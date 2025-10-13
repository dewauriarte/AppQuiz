import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Settings, BarChart3, Shield, 
  Package, Sparkles
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Debug: verificar rol
  console.log('[AdminDashboard] Usuario:', user);
  console.log('[AdminDashboard] Rol:', user?.role);

  // Solo admin y teacher pueden ver este dashboard
  if (user && user.role !== 'admin' && user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center bg-slate-900 border-red-500">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-gaming text-white mb-2">⛔ Acceso Denegado</h2>
          <p className="text-gray-400 mb-4">
            Tu rol es <span className="text-red-400 font-bold">"{user.role}"</span>
            <br />
            Necesitas ser <span className="text-green-400">admin</span> o <span className="text-blue-400">teacher</span>
          </p>
          <Button onClick={() => navigate('/dashboard')} className="bg-red-600 hover:bg-red-700">
            Volver al Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const adminActions = [
    {
      title: 'Gestión de Usuarios',
      description: 'Administra todos los usuarios',
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-950',
      borderColor: 'border-blue-500',
      onClick: () => alert('Panel de usuarios en desarrollo'),
    },
    {
      title: 'Gestión de Tienda',
      description: 'Administra items del shop',
      icon: Package,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-950',
      borderColor: 'border-purple-500',
      onClick: () => navigate('/admin/shop'),
    },
    {
      title: 'Sistema de Avatares',
      description: 'Gestiona items de avatar',
      icon: Sparkles,
      gradient: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-950',
      borderColor: 'border-pink-500',
      onClick: () => navigate('/admin/shop'), // TODO: Cambiar a /admin/avatars cuando se implemente
    },
    {
      title: 'Estadísticas Globales',
      description: 'Reportes del sistema',
      icon: BarChart3,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-950',
      borderColor: 'border-green-500',
      onClick: () => alert('Estadísticas en desarrollo'),
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: Settings,
      gradient: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-950',
      borderColor: 'border-gray-500',
      onClick: () => alert('Configuración en desarrollo'),
    },
    {
      title: 'Mi Perfil',
      description: 'Ver mi información',
      icon: Shield,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-950',
      borderColor: 'border-orange-500',
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <Topbar />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card bg-gradient-to-r from-red-900 to-orange-900 rounded-xl p-8 border-2 border-red-500 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-yellow-500 rounded-full shadow-xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-gaming text-white mb-1">
                Panel de Administración
              </h2>
              <p className="text-red-200 text-lg">
                Bienvenido, {user?.displayName || user?.username} 👑
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-2xl font-gaming text-white mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-400" />
            Acciones Rápidas
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminActions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  onClick={action.onClick}
                  className={`${action.bgColor} border-2 ${action.borderColor} hover:shadow-2xl hover:scale-105 transition-all cursor-pointer`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${action.gradient} shadow-lg`}>
                        <action.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-gaming text-white text-lg mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div>
          <h3 className="text-2xl font-gaming text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-400" />
            Estadísticas del Sistema
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: 'Usuarios Totales', icon: Users, color: 'blue', value: 'Gestionar', onClick: () => alert('En desarrollo') },
              { title: 'Items en Tienda', icon: Package, color: 'purple', value: 'Administrar', onClick: () => navigate('/admin/shop') },
              { title: 'Sistema de Avatares', icon: Sparkles, color: 'pink', value: 'Gestionar', onClick: () => navigate('/admin/shop') },
              { title: 'Configuración', icon: Settings, color: 'gray', value: 'Ajustes', onClick: () => alert('En desarrollo') },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Card className={`bg-${stat.color}-950 border-2 border-${stat.color}-500 hover:shadow-xl transition-all`}>
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`w-10 h-10 mx-auto mb-3 text-${stat.color}-400`} />
                    <h4 className="font-gaming text-white mb-2">{stat.title}</h4>
                    <Button 
                      className="w-full mt-2" 
                      variant="outline"
                      onClick={stat.onClick}
                    >
                      {stat.value}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
