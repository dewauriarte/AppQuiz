/**
 * Avatar Customization Page
 * Sprint 7: Complete avatar customization page
 */

import { AvatarBuilder } from '@/components/avatar/AvatarBuilder';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Topbar from '@/components/layout/Topbar';
import { useAuthStore } from '@/store/authStore';

export function AvatarCustomization() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Topbar />
        <div className="container mx-auto p-6 flex items-center justify-center min-h-[80vh]">
          <Card className="p-8 text-center bg-slate-800 border-purple-500">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-gaming text-white mb-2">Acceso Requerido</h2>
            <p className="text-gray-300 mb-6">Debes iniciar sesión para personalizar tu avatar</p>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              onClick={() => navigate('/login')}
            >
              Ir a Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="bg-slate-800 border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-gaming text-white flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
                Personaliza tu Avatar
              </h1>
              <p className="text-purple-200">
                Crea un avatar único con tus items
              </p>
            </div>
          </div>

          {/* Avatar Builder */}
          <AvatarBuilder
            userId={user.id}
            onSave={(data) => {
              console.log('Avatar saved:', data);
              navigate('/profile');
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

