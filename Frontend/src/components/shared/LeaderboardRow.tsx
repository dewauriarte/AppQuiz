import { motion } from 'framer-motion';
import { Crown, Medal, Star } from 'lucide-react';

interface LeaderboardRowProps {
  rank: number;
  username: string;
  level: number;
  totalXP: bigint | number;
  totalGamesWon?: number;
  averageAccuracy?: number;
  isCurrentUser?: boolean;
  delay?: number;
}

export default function LeaderboardRow({
  rank,
  username,
  level,
  totalXP,
  totalGamesWon = 0,
  averageAccuracy = 0,
  isCurrentUser = false,
  delay = 0,
}: LeaderboardRowProps) {
  const getRankIcon = () => {
    if (rank === 1) return { icon: <Crown className="w-6 h-6" />, color: 'text-yellow-400' };
    if (rank === 2) return { icon: <Medal className="w-6 h-6" />, color: 'text-gray-400' };
    if (rank === 3) return { icon: <Medal className="w-6 h-6" />, color: 'text-orange-400' };
    return { icon: <Star className="w-5 h-5" />, color: 'text-blue-400' };
  };

  const rankInfo = getRankIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`rounded-lg p-4 border-2 transition-all ${
        isCurrentUser
          ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-400 shadow-lg'
          : rank <= 3
          ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-yellow-500/50'
          : 'bg-slate-900/50 border-slate-600 hover:border-indigo-500'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-16 text-center">
          <div className={`flex items-center justify-center ${rankInfo.color}`}>
            {rankInfo.icon}
          </div>
          <div className={`text-2xl font-gaming ${rankInfo.color}`}>
            #{rank}
          </div>
        </div>

        {/* Avatar */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-3 ${
          rank === 1 ? 'border-yellow-400 shadow-yellow' :
          rank === 2 ? 'border-gray-400 shadow-gray' :
          rank === 3 ? 'border-orange-400 shadow-orange' :
          'border-slate-600'
        }`}>
          🎮
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="text-xl font-bold text-white flex items-center gap-2">
            {username}
            {isCurrentUser && (
              <span className="text-sm bg-purple-600 px-2 py-1 rounded-full">TÚ</span>
            )}
          </div>
          <div className="text-sm text-gray-400 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-blue-400" />
              Nivel {level}
            </span>
            {totalGamesWon > 0 && <span>🏆 {totalGamesWon} victorias</span>}
            {averageAccuracy > 0 && <span>🎯 {averageAccuracy.toFixed(1)}%</span>}
          </div>
        </div>

        {/* XP */}
        <div className="text-right">
          <div className="text-2xl font-gaming text-cyan-400">
            {Number(totalXP).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">XP Total</div>
        </div>
      </div>
    </motion.div>
  );
}

