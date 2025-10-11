import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, Loader2, ArrowLeft } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { initializeSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function JoinGamePage() {
  const navigate = useNavigate();
  const { accessToken, user } = useAuthStore();
  
  const [gameCode, setGameCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoinGame = () => {
    if (!gameCode.trim()) {
      toast.error('Ingresa el código del juego');
      return;
    }

    if (!accessToken) {
      toast.error('Debes iniciar sesión');
      navigate('/login');
      return;
    }

    setJoining(true);

    const socket = initializeSocket(accessToken);

    // Escuchar respuesta
    socket.once('game:joined', () => {
      toast.success('¡Unido al juego!', { icon: '🎮' });
      navigate(`/game/lobby/${gameCode}`);
      setJoining(false);
    });

    socket.once('game:join-error', (message) => {
      toast.error(message);
      setJoining(false);
    });

    // Emitir evento de unirse
    socket.emit('game:join', {
      gameCode: gameCode.toUpperCase().trim(),
      nickname: nickname.trim() || user?.displayName || user?.username,
    });

    // Timeout de seguridad
    setTimeout(() => {
      setJoining(false);
    }, 10000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')} 
            className="mb-6 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </motion.div>

        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center level-badge shadow-2xl">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-gaming text-white mb-2">
              UNIRSE AL JUEGO
            </h1>
            <p className="text-purple-200">
              Ingresa el código del juego para empezar
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800 border-2 border-cyan-500/30">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <Label htmlFor="gameCode" className="text-cyan-200 font-gaming mb-2 block">
                    CÓDIGO DE JUEGO
                  </Label>
                  <Input
                    id="gameCode"
                    type="text"
                    placeholder="Ej: ABC123"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="bg-slate-900 text-white text-2xl text-center font-gaming tracking-wider border-cyan-500/50 h-16"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !joining) {
                        handleJoinGame();
                      }
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="nickname" className="text-purple-200 font-gaming mb-2 block">
                    APODO (OPCIONAL)
                  </Label>
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="Tu apodo en el juego..."
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                    className="bg-slate-900 text-white border-purple-500/50"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Si no ingresas uno, se usará tu nombre de usuario
                  </p>
                </div>

                <Button
                  onClick={handleJoinGame}
                  disabled={!gameCode || joining}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-blue-600 hover:to-cyan-600 h-14 text-lg"
                >
                  {joining ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uniéndose...
                    </>
                  ) : (
                    <>
                      <Gamepad2 className="mr-2 h-5 w-5" />
                      ¡Unirse al Juego!
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Instrucciones */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Card className="bg-slate-800/50 border border-purple-500/20">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-400">
                  💡 <strong className="text-purple-300">Tip:</strong> El profesor te dará el código del juego.
                  <br />
                  Ingrésalo aquí para unirte a la partida.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

