import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AudioSettings } from '@/components/game/AudioSettings';
import { Gamepad2, LogOut, Settings, User } from 'lucide-react';
import NotificationCenter from '@/components/notifications/NotificationCenter';

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [openSettings, setOpenSettings] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b-2 border-indigo-500/30 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center level-badge">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-gaming text-white">APP<span className="text-purple-400">QUIZ</span></h1>
              <p className="text-xs text-purple-300">
                {user?.displayName || user?.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="hidden md:block bg-purple-600 text-white px-3 py-1">
              {user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? 'Profesor' : 'Estudiante'}
            </Badge>

            {/* Notification Center (Solo para estudiantes) */}
            {user?.role === 'student' && <NotificationCenter />}
            
            {/* Profile */}
            <Sheet open={openProfile} onOpenChange={setOpenProfile}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                  <User className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-slate-900 border-blue-500">
                <SheetHeader>
                  <SheetTitle className="text-white font-gaming">MI PERFIL</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Usuario</p>
                    <p className="text-white font-medium">{user?.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Nombre</p>
                    <p className="text-white font-medium">{user?.displayName || 'Sin nombre'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Email</p>
                    <p className="text-white font-medium">{user?.email || 'Sin email'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Rol</p>
                    <Badge className="bg-blue-600">
                      {user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                    </Badge>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Settings */}
            <Sheet open={openSettings} onOpenChange={setOpenSettings}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-slate-900 border-purple-500">
                <SheetHeader>
                  <SheetTitle className="text-white font-gaming">CONFIGURACIÓN</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <AudioSettings />
                </div>
              </SheetContent>
            </Sheet>

            {/* Logout */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

