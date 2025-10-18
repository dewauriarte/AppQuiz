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
      bgColor: 'bg-purple-800',
      borderColor: 'border-purple-900',
      iconBg: 'bg-purple-900',
      hoverBg: 'hover:bg-purple-900',
      onClick: () => navigate('/ai-generator'),
    },
    {
      title: 'Quizzes',
      description: 'Forja un nuevo desafío',
      icon: BookOpen,
      bgColor: 'bg-blue-800',
      borderColor: 'border-blue-900',
      iconBg: 'bg-blue-900',
      hoverBg: 'hover:bg-blue-900',
      onClick: () => navigate('/question-sets'),
    },
    {
      title: 'Mis Listas',
      description: 'Gestiona estudiantes',
      icon: UserCog,
      bgColor: 'bg-indigo-800',
      borderColor: 'border-indigo-900',
      iconBg: 'bg-indigo-900',
      hoverBg: 'hover:bg-indigo-900',
      onClick: () => navigate('/lists'),
    },
    {
      title: 'Iniciar Batalla',
      description: 'Comienza una sesión',
      icon: Play,
      bgColor: 'bg-teal-800',
      borderColor: 'border-teal-900',
      iconBg: 'bg-teal-900',
      hoverBg: 'hover:bg-teal-900',
      onClick: () => navigate('/game/create'),
    },
    {
      title: 'Estadísticas',
      description: 'Analiza el progreso',
      icon: BarChart3,
      bgColor: 'bg-orange-800',
      borderColor: 'border-orange-900',
      iconBg: 'bg-orange-900',
      hoverBg: 'hover:bg-orange-900',
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen bg-stone-900">
      <Topbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 bg-indigo-800 border-2 border-indigo-900"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-indigo-900 flex items-center justify-center border-2 border-indigo-950">
              <Award className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-4xl font-gaming text-white mb-1">
                ¡Bienvenido, Maestro!
              </h2>
              <p className="text-indigo-200 font-semibold text-lg">
                {user?.displayName || user?.username}
              </p>
            </div>
          </div>
          <p className="text-indigo-100 text-lg font-medium">
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
              <Card className={`border-3 ${action.borderColor} ${action.bgColor} text-white ${action.hoverBg} transition-all cursor-pointer`}>
                <CardContent className="pt-6 pb-6">
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl ${action.iconBg} flex items-center justify-center`}>
                    <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-gaming text-center mb-2 text-white font-bold">
                    {action.title}
                  </h3>
                  <p className="text-sm text-center mb-5 font-semibold text-white/90">
                    {action.description}
                  </p>
                  <Button 
                    onClick={action.onClick}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-gaming font-bold transition-all border-2 border-white/40"
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
        <Card className="border-3 border-slate-700 bg-slate-700 shadow-2xl">
          <CardHeader className="border-b-3 border-slate-600 bg-slate-600 pb-4">
            <CardTitle className="text-3xl font-gaming text-white font-bold">📊 RESUMEN DEL REINO</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                  <Loader2 className="w-10 h-10 text-white animate-spin mx-auto" strokeWidth={2.5} />
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
                    <div key={i} className="text-center p-6 bg-slate-600 rounded-2xl border-3 border-slate-500 transition-all hover:bg-slate-500">
                      <Icon className="w-14 h-14 mx-auto mb-4 text-white" strokeWidth={2.5} />
                      <p className="text-sm font-gaming text-slate-200 mb-2 uppercase tracking-wide font-bold">
                        {stat.label}
                      </p>
                      <p className="text-5xl font-gaming text-white font-black">
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
          <Card className="border-3 border-slate-700 bg-slate-700">
            <CardHeader className="border-b-3 border-slate-600 bg-blue-800">
              <CardTitle className="flex items-center gap-3 font-gaming text-white text-xl font-bold">
                <div className="w-12 h-12 rounded-xl bg-blue-900 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                MIS PERGAMINOS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" strokeWidth={2.5} />
                </div>
              ) : stats?.recentQuizzes && stats.recentQuizzes.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentQuizzes.map((quiz) => (
                    <div key={quiz.set_id} className="p-5 bg-slate-600 rounded-xl border-2 border-slate-500 hover:bg-blue-800 hover:border-blue-900 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-gaming text-white text-lg mb-1 font-bold">{quiz.title}</h4>
                          <p className="text-sm text-slate-200 font-semibold">{quiz.question_count} preguntas • {quiz.times_played} veces jugado</p>
                        </div>
                        <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => navigate('/question-sets')} className="w-full bg-blue-800 hover:bg-blue-900 font-gaming text-white font-bold transition-all border-2 border-blue-900">
                    VER TODOS
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/40 rounded-full flex items-center justify-center border border-gray-700">
                    <FileUp className="w-10 h-10 text-slate-400" strokeWidth={2.5} />
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
          <Card className="border-3 border-slate-700 bg-slate-700">
            <CardHeader className="border-b-3 border-slate-600 bg-teal-800">
              <CardTitle className="flex items-center gap-3 font-gaming text-white text-xl font-bold">
                <div className="w-12 h-12 rounded-xl bg-teal-900 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                BATALLAS RECIENTES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" strokeWidth={2.5} />
                </div>
              ) : stats?.recentGames && stats.recentGames.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentGames.map((game) => (
                    <div key={game.game_id} className="p-5 bg-slate-600 rounded-xl border-2 border-slate-500 hover:bg-teal-800 hover:border-teal-900 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-gaming text-white text-lg mb-1 font-bold">{game.game_code}</h4>
                          <p className="text-sm text-slate-200 font-semibold">{game.player_count} jugadores • {game.status}</p>
                        </div>
                        <Play className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => navigate('/game/create')} className="w-full bg-teal-800 hover:bg-teal-900 font-gaming text-white font-bold transition-all border-2 border-teal-900">
                    NUEVA BATALLA
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/40 rounded-full flex items-center justify-center border border-gray-700">
                    <Play className="w-10 h-10 text-slate-400" strokeWidth={2.5} />
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
        <Card className="border-3 border-purple-900 bg-purple-800">
          <CardHeader className="border-b-3 border-purple-900 bg-purple-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-18 h-18 bg-purple-900 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-gaming text-white font-bold">GENERADOR IA</CardTitle>
                  <p className="text-sm text-purple-100 font-bold">Crea quizzes con inteligencia artificial</p>
                </div>
              </div>
              <Badge className="bg-orange-700 text-white px-5 py-2 font-gaming font-bold text-base border-3 border-orange-800">
                ✨ PRO
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="p-6 bg-purple-700 rounded-xl border-3 border-purple-800 hover:bg-purple-800 transition-all cursor-pointer">
                <Wand2 className="w-12 h-12 text-white mb-3" strokeWidth={2.5} />
                <p className="text-lg font-gaming text-white mb-2 font-black">Desde PDF</p>
                <p className="text-sm text-purple-100 font-bold">Sube documento</p>
              </div>
              <div className="p-6 bg-purple-700 rounded-xl border-3 border-purple-800 hover:bg-purple-800 transition-all cursor-pointer">
                <Sparkles className="w-12 h-12 text-white mb-3" strokeWidth={2.5} />
                <p className="text-lg font-gaming text-white mb-2 font-black">Desde Texto</p>
                <p className="text-sm text-purple-100 font-bold">Escribe tema</p>
              </div>
              <div className="p-6 bg-purple-700 rounded-xl border-3 border-purple-800 hover:bg-purple-800 transition-all cursor-pointer">
                <BookOpen className="w-12 h-12 text-white mb-3" strokeWidth={2.5} />
                <p className="text-lg font-gaming text-white mb-2 font-black">Manual</p>
                <p className="text-sm text-purple-100 font-bold">Crea tú mismo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}
