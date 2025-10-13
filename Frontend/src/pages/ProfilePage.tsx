import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Target, Swords, TrendingUp, Award, Calendar, 
  Zap, CheckCircle, ArrowLeft, Loader2, Crown
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import { getUserStats, getRecentGames } from '@/services/userStatsService';

export default function ProfilePage() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => getUserStats(user!.id, accessToken!),
    enabled: !!user?.id && !!accessToken,
  });

  const { data: recentGames, isLoading: gamesLoading } = useQuery({
    queryKey: ['recentGames', user?.id],
    queryFn: () => getRecentGames(user!.id, accessToken!, 10),
    enabled: !!user?.id && !!accessToken,
  });

  const isLoading = statsLoading || gamesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="game-card bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-8 border-2 border-purple-500 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center level-badge shadow-2xl border-4 border-yellow-400">
                  <span className="text-6xl">🎮</span>
                </div>
                {stats && stats.profile.level >= 10 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2 border-2 border-yellow-300">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl font-gaming text-white mb-2">
                  {user?.displayName || user?.username}
                </h1>
                <p className="text-purple-300 text-lg mb-4">@{user?.username}</p>

                {/* XP Bar */}
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto md:mx-0" />
                ) : (
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg text-purple-200 font-gaming">
                        NIVEL {stats?.profile.level || 1}
                      </span>
                      <span className="text-lg text-purple-200">
                        {stats?.profile.current_xp || 0} / {stats?.profile.xp_to_next_level || 100} XP
                      </span>
                    </div>
                    <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden border-2 border-purple-500/50">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${stats?.calculated.xp_progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-yellow-500/30">
                  <div className="text-3xl mb-1">🪙</div>
                  <p className="text-2xl font-gaming text-yellow-400">
                    {isLoading ? '...' : stats?.currencies.coins.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">Monedas</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-cyan-500/30">
                  <div className="text-3xl mb-1">💎</div>
                  <p className="text-2xl font-gaming text-cyan-400">
                    {isLoading ? '...' : stats?.currencies.gems.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">Gemas</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800 border-2 border-indigo-500">
              <CardHeader className="border-b border-indigo-500/30">
                <CardTitle className="text-white font-gaming flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  ESTADÍSTICAS COMPLETAS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Quizzes Completados', value: stats?.profile.total_quizzes_completed || 0, icon: CheckCircle, color: 'green' },
                      { label: 'Preguntas Respondidas', value: stats?.profile.total_questions_answered || 0, icon: Target, color: 'blue' },
                      { label: 'Respuestas Correctas', value: stats?.profile.total_correct_answers || 0, icon: Award, color: 'purple' },
                      { label: 'Precisión', value: `${stats?.profile.average_accuracy.toFixed(1)}%`, icon: Zap, color: 'yellow' },
                      { label: 'Juegos Ganados', value: stats?.profile.total_games_won || 0, icon: Trophy, color: 'yellow' },
                      { label: 'Total Juegos', value: stats?.profile.total_games_played || 0, icon: Swords, color: 'red' },
                      { label: 'Racha Actual', value: stats?.profile.current_streak || 0, icon: Zap, color: 'orange' },
                      { label: 'Mejor Racha', value: stats?.profile.longest_streak || 0, icon: Zap, color: 'orange' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-700 flex items-center justify-center level-badge shadow-xl`}>
                          <stat.icon className="w-8 h-8 text-white" />
                        </div>
                        <p className={`text-3xl font-bold font-gaming text-${stat.color}-400 mb-1`}>
                          {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Games */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800 border-2 border-indigo-500">
              <CardHeader className="border-b border-indigo-500/30">
                <CardTitle className="text-white font-gaming flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  JUEGOS RECIENTES
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {gamesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
                  </div>
                ) : recentGames?.games && recentGames.games.length > 0 ? (
                  <div className="space-y-3">
                    {recentGames.games.map((game, i) => (
                      <div
                        key={i}
                        className="bg-slate-900/50 rounded-lg p-4 border border-slate-600 hover:border-indigo-500 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Rank Badge */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-gaming text-xl ${
                              game.final_rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                              game.final_rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                              game.final_rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                              'bg-slate-700 text-gray-300'
                            }`}>
                              #{game.final_rank}
                            </div>

                            {/* Game Info */}
                            <div>
                              <div className="text-white font-bold">Código: {game.game_code}</div>
                              <div className="text-sm text-gray-400 flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  {game.correct_answers}/{game.total_questions}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-4 h-4 text-blue-400" />
                                  {game.accuracy_percentage.toFixed(1)}%
                                </span>
                                <span className="flex items-center gap-1">
                                  <Zap className="w-4 h-4 text-orange-400" />
                                  Combo {game.highest_combo}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Score & Rewards */}
                          <div className="text-right">
                            <div className="text-2xl font-gaming text-yellow-400">
                              {game.final_score.toLocaleString()} pts
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-2 justify-end">
                              <span>+{game.xp_earned} XP</span>
                              <span>🪙 {game.coins_earned}</span>
                              {game.gems_earned > 0 && <span>💎 {game.gems_earned}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Swords className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No has jugado ningún juego aún</p>
                    <p className="text-sm">¡Únete a una batalla para comenzar!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800 border-2 border-purple-500">
              <CardHeader className="border-b border-purple-500/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-gaming flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    LOGROS
                  </CardTitle>
                  <Button variant="outline" size="sm" disabled>
                    Ver Todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-400">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Sistema de Logros</p>
                  <p className="text-sm">Disponible en Sprint 8</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

