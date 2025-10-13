import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, BarChart3, FileUp, Sparkles, Users, Calendar, Award, Scroll, Wand2, UserCog, Loader2 } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import { getTeacherStats } from '@/services/teacherStatsService';

export default function TeacherDashboard() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['teacherStats', user?.id],
    queryFn: () => getTeacherStats(user!.id, accessToken!),
    enabled: !!user?.id && !!accessToken && user?.role === 'teacher',
    staleTime: 30000,
  });

  const quickActions = [
    {
      title: 'IA Mágica',
      description: 'Genera con inteligencia',
      icon: Wand2,
      gradient: 'from-purple-600 to-purple-700',
      bgColor: 'bg-gradient-to-br from-slate-800 to-slate-900',
      borderColor: 'border-purple-500/40',
      iconColor: 'text-purple-300',
      glowColor: 'shadow-purple-500/20',
      onClick: () => navigate('/ai-generator'),
    },
    {
      title: 'Quizzes',
      description: 'Forja un nuevo desafío',
      icon: BookOpen,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-slate-800 to-slate-900',
      borderColor: 'border-blue-500/40',
      iconColor: 'text-blue-300',
      glowColor: 'shadow-blue-500/20',
      onClick: () => navigate('/question-sets'),
    },
    {
      title: 'Mis Listas',
      description: 'Gestiona estudiantes',
      icon: UserCog,
      gradient: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-slate-800 to-slate-900',
      borderColor: 'border-indigo-500/40',
      iconColor: 'text-indigo-300',
      glowColor: 'shadow-indigo-500/20',
      onClick: () => navigate('/lists'),
    },
    {
      title: 'Iniciar Batalla',
      description: 'Comienza una sesión',
      icon: Play,
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-slate-800 to-slate-900',
      borderColor: 'border-emerald-500/40',
      iconColor: 'text-emerald-300',
      glowColor: 'shadow-emerald-500/20',
      onClick: () => navigate('/game/create'),
    },
    {
      title: 'Estadísticas',
      description: 'Analiza el progreso',
      icon: BarChart3,
      gradient: 'from-amber-500 to-amber-600',
      bgColor: 'bg-gradient-to-br from-slate-800 to-slate-900',
      borderColor: 'border-amber-500/40',
      iconColor: 'text-amber-300',
      glowColor: 'shadow-amber-500/20',
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Topbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-slate-700/50 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-xl border-2 border-blue-400/30">
              <Award className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-4xl font-gaming text-white drop-shadow-lg mb-1">
                ¡Bienvenido, Maestro!
              </h2>
              <p className="text-blue-300 font-semibold text-lg">
                {user?.displayName || user?.username}
              </p>
            </div>
          </div>
          <p className="text-slate-300 text-lg font-medium">
            Prepara desafíos épicos y guía a tus estudiantes hacia la victoria
          </p>
        </div>
      </motion.div>

      {/* Quick Actions - Gaming Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.1 }}
            >
              <Card className={`border-2 ${action.borderColor} ${action.bgColor} text-white shadow-xl ${action.glowColor} hover:shadow-2xl transition-all hover:scale-105 cursor-pointer hover:border-opacity-60`}>
                <CardContent className="pt-6 pb-6">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-xl border-2 border-white/10`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-gaming text-center mb-2 text-white">
                    {action.title}
                  </h3>
                  <p className={`text-sm text-center mb-5 font-medium ${action.iconColor}`}>
                    {action.description}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={action.onClick}
                    className={`w-full border-2 ${action.borderColor} hover:bg-white/10 ${action.iconColor} hover:text-white font-gaming transition-all`}
                  >
                    ACCEDER
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-2 border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
          <CardHeader className="border-b-2 border-slate-700/50 bg-slate-800/50 pb-4">
            <CardTitle className="text-3xl font-gaming text-white">📊 RESUMEN DEL REINO</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: 'Quizzes Forjados', value: stats?.totalQuizzes || 0, icon: Scroll, color: 'blue' },
                  { label: 'Batallas Activas', value: stats?.activeGames || 0, icon: Play, color: 'green' },
                  { label: 'Aprendices', value: stats?.totalStudents || 0, icon: Users, color: 'purple' },
                  { label: 'Precisión Promedio', value: `${(stats?.averageAccuracy || 0).toFixed(1)}%`, icon: Award, color: 'amber' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="text-center p-6 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl border-2 border-slate-600/40 hover:scale-105 transition-all hover:border-slate-500/60 hover:shadow-lg">
                      <Icon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-sm font-gaming text-slate-400 mb-2 uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-4xl font-gaming text-white font-bold">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Quizzes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-2 border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
            <CardHeader className="border-b-2 border-slate-700/50 bg-slate-800/50">
              <CardTitle className="flex items-center gap-3 font-gaming text-white text-xl">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                MIS PERGAMINOS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                </div>
              ) : stats?.recentQuizzes && stats.recentQuizzes.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentQuizzes.map((quiz) => (
                    <div key={quiz.set_id} className="p-5 bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-xl border-2 border-slate-600/40 hover:border-blue-500/50 transition-all hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-gaming text-white text-lg mb-1">{quiz.title}</h4>
                          <p className="text-sm text-slate-400 font-medium">{quiz.question_count} preguntas • {quiz.times_played} veces jugado</p>
                        </div>
                        <BookOpen className="w-7 h-7 text-blue-400" />
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => navigate('/question-sets')} className="w-full bg-blue-600 hover:bg-blue-700 font-gaming text-white shadow-lg hover:shadow-xl transition-all">
                    VER TODOS
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/40 rounded-full flex items-center justify-center border border-gray-700">
                    <FileUp className="w-10 h-10 text-gray-500 opacity-50" />
                  </div>
                  <p className="text-sm font-gaming text-gray-500 mb-3">NO HAY PERGAMINOS</p>
                  <Button onClick={() => navigate('/question-sets/create')} className="bg-gray-800 hover:bg-gray-700 font-gaming border border-gray-600">
                    CREAR PRIMERO
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-2 border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
            <CardHeader className="border-b-2 border-slate-700/50 bg-slate-800/50">
              <CardTitle className="flex items-center gap-3 font-gaming text-white text-xl">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                </div>
                BATALLAS RECIENTES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto" />
                </div>
              ) : stats?.recentGames && stats.recentGames.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentGames.map((game) => (
                    <div key={game.game_id} className="p-5 bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-xl border-2 border-slate-600/40 hover:border-emerald-500/50 transition-all hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-gaming text-white text-lg mb-1">{game.game_code}</h4>
                          <p className="text-sm text-slate-400 font-medium">{game.player_count} jugadores • {game.status}</p>
                        </div>
                        <Play className="w-7 h-7 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => navigate('/game/create')} className="w-full bg-emerald-600 hover:bg-emerald-700 font-gaming text-white shadow-lg hover:shadow-xl transition-all">
                    NUEVA BATALLA
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/40 rounded-full flex items-center justify-center border border-gray-700">
                    <Play className="w-10 h-10 text-gray-500 opacity-50" />
                  </div>
                  <p className="text-sm font-gaming text-gray-500 mb-3">SIN BATALLAS</p>
                  <Button 
                    onClick={() => navigate('/game/create')}
                    variant="outline" 
                    className="border border-gray-600 hover:bg-gray-800 text-gray-400 hover:text-gray-200 font-gaming"
                  >
                    INICIAR AHORA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Power-ups Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-2 border-purple-500/40 bg-gradient-to-br from-purple-900/20 via-slate-800 to-slate-900 shadow-2xl shadow-purple-500/10">
          <CardHeader className="border-b-2 border-purple-500/30 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center border-2 border-purple-400/30 shadow-xl">
                  <Sparkles className="w-9 h-9 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-gaming text-white">GENERADOR IA</CardTitle>
                  <p className="text-sm text-purple-300 font-semibold">Crea quizzes con inteligencia artificial</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 font-gaming border-2 border-amber-400/50 shadow-lg text-base">
                ✨ PRO
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="p-6 bg-gradient-to-br from-purple-700/20 to-slate-800/20 rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <Wand2 className="w-10 h-10 text-purple-400 mb-3" />
                <p className="text-base font-gaming text-white mb-2 font-bold">Desde PDF</p>
                <p className="text-sm text-purple-300">Sube documento</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-700/20 to-slate-800/20 rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <Sparkles className="w-10 h-10 text-purple-400 mb-3" />
                <p className="text-base font-gaming text-white mb-2 font-bold">Desde Texto</p>
                <p className="text-sm text-purple-300">Escribe tema</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-700/20 to-slate-800/20 rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <BookOpen className="w-10 h-10 text-purple-400 mb-3" />
                <p className="text-base font-gaming text-white mb-2 font-bold">Manual</p>
                <p className="text-sm text-purple-300">Crea tú mismo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}
