import { calculatePoints, calculateRewards, shuffleArray } from '@utils/scoring';

describe('Scoring Utils', () => {
  describe('calculatePoints', () => {
    it('should return 0 points for incorrect answer', () => {
      const result = calculatePoints(false, 5000, 30000, 0);

      expect(result.points).toBe(0);
      expect(result.basePoints).toBe(0);
      expect(result.speedBonus).toBe(0);
      expect(result.comboMultiplier).toBe(1);
      expect(result.totalPoints).toBe(0);
    });

    it('should calculate base points for correct answer with no combo', () => {
      const result = calculatePoints(true, 15000, 30000, 0);

      expect(result.basePoints).toBe(1000);
      expect(result.comboMultiplier).toBe(1);
      expect(result.totalPoints).toBeGreaterThan(1000); // Has speed bonus
    });

    it('should give maximum speed bonus for instant answer', () => {
      const result = calculatePoints(true, 0, 30000, 0);

      expect(result.basePoints).toBe(1000);
      expect(result.speedBonus).toBe(500); // Maximum speed bonus
      expect(result.comboMultiplier).toBe(1);
      expect(result.totalPoints).toBe(1500); // 1000 + 500
    });

    it('should give minimum speed bonus for answer at time limit', () => {
      const result = calculatePoints(true, 30000, 30000, 0);

      expect(result.basePoints).toBe(1000);
      expect(result.speedBonus).toBe(0); // No speed bonus
      expect(result.comboMultiplier).toBe(1);
      expect(result.totalPoints).toBe(1000); // Just base points
    });

    it('should calculate speed bonus proportionally', () => {
      // Answer at 50% of time limit
      const result = calculatePoints(true, 15000, 30000, 0);

      expect(result.basePoints).toBe(1000);
      expect(result.speedBonus).toBe(250); // 50% of 500
      expect(result.comboMultiplier).toBe(1);
      expect(result.totalPoints).toBe(1250); // 1000 + 250
    });

    it('should apply combo multiplier for streak of 1', () => {
      const result = calculatePoints(true, 0, 30000, 1);

      expect(result.basePoints).toBe(1000);
      expect(result.speedBonus).toBe(500);
      expect(result.comboMultiplier).toBe(1.1); // 1 + (1 * 0.1)
      expect(result.totalPoints).toBe(1650); // (1000 + 500) * 1.1
    });

    it('should apply combo multiplier for streak of 3', () => {
      const result = calculatePoints(true, 0, 30000, 3);

      expect(result.basePoints).toBe(1000);
      expect(result.speedBonus).toBe(500);
      expect(result.comboMultiplier).toBe(1.3); // 1 + (3 * 0.1)
      expect(result.totalPoints).toBe(1950); // (1000 + 500) * 1.3
    });

    it('should apply combo multiplier for streak of 5', () => {
      const result = calculatePoints(true, 0, 30000, 5);

      expect(result.basePoints).toBe(1000);
      expect(result.speedBonus).toBe(500);
      expect(result.comboMultiplier).toBe(1.5); // 1 + (5 * 0.1)
      expect(result.totalPoints).toBe(2250); // (1000 + 500) * 1.5
    });

    it('should apply combo multiplier for high streak of 10', () => {
      const result = calculatePoints(true, 0, 30000, 10);

      expect(result.basePoints).toBe(1000);
      expect(result.speedBonus).toBe(500);
      expect(result.comboMultiplier).toBe(2); // 1 + (10 * 0.1)
      expect(result.totalPoints).toBe(3000); // (1000 + 500) * 2
    });

    it('should calculate realistic scenario: medium speed + combo', () => {
      // Answer in 10 seconds (30s limit), combo of 2
      const result = calculatePoints(true, 10000, 30000, 2);

      expect(result.basePoints).toBe(1000);
      expect(result.speedBonus).toBe(333); // ~66% of 500
      expect(result.comboMultiplier).toBe(1.2); // 1 + (2 * 0.1)
      expect(result.totalPoints).toBe(1599); // (1000 + 333) * 1.2 = 1599.6 floored
    });

    it('should handle edge case: negative speed bonus as 0', () => {
      // Answer after time limit (shouldn't happen, but test edge case)
      const result = calculatePoints(true, 35000, 30000, 0);

      expect(result.basePoints).toBe(1000);
      expect(result.speedBonus).toBe(0); // Max with 0
      expect(result.totalPoints).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('calculateRewards', () => {
    it('should give 3x multiplier for 1st place', () => {
      const rewards = calculateRewards(1, 10);

      expect(rewards.xp).toBe(360); // 100 * 3 * 1.2 (participation bonus)
      expect(rewards.coins).toBe(180); // 50 * 3 * 1.2
      expect(rewards.gems).toBe(5); // 1st place gets 5 gems
    });

    it('should give 2x multiplier for 2nd place', () => {
      const rewards = calculateRewards(2, 10);

      expect(rewards.xp).toBe(240); // 100 * 2 * 1.2
      expect(rewards.coins).toBe(120); // 50 * 2 * 1.2
      expect(rewards.gems).toBe(3); // 2nd place gets 3 gems
    });

    it('should give 1.5x multiplier for 3rd place', () => {
      const rewards = calculateRewards(3, 10);

      expect(rewards.xp).toBe(180); // 100 * 1.5 * 1.2
      expect(rewards.coins).toBe(90); // 50 * 1.5 * 1.2
      expect(rewards.gems).toBe(1); // 3rd place gets 1 gem
    });

    it('should give 1.2x multiplier for top 50%', () => {
      const rewards = calculateRewards(5, 10); // 5th out of 10 = top 50%

      expect(rewards.xp).toBe(144); // 100 * 1.2 * 1.2
      expect(rewards.coins).toBe(72); // 50 * 1.2 * 1.2
      expect(rewards.gems).toBe(0); // No gems outside top 3
    });

    it('should give base multiplier for bottom 50%', () => {
      const rewards = calculateRewards(8, 10); // 8th out of 10 = bottom 50%

      expect(rewards.xp).toBe(120); // 100 * 1 * 1.2
      expect(rewards.coins).toBe(60); // 50 * 1 * 1.2
      expect(rewards.gems).toBe(0); // No gems outside top 3
    });

    it('should not give participation bonus for small games (<10 players)', () => {
      const rewards = calculateRewards(1, 5); // 1st place, 5 players

      expect(rewards.xp).toBe(300); // 100 * 3 * 1 (no participation bonus)
      expect(rewards.coins).toBe(150); // 50 * 3 * 1
      expect(rewards.gems).toBe(5);
    });

    it('should give participation bonus for large games (>=10 players)', () => {
      const rewards = calculateRewards(1, 20); // 1st place, 20 players

      expect(rewards.xp).toBe(360); // 100 * 3 * 1.2
      expect(rewards.coins).toBe(180); // 50 * 3 * 1.2
      expect(rewards.gems).toBe(5);
    });

    it('should handle edge case: 1st place solo game', () => {
      const rewards = calculateRewards(1, 1);

      expect(rewards.xp).toBe(300); // 100 * 3 * 1
      expect(rewards.coins).toBe(150); // 50 * 3 * 1
      expect(rewards.gems).toBe(5);
    });

    it('should handle last place in large game', () => {
      const rewards = calculateRewards(100, 100);

      expect(rewards.xp).toBe(120); // Base * 1 * 1.2
      expect(rewards.coins).toBe(60);
      expect(rewards.gems).toBe(0);
    });

    it('should give gems only to top 3', () => {
      expect(calculateRewards(1, 10).gems).toBe(5);
      expect(calculateRewards(2, 10).gems).toBe(3);
      expect(calculateRewards(3, 10).gems).toBe(1);
      expect(calculateRewards(4, 10).gems).toBe(0);
      expect(calculateRewards(5, 10).gems).toBe(0);
    });
  });

  describe('shuffleArray', () => {
    it('should return array with same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      expect(shuffled.length).toBe(original.length);
    });

    it('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);

      expect(original).toEqual(originalCopy);
    });

    it('should handle empty array', () => {
      const original: number[] = [];
      const shuffled = shuffleArray(original);

      expect(shuffled).toEqual([]);
    });

    it('should handle single element array', () => {
      const original = [42];
      const shuffled = shuffleArray(original);

      expect(shuffled).toEqual([42]);
    });

    it('should shuffle array (statistical test)', () => {
      // Run multiple times and check that order changes
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let sameOrderCount = 0;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const shuffled = shuffleArray(original);
        if (JSON.stringify(shuffled) === JSON.stringify(original)) {
          sameOrderCount++;
        }
      }

      // Probability of same order should be very low (1/10! ≈ 0.000028%)
      // Allow up to 5% to account for randomness
      expect(sameOrderCount).toBeLessThan(iterations * 0.05);
    });

    it('should work with objects', () => {
      const original = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
      ];
      const shuffled = shuffleArray(original);

      expect(shuffled.length).toBe(3);
      expect(shuffled).toContainEqual({ id: 1, name: 'A' });
      expect(shuffled).toContainEqual({ id: 2, name: 'B' });
      expect(shuffled).toContainEqual({ id: 3, name: 'C' });
    });

    it('should work with strings', () => {
      const original = ['apple', 'banana', 'cherry', 'date'];
      const shuffled = shuffleArray(original);

      expect(shuffled.length).toBe(4);
      expect(shuffled.sort()).toEqual(original.sort());
    });
  });
});
