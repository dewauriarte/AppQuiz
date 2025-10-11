import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Copy, 
  Play, 
  X, 
  Users, 
  CheckCircle, 
  Clock,
  Loader2 
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { initializeSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface Player {
  user_id: number;
  username: string;
  display_name?: string | null;
  nickname?: string;
  isReady: boolean;
  score: number;
}

export default function GameLobbyPage() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  
  const [game, setGame] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (!gameCode || !accessToken) return;

    // Inicializar Socket.IO
    const socket = initializeSocket(accessToken);

    // Cargar info del juego
    loadGame();

    // Unirse al room del juego (necesario para recibir eventos en tiempo real)
    socket.emit('game:join', { gameCode, nickname: '' }, (response: any) => {
      if (!response.success) {
        console.error('Error joining game room:', response.message);
      }
    });

    // Escuchar eventos
    socket.on('game:player-joined', (data) => {
      setPlayers(data.players);
      toast.success(`${data.player.username} se unió al juego`, {
        icon: '👋',
        duration: 2000,
      });
    });

    socket.on('game:player-left', (data) => {
      setPlayers((prev) => prev.filter(p => p.user_id !== data.userId));
      toast(`${data.username} salió del juego`, {
        icon: '👋',
        duration: 2000,
      });
    });

    socket.on('game:player-ready', (data) => {
      setPlayers((prev) =>
        prev.map(p =>
          p.user_id === data.userId ? { ...p, isReady: true } : p
        )
      );
    });

    socket.on('game:starting', () => {
      setStarting(true);
      toast.success('¡El juego va a comenzar!', { icon: '🎮' });
    });

    socket.on('game:started', () => {
      navigate(`/game/play/${gameCode}`);
    });

    return () => {
      socket.off('game:player-joined');
      socket.off('game:player-left');
      socket.off('game:player-ready');
      socket.off('game:starting');
      socket.off('game:started');
    };
  }, [gameCode, accessToken]);

  const loadGame = async () => {
    try {
      const { data } = await api.get(`/games/code/${gameCode}`);
      setGame(data.data);
      setPlayers(data.data.game_players || []);
    } catch (error) {
      console.error('Error loading game:', error);
      toast.error('Error al cargar el juego');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode || '');
    toast.success('Código copiado', { icon: '📋' });
  };

  const startGame = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('game:start', { gameCode }, (response: any) => {
      if (!response.success) {
        toast.error(response.message || 'Error al iniciar el juego');
      }
    });
  };

  const cancelGame = async () => {
    try {
      await api.delete(`/games/${game.game_id}`);
      toast.success('Juego cancelado');
      setIsCancelDialogOpen(false);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cancelar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
      </div>
    );
  }

  const readyCount = players.filter(p => p.isReady).length;
  const canStart = players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="game-card bg-gradient-to-br from-blue-900 to-cyan-900 rounded-xl p-8 border-2 border-blue-500 shadow-2xl text-center">
            <h1 className="text-2xl font-gaming text-white mb-2">SALA DE ESPERA</h1>
            <p className="text-blue-200 mb-6">{game?.question_sets?.title}</p>
            
            {/* Game Code */}
            <div className="bg-slate-900/80 rounded-xl p-6 max-w-md mx-auto border-2 border-cyan-500">
              <p className="text-cyan-200 text-sm font-gaming mb-2">CÓDIGO DE JUEGO</p>
              <div className="text-6xl font-gaming text-white tracking-wider mb-4 relative">
                {gameCode?.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="inline-block bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <Button
                onClick={copyGameCode}
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar Código
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Jugadores */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-slate-800 border-2 border-purple-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-gaming text-white">
                      JUGADORES ({players.length}/{game?.max_players})
                    </h2>
                  </div>
                  <Badge className="bg-green-600">
                    {readyCount} Listos
                  </Badge>
                </div>

                {players.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
                    <p className="text-gray-400 font-gaming">
                      Esperando jugadores...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Comparte el código para que se unan
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {players.map((player, index) => (
                      <motion.div
                        key={player.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border-2 border-purple-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-gaming text-white">
                            {(player.display_name || player.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {player.display_name || player.username}
                            </p>
                            {player.nickname && (
                              <p className="text-sm text-gray-400">"{player.nickname}"</p>
                            )}
                          </div>
                        </div>
                        {player.isReady && (
                          <Badge className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Listo
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Controles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <Card className="bg-slate-800 border-2 border-green-500/30">
              <CardContent className="pt-6 space-y-4">
                <Button
                  onClick={startGame}
                  disabled={!canStart || starting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 h-14 text-lg"
                >
                  {starting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      ¡Iniciar Juego!
                    </>
                  )}
                </Button>

                {!canStart && (
                  <p className="text-xs text-center text-amber-400">
                    Se necesitan al menos 2 jugadores
                  </p>
                )}

                <Button
                  onClick={() => setIsCancelDialogOpen(true)}
                  variant="outline"
                  className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar Juego
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-2 border-blue-500/30">
              <CardContent className="pt-6">
                <h3 className="font-gaming text-white mb-3">INFO DEL JUEGO</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Modo:</span>
                    <span className="text-white font-medium capitalize">{game?.game_mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Preguntas:</span>
                    <span className="text-white font-medium">{game?.question_sets?._count?.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Jugadores:</span>
                    <span className="text-white font-medium">{game?.max_players}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Diálogo de confirmación para cancelar juego */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-2 border-red-500/50 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-gaming text-2xl text-red-400 flex items-center gap-2">
              <X className="w-6 h-6" />
              CANCELAR JUEGO
            </AlertDialogTitle>
            <AlertDialogDescription className="text-purple-200">
              ¿Estás seguro de cancelar el juego? Todos los jugadores serán desconectados y el código dejará de funcionar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-800">
              No, Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={cancelGame}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-rose-600 hover:to-red-600"
            >
              <X className="mr-2 h-4 w-4" />
              Sí, Cancelar Juego
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

