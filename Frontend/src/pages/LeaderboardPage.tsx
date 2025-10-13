import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, Medal, Star, Loader2, Users, ArrowLeft } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import { getGlobalLeaderboard, getFriendsLeaderboard } from '@/services/userStatsService';

type LeaderboardTab = 'global' | 'friends';

export default function LeaderboardPage() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: globalData, isLoading: globalLoading } = useQuery({
    queryKey: ['globalLeaderboard', page],
    queryFn: () => getGlobalLeaderboard(accessToken!, limit, page * limit),
    enabled: !!accessToken && activeTab === 'global',
  });

  const { data: friendsData, isLoading: friendsLoading } = useQuery({
    queryKey: ['friendsLeaderboard'],
    queryFn: () => getFriendsLeaderboard(accessToken!),
    enabled: !!accessToken && activeTab === 'friends',
  });

  const isLoading = activeTab === 'global' ? globalLoading : friendsLoading;
  const leaderboard = activeTab === 'global' ? globalData?.leaderboard : friendsData?.leaderboard;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return { icon: <Crown className="w-6 h-6" />, color: 'text-yellow-400' };
    if (rank === 2) return { icon: <Medal className="w-6 h-6" />, color: 'text-gray-400' };
    if (rank === 3) return { icon: <Medal className="w-6 h-6" />, color: 'text-orange-400' };
    return { icon: <Star className="w-5 h-5" />, color: 'text-blue-400' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header con botón de regreso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Button
              onClick={() => navigate('/dashboard')}
              className="absolute left-0 top-0 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 font-gaming"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              VOLVER
            </Button>
            
            <div className="text-center">
              <h1 className="text-6xl font-gaming text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
                🏆 RANKINGS 🏆
              </h1>
              <p className="text-xl text-purple-300">Compite con los mejores jugadores</p>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-4"
          >
            <Button
              onClick={() => setActiveTab('global')}
              className={`px-8 py-6 text-xl font-gaming ${
                activeTab === 'global'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Global
            </Button>
            <Button
              onClick={() => setActiveTab('friends')}
              className={`px-8 py-6 text-xl font-gaming ${
                activeTab === 'friends'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Amigos
            </Button>
          </motion.div>

          {/* Current User Position (Global only) */}
          {activeTab === 'global' && globalData?.current_user_rank && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-2 border-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-4">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-white font-gaming text-lg">
                      Tu Posición Global: <span className="text-yellow-400">#{globalData.current_user_rank}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800 border-2 border-indigo-500">
              <CardHeader className="border-b border-indigo-500/30">
                <CardTitle className="text-white font-gaming flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  {activeTab === 'global' ? 'TOP 100 MUNDIAL' : 'RANKING DE AMIGOS'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
                  </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {leaderboard.map((player: any) => {
                        const rankInfo = getRankIcon(player.rank);
                        const isCurrentUser = player.user_id === user?.id;

                        return (
                          <motion.div
                            key={player.user_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: player.rank * 0.02 }}
                            className={`rounded-lg p-4 border-2 transition-all ${
                              isCurrentUser
                                ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-400 shadow-lg'
                                : player.rank <= 3
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
                                  #{player.rank}
                                </div>
                              </div>

                              {/* Avatar */}
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-3 ${
                                player.rank === 1 ? 'border-yellow-400 shadow-yellow' :
                                player.rank === 2 ? 'border-gray-400 shadow-gray' :
                                player.rank === 3 ? 'border-orange-400 shadow-orange' :
                                'border-slate-600'
                              }`}>
                                🎮
                              </div>

                              {/* User Info */}
                              <div className="flex-1">
                                <div className="text-xl font-bold text-white flex items-center gap-2">
                                  {player.username}
                                  {isCurrentUser && (
                                    <span className="text-sm bg-purple-600 px-2 py-1 rounded-full">TÚ</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400 flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-blue-400" />
                                    Nivel {player.level}
                                  </span>
                                  <span>🏆 {player.total_games_won} victorias</span>
                                  <span>🎯 {player.average_accuracy.toFixed(1)}%</span>
                                </div>
                              </div>

                              {/* XP */}
                              <div className="text-right">
                                <div className="text-2xl font-gaming text-cyan-400">
                                  {Number(player.total_xp).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-400">XP Total</div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Pagination (Global only) */}
                    {activeTab === 'global' && (
                      <div className="flex justify-center gap-4 mt-6">
                        <Button
                          onClick={() => setPage(Math.max(0, page - 1))}
                          disabled={page === 0}
                          variant="outline"
                        >
                          Anterior
                        </Button>
                        <span className="text-white font-gaming py-2 px-4">
                          Página {page + 1}
                        </span>
                        <Button
                          onClick={() => setPage(page + 1)}
                          disabled={!globalData?.leaderboard || globalData.leaderboard.length < limit}
                          variant="outline"
                        >
                          Siguiente
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">
                      {activeTab === 'friends' 
                        ? 'No tienes amigos en tu lista aún' 
                        : 'No hay datos disponibles'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

