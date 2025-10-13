import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// **Interfaces**
export interface Rewards {
  xp: number;
  coins: number;
  gems?: number;
  items?: Array<{ itemId: number; quantity: number }>;
}

export interface LevelUpResult {
  oldLevel: number;
  newLevel: number;
  rewards: {
    coins: number;
    gems?: number;
    items?: Array<{ itemId: number; quantity: number }>;
  };
}

export interface GrantRewardsResult {
  success: boolean;
  profile: {
    level: number;
    total_xp: bigint;
    current_xp: number;
    xp_to_next_level: number;
  };
  currencies: {
    coins: number;
    gems: number;
  };
  levelUp?: LevelUpResult;
}

// **Level Calculation Logic**
/**
 * Calcula el nivel basado en el total de XP
 * Formula: XP_to_level = 100 * level^1.5
 * Level 1: 100 XP
 * Level 2: 283 XP
 * Level 3: 520 XP
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP < 0) return 1;
  
  let level = 1;
  let xpRequired = 0;
  
  while (xpRequired <= totalXP) {
    level++;
    xpRequired += Math.floor(100 * Math.pow(level, 1.5));
  }
  
  return level - 1;
}

/**
 * Calcula el XP necesario para el siguiente nivel
 */
export function calculateXPForNextLevel(currentLevel: number): number {
  return Math.floor(100 * Math.pow(currentLevel + 1, 1.5));
}

/**
 * Calcula el XP actual dentro del nivel (para la barra de progreso)
 */
export function calculateCurrentXP(totalXP: number, currentLevel: number): number {
  let xpForLevel = 0;
  for (let i = 1; i <= currentLevel; i++) {
    xpForLevel += Math.floor(100 * Math.pow(i, 1.5));
  }
  return Math.floor(Number(totalXP) - xpForLevel);
}

/**
 * Calcula las recompensas por subir de nivel
 * - Cada nivel: 100 coins * level
 * - Cada 5 niveles: 50 gems
 * - Cada 10 niveles: item random (ID 1-10, por ahora)
 */
export function calculateLevelRewards(newLevel: number): {
  coins: number;
  gems?: number;
  items?: Array<{ itemId: number; quantity: number }>;
} {
  const rewards: {
    coins: number;
    gems?: number;
    items?: Array<{ itemId: number; quantity: number }>;
  } = {
    coins: 100 * newLevel,
  };

  // Cada 5 niveles: 50 gems
  if (newLevel % 5 === 0) {
    rewards.gems = 50;
  }

  // Cada 10 niveles: item random
  if (newLevel % 10 === 0) {
    const randomItemId = Math.floor(Math.random() * 10) + 1; // IDs 1-10
    rewards.items = [{ itemId: randomItemId, quantity: 1 }];
  }

  return rewards;
}

/**
 * Verifica si el usuario subió de nivel
 */
export function checkLevelUp(
  currentLevel: number,
  totalXP: bigint
): LevelUpResult | null {
  const newLevel = calculateLevel(Number(totalXP));

  if (newLevel > currentLevel) {
    return {
      oldLevel: currentLevel,
      newLevel: newLevel,
      rewards: calculateLevelRewards(newLevel),
    };
  }

  return null;
}

// **Main Grant Rewards Function**
/**
 * Otorga recompensas a un usuario
 * - Actualiza user_profiles (total_xp, current_xp, level)
 * - Check level up
 * - Actualiza user_currencies (coins, gems)
 * - Guarda transacciones
 * - Retorna nuevo nivel/unlocks
 */
export async function grantRewards(
  userId: number,
  rewards: Rewards
): Promise<GrantRewardsResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. Obtener profile actual
    let profile = await tx.user_profiles.findUnique({
      where: { user_id: userId },
    });

    // Si no existe profile, crearlo
    if (!profile) {
      profile = await tx.user_profiles.create({
        data: {
          user_id: userId,
          level: 1,
          total_xp: BigInt(0),
          current_xp: 0,
          xp_to_next_level: calculateXPForNextLevel(1),
        },
      });
    }

    // 2. Actualizar XP
    const newTotalXP = BigInt(profile.total_xp) + BigInt(rewards.xp);
    const currentLevel = profile.level;

    // 3. Check level up
    const levelUpResult = checkLevelUp(currentLevel, newTotalXP);

    let finalLevel = currentLevel;
    let additionalCoins = 0;
    let additionalGems = 0;

    if (levelUpResult) {
      finalLevel = levelUpResult.newLevel;
      additionalCoins += levelUpResult.rewards.coins;
      if (levelUpResult.rewards.gems) {
        additionalGems += levelUpResult.rewards.gems;
      }
      // TODO: Manejar items cuando el inventario esté implementado
    }

    // 4. Calcular current_xp y xp_to_next_level
    const newCurrentXP = calculateCurrentXP(Number(newTotalXP), finalLevel);
    const xpToNextLevel = calculateXPForNextLevel(finalLevel);

    // 5. Actualizar profile
    const updatedProfile = await tx.user_profiles.update({
      where: { user_id: userId },
      data: {
        total_xp: newTotalXP,
        current_xp: newCurrentXP,
        level: finalLevel,
        xp_to_next_level: xpToNextLevel,
      },
    });

    // 6. Obtener currencies actual
    let currencies = await tx.user_currencies.findUnique({
      where: { user_id: userId },
    });

    // Si no existe currencies, crearlo
    if (!currencies) {
      currencies = await tx.user_currencies.create({
        data: {
          user_id: userId,
          coins: 0,
          gems: 0,
        },
      });
    }

    // 7. Calcular nuevas cantidades (respetando límites)
    const totalCoins = rewards.coins + additionalCoins;
    const totalGems = (rewards.gems || 0) + additionalGems;

    const newCoins = Math.min(
      currencies.coins + totalCoins,
      currencies.coins_cap
    );
    const newGems = Math.min(
      currencies.gems + totalGems,
      currencies.gems_cap
    );

    // Verificar daily limit de coins
    const today = new Date();
    const lastReset = currencies.last_daily_reset || new Date(0);
    const isSameDay =
      today.toDateString() === new Date(lastReset).toDateString();

    let coinsEarnedToday = isSameDay ? currencies.coins_earned_today : 0;
    const coinsToAdd = Math.min(
      totalCoins,
      currencies.daily_coins_limit - coinsEarnedToday
    );
    coinsEarnedToday += coinsToAdd;

    // 8. Actualizar currencies
    const updatedCurrencies = await tx.user_currencies.update({
      where: { user_id: userId },
      data: {
        coins: newCoins,
        gems: newGems,
        total_coins_earned: { increment: coinsToAdd },
        total_gems_earned: { increment: totalGems },
        coins_earned_today: coinsEarnedToday,
        last_daily_reset: isSameDay ? lastReset : today,
      },
    });

    // 9. Guardar transacciones (si hay coins o gems)
    if (coinsToAdd > 0) {
      await tx.currency_transactions.create({
        data: {
          user_id: userId,
          currency_type: 'coins',
          amount: coinsToAdd,
          balance_after: newCoins,
          source: 'quiz_complete',
        },
      });
    }

    if (totalGems > 0) {
      await tx.currency_transactions.create({
        data: {
          user_id: userId,
          currency_type: 'gems',
          amount: totalGems,
          balance_after: newGems,
          source: levelUpResult ? 'level_up' : 'quiz_complete',
        },
      });
    }

    // 10. Return result
    return {
      success: true,
      profile: {
        level: updatedProfile.level,
        total_xp: updatedProfile.total_xp,
        current_xp: updatedProfile.current_xp,
        xp_to_next_level: updatedProfile.xp_to_next_level,
      },
      currencies: {
        coins: updatedCurrencies.coins,
        gems: updatedCurrencies.gems,
      },
      levelUp: levelUpResult || undefined,
    };
  });
}

