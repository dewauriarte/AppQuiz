import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Settings, BarChart3, Shield } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';

export default function AdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <Topbar />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card bg-gradient-to-r from-red-900 to-orange-900 rounded-xl p-6 border-2 border-red-500"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-12 h-12 text-yellow-400" />
            <div>
              <h2 className="text-3xl font-gaming text-white">
                Panel de Administración
              </h2>
              <p className="text-red-200">{user?.displayName || user?.username}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Usuarios', icon: Users, color: 'blue', count: '0' },
            { title: 'Quizzes', icon: BookOpen, color: 'purple', count: '0' },
            { title: 'Configuración', icon: Settings, color: 'gray', count: '-' },
            { title: 'Reportes', icon: BarChart3, color: 'green', count: '0' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`bg-${item.color}-950 border-2 border-${item.color}-500 text-white hover:scale-105 transition-all cursor-pointer`}>
                <CardContent className="pt-6">
                  <item.icon className={`w-12 h-12 mx-auto mb-3 text-${item.color}-400`} />
                  <h3 className="text-center font-gaming mb-2">{item.title}</h3>
                  <p className="text-center text-3xl font-bold">{item.count}</p>
                  <Button className="w-full mt-4" variant="outline">
                    GESTIONAR
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
