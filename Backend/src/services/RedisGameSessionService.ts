import redis from '@/config/redis';
import prisma from '@/config/database';
import { GameStatus, Prisma } from '@prisma/client';

/**
 * Redis Game Session Service
 * 
 * Gestiona el estado de las sesiones de juego activas en Redis
 * - Rápido acceso (<1ms)
 * - TTL automático (expira después del juego)
 * - Persistente a recargas de página
 * - Escalable a múltiples instancias
 */

// Keys de Redis
const KEYS = {
  gameState: (gameCode: string) => `game:${gameCode}:state`,
  gamePlayer: (gameCode: string, userId: number) => `game:${gameCode}:player:${userId}`,
  gamePlayers: (gameCode: string) => `game:${gameCode}:players`,
  gameNicknames: (gameCode: string) => `game:${gameCode}:nicknames`, // Hash userId->nickname
  gameQuestions: (gameCode: string) => `game:${gameCode}:questions`, // Lista ordenada de question IDs
  gameAnswers: (gameCode: string, questionId: number) => `game:${gameCode}:q:${questionId}:answers`,
  gameLeaderboard: (gameCode: string) => `game:${gameCode}:leaderboard`,
  activeGames: () => 'games:active',
};

// TTL en segundos
const TTL = {
  gameSession: 7200, // 2 horas
  playerState: 7200,
  answerCache: 3600, // 1 hora
};

export interface GameSessionState {
  gameId: number;
  gameCode: string;
  teacherId: number;
  questionSetId: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  status: GameStatus;
  questionStartTime: number;
  config: Prisma.JsonValue;
  createdAt: number;
  startedAt?: number;
  currentQuestion?: any; // Pregunta actual preparada (para recuperación al recargar)
}

export interface PlayerState {
  userId: number;
  nickname: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  comboStreak: number;
  highestCombo: number;
  totalTimeTaken: number;
  lastAnswerTime?: number;
  isConnected: boolean;
}

export interface QuestionAnswer {
  userId: number;
  optionId: number;
  timeTaken: number;
  timestamp: number;
}

export class RedisGameSessionService {
  /**
   * Crear sesión de juego en Redis
   */
  async createGameSession(
    gameCode: string,
    gameData: GameSessionState
  ): Promise<void> {
    const key = KEYS.gameState(gameCode);
    
    await redis.setex(
      key,
      TTL.gameSession,
      JSON.stringify(gameData)
    );

    // Agregar a la lista de juegos activos
    await redis.sadd(KEYS.activeGames(), gameCode);

    console.log(`✅ Game session created in Redis: ${gameCode}`);
  }

  /**
   * Obtener sesión de juego
   */
  async getGameSession(gameCode: string): Promise<GameSessionState | null> {
    const key = KEYS.gameState(gameCode);
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as GameSessionState;
  }

  /**
   * Actualizar sesión de juego
   */
  async updateGameSession(
    gameCode: string,
    updates: Partial<GameSessionState>
  ): Promise<void> {
    const current = await this.getGameSession(gameCode);
    if (!current) {
      throw new Error('Game session not found in Redis');
    }

    const updated = { ...current, ...updates };
    const key = KEYS.gameState(gameCode);

    await redis.setex(
      key,
      TTL.gameSession,
      JSON.stringify(updated)
    );
  }

  /**
   * Agregar o actualizar jugador en la sesión
   */
  async setPlayerState(
    gameCode: string,
    userId: number,
    playerData: PlayerState
  ): Promise<void> {
    const key = KEYS.gamePlayer(gameCode, userId);
    
    await redis.setex(
      key,
      TTL.playerState,
      JSON.stringify(playerData)
    );

    // Agregar a la lista de jugadores
    await redis.sadd(KEYS.gamePlayers(gameCode), userId.toString());

    // Actualizar leaderboard (sorted set por score)
    await redis.zadd(
      KEYS.gameLeaderboard(gameCode),
      playerData.score,
      userId.toString()
    );
  }

  /**
   * Obtener estado de un jugador
   */
  async getPlayerState(
    gameCode: string,
    userId: number
  ): Promise<PlayerState | null> {
    const key = KEYS.gamePlayer(gameCode, userId);
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as PlayerState;
  }

  /**
   * Obtener todos los jugadores de un juego
   */
  async getAllPlayers(gameCode: string): Promise<PlayerState[]> {
    const playerIds = await redis.smembers(KEYS.gamePlayers(gameCode));
    
    const players: PlayerState[] = [];
    for (const userId of playerIds) {
      const player = await this.getPlayerState(gameCode, parseInt(userId, 10));
      if (player) {
        players.push(player);
      }
    }

    return players;
  }

  /**
   * Obtener leaderboard ordenado
   */
  async getLeaderboard(gameCode: string): Promise<Array<PlayerState & { rank: number }>> {
    // Obtener IDs ordenados por score (descendente)
    const userIds = await redis.zrevrange(KEYS.gameLeaderboard(gameCode), 0, -1);
    
    const leaderboard: Array<PlayerState & { rank: number }> = [];
    
    for (let i = 0; i < userIds.length; i++) {
      const userId = parseInt(userIds[i], 10);
      const player = await this.getPlayerState(gameCode, userId);
      
      if (player) {
        leaderboard.push({
          ...player,
          rank: i + 1,
        });
      }
    }

    return leaderboard;
  }

  /**
   * Registrar respuesta de un jugador a una pregunta
   */
  async recordAnswer(
    gameCode: string,
    questionId: number,
    answer: QuestionAnswer
  ): Promise<void> {
    const key = KEYS.gameAnswers(gameCode, questionId);
    
    await redis.hset(
      key,
      answer.userId.toString(),
      JSON.stringify(answer)
    );

    // Expirar después de 1 hora
    await redis.expire(key, TTL.answerCache);
  }

  /**
   * Verificar si un jugador ya respondió una pregunta
   */
  async hasPlayerAnswered(
    gameCode: string,
    questionId: number,
    userId: number
  ): Promise<boolean> {
    const key = KEYS.gameAnswers(gameCode, questionId);
    const exists = await redis.hexists(key, userId.toString());
    return exists === 1;
  }

  /**
   * Obtener todas las respuestas de una pregunta
   */
  async getQuestionAnswers(
    gameCode: string,
    questionId: number
  ): Promise<QuestionAnswer[]> {
    const key = KEYS.gameAnswers(gameCode, questionId);
    const data = await redis.hgetall(key);

    return Object.values(data).map(json => JSON.parse(json) as QuestionAnswer);
  }

  /**
   * Limpiar sesión de juego (al finalizar)
   */
  async cleanupGameSession(gameCode: string): Promise<void> {
    const gameState = await this.getGameSession(gameCode);
    if (!gameState) return;

    // Eliminar todas las keys relacionadas
    const keys = [
      KEYS.gameState(gameCode),
      KEYS.gamePlayers(gameCode),
      KEYS.gameNicknames(gameCode),
      KEYS.gameQuestions(gameCode),
      KEYS.gameLeaderboard(gameCode),
    ];

    // Eliminar keys de jugadores
    const playerIds = await redis.smembers(KEYS.gamePlayers(gameCode));
    for (const userId of playerIds) {
      keys.push(KEYS.gamePlayer(gameCode, parseInt(userId, 10)));
    }

    // Eliminar keys de respuestas (puede haber muchas preguntas)
    for (let i = 0; i < gameState.totalQuestions; i++) {
      keys.push(KEYS.gameAnswers(gameCode, i));
    }

    await redis.del(...keys);
    await redis.srem(KEYS.activeGames(), gameCode);

    console.log(`🧹 Game session cleaned up: ${gameCode}`);
  }

  /**
   * Marcar jugador como conectado/desconectado
   */
  async setPlayerConnection(
    gameCode: string,
    userId: number,
    isConnected: boolean
  ): Promise<void> {
    const player = await this.getPlayerState(gameCode, userId);
    if (!player) return;

    player.isConnected = isConnected;
    await this.setPlayerState(gameCode, userId, player);
  }

  /**
   * Obtener cantidad de jugadores conectados
   */
  async getConnectedPlayersCount(gameCode: string): Promise<number> {
    const players = await this.getAllPlayers(gameCode);
    return players.filter(p => p.isConnected).length;
  }

  /**
   * Inicializar sesión desde DB (para recuperación)
   */
  async initializeFromDatabase(gameCode: string): Promise<boolean> {
    try {
      // Verificar si ya existe en Redis
      const existing = await this.getGameSession(gameCode);
      if (existing) {
        console.log(`♻️ Game session already exists in Redis: ${gameCode}`);
        return true;
      }

      // Cargar desde DB
      const game = await prisma.games.findUnique({
        where: { game_code: gameCode },
        include: {
          question_sets: {
            include: {
              questions: {
                select: {
                  question_id: true,
                },
              },
            },
          },
          game_players: true,
        },
      });

      if (!game) {
        return false;
      }

      // Preparar orden de preguntas
      let questionIds = game.question_sets?.questions.map(q => q.question_id) || [];

      // Aplicar shuffle si está configurado
      // NOTA: Al recuperar desde BD, NO hacemos shuffle porque no sabemos el orden original
      // El orden original debería estar guardado en Redis, pero si no está, usamos el orden de BD
      if (game.config && typeof game.config === 'object' && 'shuffle_questions' in game.config) {
        // Si había shuffle configurado pero no tenemos el orden guardado, usamos orden de BD
        // TODO: En futuro, guardar orden en BD también para recuperación perfecta
        console.warn(`⚠️ Recovering shuffled game without saved order, using DB order for ${gameCode}`);
      }

      // Guardar orden de preguntas en Redis
      await this.setQuestionOrder(gameCode, questionIds);

      // Crear sesión en Redis
      const sessionState: GameSessionState = {
        gameId: game.game_id,
        gameCode: game.game_code,
        teacherId: game.teacher_id,
        questionSetId: game.set_id,
        totalQuestions: questionIds.length,
        currentQuestionIndex: game.current_question_index || 0,
        status: game.status,
        questionStartTime: 0,
        config: game.config,
        createdAt: game.created_at.getTime(),
        startedAt: game.started_at?.getTime(),
      };

      await this.createGameSession(gameCode, sessionState);

      // Restaurar jugadores
      for (const player of game.game_players) {
        if (!player.user_id) continue;

        const playerState: PlayerState = {
          userId: player.user_id,
          nickname: player.nickname,
          score: player.score,
          correctAnswers: player.correct_answers,
          wrongAnswers: player.wrong_answers,
          comboStreak: player.combo_streak,
          highestCombo: player.highest_combo,
          totalTimeTaken: player.total_time_played_ms || 0,
          isConnected: false, // Se actualizará cuando se conecten
        };

        await this.setPlayerState(gameCode, player.user_id, playerState);

        // Guardar nickname en Redis
        await this.addPlayerToGame(gameCode, player.user_id, player.nickname);
      }

      console.log(`♻️ Game session restored from DB: ${gameCode}`);
      return true;
    } catch (error) {
      console.error('Error initializing session from DB:', error);
      return false;
    }
  }

  /**
   * Obtener todos los juegos activos
   */
  async getActiveGames(): Promise<string[]> {
    return redis.smembers(KEYS.activeGames());
  }

  /**
   * Guardar orden de preguntas (para mantener shuffle consistente)
   */
  async setQuestionOrder(gameCode: string, questionIds: number[]): Promise<void> {
    const key = KEYS.gameQuestions(gameCode);
    await redis.del(key); // Limpiar lista anterior
    if (questionIds.length > 0) {
      await redis.rpush(key, ...questionIds.map(id => id.toString()));
      await redis.expire(key, TTL.gameSession);
    }
  }

  /**
   * Obtener orden de preguntas
   */
  async getQuestionOrder(gameCode: string): Promise<number[]> {
    const key = KEYS.gameQuestions(gameCode);
    const questionIds = await redis.lrange(key, 0, -1);
    return questionIds.map(id => parseInt(id, 10));
  }

  /**
   * Guardar/actualizar nickname de jugador
   */
  async setPlayerNickname(gameCode: string, userId: number, nickname: string): Promise<void> {
    const key = KEYS.gameNicknames(gameCode);
    await redis.hset(key, userId.toString(), nickname);
    await redis.expire(key, TTL.gameSession);
  }

  /**
   * Obtener nickname de jugador
   */
  async getPlayerNickname(gameCode: string, userId: number): Promise<string | null> {
    const key = KEYS.gameNicknames(gameCode);
    return redis.hget(key, userId.toString());
  }

  /**
   * Obtener todos los nicknames del juego
   */
  async getAllNicknames(gameCode: string): Promise<Map<number, string>> {
    const key = KEYS.gameNicknames(gameCode);
    const data = await redis.hgetall(key);

    const nicknames = new Map<number, string>();
    for (const [userId, nickname] of Object.entries(data)) {
      nicknames.set(parseInt(userId, 10), nickname);
    }
    return nicknames;
  }

  /**
   * Verificar si un nickname ya está en uso
   */
  async isNicknameInUse(gameCode: string, nickname: string, excludeUserId?: number): Promise<boolean> {
    const nicknames = await this.getAllNicknames(gameCode);

    for (const [userId, nick] of nicknames.entries()) {
      if (excludeUserId && userId === excludeUserId) continue;
      if (nick.toLowerCase() === nickname.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Agregar jugador a la lista de jugadores conectados
   */
  async addPlayerToGame(gameCode: string, userId: number, nickname: string): Promise<void> {
    // Agregar a set de jugadores
    await redis.sadd(KEYS.gamePlayers(gameCode), userId.toString());
    await redis.expire(KEYS.gamePlayers(gameCode), TTL.gameSession);

    // Guardar nickname
    await this.setPlayerNickname(gameCode, userId, nickname);
  }

  /**
   * Obtener lista de IDs de jugadores
   */
  async getPlayerIds(gameCode: string): Promise<number[]> {
    const playerIds = await redis.smembers(KEYS.gamePlayers(gameCode));
    return playerIds.map(id => parseInt(id, 10));
  }

  /**
   * Health check - verificar conectividad con Redis
   */
  async healthCheck(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

export default new RedisGameSessionService();

