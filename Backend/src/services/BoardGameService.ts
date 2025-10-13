import prisma from '@/config/database';
import redis from '@/config/redis';
import { BoardEventType, Prisma } from '@prisma/client';
import {
  BoardGameConfig,
  BoardGameState,
  BoardPlayerState,
  DiceRollResult,
  BoardEventTrigger,
  EventEffects,
  TurnResult,
  BoardGameEndResult,
  BoardEventAssignment,
} from '@/types/boardGame.types';
import { grantRewards } from './RewardsService';

/**
 * Board Game Service - Sprint 11
 * Gestiona la lógica del modo tablero tipo Mario Party
 * 
 * Características:
 * - Tablero configurable (30-50 casillas)
 * - Eventos aleatorios en casillas
 * - Sistema de turnos con timeout
 * - Dado animado (1-6)
 * - Integración con sistema de preguntas
 */

// Redis Keys para Board Mode
const BOARD_KEYS = {
  boardState: (gameCode: string) => `game:${gameCode}:board:state`,
  boardPlayers: (gameCode: string) => `game:${gameCode}:board:players`,
  boardPlayer: (gameCode: string, userId: number) => `game:${gameCode}:board:player:${userId}`,
  turnTimer: (gameCode: string) => `game:${gameCode}:board:turn_timer`,
};

const BOARD_TTL = 7200; // 2 horas

export class BoardGameService {
  /**
   * Inicializa el tablero del juego
   * Crea eventos aleatorios en casillas según probabilidades
   */
  async initializeBoardGame(gameCode: string, config: BoardGameConfig): Promise<BoardGameState> {
    console.log(`[BoardGame] Initializing board for game ${gameCode}`);

    // Obtener jugadores del juego
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
      include: {
        game_players: {
          select: {
            user_id: true,
            nickname: true,
          },
        },
      },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Determinar orden de turnos (aleatorio)
    const playerIds = game.game_players
      .filter(p => p.user_id !== null)
      .map(p => p.user_id!);
    
    const turnOrder = this.shuffleArray([...playerIds]);

    // Generar eventos aleatorios en el tablero
    const events = await this.generateBoardEvents(config.board_size);

    // Definir posiciones especiales
    const checkpointPositions: number[] = [];
    const shopPositions: number[] = [];

    for (let i = 10; i < config.board_size; i += 10) {
      checkpointPositions.push(i);
    }

    for (let i = 20; i < config.board_size; i += 20) {
      shopPositions.push(i);
    }

    // Crear estado del tablero
    const boardState: BoardGameState = {
      board_size: config.board_size,
      board_layout: config.board_layout,
      current_turn: 0,
      turn_order: turnOrder,
      events,
      checkpoint_positions: checkpointPositions,
      shop_positions: shopPositions,
      question_counter: 0,
    };

    // Guardar en Redis
    await redis.setex(
      BOARD_KEYS.boardState(gameCode),
      BOARD_TTL,
      JSON.stringify(boardState)
    );

    // Inicializar estado de cada jugador
    for (const player of game.game_players) {
      if (!player.user_id) continue;

      const playerState: BoardPlayerState = {
        userId: player.user_id,
        nickname: player.nickname,
        board_position: 0,
        coins_collected: 0,
        powerups: [],
        shields: 0,
        is_turn: player.user_id === turnOrder[0],
      };

      await this.setBoardPlayerState(gameCode, player.user_id, playerState);

      // Actualizar en DB
      await prisma.game_players.updateMany({
        where: {
          game_id: game.game_id,
          user_id: player.user_id,
        },
        data: {
          board_position: 0,
          coins_collected: 0,
        },
      });
    }

    console.log(`✅ Board initialized: ${config.board_size} tiles, ${events.length} events, ${turnOrder.length} players`);
    return boardState;
  }

  /**
   * Genera eventos aleatorios en el tablero según probabilidades
   */
  private async generateBoardEvents(boardSize: number): Promise<BoardEventAssignment[]> {
    // Obtener todos los eventos disponibles con sus probabilidades
    const availableEvents = await prisma.board_events.findMany({
      where: { is_active: true },
      select: {
        event_id: true,
        event_type: true,
        spawn_probability: true,
      },
    });

    if (availableEvents.length === 0) {
      console.warn('⚠️ No board events found in database');
      return [];
    }

    const events: BoardEventAssignment[] = [];
    const eventPositions = new Set<number>();

    // Determinar cantidad de eventos (30-40% de las casillas)
    const eventCount = Math.floor(boardSize * 0.35);

    // Generar posiciones aleatorias (excluyendo inicio y fin)
    while (eventPositions.size < eventCount) {
      const position = Math.floor(Math.random() * (boardSize - 2)) + 1;
      
      // Evitar posiciones múltiplos de 10 y 20 (checkpoints y tiendas)
      if (position % 10 !== 0 && position % 20 !== 0) {
        eventPositions.add(position);
      }
    }

    // Asignar eventos aleatorios según probabilidades
    for (const position of eventPositions) {
      const event = this.selectRandomEvent(availableEvents);
      if (event) {
        events.push({
          position,
          event_type: event.event_type,
          event_id: event.event_id,
        });
      }
    }

    return events;
  }

  /**
   * Selecciona un evento aleatorio basado en probabilidades
   */
  private selectRandomEvent(
    events: Array<{ event_id: number; event_type: BoardEventType; spawn_probability: Prisma.Decimal | null }>
  ): { event_id: number; event_type: BoardEventType } | null {
    if (events.length === 0) return null;

    // Calcular suma total de probabilidades
    const totalProbability = events.reduce(
      (sum, e) => sum + (e.spawn_probability ? parseFloat(e.spawn_probability.toString()) : 10),
      0
    );

    // Generar número aleatorio
    let random = Math.random() * totalProbability;

    // Seleccionar evento
    for (const event of events) {
      const probability = event.spawn_probability ? parseFloat(event.spawn_probability.toString()) : 10;
      random -= probability;
      
      if (random <= 0) {
        return {
          event_id: event.event_id,
          event_type: event.event_type,
        };
      }
    }

    // Fallback: retornar el primer evento
    return {
      event_id: events[0].event_id,
      event_type: events[0].event_type,
    };
  }

  /**
   * Tirar el dado y mover al jugador
   */
  async rollDice(gameCode: string, userId: number): Promise<DiceRollResult> {
    // Obtener estado del tablero
    const boardState = await this.getBoardState(gameCode);
    if (!boardState) {
      throw new Error('Board state not found');
    }

    // Verificar que es el turno del jugador
    const currentPlayerId = boardState.turn_order[boardState.current_turn];
    if (currentPlayerId !== userId) {
      throw new Error('Not your turn');
    }

    // Obtener estado del jugador
    const playerState = await this.getBoardPlayerState(gameCode, userId);
    if (!playerState) {
      throw new Error('Player not found in board game');
    }

    // Tirar dado (1-6)
    const diceValue = Math.floor(Math.random() * 6) + 1;
    const oldPosition = playerState.board_position;
    let newPosition = oldPosition + diceValue;

    // Limitar a tamaño del tablero
    if (newPosition >= boardState.board_size) {
      newPosition = boardState.board_size - 1;
    }

    // Actualizar posición del jugador
    playerState.board_position = newPosition;
    await this.setBoardPlayerState(gameCode, userId, playerState);

    // Actualizar en DB
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
    });

    if (game) {
      await prisma.game_players.updateMany({
        where: {
          game_id: game.game_id,
          user_id: userId,
        },
        data: {
          board_position: newPosition,
        },
      });
    }

    // Verificar si hay evento en la nueva posición
    let eventTrigger: BoardEventTrigger | undefined;
    const eventAtPosition = boardState.events.find(e => e.position === newPosition);

    if (eventAtPosition) {
      eventTrigger = await this.executeEvent(gameCode, userId, eventAtPosition);
    }

    // Crear resultado
    const result: DiceRollResult = {
      userId,
      diceValue,
      oldPosition,
      newPosition,
      event: eventTrigger,
      timestamp: Date.now(),
    };

    // Guardar último resultado en Redis
    boardState.last_dice_roll = result;
    await this.setBoardState(gameCode, boardState);

    console.log(`🎲 Player ${userId} rolled ${diceValue}: ${oldPosition} → ${newPosition}`);
    return result;
  }

  /**
   * Ejecuta un evento del tablero
   */
  async executeEvent(
    gameCode: string,
    userId: number,
    eventAssignment: BoardEventAssignment
  ): Promise<BoardEventTrigger> {
    // Obtener detalles del evento
    const event = await prisma.board_events.findUnique({
      where: { event_id: eventAssignment.event_id },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const playerState = await this.getBoardPlayerState(gameCode, userId);
    if (!playerState) {
      throw new Error('Player not found');
    }

    const effects: EventEffects = {};
    let message = event.description || '';

    // Aplicar efectos según tipo de evento
    switch (event.event_type) {
      case BoardEventType.bonus_coins:
        effects.coin_change = event.coin_effect;
        playerState.coins_collected += event.coin_effect;
        message = `¡Encontraste ${event.coin_effect} monedas!`;
        break;

      case BoardEventType.bonus_xp:
        effects.xp_change = event.xp_effect;
        message = `¡Ganaste ${event.xp_effect} XP extra!`;
        break;

      case BoardEventType.bonus_gems:
        effects.gem_change = event.gem_effect;
        message = `¡Conseguiste ${event.gem_effect} gemas!`;
        break;

      case BoardEventType.trap_lose_coins:
        // Verificar si tiene escudo
        if (playerState.shields > 0) {
          playerState.shields -= 1;
          message = '¡Tu escudo te protegió de la trampa!';
        } else {
          const coinsToLose = Math.min(Math.abs(event.coin_effect), playerState.coins_collected);
          effects.coin_change = -coinsToLose;
          playerState.coins_collected -= coinsToLose;
          message = `¡Trampa! Perdiste ${coinsToLose} monedas`;
        }
        break;

      case BoardEventType.trap_go_back:
        // Verificar si tiene escudo
        if (playerState.shields > 0) {
          playerState.shields -= 1;
          message = '¡Tu escudo te protegió de retroceder!';
        } else {
          const moveBack = Math.abs(event.move_effect);
          effects.position_change = -moveBack;
          playerState.board_position = Math.max(0, playerState.board_position - moveBack);
          message = `¡Retrocedes ${moveBack} casillas!`;
        }
        break;

      case BoardEventType.teleport_forward:
        const moveForward = event.move_effect;
        effects.position_change = moveForward;
        const boardState = await this.getBoardState(gameCode);
        if (boardState) {
          playerState.board_position = Math.min(
            boardState.board_size - 1,
            playerState.board_position + moveForward
          );
        }
        message = `¡Teletransporte! Avanzas ${moveForward} casillas`;
        break;

      case BoardEventType.powerup:
        const powerupType = this.getRandomPowerup();
        effects.powerup_granted = powerupType;
        playerState.powerups.push(powerupType);
        message = `¡Conseguiste un powerup: ${powerupType}!`;
        break;

      case BoardEventType.mystery_box:
        // Recompensa aleatoria
        const mysteryReward = this.getRandomMysteryReward();
        Object.assign(effects, mysteryReward.effects);
        message = mysteryReward.message;
        
        if (mysteryReward.effects.coin_change) {
          playerState.coins_collected += mysteryReward.effects.coin_change;
        }
        if (mysteryReward.effects.shield_granted) {
          playerState.shields += 1;
        }
        break;

      case BoardEventType.quiz_challenge:
        // Este evento activará una pregunta extra
        effects.xp_change = event.xp_effect * 2; // Doble recompensa
        message = '¡Pregunta desafío! Responde correctamente para doble recompensa';
        break;

      case BoardEventType.boss_encounter:
        message = '¡Encuentro con Boss! (Funcionalidad pendiente)';
        break;
    }

    // Guardar estado actualizado del jugador
    await this.setBoardPlayerState(gameCode, userId, playerState);

    // Actualizar coins en DB
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
    });

    if (game) {
      await prisma.game_players.updateMany({
        where: {
          game_id: game.game_id,
          user_id: userId,
        },
        data: {
          coins_collected: playerState.coins_collected,
          board_position: playerState.board_position,
        },
      });
    }

    // Otorgar recompensas inmediatas (coins, gems, xp)
    if (effects.coin_change || effects.gem_change || effects.xp_change) {
      await grantRewards(userId, {
        coins: effects.coin_change || 0,
        gems: effects.gem_change || 0,
        xp: effects.xp_change || 0,
      });
    }

    console.log(`⚡ Event executed: ${event.event_type} for player ${userId}`);

    return {
      event_type: event.event_type,
      event_id: event.event_id,
      position: eventAssignment.position,
      effects,
      message,
    };
  }

  /**
   * Avanza al siguiente turno
   */
  async advanceTurn(gameCode: string, turnTimeout: number = 15): Promise<TurnResult> {
    const boardState = await this.getBoardState(gameCode);
    if (!boardState) {
      throw new Error('Board state not found');
    }

    // Incrementar contador de preguntas
    boardState.question_counter += 1;

    // Avanzar al siguiente jugador
    const currentTurn = boardState.current_turn;
    const nextTurn = (currentTurn + 1) % boardState.turn_order.length;
    boardState.current_turn = nextTurn;

    // Calcular timeout
    const timeoutAt = Date.now() + (turnTimeout * 1000);
    boardState.turn_timeout_at = timeoutAt;

    // Actualizar estados de jugadores
    const currentPlayerId = boardState.turn_order[currentTurn];
    const nextPlayerId = boardState.turn_order[nextTurn];

    // Marcar jugador actual como no en turno
    const currentPlayer = await this.getBoardPlayerState(gameCode, currentPlayerId);
    if (currentPlayer) {
      currentPlayer.is_turn = false;
      await this.setBoardPlayerState(gameCode, currentPlayerId, currentPlayer);
    }

    // Marcar siguiente jugador como en turno
    const nextPlayer = await this.getBoardPlayerState(gameCode, nextPlayerId);
    if (nextPlayer) {
      nextPlayer.is_turn = true;
      await this.setBoardPlayerState(gameCode, nextPlayerId, nextPlayer);
    }

    // Guardar estado actualizado
    await this.setBoardState(gameCode, boardState);

    console.log(`🔄 Turn advanced: Player ${currentPlayerId} → Player ${nextPlayerId}`);

    return {
      current_player_id: nextPlayerId,
      next_player_id: boardState.turn_order[(nextTurn + 1) % boardState.turn_order.length],
      turn_number: nextTurn,
      timeout_at: timeoutAt,
    };
  }

  /**
   * Verifica si hay un ganador
   */
  async checkWinCondition(gameCode: string): Promise<{ hasWinner: boolean; winnerId?: number }> {
    const boardState = await this.getBoardState(gameCode);
    if (!boardState) {
      return { hasWinner: false };
    }

    // Verificar si algún jugador llegó al final
    for (const userId of boardState.turn_order) {
      const player = await this.getBoardPlayerState(gameCode, userId);
      if (player && player.board_position >= boardState.board_size - 1) {
        return { hasWinner: true, winnerId: userId };
      }
    }

    return { hasWinner: false };
  }

  /**
   * Finaliza el juego de tablero y calcula ranking
   */
  async endBoardGame(gameCode: string): Promise<BoardGameEndResult> {
    const boardState = await this.getBoardState(gameCode);
    if (!boardState) {
      throw new Error('Board state not found');
    }

    // Obtener todos los jugadores
    const players: BoardPlayerState[] = [];
    for (const userId of boardState.turn_order) {
      const player = await this.getBoardPlayerState(gameCode, userId);
      if (player) {
        players.push(player);
      }
    }

    // Ordenar por posición (mayor primero) y luego por coins
    players.sort((a, b) => {
      if (b.board_position !== a.board_position) {
        return b.board_position - a.board_position;
      }
      return b.coins_collected - a.coins_collected;
    });

    // Asignar rankings
    const finalPositions = players.map((player, index) => ({
      userId: player.userId,
      nickname: player.nickname,
      board_position: player.board_position,
      score: player.coins_collected,
      coins_collected: player.coins_collected,
      rank: index + 1,
    }));

    const winner = finalPositions[0];

    // Actualizar ranks en DB
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
    });

    if (game) {
      for (const position of finalPositions) {
        await prisma.game_players.updateMany({
          where: {
            game_id: game.game_id,
            user_id: position.userId,
          },
          data: {
            final_rank: position.rank,
            score: position.score,
          },
        });
      }
    }

    console.log(`🏁 Board game ended. Winner: Player ${winner.userId}`);

    return {
      winner_id: winner.userId,
      final_positions: finalPositions,
      reason: 'reached_end',
    };
  }

  /**
   * Helpers - Redis State Management
   */

  private async getBoardState(gameCode: string): Promise<BoardGameState | null> {
    const data = await redis.get(BOARD_KEYS.boardState(gameCode));
    return data ? JSON.parse(data) : null;
  }

  private async setBoardState(gameCode: string, state: BoardGameState): Promise<void> {
    await redis.setex(BOARD_KEYS.boardState(gameCode), BOARD_TTL, JSON.stringify(state));
  }

  private async getBoardPlayerState(gameCode: string, userId: number): Promise<BoardPlayerState | null> {
    const data = await redis.get(BOARD_KEYS.boardPlayer(gameCode, userId));
    return data ? JSON.parse(data) : null;
  }

  private async setBoardPlayerState(
    gameCode: string,
    userId: number,
    state: BoardPlayerState
  ): Promise<void> {
    await redis.setex(BOARD_KEYS.boardPlayer(gameCode, userId), BOARD_TTL, JSON.stringify(state));
    await redis.sadd(BOARD_KEYS.boardPlayers(gameCode), userId.toString());
  }

  async getAllBoardPlayers(gameCode: string): Promise<BoardPlayerState[]> {
    const playerIds = await redis.smembers(BOARD_KEYS.boardPlayers(gameCode));
    const players: BoardPlayerState[] = [];

    for (const userIdStr of playerIds) {
      const userId = parseInt(userIdStr);
      const player = await this.getBoardPlayerState(gameCode, userId);
      if (player) {
        players.push(player);
      }
    }

    return players;
  }

  /**
   * Utility Functions
   */

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getRandomPowerup(): string {
    const powerups = ['speed_boost', 'double_coins', 'shield', 'extra_roll'];
    return powerups[Math.floor(Math.random() * powerups.length)];
  }

  private getRandomMysteryReward(): { effects: EventEffects; message: string } {
    const rewards = [
      { effects: { coin_change: 50 }, message: '¡Caja misteriosa: +50 monedas!' },
      { effects: { gem_change: 10 }, message: '¡Caja misteriosa: +10 gemas!' },
      { effects: { xp_change: 100 }, message: '¡Caja misteriosa: +100 XP!' },
      { effects: { shield_granted: true }, message: '¡Caja misteriosa: Escudo protector!' },
      { effects: { coin_change: -20 }, message: 'Caja misteriosa: Era una trampa! -20 monedas' },
    ];
    return rewards[Math.floor(Math.random() * rewards.length)];
  }

  /**
   * Limpiar sesión de tablero
   */
  async cleanupBoardSession(gameCode: string): Promise<void> {
    const playerIds = await redis.smembers(BOARD_KEYS.boardPlayers(gameCode));
    
    // Eliminar jugadores
    for (const userId of playerIds) {
      await redis.del(BOARD_KEYS.boardPlayer(gameCode, parseInt(userId)));
    }

    // Eliminar estado y listas
    await redis.del(BOARD_KEYS.boardState(gameCode));
    await redis.del(BOARD_KEYS.boardPlayers(gameCode));
    await redis.del(BOARD_KEYS.turnTimer(gameCode));

    console.log(`🧹 Board session cleaned up: ${gameCode}`);
  }
}

export default new BoardGameService();
