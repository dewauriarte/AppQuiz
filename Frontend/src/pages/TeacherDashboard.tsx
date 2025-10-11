import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, BarChart3, FileUp, Sparkles, Users, Calendar, Award, Scroll, Wand2, UserCog } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'IA Mágica',
      description: 'Genera con inteligencia',
      icon: Wand2,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-950',
      borderColor: 'border-purple-500',
      onClick: () => navigate('/ai-generator'),
    },
    {
      title: 'Quizzes',
      description: 'Forja un nuevo desafío',
      icon: BookOpen,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-950',
      borderColor: 'border-blue-500',
      onClick: () => navigate('/question-sets'),
    },
    {
      title: 'Mis Listas',
      description: 'Gestiona estudiantes',
      icon: UserCog,
      gradient: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-950',
      borderColor: 'border-indigo-500',
      onClick: () => navigate('/lists'),
    },
    {
      title: 'Iniciar Batalla',
      description: 'Comienza una sesión',
      icon: Play,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-950',
      borderColor: 'border-green-500',
      onClick: () => navigate('/game/create'),
    },
    {
      title: 'Estadísticas',
      description: 'Analiza el progreso',
      icon: BarChart3,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-950',
      borderColor: 'border-orange-500',
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-purple-900 to-indigo-900 border-3 border-purple-500 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center level-badge">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-gaming text-retro text-white">
                ¡Bienvenido, Maestro!
              </h2>
              <p className="text-purple-200 font-medium">
                {user?.displayName || user?.username}
              </p>
            </div>
          </div>
          <p className="text-purple-100 text-lg">
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
              <Card className={`border-3 ${action.borderColor} ${action.bgColor} text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer game-card`}>
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg level-badge`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-gaming text-center mb-2">
                    {action.title}
                  </h3>
                  <p className="text-xs text-center text-gray-300 mb-4">
                    {action.description}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={action.onClick}
                    className="w-full border-2 border-white/30 hover:bg-white/10 text-white font-gaming"
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
        <Card className="border-2 border-indigo-500 bg-slate-900 shadow-xl">
          <CardHeader className="border-b border-indigo-500/30 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
            <CardTitle className="text-2xl font-gaming text-white">RESUMEN DEL REINO</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: 'Quizzes Forjados', value: '0', icon: Scroll, color: 'blue' },
                { label: 'Batallas Activas', value: '0', icon: Play, color: 'green' },
                { label: 'Aprendices', value: '0', icon: Users, color: 'purple' },
                { label: 'Victoria Promedio', value: '0%', icon: Award, color: 'amber' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className={`text-center p-4 bg-${stat.color}-950/30 rounded-xl border-2 border-${stat.color}-500/30`}>
                    <Icon className={`w-10 h-10 mx-auto mb-3 text-${stat.color}-400`} />
                    <p className={`text-xs font-gaming text-${stat.color}-300 mb-1`}>
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-gaming text-${stat.color}-400`}>
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
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
          <Card className="border-2 border-blue-500 bg-slate-900 shadow-xl">
            <CardHeader className="border-b border-blue-500/30 bg-gradient-to-r from-blue-900/30 to-cyan-900/30">
              <CardTitle className="flex items-center gap-2 font-gaming text-white">
                <BookOpen className="w-5 h-5 text-blue-400" />
                MIS PERGAMINOS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/30">
                  <FileUp className="w-10 h-10 text-blue-400 opacity-50" />
                </div>
                <p className="text-sm font-gaming text-gray-400 mb-3">NO HAY PERGAMINOS</p>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 font-gaming">
                  CREAR PRIMERO
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-2 border-green-500 bg-slate-900 shadow-xl">
            <CardHeader className="border-b border-green-500/30 bg-gradient-to-r from-green-900/30 to-emerald-900/30">
              <CardTitle className="flex items-center gap-2 font-gaming text-white">
                <Calendar className="w-5 h-5 text-green-400" />
                BATALLAS RECIENTES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30">
                  <Play className="w-10 h-10 text-green-400 opacity-50" />
                </div>
                <p className="text-sm font-gaming text-gray-400 mb-3">SIN BATALLAS</p>
                <Button 
                  variant="outline" 
                  className="border-2 border-green-500 hover:bg-green-500/10 text-green-400 font-gaming"
                >
                  INICIAR AHORA
                </Button>
              </div>
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
        <Card className="border-3 border-purple-500 bg-gradient-to-br from-purple-950 to-indigo-950 shadow-2xl">
          <CardHeader className="border-b border-purple-500/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center level-badge">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-gaming text-white">GENERADOR IA</CardTitle>
                  <p className="text-sm text-purple-300">Crea quizzes con inteligencia artificial</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 font-gaming border-2 border-amber-300">
                ✨ PRO
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <Wand2 className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-sm font-gaming text-white mb-1">Desde PDF</p>
                <p className="text-xs text-gray-400">Sube documento</p>
              </div>
              <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-2" />
                <p className="text-sm font-gaming text-white mb-1">Desde Texto</p>
                <p className="text-xs text-gray-400">Escribe tema</p>
              </div>
              <div className="p-4 bg-pink-900/30 rounded-lg border border-pink-500/30">
                <BookOpen className="w-8 h-8 text-pink-400 mb-2" />
                <p className="text-sm font-gaming text-white mb-1">Manual</p>
                <p className="text-xs text-gray-400">Crea tú mismo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}
