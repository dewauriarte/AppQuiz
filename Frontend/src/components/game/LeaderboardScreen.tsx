import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LeaderboardPlayer {
  rank: number;
  user_id: number;
  nickname: string;
  username: string;
  score: number;
  correct_answers: number;
  combo_streak: number;
}

interface LeaderboardScreenProps {
  leaderboard: LeaderboardPlayer[];
  currentUserId: number;
}

const MEDAL_COLORS = [
  'from-yellow-400 to-yellow-600', // 1st
  'from-gray-300 to-gray-400', // 2nd
  'from-orange-400 to-orange-600', // 3rd
];

export default function LeaderboardScreen({
  leaderboard,
  currentUserId,
}: LeaderboardScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-16 h-16 text-yellow-400" />
            <h1 className="text-6xl font-gaming text-white">RANKING</h1>
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <p className="text-xl text-purple-300">
            Top {Math.min(5, leaderboard.length)} {leaderboard.length === 1 ? 'Jugador' : 'Jugadores'}
          </p>
        </motion.div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {leaderboard.map((player, index) => {
            const isCurrentUser = player.user_id === currentUserId;
            const medal = index < 3 ? MEDAL_COLORS[index] : null;

            return (
              <motion.div
                key={player.user_id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`
                    p-6 border-4 min-h-[120px]
                    ${isCurrentUser
                      ? 'bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-400 ring-4 ring-purple-500'
                      : 'bg-slate-800 border-slate-600'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {medal ? (
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${medal} flex items-center justify-center shadow-xl`}>
                          <span className="text-3xl font-gaming text-white">{player.rank}</span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-500">
                          <span className="text-2xl font-gaming text-white">{player.rank}</span>
                        </div>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="text-xl font-bold text-white mb-1">
                        {player.nickname || player.username}
                        {isCurrentUser && (
                          <span className="ml-2 text-purple-400 text-sm">(TÚ)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-400">
                          ✓ {player.correct_answers} correctas
                        </span>
                        {player.combo_streak > 0 && (
                          <span className="text-orange-400">
                            🔥 Combo x{player.combo_streak}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-4xl font-gaming text-yellow-400">
                        {player.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">puntos</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Next Question Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center mt-8 text-cyan-400 text-xl font-gaming"
        >
          Siguiente pregunta en breve...
        </motion.div>
      </div>
    </div>
  );
}

