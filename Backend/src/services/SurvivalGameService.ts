import prisma from '@/config/database';
import { BadRequestError, NotFoundError } from '@/utils/ApiError';
import { getSocketIO } from '@/socket/socketInstance';

/**
 * SurvivalGameService - Modo Battle Royale Educativo
 * Sistema de eliminación progresiva con zona segura
 */

interface SurvivalConfig {
  max_players: number;
  total_rounds: number;
  elimination_rate: number; // Porcentaje (0.2 = 20%)
  safe_zone_size: number; // 100 = 100%
  final_round_players: number;
  question_time_limit: number;
  final_round_time_limit: number;
}

interface SurvivalMetadata {
  current_round: number;
  total_rounds: number;
  safe_zone_size: number;
  players_alive: number;
  total_players: number;
  is_final_round: boolean;
  elimination_history: Array<{
    round: number;
    eliminated_count: number;
    eliminated_ids: number[];
  }>;
}

interface SurvivalPlayerData {
  userId: number;
  nickname: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  combo_streak: number;
  is_eliminated: boolean;
  elimination_round?: number;
  final_rank?: number;
}

export class SurvivalGameService {
  /**
   * Inicializar juego de supervivencia
   */
  async initializeSurvivalGame(gameId: number): Promise<SurvivalMetadata> {
    const game = await prisma.games.findUnique({
      where: { game_id: gameId },
      include: {
        _count: {
          select: { game_results: true }
        }
      }
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    if (game.game_mode !== 'survival') {
      throw new BadRequestError('Este juego no es de modo supervivencia');
    }

    // Configuración por defecto
    const config: SurvivalConfig = {
      max_players: 100,
      total_rounds: 12,
      elimination_rate: 0.20, // 20% por ronda
      safe_zone_size: 100,
      final_round_players: 10,
      question_time_limit: 30,
      final_round_time_limit: 20,
      ...(game.config as any)
    };

    const totalPlayers = game._count.game_results;

    // Metadata inicial
    const metadata: SurvivalMetadata = {
      current_round: 0,
      total_rounds: config.total_rounds,
      safe_zone_size: 100,
      players_alive: totalPlayers,
      total_players: totalPlayers,
      is_final_round: false,
      elimination_history: []
    };

    // Guardar en game.metadata
    await prisma.games.update({
      where: { game_id: gameId },
      data: {
        metadata: {
          ...game.metadata as any,
          survival: metadata,
          survival_config: config
        }
      }
    });

    console.log(`[SurvivalGameService] Juego ${gameId} inicializado: ${totalPlayers} jugadores`);
    return metadata;
  }

  /**
   * Iniciar ronda de supervivencia
   */
  async startSurvivalRound(gameId: number, roundNumber: number): Promise<void> {
    const game = await prisma.games.findUnique({
      where: { game_id: gameId }
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    const metadata = (game.metadata as any)?.survival as SurvivalMetadata;
    const config = (game.metadata as any)?.survival_config as SurvivalConfig;

    if (!metadata || !config) {
      throw new BadRequestError('Metadata de supervivencia no encontrada');
    }

    // Actualizar ronda actual
    metadata.current_round = roundNumber;

    // Calcular zona segura (reduce progresivamente)
    metadata.safe_zone_size = this.calculateSafeZoneSize(roundNumber, config.total_rounds);

    // Verificar si es ronda final
    if (metadata.players_alive <= config.final_round_players) {
      metadata.is_final_round = true;
    }

    await prisma.games.update({
      where: { game_id: gameId },
      data: {
        metadata: {
          ...game.metadata as any,
          survival: metadata
        }
      }
    });

    console.log(`[SurvivalGameService] Ronda ${roundNumber} iniciada - ${metadata.players_alive} jugadores vivos`);

    // Emitir evento socket
    const io = getSocketIO();
    io.to(`game:${game.game_code}`).emit('survival:round-start', {
      round: roundNumber,
      total_rounds: config.total_rounds,
      safe_zone_size: metadata.safe_zone_size,
      players_alive: metadata.players_alive,
      is_final_round: metadata.is_final_round,
      time_limit: metadata.is_final_round ? config.final_round_time_limit : config.question_time_limit
    });
  }

  /**
   * Procesar eliminación de jugadores al final de una ronda
   */
  async processEliminationRound(gameId: number): Promise<{
    eliminated: SurvivalPlayerData[];
    survivors: SurvivalPlayerData[];
  }> {
    const game = await prisma.games.findUnique({
      where: { game_id: gameId },
      include: {
        game_results: {
          include: {
            users: {
              select: {
                user_id: true,
                username: true,
                display_name: true
              }
            }
          }
        }
      }
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    const metadata = (game.metadata as any)?.survival as SurvivalMetadata;
    const config = (game.metadata as any)?.survival_config as SurvivalConfig;

    if (!metadata || !config) {
      throw new BadRequestError('Metadata de supervivencia no encontrada');
    }

    // Obtener jugadores activos (no eliminados)
    const activePlayers = game.game_results
      .filter(r => !(r.metadata as any)?.is_eliminated)
      .map(r => ({
        userId: r.user_id,
        nickname: r.users.display_name || r.users.username,
        score: r.score,
        correct_answers: r.correct_answers,
        wrong_answers: r.wrong_answers,
        combo_streak: (r.metadata as any)?.combo_streak || 0,
        is_eliminated: false
      }))
      .sort((a, b) => b.score - a.score); // Ordenar por score descendente

    console.log(`[SurvivalGameService] Procesando eliminación: ${activePlayers.length} jugadores activos`);

    // Determinar cuántos eliminar
    let eliminationCount = 0;

    if (metadata.is_final_round) {
      // En ronda final, eliminar 1 por pregunta hasta quedar 3
      eliminationCount = activePlayers.length > 3 ? 1 : 0;
    } else {
      // Eliminación normal: 20% de los activos
      eliminationCount = Math.max(1, Math.floor(activePlayers.length * config.elimination_rate));
      
      // Asegurar que queden al menos final_round_players
      const wouldRemain = activePlayers.length - eliminationCount;
      if (wouldRemain < config.final_round_players) {
        eliminationCount = Math.max(0, activePlayers.length - config.final_round_players);
      }
    }

    // Tomar los últimos N jugadores (menor score)
    const playersToEliminate = activePlayers.slice(-eliminationCount);
    const survivors = activePlayers.slice(0, -eliminationCount || undefined);

    console.log(`[SurvivalGameService] Eliminando ${eliminationCount} jugadores`);

    // Marcar como eliminados en DB
    const eliminatedIds = playersToEliminate.map(p => p.userId);

    for (const player of playersToEliminate) {
      await prisma.game_results.updateMany({
        where: {
          game_id: gameId,
          user_id: player.userId
        },
        data: {
          metadata: {
            ...(await this.getPlayerMetadata(gameId, player.userId)),
            is_eliminated: true,
            elimination_round: metadata.current_round,
            final_rank: activePlayers.length - playersToEliminate.indexOf(player)
          }
        }
      });
    }

    // Actualizar metadata del juego
    metadata.players_alive = survivors.length;
    metadata.elimination_history.push({
      round: metadata.current_round,
      eliminated_count: eliminationCount,
      eliminated_ids: eliminatedIds
    });

    // Verificar si activar ronda final
    if (metadata.players_alive <= config.final_round_players && !metadata.is_final_round) {
      metadata.is_final_round = true;
      console.log(`[SurvivalGameService] ¡Ronda final activada! ${metadata.players_alive} jugadores restantes`);
    }

    // Actualizar zona segura
    metadata.safe_zone_size = this.calculateSafeZoneSize(metadata.current_round, config.total_rounds);

    await prisma.games.update({
      where: { game_id: gameId },
      data: {
        metadata: {
          ...game.metadata as any,
          survival: metadata
        }
      }
    });

    // Emitir resultado de la ronda
    const io = getSocketIO();
    io.to(`game:${game.game_code}`).emit('survival:round-end', {
      round: metadata.current_round,
      eliminated: playersToEliminate.map(p => ({
        userId: p.userId,
        nickname: p.nickname,
        score: p.score,
        rank: p.final_rank
      })),
      survivors_count: survivors.length,
      players_alive: metadata.players_alive,
      safe_zone_size: metadata.safe_zone_size,
      is_final_round: metadata.is_final_round
    });

    // Si activamos ronda final, emitir evento especial
    if (metadata.is_final_round && metadata.players_alive === config.final_round_players) {
      io.to(`game:${game.game_code}`).emit('survival:final-round', {
        players_alive: metadata.players_alive,
        message: `¡Top ${config.final_round_players}! Ronda final activada`,
        survivors: survivors.slice(0, config.final_round_players).map((p, i) => ({
          userId: p.userId,
          nickname: p.nickname,
          score: p.score,
          rank: i + 1
        }))
      });
    }

    return {
      eliminated: playersToEliminate,
      survivors
    };
  }

  /**
   * Iniciar ronda final (solo top 10)
   */
  async startFinalRound(gameId: number): Promise<void> {
    const game = await prisma.games.findUnique({
      where: { game_id: gameId }
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    const metadata = (game.metadata as any)?.survival as SurvivalMetadata;

    if (!metadata) {
      throw new BadRequestError('Metadata de supervivencia no encontrada');
    }

    metadata.is_final_round = true;

    await prisma.games.update({
      where: { game_id: gameId },
      data: {
        metadata: {
          ...game.metadata as any,
          survival: metadata
        }
      }
    });

    console.log(`[SurvivalGameService] Ronda final iniciada - ${metadata.players_alive} jugadores`);

    const io = getSocketIO();
    io.to(`game:${game.game_code}`).emit('survival:final-round', {
      players_alive: metadata.players_alive,
      message: '¡Ronda final! Los últimos supervivientes'
    });
  }

  /**
   * Procesar eliminación final (1 jugador a la vez)
   */
  async processFinalElimination(gameId: number): Promise<{
    eliminated: SurvivalPlayerData | null;
    remaining: number;
    finished: boolean;
  }> {
    const result = await this.processEliminationRound(gameId);
    
    const game = await prisma.games.findUnique({
      where: { game_id: gameId }
    });

    const metadata = (game?.metadata as any)?.survival as SurvivalMetadata;

    // Si quedan 3 o menos, el juego termina
    const finished = metadata.players_alive <= 3;

    if (finished) {
      await this.finishSurvivalGame(gameId);
    }

    return {
      eliminated: result.eliminated[0] || null,
      remaining: metadata.players_alive,
      finished
    };
  }

  /**
   * Finalizar juego de supervivencia
   */
  async finishSurvivalGame(gameId: number): Promise<void> {
    const game = await prisma.games.findUnique({
      where: { game_id: gameId },
      include: {
        game_results: {
          include: {
            users: {
              select: {
                user_id: true,
                username: true,
                display_name: true
              }
            }
          }
        }
      }
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    // Obtener top 3 final
    const finalStandings = game.game_results
      .filter(r => !(r.metadata as any)?.is_eliminated || (r.metadata as any)?.final_rank <= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const winner = finalStandings[0];

    // Asignar recompensas
    await this.assignSurvivalRewards(gameId, finalStandings);

    // Actualizar estado del juego
    await prisma.games.update({
      where: { game_id: gameId },
      data: {
        status: 'finished',
        ended_at: new Date()
      }
    });

    console.log(`[SurvivalGameService] Juego ${gameId} finalizado - Ganador: ${winner.users.display_name}`);

    // Emitir evento de finalización
    const io = getSocketIO();
    io.to(`game:${game.game_code}`).emit('survival:game-finished', {
      winner_id: winner.user_id,
      winner_name: winner.users.display_name || winner.users.username,
      final_standings: finalStandings.map((r, i) => ({
        rank: i + 1,
        userId: r.user_id,
        nickname: r.users.display_name || r.users.username,
        score: r.score,
        correct_answers: r.correct_answers,
        wrong_answers: r.wrong_answers
      }))
    });
  }

  /**
   * Calcular zona segura según la ronda
   */
  private calculateSafeZoneSize(currentRound: number, totalRounds: number): number {
    if (currentRound <= 3) return 100; // Rondas iniciales: 100%
    if (currentRound <= 6) return 80;  // Rondas medias: 80%
    if (currentRound <= 9) return 60;  // Rondas críticas: 60%
    return 40; // Rondas finales: 40%
  }

  /**
   * Calcular score de supervivencia
   */
  calculateSurvivalScore(
    correctAnswers: number,
    wrongAnswers: number,
    speedBonus: number,
    comboStreak: number
  ): number {
    const basePoints = correctAnswers * 100;
    const penalty = wrongAnswers * -20;
    const comboBonus = comboStreak * 50;
    
    return Math.max(0, basePoints + penalty + speedBonus + comboBonus);
  }

  /**
   * Asignar recompensas de supervivencia
   */
  private async assignSurvivalRewards(gameId: number, topPlayers: any[]): Promise<void> {
    const rewardTiers = [
      { rank: 1, coins: 5000, gems: 200, title: 'Survival Champion' },
      { rank: 2, coins: 3000, gems: 100, title: 'Runner-up' },
      { rank: 3, coins: 2000, gems: 75, title: 'Bronze Survivor' },
    ];

    for (let i = 0; i < Math.min(topPlayers.length, 3); i++) {
      const player = topPlayers[i];
      const tier = rewardTiers[i];

      // Actualizar monedas y gemas del usuario
      await prisma.user_profiles.update({
        where: { user_id: player.user_id },
        data: {
          total_coins_earned: {
            increment: tier.coins
          },
          total_gems_earned: {
            increment: tier.gems
          }
        }
      });

      console.log(`[SurvivalGameService] Recompensas asignadas a ${player.users.display_name}: ${tier.coins} coins, ${tier.gems} gems`);
    }

    // Recompensa de participación para todos los demás (100 coins)
    const allPlayers = await prisma.game_results.findMany({
      where: { game_id: gameId },
      select: { user_id: true }
    });

    const topPlayerIds = topPlayers.map(p => p.user_id);
    const otherPlayerIds = allPlayers
      .map(p => p.user_id)
      .filter(id => !topPlayerIds.includes(id));

    for (const userId of otherPlayerIds) {
      await prisma.user_profiles.update({
        where: { user_id: userId },
        data: {
          total_coins_earned: {
            increment: 100
          }
        }
      });
    }
  }

  /**
   * Obtener metadata de un jugador
   */
  private async getPlayerMetadata(gameId: number, userId: number): Promise<any> {
    const result = await prisma.game_results.findFirst({
      where: {
        game_id: gameId,
        user_id: userId
      }
    });

    return result?.metadata || {};
  }

  /**
   * Obtener estado actual del juego de supervivencia
   */
  async getSurvivalStatus(gameId: number): Promise<{
    metadata: SurvivalMetadata;
    config: SurvivalConfig;
    players: SurvivalPlayerData[];
  }> {
    const game = await prisma.games.findUnique({
      where: { game_id: gameId },
      include: {
        game_results: {
          include: {
            users: {
              select: {
                user_id: true,
                username: true,
                display_name: true
              }
            }
          }
        }
      }
    });

    if (!game) {
      throw new NotFoundError('Juego no encontrado');
    }

    const metadata = (game.metadata as any)?.survival as SurvivalMetadata;
    const config = (game.metadata as any)?.survival_config as SurvivalConfig;

    const players: SurvivalPlayerData[] = game.game_results.map(r => ({
      userId: r.user_id,
      nickname: r.users.display_name || r.users.username,
      score: r.score,
      correct_answers: r.correct_answers,
      wrong_answers: r.wrong_answers,
      combo_streak: (r.metadata as any)?.combo_streak || 0,
      is_eliminated: (r.metadata as any)?.is_eliminated || false,
      elimination_round: (r.metadata as any)?.elimination_round,
      final_rank: (r.metadata as any)?.final_rank
    }));

    return {
      metadata,
      config,
      players: players.sort((a, b) => b.score - a.score)
    };
  }
}

export default new SurvivalGameService();
