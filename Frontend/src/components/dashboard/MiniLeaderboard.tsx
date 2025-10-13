import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getGlobalLeaderboard } from '@/services/userStatsService';
import { useAuthStore } from '@/store/authStore';

export default function MiniLeaderboard() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['miniLeaderboard'],
    queryFn: () => getGlobalLeaderboard(accessToken!, 5, 0),
    enabled: !!accessToken,
    refetchInterval: 30000, // Auto-refresh cada 30s
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: <Crown className="w-5 h-5" />, bg: 'from-yellow-400 to-orange-500' };
    if (rank === 2) return { icon: <Medal className="w-5 h-5" />, bg: 'from-gray-300 to-gray-500' };
    if (rank === 3) return { icon: <Medal className="w-5 h-5" />, bg: 'from-orange-400 to-orange-600' };
    return { icon: null, bg: 'from-slate-600 to-slate-700' };
  };

  return (
    <Card className="bg-slate-800 border-2 border-yellow-500">
      <CardHeader className="border-b border-yellow-500/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-gaming flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            TOP 5 GLOBAL
          </CardTitle>
          <Button
            onClick={() => navigate('/leaderboard')}
            variant="ghost"
            size="sm"
            className="text-yellow-400 hover:text-yellow-300"
          >
            Ver Todo
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto" />
          </div>
        ) : data?.leaderboard && data.leaderboard.length > 0 ? (
          <div className="space-y-3">
            {data.leaderboard.map((player: any, index: number) => {
              const rankInfo = getRankBadge(player.rank);
              
              return (
                <motion.div
                  key={player.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-lg p-3 bg-gradient-to-r ${rankInfo.bg} border border-white/10`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
                      {rankInfo.icon || (
                        <span className="text-white font-gaming">#{player.rank}</span>
                      )}
                    </div>

                    {/* User */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold truncate">
                        {player.username}
                      </div>
                      <div className="text-xs text-white/70">
                        Nivel {player.level} • {player.total_games_won} victorias
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="text-lg font-gaming text-white">
                        {Number(player.total_xp).toLocaleString()}
                      </div>
                      <div className="text-xs text-white/70">XP</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay datos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

