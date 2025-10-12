import prisma from '@config/database';
import { calculatePoints, calculateRewards, shuffleArray } from '@utils/scoring';

interface GameState {
  gameId: number;
  gameCode: string;
  currentQuestionIndex: number;
  questions: any[];
  questionStartTime: number;
  timeLimit: number;
  answersReceived: Set<number>; // userIds que ya respondieron
}

// Map para trackear el estado de cada juego activo
const activeGames = new Map<string, GameState>();

// Map para trackear timers
const gameTimers = new Map<string, NodeJS.Timeout>();

export class GameplayService {
  /**
   * Inicializa un juego y obtiene todas las preguntas
   */
  async initializeGame(gameCode: string): Promise<GameState> {
    const game = await prisma.games.findUnique({
      where: { game_code: gameCode },
      include: {
        question_sets: {
          include: {
            questions: {
              include: {
                question_options: true,
              },
            },
          },
        },
      },
    });

    if (!game || !game.question_sets) {
      throw new Error('Game or question set not found');
    }

    let questions = game.question_sets.questions;

    // Shuffle preguntas si está configurado
    if (game.config && typeof game.config === 'object' && 'shuffle_questions' in game.config) {
      const config = game.config as any;
      if (config.shuffle_questions) {
        questions = shuffleArray(questions);
      }
    }

    const gameState: GameState = {
      gameId: game.game_id,
      gameCode,
      currentQuestionIndex: 0,
      questions,
      questionStartTime: Date.now(),
      timeLimit: (game.config as any)?.question_time_limit || 30,
      answersReceived: new Set(),
    };

    activeGames.set(gameCode, gameState);
    return gameState;
  }

  /**
   * Obtiene el estado actual de un juego
   */
  getGameState(gameCode: string): GameState | undefined {
    return activeGames.get(gameCode);
  }

  /**
   * Prepara una pregunta para enviar (sin respuesta correcta)
   */
  prepareQuestion(gameCode: string) {
    const gameState = activeGames.get(gameCode);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const question = gameState.questions[gameState.currentQuestionIndex];
    if (!question) {
      return null; // No hay más preguntas
    }

    let options = [...question.question_options];

    // Shuffle opciones si está configurado
    // options = shuffleArray(options);

    // Remover is_correct de las opciones
    const sanitizedOptions = options.map(({ option_id, option_text, option_order }) => ({
      option_id,
      option_text,
      option_order,
    }));

    // Reset tracking de respuestas para esta pregunta
    gameState.answersReceived.clear();
    gameState.questionStartTime = Date.now();

    return {
      questionNumber: gameState.currentQuestionIndex + 1,
      totalQuestions: gameState.questions.length,
      question: {
        question_id: question.question_id,
        question_text: question.question_text,
        question_type: question.question_type,
        difficulty: question.difficulty,
        options: sanitizedOptions,
      },
      timeLimit: gameState.timeLimit,
    };
  }

  /**
   * Procesa una respuesta de un jugador
   */
  async processAnswer(
    gameCode: string,
    userId: number,
    questionId: number,
    optionId: number,
    timeTaken: number
  ) {
    const gameState = activeGames.get(gameCode);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    // Verificar que no haya respondido ya
    if (gameState.answersReceived.has(userId)) {
      throw new Error('Answer already submitted');
    }

    // Verificar timeout
    if (timeTaken > gameState.timeLimit * 1000) {
      throw new Error('Time expired');
    }

    // Marcar como respondido
    gameState.answersReceived.add(userId);

    // Obtener la pregunta y opción correcta
    const question = gameState.questions[gameState.currentQuestionIndex];
    const correctOption = question.question_options.find((o: any) => o.is_correct);
    const isCorrect = correctOption?.option_id === optionId;

    // Obtener jugador actual
    const player = await prisma.game_players.findFirst({
      where: {
        game_id: gameState.gameId,
        user_id: userId,
      },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    // Calcular puntos
    const currentCombo = isCorrect ? player.combo_streak : 0;
    const scoreResult = calculatePoints(
      isCorrect,
      timeTaken,
      gameState.timeLimit * 1000,
      currentCombo
    );

    // Actualizar estadísticas del jugador
    const newScore = player.score + scoreResult.totalPoints;
    const newCombo = isCorrect ? player.combo_streak + 1 : 0;
    const newCorrect = player.correct_answers + (isCorrect ? 1 : 0);
    const newWrong = player.wrong_answers + (isCorrect ? 0 : 1);

    await prisma.game_players.update({
      where: { player_id: player.player_id },
      data: {
        score: newScore,
        combo_streak: newCombo,
        highest_combo: Math.max(player.highest_combo, newCombo),
        correct_answers: newCorrect,
        wrong_answers: newWrong,
      },
    });

    // Guardar respuesta en game_answers
    await prisma.game_answers.create({
      data: {
        game_id: gameState.gameId,
        player_id: player.player_id,
        question_id: questionId,
        option_id: optionId,
        was_correct: isCorrect,
        time_taken_ms: timeTaken,
        points_earned: scoreResult.totalPoints,
        combo_multiplier: scoreResult.comboMultiplier,
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

    return {
      isCorrect,
      correctOptionId: correctOption?.option_id,
      pointsEarned: scoreResult.totalPoints,
      newScore,
      newCombo,
      breakdown: scoreResult,
    };
  }

  /**
   * Obtiene el leaderboard actual
   */
  async getLeaderboard(gameCode: string) {
    const gameState = activeGames.get(gameCode);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const players = await prisma.game_players.findMany({
      where: { game_id: gameState.gameId },
      include: {
        users: {
          select: {
            username: true,
            display_name: true,
          },
        },
      },
      orderBy: [
        { score: 'desc' },
        { correct_answers: 'desc' },
        { combo_streak: 'desc' },
      ],
    });

    return players.map((player, index) => ({
      rank: index + 1,
      user_id: player.user_id,
      nickname: player.nickname,
      username: player.users?.username,
      display_name: player.users?.display_name,
      score: player.score,
      correct_answers: player.correct_answers,
      wrong_answers: player.wrong_answers,
      combo_streak: player.combo_streak,
      highest_combo: player.highest_combo,
    }));
  }

  /**
   * Avanza a la siguiente pregunta
   */
  advanceQuestion(gameCode: string): boolean {
    const gameState = activeGames.get(gameCode);
    if (!gameState) {
      return false;
    }

    gameState.currentQuestionIndex++;
    return gameState.currentQuestionIndex < gameState.questions.length;
  }

  /**
   * Finaliza el juego y calcula resultados
   */
  async endGame(gameCode: string) {
    const gameState = activeGames.get(gameCode);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    // Obtener leaderboard final
    const leaderboard = await this.getLeaderboard(gameCode);
    const totalPlayers = leaderboard.length;

    // Array para almacenar leaderboard con recompensas
    const leaderboardWithRewards = [];

    // Guardar resultados y otorgar recompensas
    for (const player of leaderboard) {
      if (!player.user_id) continue;

      const rewards = calculateRewards(player.rank, totalPlayers);

      // Agregar recompensas al player
      leaderboardWithRewards.push({
        ...player,
        rewards: {
          xp: rewards.xp,
          coins: rewards.coins,
          gems: rewards.gems,
        },
      });

      // Obtener player_id
      const gamePlayer = await prisma.game_players.findFirst({
        where: {
          game_id: gameState.gameId,
          user_id: player.user_id,
        },
      });

      if (!gamePlayer) continue;

      const totalQuestions = gameState.questions.length;
      const accuracy = (player.correct_answers / totalQuestions) * 100;
      const avgResponseTime = gamePlayer.total_time_played_ms || 0;

      // Guardar en game_results
      await prisma.game_results.create({
        data: {
          game_id: gameState.gameId,
          player_id: gamePlayer.player_id,
          user_id: player.user_id,
          final_score: player.score,
          final_rank: player.rank,
          total_questions: totalQuestions,
          correct_answers: player.correct_answers,
          wrong_answers: player.wrong_answers,
          accuracy_percentage: accuracy,
          average_response_time_ms: avgResponseTime,
          highest_combo: player.highest_combo,
          xp_earned: rewards.xp,
          coins_earned: rewards.coins,
          gems_earned: rewards.gems,
          podium_finish: player.rank <= 3,
          perfect_score: player.correct_answers === totalQuestions,
        },
      });

      // Otorgar recompensas al usuario
      // Actualizar XP y stats del perfil
      await prisma.user_profiles.upsert({
        where: { user_id: player.user_id },
        update: {
          total_xp: { increment: rewards.xp },
          current_xp: { increment: rewards.xp },
          total_games_played: { increment: 1 },
          total_games_won: { increment: player.rank === 1 ? 1 : 0 },
          total_quizzes_completed: { increment: 1 },
          total_questions_answered: { increment: totalQuestions },
          total_correct_answers: { increment: player.correct_answers },
        },
        create: {
          user_id: player.user_id,
          total_xp: rewards.xp,
          current_xp: rewards.xp,
          total_games_played: 1,
          total_games_won: player.rank === 1 ? 1 : 0,
          total_quizzes_completed: 1,
          total_questions_answered: totalQuestions,
          total_correct_answers: player.correct_answers,
        },
      });

      // Actualizar monedas
      await prisma.user_currencies.upsert({
        where: { user_id: player.user_id },
        update: {
          coins: { increment: rewards.coins },
          gems: { increment: rewards.gems },
          total_coins_earned: { increment: rewards.coins },
          total_gems_earned: { increment: rewards.gems },
        },
        create: {
          user_id: player.user_id,
          coins: rewards.coins,
          gems: rewards.gems,
          total_coins_earned: rewards.coins,
          total_gems_earned: rewards.gems,
        },
      });
    }

    // Actualizar estadísticas del question set
    await prisma.question_sets.update({
      where: { set_id: (await prisma.games.findUnique({ where: { game_id: gameState.gameId } }))!.set_id },
      data: {
        times_played: { increment: 1 },
      },
    });

    // Actualizar estado del juego
    await prisma.games.update({
      where: { game_id: gameState.gameId },
      data: {
        status: 'finished',
        ended_at: new Date(),
      },
    });

    // Limpiar estado
    this.cleanupGame(gameCode);

    return {
      leaderboard: leaderboardWithRewards,
      totalPlayers,
    };
  }

  /**
   * Limpia el estado de un juego
   */
  cleanupGame(gameCode: string) {
    activeGames.delete(gameCode);
    
    const timer = gameTimers.get(gameCode);
    if (timer) {
      clearTimeout(timer);
      gameTimers.delete(gameCode);
    }
  }

  /**
   * Establece un timer para un juego
   */
  setGameTimer(gameCode: string, timer: NodeJS.Timeout) {
    // Limpiar timer anterior si existe
    const existingTimer = gameTimers.get(gameCode);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    gameTimers.set(gameCode, timer);
  }

  /**
   * Limpia el timer de un juego
   */
  clearGameTimer(gameCode: string) {
    const timer = gameTimers.get(gameCode);
    if (timer) {
      clearTimeout(timer);
      gameTimers.delete(gameCode);
    }
  }
}

export default new GameplayService();

