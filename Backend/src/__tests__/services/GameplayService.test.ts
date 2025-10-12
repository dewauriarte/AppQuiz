import { GameplayService } from '@services/GameplayService';
import prisma from '@config/database';
import * as scoring from '@utils/scoring';

// Mock Prisma
jest.mock('@config/database', () => ({
  __esModule: true,
  default: {
    games: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    game_players: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    game_answers: {
      create: jest.fn(),
    },
    game_results: {
      create: jest.fn(),
    },
    questions: {
      update: jest.fn(),
    },
    question_sets: {
      update: jest.fn(),
    },
    user_profiles: {
      upsert: jest.fn(),
    },
    user_currencies: {
      upsert: jest.fn(),
    },
  },
}));

// Mock scoring utils
jest.mock('@utils/scoring');

describe('GameplayService', () => {
  let service: GameplayService;

  beforeEach(() => {
    service = new GameplayService();
    jest.clearAllMocks();
  });

  describe('initializeGame', () => {
    it('should initialize game with questions', async () => {
      const mockGame = {
        game_id: 1,
        game_code: 'ABC123',
        config: { shuffle_questions: false, question_time_limit: 30 },
        question_sets: {
          questions: [
            {
              question_id: 1,
              question_text: 'Question 1',
              question_options: [
                { option_id: 1, option_text: 'A', is_correct: true },
                { option_id: 2, option_text: 'B', is_correct: false },
              ],
            },
            {
              question_id: 2,
              question_text: 'Question 2',
              question_options: [
                { option_id: 3, option_text: 'C', is_correct: false },
                { option_id: 4, option_text: 'D', is_correct: true },
              ],
            },
          ],
        },
      };

      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);

      const gameState = await service.initializeGame('ABC123');

      expect(gameState.gameId).toBe(1);
      expect(gameState.gameCode).toBe('ABC123');
      expect(gameState.currentQuestionIndex).toBe(0);
      expect(gameState.questions).toHaveLength(2);
      expect(gameState.timeLimit).toBe(30);
      expect(gameState.answersReceived.size).toBe(0);
    });

    it('should shuffle questions when config.shuffle_questions is true', async () => {
      const mockGame = {
        game_id: 1,
        game_code: 'ABC123',
        config: { shuffle_questions: true, question_time_limit: 30 },
        question_sets: {
          questions: [
            { question_id: 1, question_text: 'Q1', question_options: [] },
            { question_id: 2, question_text: 'Q2', question_options: [] },
            { question_id: 3, question_text: 'Q3', question_options: [] },
          ],
        },
      };

      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (scoring.shuffleArray as jest.Mock).mockImplementation((arr) => [...arr].reverse());

      const gameState = await service.initializeGame('ABC123');

      expect(scoring.shuffleArray).toHaveBeenCalledWith(mockGame.question_sets.questions);
      expect(gameState.questions[0].question_id).toBe(3); // Reversed
    });

    it('should throw error if game not found', async () => {
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.initializeGame('INVALID')).rejects.toThrow(
        'Game or question set not found'
      );
    });

    it('should throw error if question set not found', async () => {
      (prisma.games.findUnique as jest.Mock).mockResolvedValue({
        game_id: 1,
        question_sets: null,
      });

      await expect(service.initializeGame('ABC123')).rejects.toThrow(
        'Game or question set not found'
      );
    });
  });

  describe('getGameState', () => {
    it('should return game state if exists', async () => {
      const mockGame = {
        game_id: 1,
        game_code: 'ABC123',
        config: { question_time_limit: 30 },
        question_sets: { questions: [] },
      };

      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      await service.initializeGame('ABC123');

      const gameState = service.getGameState('ABC123');

      expect(gameState).toBeDefined();
      expect(gameState?.gameCode).toBe('ABC123');
    });

    it('should return undefined if game state does not exist', () => {
      const gameState = service.getGameState('NONEXISTENT');

      expect(gameState).toBeUndefined();
    });
  });

  describe('prepareQuestion', () => {
    beforeEach(async () => {
      const mockGame = {
        game_id: 1,
        game_code: 'TEST123',
        config: { question_time_limit: 30 },
        question_sets: {
          questions: [
            {
              question_id: 1,
              question_text: 'What is 2+2?',
              question_type: 'multiple_choice',
              difficulty: 'easy',
              question_options: [
                { option_id: 1, option_text: '3', option_order: 0, is_correct: false },
                { option_id: 2, option_text: '4', option_order: 1, is_correct: true },
                { option_id: 3, option_text: '5', option_order: 2, is_correct: false },
              ],
            },
          ],
        },
      };

      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      await service.initializeGame('TEST123');
    });

    it('should prepare question without is_correct field', () => {
      const questionData = service.prepareQuestion('TEST123');

      expect(questionData).toBeDefined();
      expect(questionData?.question.question_id).toBe(1);
      expect(questionData?.question.question_text).toBe('What is 2+2?');
      expect(questionData?.question.options).toHaveLength(3);

      // Verify is_correct is NOT in options
      questionData?.question.options.forEach((option) => {
        expect(option).not.toHaveProperty('is_correct');
        expect(option).toHaveProperty('option_id');
        expect(option).toHaveProperty('option_text');
        expect(option).toHaveProperty('option_order');
      });
    });

    it('should include question metadata', () => {
      const questionData = service.prepareQuestion('TEST123');

      expect(questionData?.questionNumber).toBe(1);
      expect(questionData?.totalQuestions).toBe(1);
      expect(questionData?.timeLimit).toBe(30);
    });

    it('should reset answers received set', () => {
      const gameState = service.getGameState('TEST123');
      gameState?.answersReceived.add(1);
      gameState?.answersReceived.add(2);

      service.prepareQuestion('TEST123');

      expect(gameState?.answersReceived.size).toBe(0);
    });

    it('should return null when no more questions', () => {
      const gameState = service.getGameState('TEST123');
      if (gameState) {
        gameState.currentQuestionIndex = 999; // Beyond questions array
      }

      const questionData = service.prepareQuestion('TEST123');

      expect(questionData).toBeNull();
    });
  });

  describe('processAnswer', () => {
    beforeEach(async () => {
      const mockGame = {
        game_id: 1,
        game_code: 'TEST123',
        config: { question_time_limit: 30 },
        question_sets: {
          questions: [
            {
              question_id: 1,
              question_text: 'Question',
              question_options: [
                { option_id: 1, option_text: 'Wrong', is_correct: false },
                { option_id: 2, option_text: 'Correct', is_correct: true },
              ],
            },
          ],
        },
      };

      const mockPlayer = {
        player_id: 100,
        user_id: 10,
        score: 1000,
        combo_streak: 2,
        highest_combo: 5,
        correct_answers: 8,
        wrong_answers: 2,
      };

      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.findFirst as jest.Mock).mockResolvedValue(mockPlayer);
      (prisma.game_players.update as jest.Mock).mockResolvedValue({});
      (prisma.game_answers.create as jest.Mock).mockResolvedValue({});
      (prisma.questions.update as jest.Mock).mockResolvedValue({});

      await service.initializeGame('TEST123');
    });

    it('should process correct answer and calculate points', async () => {
      (scoring.calculatePoints as jest.Mock).mockReturnValue({
        points: 1500,
        basePoints: 1000,
        speedBonus: 500,
        comboMultiplier: 1.2,
        totalPoints: 1500,
      });

      const result = await service.processAnswer('TEST123', 10, 1, 2, 5000);

      expect(result.isCorrect).toBe(true);
      expect(result.correctOptionId).toBe(2);
      expect(result.pointsEarned).toBe(1500);
      expect(result.newScore).toBe(2500); // 1000 + 1500
      expect(result.newCombo).toBe(3); // 2 + 1

      expect(scoring.calculatePoints).toHaveBeenCalledWith(true, 5000, 30000, 2);
    });

    it('should process incorrect answer with 0 points', async () => {
      (scoring.calculatePoints as jest.Mock).mockReturnValue({
        points: 0,
        basePoints: 0,
        speedBonus: 0,
        comboMultiplier: 1,
        totalPoints: 0,
      });

      const result = await service.processAnswer('TEST123', 10, 1, 1, 5000);

      expect(result.isCorrect).toBe(false);
      expect(result.correctOptionId).toBe(2);
      expect(result.pointsEarned).toBe(0);
      expect(result.newScore).toBe(1000); // No change
      expect(result.newCombo).toBe(0); // Reset to 0

      expect(scoring.calculatePoints).toHaveBeenCalledWith(false, 5000, 30000, 0);
    });

    it('should update player stats in database', async () => {
      (scoring.calculatePoints as jest.Mock).mockReturnValue({
        points: 1500,
        totalPoints: 1500,
        comboMultiplier: 1.2,
      });

      await service.processAnswer('TEST123', 10, 1, 2, 5000);

      expect(prisma.game_players.update).toHaveBeenCalledWith({
        where: { player_id: 100 },
        data: {
          score: 2500,
          combo_streak: 3,
          highest_combo: 5,
          correct_answers: 9,
          wrong_answers: 2,
        },
      });
    });

    it('should save answer to game_answers table', async () => {
      (scoring.calculatePoints as jest.Mock).mockReturnValue({
        points: 1500,
        totalPoints: 1500,
        comboMultiplier: 1.2,
      });

      await service.processAnswer('TEST123', 10, 1, 2, 5000);

      expect(prisma.game_answers.create).toHaveBeenCalledWith({
        data: {
          game_id: 1,
          player_id: 100,
          question_id: 1,
          option_id: 2,
          was_correct: true,
          time_taken_ms: 5000,
          points_earned: 1500,
          combo_multiplier: 1.2,
        },
      });
    });

    it('should update question stats', async () => {
      (scoring.calculatePoints as jest.Mock).mockReturnValue({
        totalPoints: 1500,
        comboMultiplier: 1.2,
      });

      await service.processAnswer('TEST123', 10, 1, 2, 5000);

      expect(prisma.questions.update).toHaveBeenCalledWith({
        where: { question_id: 1 },
        data: {
          times_answered: { increment: 1 },
          times_correct: { increment: 1 },
        },
      });
    });

    it('should throw error if answer already submitted', async () => {
      const gameState = service.getGameState('TEST123');
      gameState?.answersReceived.add(10);

      await expect(service.processAnswer('TEST123', 10, 1, 2, 5000)).rejects.toThrow(
        'Answer already submitted'
      );
    });

    it('should throw error if time expired', async () => {
      await expect(service.processAnswer('TEST123', 10, 1, 2, 35000)).rejects.toThrow(
        'Time expired'
      );
    });

    it('should throw error if player not found', async () => {
      (prisma.game_players.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.processAnswer('TEST123', 999, 1, 2, 5000)).rejects.toThrow(
        'Player not found'
      );
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard ordered by score', async () => {
      const mockGame = {
        game_id: 1,
        config: { question_time_limit: 30 },
        question_sets: { questions: [] },
      };

      const mockPlayers = [
        {
          player_id: 1,
          user_id: 10,
          nickname: 'Player1',
          score: 5000,
          correct_answers: 10,
          wrong_answers: 0,
          combo_streak: 5,
          highest_combo: 10,
          users: { username: 'user1', display_name: 'User One' },
        },
        {
          player_id: 2,
          user_id: 20,
          nickname: 'Player2',
          score: 3000,
          correct_answers: 8,
          wrong_answers: 2,
          combo_streak: 2,
          highest_combo: 5,
          users: { username: 'user2', display_name: 'User Two' },
        },
      ];

      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.findMany as jest.Mock).mockResolvedValue(mockPlayers);

      await service.initializeGame('TEST123');
      const leaderboard = await service.getLeaderboard('TEST123');

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].score).toBe(5000);
      expect(leaderboard[0].nickname).toBe('Player1');
      expect(leaderboard[1].rank).toBe(2);
      expect(leaderboard[1].score).toBe(3000);
    });
  });

  describe('advanceQuestion', () => {
    beforeEach(async () => {
      const mockGame = {
        game_id: 1,
        game_code: 'TEST123',
        config: { question_time_limit: 30 },
        question_sets: {
          questions: [
            { question_id: 1, question_options: [] },
            { question_id: 2, question_options: [] },
            { question_id: 3, question_options: [] },
          ],
        },
      };

      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      await service.initializeGame('TEST123');
    });

    it('should advance to next question and return true', () => {
      const hasMore = service.advanceQuestion('TEST123');

      expect(hasMore).toBe(true);
      const gameState = service.getGameState('TEST123');
      expect(gameState?.currentQuestionIndex).toBe(1);
    });

    it('should return false when no more questions', () => {
      const gameState = service.getGameState('TEST123');
      if (gameState) {
        gameState.currentQuestionIndex = 2; // Last question
      }

      const hasMore = service.advanceQuestion('TEST123');

      expect(hasMore).toBe(false);
    });

    it('should return false if game state not found', () => {
      const hasMore = service.advanceQuestion('INVALID');

      expect(hasMore).toBe(false);
    });
  });

  describe('endGame', () => {
    beforeEach(async () => {
      const mockGame = {
        game_id: 1,
        game_code: 'TEST123',
        set_id: 100,
        config: { question_time_limit: 30 },
        question_sets: {
          questions: [
            { question_id: 1, question_options: [] },
            { question_id: 2, question_options: [] },
          ],
        },
      };

      const mockPlayers = [
        {
          player_id: 1,
          user_id: 10,
          nickname: 'Winner',
          score: 3000,
          correct_answers: 2,
          wrong_answers: 0,
          combo_streak: 2,
          highest_combo: 2,
          total_time_played_ms: 10000,
          users: { username: 'winner', display_name: 'Winner' },
        },
        {
          player_id: 2,
          user_id: 20,
          nickname: 'Second',
          score: 2000,
          correct_answers: 1,
          wrong_answers: 1,
          combo_streak: 0,
          highest_combo: 1,
          total_time_played_ms: 15000,
          users: { username: 'second', display_name: 'Second' },
        },
      ];

      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.findMany as jest.Mock).mockResolvedValue(mockPlayers);
      (prisma.game_players.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockPlayers[0])
        .mockResolvedValueOnce(mockPlayers[1]);
      (prisma.game_results.create as jest.Mock).mockResolvedValue({});
      (prisma.user_profiles.upsert as jest.Mock).mockResolvedValue({});
      (prisma.user_currencies.upsert as jest.Mock).mockResolvedValue({});
      (prisma.question_sets.update as jest.Mock).mockResolvedValue({});
      (prisma.games.update as jest.Mock).mockResolvedValue({});

      (scoring.calculateRewards as jest.Mock)
        .mockReturnValueOnce({ xp: 360, coins: 180, gems: 5 })
        .mockReturnValueOnce({ xp: 240, coins: 120, gems: 3 });

      await service.initializeGame('TEST123');
    });

    it('should calculate and return final leaderboard with rewards', async () => {
      const results = await service.endGame('TEST123');

      expect(results.leaderboard).toHaveLength(2);
      expect(results.totalPlayers).toBe(2);
      expect(results.leaderboard[0].rank).toBe(1);
      expect(results.leaderboard[0].rewards).toEqual({ xp: 360, coins: 180, gems: 5 });
      expect(results.leaderboard[1].rank).toBe(2);
      expect(results.leaderboard[1].rewards).toEqual({ xp: 240, coins: 120, gems: 3 });
    });

    it('should save game results to database', async () => {
      await service.endGame('TEST123');

      expect(prisma.game_results.create).toHaveBeenCalledTimes(2);
      expect(prisma.game_results.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            game_id: 1,
            player_id: 1,
            user_id: 10,
            final_score: 3000,
            final_rank: 1,
            total_questions: 2,
            correct_answers: 2,
            xp_earned: 360,
            coins_earned: 180,
            gems_earned: 5,
          }),
        })
      );
    });

    it('should update user profiles with rewards', async () => {
      await service.endGame('TEST123');

      expect(prisma.user_profiles.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.user_profiles.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 10 },
          update: expect.objectContaining({
            total_xp: { increment: 360 },
            current_xp: { increment: 360 },
            total_games_played: { increment: 1 },
            total_games_won: { increment: 1 },
          }),
        })
      );
    });

    it('should update user currencies with rewards', async () => {
      await service.endGame('TEST123');

      expect(prisma.user_currencies.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.user_currencies.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 10 },
          update: expect.objectContaining({
            coins: { increment: 180 },
            gems: { increment: 5 },
          }),
        })
      );
    });

    it('should update question set stats', async () => {
      await service.endGame('TEST123');

      expect(prisma.question_sets.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { times_played: { increment: 1 } },
        })
      );
    });

    it('should update game status to finished', async () => {
      await service.endGame('TEST123');

      expect(prisma.games.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { game_id: 1 },
          data: expect.objectContaining({
            status: 'finished',
            ended_at: expect.any(Date),
          }),
        })
      );
    });

    it('should cleanup game state', async () => {
      await service.endGame('TEST123');

      const gameState = service.getGameState('TEST123');
      expect(gameState).toBeUndefined();
    });
  });
});
