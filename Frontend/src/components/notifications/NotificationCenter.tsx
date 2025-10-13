import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Gamepad2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSocketStore } from '@/store/socketStore';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface GameInvitation {
  id: string;
  game_id: number;
  game_code: string;
  quiz_title: string;
  teacher_name: string;
  game_mode: string;
  created_at: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [invitations, setInvitations] = useState<GameInvitation[]>([]);
  const navigate = useNavigate();
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) {
      // Socket no disponible
      return;
    }

    // Socket conectado, escuchando invitaciones...

    // Escuchar invitaciones
    socket.on('game:invitation', (data: Omit<GameInvitation, 'id'>) => {
      console.log('[NotificationCenter] 🎮 Invitación recibida:', data);
      
      const invitation: GameInvitation = {
        ...data,
        id: `${data.game_id}-${Date.now()}`,
      };

      setInvitations((prev) => [invitation, ...prev]);

      // Mostrar toast
      toast.success(
        `🎮 Nueva invitación de ${data.teacher_name} para jugar "${data.quiz_title}"`,
        { duration: 5000 }
      );
    });

    return () => {
      socket.off('game:invitation');
    };
  }, [socket]);

  const handleJoinGame = (invitation: GameInvitation) => {
    navigate(`/game/join?code=${invitation.game_code}`);
    handleDismiss(invitation.id);
    setIsOpen(false);
  };

  const handleDismiss = (invitationId: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
  };

  const handleClearAll = () => {
    setInvitations([]);
  };

  const getGameModeIcon = (mode: string) => {
    switch (mode) {
      case 'classic':
        return '⚡';
      case 'board':
        return '🎲';
      case 'survival':
        return '💀';
      default:
        return '🎮';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-white hover:bg-purple-500/20"
      >
        <Bell className="w-5 h-5" />
        {invitations.length > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {invitations.length}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 z-50"
            >
              <Card className="bg-slate-800 border-2 border-purple-500 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-400" />
                      <h3 className="font-gaming text-white">INVITACIONES</h3>
                    </div>
                    {invitations.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-xs text-purple-300 hover:text-white"
                      >
                        Limpiar todo
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {invitations.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
                      <p className="text-gray-400 text-sm">No tienes invitaciones</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {invitations.map((invitation) => (
                        <motion.div
                          key={invitation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="relative"
                        >
                          <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 hover:border-purple-400 transition-colors p-3">
                            {/* Dismiss Button */}
                            <button
                              onClick={() => handleDismiss(invitation.id)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            {/* Content */}
                            <div className="pr-6">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="text-2xl">
                                  {getGameModeIcon(invitation.game_mode)}
                                </span>
                                <div className="flex-1">
                                  <h4 className="font-gaming text-white text-sm mb-1">
                                    {invitation.quiz_title}
                                  </h4>
                                  <p className="text-xs text-purple-300">
                                    Invitación de <span className="font-semibold">{invitation.teacher_name}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatDistanceToNow(new Date(invitation.created_at), {
                                    addSuffix: true,
                                    locale: es,
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleJoinGame(invitation)}
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-gaming text-xs py-2"
                                >
                                  <Gamepad2 className="w-3 h-3 mr-1" />
                                  UNIRSE
                                </Button>
                                <Badge variant="outline" className="text-xs border-purple-400 text-purple-300">
                                  {invitation.game_code}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

