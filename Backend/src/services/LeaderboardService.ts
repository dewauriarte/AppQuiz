import prisma from '@config/database';

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  level: number;
  total_xp: bigint;
  total_games_won: number;
  total_games_played: number;
  average_accuracy: number;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

/**
 * Obtiene el leaderboard global
 * TODO: Implementar periods (daily, weekly, monthly) con tabla de snapshots
 */
export async function getGlobalLeaderboard(
  limit: number = 100,
  offset: number = 0,
  _period: LeaderboardPeriod = 'all_time'
): Promise<LeaderboardEntry[]> {
  // Por ahora solo implementamos all_time (basado en total_xp)
  // Para periods (daily, weekly, monthly) necesitaríamos una tabla de snapshots
  
  const profiles = await prisma.user_profiles.findMany({
    where: {
      deleted_at: null,
    },
    include: {
      users: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      total_xp: 'desc',
    },
    take: limit,
    skip: offset,
  });

  return profiles.map((profile, index) => ({
    rank: offset + index + 1,
    user_id: profile.user_id,
    username: profile.users.username,
    avatar_url: profile.avatar_url || undefined,
    level: profile.level,
    total_xp: profile.total_xp,
    total_games_won: profile.total_games_won,
    total_games_played: profile.total_games_played,
    average_accuracy: Number(profile.average_accuracy || 0),
  }));
}

/**
 * Obtiene el leaderboard de amigos del usuario
 */
export async function getFriendsLeaderboard(userId: number): Promise<LeaderboardEntry[]> {
  // Obtener IDs de amigos
  const friendships = await prisma.friendships.findMany({
    where: {
      OR: [
        { user_id: userId, status: 'accepted' },
        { friend_id: userId, status: 'accepted' },
      ],
    },
  });

  const friendIds = friendships.map((f) =>
    f.user_id === userId ? f.friend_id : f.user_id
  );

  // Incluir al usuario mismo
  friendIds.push(userId);

  // Obtener profiles de amigos + usuario
  const profiles = await prisma.user_profiles.findMany({
    where: {
      user_id: {
        in: friendIds,
      },
      deleted_at: null,
    },
    include: {
      users: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      total_xp: 'desc',
    },
  });

  return profiles.map((profile, index) => ({
    rank: index + 1,
    user_id: profile.user_id,
    username: profile.users.username,
    avatar_url: profile.avatar_url || undefined,
    level: profile.level,
    total_xp: profile.total_xp,
    total_games_won: profile.total_games_won,
    total_games_played: profile.total_games_played,
    average_accuracy: Number(profile.average_accuracy || 0),
  }));
}

/**
 * Obtiene la posición del usuario en el leaderboard global
 */
export async function getUserGlobalRank(userId: number): Promise<number> {
  const userProfile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
    select: { total_xp: true },
  });

  if (!userProfile) {
    return 0;
  }

  const higherRankedCount = await prisma.user_profiles.count({
    where: {
      total_xp: {
        gt: userProfile.total_xp,
      },
      deleted_at: null,
    },
  });

  return higherRankedCount + 1;
}

