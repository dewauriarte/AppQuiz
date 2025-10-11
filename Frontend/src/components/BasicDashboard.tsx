import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const BasicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                ¡Bienvenido, {user.username}!
              </CardTitle>
              <Badge variant="secondary" className="w-fit mx-auto">
                {user.role === 'admin' ? 'Administrador' :
                 user.role === 'teacher' ? 'Profesor' : 'Estudiante'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Nivel</h3>
                    <p className="text-2xl font-bold text-blue-600">1</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Monedas</h3>
                    <p className="text-2xl font-bold text-yellow-600">0</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1">
                  Unirse a Juego
                </Button>
                <Button variant="outline" className="flex-1">
                  Crear Juego
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
