import BoardGameService from '@/services/BoardGameService';
import prisma from '@/config/database';
import redis from '@/config/redis';
import { BoardEventType } from '@prisma/client';
import * as RewardsService from '@/services/RewardsService';

// Mock dependencies
jest.mock('@/config/database');
jest.mock('@/config/redis');
jest.mock('@/services/RewardsService');

describe('BoardGameService', () => {
  const mockGameCode = 'TEST123';
  const mockUserId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rollDice', () => {
    it('should generate dice value between 1 and 6', async () => {
      // Setup mocks
      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [mockUserId],
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      const mockPlayerState = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 5,
        coins_collected: 100,
        powerups: [],
        shields: 0,
        is_turn: true,
      };

      const mockGame = {
        game_id: 1,
        game_code: mockGameCode,
      };

      // Mock Redis calls
      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockBoardState)) // getBoardState
        .mockResolvedValueOnce(JSON.stringify(mockPlayerState)); // getBoardPlayerState

      (redis.setex as jest.Mock).mockResolvedValue('OK');
      (redis.sadd as jest.Mock).mockResolvedValue(1);

      // Mock Prisma
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Execute multiple times to test range
      const results: number[] = [];
      for (let i = 0; i < 100; i++) {
        const result = await BoardGameService.rollDice(mockGameCode, mockUserId);
        results.push(result.diceValue);
      }

      // Verify all values are between 1 and 6
      results.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(6);
      });

      // Verify we got different values (not all the same)
      const uniqueValues = new Set(results);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });

    it('should update player position correctly', async () => {
      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [mockUserId],
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      const mockPlayerState = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 5,
        coins_collected: 100,
        powerups: [],
        shields: 0,
        is_turn: true,
      };

      const mockGame = { game_id: 1, game_code: mockGameCode };

      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockBoardState))
        .mockResolvedValueOnce(JSON.stringify(mockPlayerState));

      (redis.setex as jest.Mock).mockResolvedValue('OK');
      (redis.sadd as jest.Mock).mockResolvedValue(1);
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await BoardGameService.rollDice(mockGameCode, mockUserId);

      expect(result.oldPosition).toBe(5);
      expect(result.newPosition).toBe(5 + result.diceValue);
      expect(result.userId).toBe(mockUserId);
      expect(result.timestamp).toBeDefined();
    });

    it('should not exceed board size', async () => {
      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [mockUserId],
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      const mockPlayerState = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 38, // Near the end
        coins_collected: 100,
        powerups: [],
        shields: 0,
        is_turn: true,
      };

      const mockGame = { game_id: 1, game_code: mockGameCode };

      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockBoardState))
        .mockResolvedValueOnce(JSON.stringify(mockPlayerState));

      (redis.setex as jest.Mock).mockResolvedValue('OK');
      (redis.sadd as jest.Mock).mockResolvedValue(1);
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await BoardGameService.rollDice(mockGameCode, mockUserId);

      // Should be capped at board_size - 1
      expect(result.newPosition).toBeLessThanOrEqual(39);
    });

    it('should throw error if not player turn', async () => {
      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [999], // Different player
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      (redis.get as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockBoardState));

      await expect(
        BoardGameService.rollDice(mockGameCode, mockUserId)
      ).rejects.toThrow('Not your turn');
    });
  });

  describe('executeEvent', () => {
    it('should execute bonus_coins event', async () => {
      const mockEvent = {
        event_id: 1,
        event_type: BoardEventType.bonus_coins,
        name: 'Treasure',
        description: 'Found coins!',
        coin_effect: 50,
        gem_effect: 0,
        xp_effect: 0,
        move_effect: 0,
      };

      const mockPlayerState = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 10,
        coins_collected: 100,
        powerups: [],
        shields: 0,
        is_turn: true,
      };

      const mockGame = { game_id: 1, game_code: mockGameCode };

      (prisma.board_events.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockPlayerState));
      (redis.setex as jest.Mock).mockResolvedValue('OK');
      (redis.sadd as jest.Mock).mockResolvedValue(1);
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (RewardsService.grantRewards as jest.Mock).mockResolvedValue({
        coins: 50,
        gems: 0,
        xp: 0,
        levelUp: false,
      });

      const result = await BoardGameService.executeEvent(mockGameCode, mockUserId, {
        position: 10,
        event_type: BoardEventType.bonus_coins,
        event_id: 1,
      });

      expect(result.event_type).toBe(BoardEventType.bonus_coins);
      expect(result.effects.coin_change).toBe(50);
      expect(RewardsService.grantRewards).toHaveBeenCalledWith(mockUserId, {
        coins: 50,
        gems: 0,
        xp: 0,
      });
    });

    it('should execute trap_lose_coins event', async () => {
      const mockEvent = {
        event_id: 2,
        event_type: BoardEventType.trap_lose_coins,
        name: 'Trap',
        description: 'Lost coins!',
        coin_effect: -50,
        gem_effect: 0,
        xp_effect: 0,
        move_effect: 0,
      };

      const mockPlayerState = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 10,
        coins_collected: 100,
        powerups: [],
        shields: 0,
        is_turn: true,
      };

      const mockGame = { game_id: 1, game_code: mockGameCode };

      (prisma.board_events.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockPlayerState));
      (redis.setex as jest.Mock).mockResolvedValue('OK');
      (redis.sadd as jest.Mock).mockResolvedValue(1);
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (RewardsService.grantRewards as jest.Mock).mockResolvedValue({
        coins: -50,
        gems: 0,
        xp: 0,
        levelUp: false,
      });

      const result = await BoardGameService.executeEvent(mockGameCode, mockUserId, {
        position: 10,
        event_type: BoardEventType.trap_lose_coins,
        event_id: 2,
      });

      expect(result.event_type).toBe(BoardEventType.trap_lose_coins);
      expect(result.effects.coin_change).toBe(-50);
    });

    it('should respect shields on trap events', async () => {
      const mockEvent = {
        event_id: 2,
        event_type: BoardEventType.trap_lose_coins,
        name: 'Trap',
        description: 'Lost coins!',
        coin_effect: -50,
        gem_effect: 0,
        xp_effect: 0,
        move_effect: 0,
      };

      const mockPlayerState = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 10,
        coins_collected: 100,
        powerups: [],
        shields: 1, // Has shield
        is_turn: true,
      };

      const mockGame = { game_id: 1, game_code: mockGameCode };

      (prisma.board_events.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockPlayerState));
      (redis.setex as jest.Mock).mockResolvedValue('OK');
      (redis.sadd as jest.Mock).mockResolvedValue(1);
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await BoardGameService.executeEvent(mockGameCode, mockUserId, {
        position: 10,
        event_type: BoardEventType.trap_lose_coins,
        event_id: 2,
      });

      expect(result.message).toContain('escudo');
      expect(result.effects.coin_change).toBeUndefined();
    });

    it('should execute teleport_forward event', async () => {
      const mockEvent = {
        event_id: 3,
        event_type: BoardEventType.teleport_forward,
        name: 'Portal',
        description: 'Teleport!',
        coin_effect: 0,
        gem_effect: 0,
        xp_effect: 0,
        move_effect: 5,
      };

      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [mockUserId],
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      const mockPlayerState = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 10,
        coins_collected: 100,
        powerups: [],
        shields: 0,
        is_turn: true,
      };

      const mockGame = { game_id: 1, game_code: mockGameCode };

      (prisma.board_events.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockPlayerState))
        .mockResolvedValueOnce(JSON.stringify(mockBoardState));
      (redis.setex as jest.Mock).mockResolvedValue('OK');
      (redis.sadd as jest.Mock).mockResolvedValue(1);
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await BoardGameService.executeEvent(mockGameCode, mockUserId, {
        position: 10,
        event_type: BoardEventType.teleport_forward,
        event_id: 3,
      });

      expect(result.event_type).toBe(BoardEventType.teleport_forward);
      expect(result.effects.position_change).toBe(5);
    });

    it('should execute mystery_box with random reward', async () => {
      const mockEvent = {
        event_id: 4,
        event_type: BoardEventType.mystery_box,
        name: 'Mystery Box',
        description: 'Random reward!',
        coin_effect: 0,
        gem_effect: 0,
        xp_effect: 0,
        move_effect: 0,
      };

      const mockPlayerState = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 10,
        coins_collected: 100,
        powerups: [],
        shields: 0,
        is_turn: true,
      };

      const mockGame = { game_id: 1, game_code: mockGameCode };

      (prisma.board_events.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockPlayerState));
      (redis.setex as jest.Mock).mockResolvedValue('OK');
      (redis.sadd as jest.Mock).mockResolvedValue(1);
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await BoardGameService.executeEvent(mockGameCode, mockUserId, {
        position: 10,
        event_type: BoardEventType.mystery_box,
        event_id: 4,
      });

      expect(result.event_type).toBe(BoardEventType.mystery_box);
      expect(result.message).toBeDefined();
      expect(result.effects).toBeDefined();
    });
  });

  describe('checkWinCondition', () => {
    it('should detect winner when player reaches end', async () => {
      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [mockUserId, 2, 3],
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      const mockPlayerState = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 39, // At the end (board_size - 1)
        coins_collected: 100,
        powerups: [],
        shields: 0,
        is_turn: true,
      };

      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockBoardState))
        .mockResolvedValueOnce(JSON.stringify(mockPlayerState));

      const result = await BoardGameService.checkWinCondition(mockGameCode);

      expect(result.hasWinner).toBe(true);
      expect(result.winnerId).toBe(mockUserId);
    });

    it('should not detect winner when no player at end', async () => {
      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [mockUserId, 2, 3],
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      const mockPlayerStates = [
        {
          userId: mockUserId,
          nickname: 'TestPlayer',
          board_position: 20,
          coins_collected: 100,
          powerups: [],
          shields: 0,
          is_turn: true,
        },
        {
          userId: 2,
          nickname: 'Player2',
          board_position: 15,
          coins_collected: 50,
          powerups: [],
          shields: 0,
          is_turn: false,
        },
      ];

      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockBoardState))
        .mockResolvedValueOnce(JSON.stringify(mockPlayerStates[0]))
        .mockResolvedValueOnce(JSON.stringify(mockPlayerStates[1]))
        .mockResolvedValueOnce(null); // No more players

      const result = await BoardGameService.checkWinCondition(mockGameCode);

      expect(result.hasWinner).toBe(false);
      expect(result.winnerId).toBeUndefined();
    });

    it('should detect first player to reach end when multiple close', async () => {
      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [mockUserId, 2, 3],
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      // Player 2 reached first
      const mockPlayer1State = {
        userId: mockUserId,
        nickname: 'TestPlayer',
        board_position: 38,
        coins_collected: 100,
        powerups: [],
        shields: 0,
        is_turn: false,
      };

      const mockPlayer2State = {
        userId: 2,
        nickname: 'Player2',
        board_position: 39, // At end
        coins_collected: 150,
        powerups: [],
        shields: 0,
        is_turn: false,
      };

      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockBoardState))
        .mockResolvedValueOnce(JSON.stringify(mockPlayer1State))
        .mockResolvedValueOnce(JSON.stringify(mockPlayer2State));

      const result = await BoardGameService.checkWinCondition(mockGameCode);

      expect(result.hasWinner).toBe(true);
      expect(result.winnerId).toBe(2); // Player 2 wins
    });
  });

  describe('endBoardGame', () => {
    it('should calculate final ranking correctly', async () => {
      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [1, 2, 3],
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      const mockPlayers = [
        {
          userId: 1,
          nickname: 'Player1',
          board_position: 39, // Highest position
          coins_collected: 100,
          powerups: [],
          shields: 0,
          is_turn: false,
        },
        {
          userId: 2,
          nickname: 'Player2',
          board_position: 35,
          coins_collected: 200, // More coins but lower position
          powerups: [],
          shields: 0,
          is_turn: false,
        },
        {
          userId: 3,
          nickname: 'Player3',
          board_position: 30,
          coins_collected: 50,
          powerups: [],
          shields: 0,
          is_turn: false,
        },
      ];

      const mockGame = { game_id: 1, game_code: mockGameCode };

      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockBoardState))
        .mockResolvedValueOnce(JSON.stringify(mockPlayers[0]))
        .mockResolvedValueOnce(JSON.stringify(mockPlayers[1]))
        .mockResolvedValueOnce(JSON.stringify(mockPlayers[2]));

      (redis.smembers as jest.Mock).mockResolvedValue(['1', '2', '3']);
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await BoardGameService.endBoardGame(mockGameCode);

      expect(result.winner_id).toBe(1); // Player with highest position
      expect(result.final_positions).toHaveLength(3);
      expect(result.final_positions[0].rank).toBe(1);
      expect(result.final_positions[0].userId).toBe(1);
      expect(result.final_positions[1].rank).toBe(2);
      expect(result.final_positions[2].rank).toBe(3);
    });

    it('should rank by coins when positions are equal', async () => {
      const mockBoardState = {
        board_size: 40,
        board_layout: 'serpentine' as const,
        current_turn: 0,
        turn_order: [1, 2],
        events: [],
        checkpoint_positions: [10, 20, 30],
        shop_positions: [20],
        question_counter: 0,
      };

      const mockPlayers = [
        {
          userId: 1,
          nickname: 'Player1',
          board_position: 30,
          coins_collected: 100,
          powerups: [],
          shields: 0,
          is_turn: false,
        },
        {
          userId: 2,
          nickname: 'Player2',
          board_position: 30, // Same position
          coins_collected: 200, // More coins, should win
          powerups: [],
          shields: 0,
          is_turn: false,
        },
      ];

      const mockGame = { game_id: 1, game_code: mockGameCode };

      (redis.get as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockBoardState))
        .mockResolvedValueOnce(JSON.stringify(mockPlayers[0]))
        .mockResolvedValueOnce(JSON.stringify(mockPlayers[1]));

      (redis.smembers as jest.Mock).mockResolvedValue(['1', '2']);
      (prisma.games.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.game_players.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await BoardGameService.endBoardGame(mockGameCode);

      expect(result.winner_id).toBe(2); // Player with more coins
      expect(result.final_positions[0].userId).toBe(2);
      expect(result.final_positions[1].userId).toBe(1);
    });
  });
});
