import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, BookOpen, Swords, TrendingUp, Award, Loader2 } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '@/services/userStatsService';
import MiniLeaderboard from '@/components/dashboard/MiniLeaderboard';

export default function StudentDashboard() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  // Fetch user stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => getUserStats(user!.id, accessToken!),
    enabled: !!user?.id && !!accessToken,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Banner con Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="game-card bg-gradient-to-r from-blue-900 to-cyan-900 rounded-xl p-6 border-2 border-blue-500 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center level-badge shadow-xl">
                <Swords className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-gaming text-white mb-1">
                  ¡Bienvenido, Guerrero!
                </h2>
                <p className="text-blue-200 text-lg">{user?.displayName || user?.username}</p>
              </div>
            </div>

            {/* XP Bar */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-200 font-gaming">
                  NIVEL {isLoading ? '...' : stats?.profile.level || 1}
                </span>
                <span className="text-sm text-blue-200">
                  {isLoading
                    ? '... / ... XP'
                    : `${stats?.profile.current_xp || 0} / ${stats?.profile.xp_to_next_level || 100} XP`}
                </span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-blue-500/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{
                    width: `${stats?.calculated.xp_progress_percentage || 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading ? (
                <div className="col-span-4 text-center py-4">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                </div>
              ) : (
                [
                  { label: 'Monedas', value: stats?.currencies.coins || 0, icon: '🪙', color: 'yellow' },
                  { label: 'Gemas', value: stats?.currencies.gems || 0, icon: '💎', color: 'cyan' },
                  { label: 'Victorias', value: stats?.profile.total_games_won || 0, icon: '🏆', color: 'green' },
                  { label: 'Racha', value: stats?.profile.current_streak || 0, icon: '🔥', color: 'orange' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-blue-500/30 text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <p className={`text-2xl font-bold font-gaming text-${stat.color}-400`}>
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 uppercase">{stat.label}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Unirse a Batalla', icon: Swords, color: 'green', gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-950', onClick: () => navigate('/game/join') },
                { title: 'Mi Perfil', icon: Award, color: 'purple', gradient: 'from-purple-500 to-pink-600', bg: 'bg-purple-950', onClick: () => navigate('/profile') },
                { title: 'Mis Logros', icon: Trophy, color: 'yellow', gradient: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-950', onClick: () => {} },
                { title: 'Biblioteca', icon: BookOpen, color: 'blue', gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-950', onClick: () => {} },
              ].map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <Card className={`${action.bg} border-2 border-${action.color}-500 text-white hover:scale-105 transition-all cursor-pointer game-card`}>
                    <CardContent className="pt-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center level-badge shadow-lg`}>
                        <action.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-center font-gaming mb-4">{action.title}</h3>
                      <Button className="w-full" variant="outline" onClick={action.onClick}>
                        ACCEDER
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-slate-800 border-2 border-indigo-500">
              <CardHeader className="border-b border-indigo-500/30">
                <CardTitle className="text-white font-gaming flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  ESTADÍSTICAS DE BATALLA
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {isLoading ? (
                    <div className="col-span-4 text-center py-8">
                      <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
                    </div>
                  ) : (
                    [
                      { label: 'Batallas', value: stats?.profile.total_games_played || 0, icon: Swords, color: 'green' },
                      { label: 'Completados', value: stats?.profile.total_quizzes_completed || 0, icon: Award, color: 'purple' },
                      {
                        label: 'Precisión',
                        value: `${stats?.profile.average_accuracy.toFixed(1) || 0}%`,
                        icon: Target,
                        color: 'blue',
                      },
                      {
                        label: 'Rank Global',
                        value: stats?.calculated.global_rank ? `#${stats.calculated.global_rank}` : '-',
                        icon: Trophy,
                        color: 'yellow',
                      },
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mini Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <MiniLeaderboard />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
