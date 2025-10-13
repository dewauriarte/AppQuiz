import prisma from '@config/database';
import { GameStatus, Prisma } from '@prisma/client';
import { calculatePoints, calculateRewards, shuffleArray, ScoreCalculation } from '@utils/scoring';
import RedisGameSessionService, { PlayerState, GameSessionState } from './RedisGameSessionService';

/**
 * Gameplay Service - Gestión del flujo de juego
 * 
 * **NUEVA ARQUITECTURA CON REDIS**:
 * - Estado de sesión en Redis (rápido, persistente a recargas)
 * - Resultados finales en PostgreSQL
 * - Socket.IO solo para conexiones
 * 
 * Ventajas:
 * - ✅ Recargar página no pierde estado
 * - ✅ Reconexión automática
 * - ✅ Escalable a múltiples instancias
 * - ✅ TTL automático limpia sesiones viejas
 */

export class GameplayService {
  /**
   * Inicializa un juego y carga todas las preguntas
   * Crea la sesión en Redis
   * **CRÍTICO**: Persiste el orden de preguntas en Redis para mantener consistencia al recargar
   */
  async initializeGame(gameCode: string): Promise<GameSessionState> {
    // Intentar recuperar sesión existente de Redis
    let gameSession = await RedisGameSessionService.getGameSession(gameCode);

    if (gameSession) {
      console.log(`♻️ Recovering existing game session: ${gameCode}`);
      // Verificar que el orden de preguntas existe
      const questionOrder = await RedisGameSessionService.getQuestionOrder(gameCode);
      if (questionOrder.length === 0) {
        console.warn(`⚠️ Question order missing for ${gameCode}, regenerating...`);
        await this.initializeQuestionOrder(gameCode, gameSession.questionSetId, gameSession.config);
      }
      return gameSession;
    }

    // Si no existe en Redis, cargar desde DB
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
      include: {
        question_sets: {
          include: {
            questions: {
              select: {
                question_id: true, // Solo necesitamos el ID ahora
              },
            },
          },
        },
      },
    });

    if (!game || !game.question_sets) {
      throw new Error('Game or question set not found');
    }

    let questionIds = game.question_sets.questions.map(q => q.question_id);

    // Shuffle preguntas si está configurado
    if (game.config && typeof game.config === 'object' && 'shuffle_questions' in game.config) {
      const config = game.config as any;
      if (config.shuffle_questions) {
        questionIds = shuffleArray([...questionIds]);
      }
    }

    // **CRÍTICO**: Guardar orden de preguntas en Redis
    await RedisGameSessionService.setQuestionOrder(gameCode, questionIds);

    // Crear sesión en Redis
    gameSession = {
      gameId: game.game_id,
      gameCode: game.game_code,
      teacherId: game.teacher_id,
      questionSetId: game.set_id,
      totalQuestions: questionIds.length,
      currentQuestionIndex: 0,
      status: game.status,
      questionStartTime: 0,
      config: game.config,
      createdAt: game.created_at.getTime(),
      startedAt: game.started_at?.getTime(),
    };

    await RedisGameSessionService.createGameSession(gameCode, gameSession);

    // Inicializar jugadores desde DB
    const gamePlayers = await prisma.game_players.findMany({
      where: { game_id: game.game_id },
      select: {
        user_id: true,
        nickname: true,
        score: true,
        correct_answers: true,
        wrong_answers: true,
        combo_streak: true,
        highest_combo: true,
        total_time_played_ms: true,
      },
    });

    for (const p of gamePlayers) {
      if (p.user_id) {
        const playerState: PlayerState = {
          userId: p.user_id,
          nickname: p.nickname,
          score: p.score,
          correctAnswers: p.correct_answers,
          wrongAnswers: p.wrong_answers,
          comboStreak: p.combo_streak,
          highestCombo: p.highest_combo,
          totalTimeTaken: p.total_time_played_ms || 0,
          isConnected: false,
        };
        await RedisGameSessionService.setPlayerState(gameCode, p.user_id, playerState);

        // **NUEVO**: Guardar en Redis para tracking de jugadores
        await RedisGameSessionService.addPlayerToGame(gameCode, p.user_id, p.nickname);
      }
    }

    console.log(`✅ Game initialized in Redis: ${gameCode} with ${questionIds.length} questions`);
    return gameSession;
  }

  /**
   * Inicializa el orden de preguntas (helper para recovery)
   */
  private async initializeQuestionOrder(
    gameCode: string,
    questionSetId: number,
    config: Prisma.JsonValue
  ): Promise<void> {
    const questions = await prisma.questions.findMany({
      where: { set_id: questionSetId },
      select: { question_id: true },
      orderBy: { question_id: 'asc' },
    });

    let questionIds = questions.map(q => q.question_id);

    // Aplicar shuffle si está configurado
    if (config && typeof config === 'object' && 'shuffle_questions' in config) {
      const cfg = config as any;
      if (cfg.shuffle_questions) {
        questionIds = shuffleArray([...questionIds]);
      }
    }

    await RedisGameSessionService.setQuestionOrder(gameCode, questionIds);
  }

  /**
   * Prepara una pregunta para ser enviada a los jugadores (sin la respuesta correcta)
   * **USA ORDEN PERSISTIDO EN REDIS** - garantiza misma pregunta al recargar
   */
  async prepareQuestion(gameCode: string): Promise<{
    questionNumber: number;
    totalQuestions: number;
    questionId: number;
    questionText: string;
    questionType: string;
    options: { option_id: number; option_text: string; option_order: number; explanation?: string | null }[];
    timeLimit: number;
    mediaUrl?: string | null;
    mediaType?: string | null;
  } | null> {
    const gameSession = await RedisGameSessionService.getGameSession(gameCode);
    if (!gameSession) {
      throw new Error('Game session not found');
    }

    // Verificar si hay más preguntas
    if (gameSession.currentQuestionIndex >= gameSession.totalQuestions) {
      return null; // No hay más preguntas
    }

    // **CRÍTICO**: Obtener orden de preguntas desde Redis
    const questionOrder = await RedisGameSessionService.getQuestionOrder(gameCode);
    if (questionOrder.length === 0) {
      throw new Error('Question order not found in Redis');
    }

    // Obtener ID de la pregunta actual según el orden persistido
    const currentQuestionId = questionOrder[gameSession.currentQuestionIndex];
    if (!currentQuestionId) {
      return null;
    }

    // Cargar pregunta específica desde BD
    const question = await prisma.questions.findUnique({
      where: { question_id: currentQuestionId },
      include: {
        question_options: true,
      },
    });

    if (!question) {
      console.error(`Question ${currentQuestionId} not found in DB`);
      return null;
    }

    let options = [...question.question_options];

    // Shuffle opciones si está configurado
    if (gameSession.config && typeof gameSession.config === 'object' && 'shuffle_options' in gameSession.config) {
      const config = gameSession.config as any;
      if (config.shuffle_options) {
        options = shuffleArray(options);
      }
    }

    // Remover is_correct de las opciones pero mantener explanation
    const sanitizedOptions = options.map((opt, index) => ({
      option_id: opt.option_id,
      option_text: opt.option_text,
      option_order: index + 1, // Orden basado en posición actual (después de shuffle)
      explanation: opt.explanation || null, // Incluir explicación de cada opción
    }));

    // Actualizar timestamp de inicio de pregunta
    await RedisGameSessionService.updateGameSession(gameCode, {
      questionStartTime: Date.now(),
    });

    return {
      questionNumber: gameSession.currentQuestionIndex + 1,
      totalQuestions: gameSession.totalQuestions,
      questionId: question.question_id,
      questionText: question.question_text,
      questionType: question.question_type,
      options: sanitizedOptions,
      timeLimit: question.time_limit,
      mediaUrl: question.media_url,
      mediaType: question.media_type,
    };
  }

  /**
   * Procesa la respuesta de un jugador
   */
  async processAnswer(
    gameCode: string,
    userId: number,
    questionId: number,
    optionId: number,
    timeTaken: number
  ): Promise<{ scoreResult: ScoreCalculation; isCorrect: boolean; correctOptionId: number | null; explanation: string | null }> {
    // Verificar si ya respondió (en Redis)
    const hasAnswered = await RedisGameSessionService.hasPlayerAnswered(gameCode, questionId, userId);
    if (hasAnswered) {
      throw new Error('Ya has respondido a esta pregunta');
    }

    // Obtener estado del jugador desde Redis
    const playerState = await RedisGameSessionService.getPlayerState(gameCode, userId);
    if (!playerState) {
      throw new Error('Player not found in game session');
    }

    // Obtener la pregunta y opción correcta
    const question = await prisma.questions.findUnique({
      where: { question_id: questionId },
      include: {
        question_options: true,
      },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    const correctOption = question.question_options.find((o: any) => o.is_correct);
    const isCorrect = correctOption?.option_id === optionId;

    // Calcular puntos (convertir timeLimit a milisegundos para que coincida con timeTaken)
    const scoreResult = calculatePoints(
      isCorrect,
      timeTaken,  // En milisegundos
      question.time_limit * 1000,  // Convertir de segundos a milisegundos
      playerState.comboStreak
    );

    // Actualizar estado del jugador
    playerState.score += scoreResult.totalPoints;
    playerState.totalTimeTaken += timeTaken;

    if (isCorrect) {
      playerState.correctAnswers++;
      playerState.comboStreak++;
      if (playerState.comboStreak > playerState.highestCombo) {
        playerState.highestCombo = playerState.comboStreak;
      }
    } else {
      playerState.wrongAnswers++;
      playerState.comboStreak = 0; // Reset combo
    }

    playerState.lastAnswerTime = Date.now();

    // Guardar en Redis
    await RedisGameSessionService.setPlayerState(gameCode, userId, playerState);

    // Registrar respuesta en Redis (cache)
    await RedisGameSessionService.recordAnswer(gameCode, questionId, {
      userId,
      optionId,
      timeTaken,
      timestamp: Date.now(),
    });

    // Guardar en BD de forma asíncrona (no bloquear)
    this.saveAnswerToDB(gameCode, userId, questionId, optionId, isCorrect, timeTaken, scoreResult).catch(err => {
      console.error('Error saving answer to DB:', err);
    });

    return {
      scoreResult,
      isCorrect,
      correctOptionId: correctOption?.option_id || null,
      explanation: question.explanation,
    };
  }

  /**
   * Guardar respuesta en la base de datos (asíncrono)
   */
  private async saveAnswerToDB(
    gameCode: string,
    userId: number,
    questionId: number,
    optionId: number,
    isCorrect: boolean,
    timeTaken: number,
    scoreResult: ScoreCalculation
  ): Promise<void> {
    const gameSession = await RedisGameSessionService.getGameSession(gameCode);
    if (!gameSession) return;

    const gamePlayer = await prisma.game_players.findFirst({
      where: {
        game_id: gameSession.gameId,
        user_id: userId,
      },
    });

    if (!gamePlayer) return;

    // Guardar respuesta
    await prisma.game_answers.create({
      data: {
        game_id: gameSession.gameId,
        player_id: gamePlayer.player_id,
        question_id: questionId,
        option_id: optionId,
        was_correct: isCorrect,
        time_taken_ms: timeTaken,
        points_earned: scoreResult.totalPoints,
        combo_multiplier: new Prisma.Decimal(scoreResult.comboMultiplier),
      },
    });

    // Actualizar game_players en BD
    await prisma.game_players.updateMany({
      where: {
        game_id: gameSession.gameId,
        user_id: userId,
      },
      data: {
        score: { increment: scoreResult.totalPoints },
        correct_answers: { increment: isCorrect ? 1 : 0 },
        wrong_answers: { increment: isCorrect ? 0 : 1 },
        total_time_played_ms: { increment: timeTaken },
      },
    });

    // Actualizar estadísticas de la pregunta
    await prisma.questions.update({
      where: { question_id: questionId },
      data: {
        times_answered: { increment: 1 },
        times_correct: { increment: isCorrect ? 1 : 0 },
      },
    });
  }

  /**
   * Obtiene el leaderboard actual del juego
   */
  async getLeaderboard(gameCode: string): Promise<Array<PlayerState & { rank: number }>> {
    return RedisGameSessionService.getLeaderboard(gameCode);
  }

  /**
   * Avanza a la siguiente pregunta o finaliza el juego
   * @returns true if there are more questions, false otherwise
   */
  async advanceQuestion(gameCode: string): Promise<boolean> {
    const gameSession = await RedisGameSessionService.getGameSession(gameCode);
    if (!gameSession) {
      throw new Error('Game session not found');
    }

    const nextIndex = gameSession.currentQuestionIndex + 1;
    
    await RedisGameSessionService.updateGameSession(gameCode, {
      currentQuestionIndex: nextIndex,
    });

    return nextIndex < gameSession.totalQuestions;
  }

  /**
   * Finaliza el juego, guarda resultados y otorga recompensas
   */
  async endGame(gameCode: string): Promise<{ leaderboard: any[]; totalPlayers: number }> {
    const gameSession = await RedisGameSessionService.getGameSession(gameCode);
    if (!gameSession) {
      throw new Error('Game session not found');
    }

    // Actualizar estado del juego a 'finished' en BD
    await prisma.games.update({
      where: { game_id: gameSession.gameId },
      data: {
        status: GameStatus.finished,
        ended_at: new Date(),
      },
    });

    // Obtener leaderboard final
    const leaderboard = await RedisGameSessionService.getLeaderboard(gameCode);
    const totalPlayers = leaderboard.length;

    // Guardar resultados y otorgar recompensas
    for (const player of leaderboard) {
      const rewards = calculateRewards(player.rank, totalPlayers);

      // Obtener player_id
      const gamePlayer = await prisma.game_players.findFirst({
        where: {
          game_id: gameSession.gameId,
          user_id: player.userId,
        },
      });

      if (!gamePlayer) continue;

      const totalQuestions = gameSession.totalQuestions;
      const accuracy = totalQuestions > 0 ? (player.correctAnswers / totalQuestions) * 100 : 0;

      // Guardar en game_results
      await prisma.game_results.create({
        data: {
          game_id: gameSession.gameId,
          player_id: gamePlayer.player_id,
          user_id: player.userId,
          final_score: player.score,
          final_rank: player.rank,
          total_questions: totalQuestions,
          correct_answers: player.correctAnswers,
          wrong_answers: player.wrongAnswers,
          accuracy_percentage: new Prisma.Decimal(accuracy),
          average_response_time_ms: player.totalTimeTaken,
          highest_combo: player.highestCombo,
          xp_earned: rewards.xp,
          coins_earned: rewards.coins,
          gems_earned: rewards.gems,
          podium_finish: player.rank <= 3,
          perfect_score: player.correctAnswers === totalQuestions,
        },
      });

      // Otorgar recompensas al usuario
      await prisma.user_profiles.upsert({
        where: { user_id: player.userId },
        update: {
          total_xp: { increment: rewards.xp },
          current_xp: { increment: rewards.xp },
          total_games_played: { increment: 1 },
          total_games_won: { increment: player.rank === 1 ? 1 : 0 },
          total_quizzes_completed: { increment: 1 },
          total_questions_answered: { increment: totalQuestions },
          total_correct_answers: { increment: player.correctAnswers },
        },
        create: {
          user_id: player.userId,
          total_xp: rewards.xp,
          current_xp: rewards.xp,
          total_games_played: 1,
          total_games_won: player.rank === 1 ? 1 : 0,
          total_quizzes_completed: 1,
          total_questions_answered: totalQuestions,
          total_correct_answers: player.correctAnswers,
        },
      });

      // Actualizar monedas
      await prisma.user_currencies.upsert({
        where: { user_id: player.userId },
        update: {
          coins: { increment: rewards.coins },
          gems: { increment: rewards.gems },
          total_coins_earned: { increment: rewards.coins },
          total_gems_earned: { increment: rewards.gems },
        },
        create: {
          user_id: player.userId,
          coins: rewards.coins,
          gems: rewards.gems,
          total_coins_earned: rewards.coins,
          total_gems_earned: rewards.gems,
        },
      });
    }

    // Actualizar estadísticas del question set
    await prisma.question_sets.update({
      where: { set_id: gameSession.questionSetId },
      data: {
        times_played: { increment: 1 },
      },
    });

    // Limpiar sesión de Redis
    await RedisGameSessionService.cleanupGameSession(gameCode);

    return { leaderboard, totalPlayers };
  }

  /**
   * Marcar jugador como conectado/desconectado
   */
  async setPlayerConnection(gameCode: string, userId: number, isConnected: boolean): Promise<void> {
    await RedisGameSessionService.setPlayerConnection(gameCode, userId, isConnected);
  }

  /**
   * Obtener cantidad de respuestas recibidas para la pregunta actual
   */
  async getAnswersReceivedCount(gameCode: string, questionId: number): Promise<number> {
    const answers = await RedisGameSessionService.getQuestionAnswers(gameCode, questionId);
    return answers.length;
  }

  /**
   * Recuperar sesión desde la base de datos (para reconexión)
   */
  async recoverSession(gameCode: string): Promise<boolean> {
    return RedisGameSessionService.initializeFromDatabase(gameCode);
  }
}

export default new GameplayService();
