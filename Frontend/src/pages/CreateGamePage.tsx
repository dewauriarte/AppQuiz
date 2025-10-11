import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Gamepad2, Loader2, Rocket } from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface QuestionSet {
  set_id: number;
  title: string;
  difficulty: string;
  _count: { questions: number };
}

export default function CreateGamePage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [gameMode, setGameMode] = useState('classic');
  const [maxPlayers, setMaxPlayers] = useState('50');
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [speedPoints, setSpeedPoints] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const { data } = await api.get('/question-sets?limit=100');
      setQuizzes(data.data || []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Error al cargar los quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    if (!selectedQuiz) {
      toast.error('Selecciona un quiz');
      return;
    }

    try {
      setCreating(true);
      const { data } = await api.post('/games', {
        set_id: parseInt(selectedQuiz),
        game_mode: gameMode,
        max_players: parseInt(maxPlayers),
        config: {
          show_leaderboard_live: showLeaderboard,
          points_for_speed: speedPoints,
        },
      });

      toast.success('¡Juego creado!');
      navigate(`/game/lobby/${data.data.game_code}`);
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast.error(error.response?.data?.message || 'Error al crear el juego');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')} 
            className="mb-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="game-card bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-6 border-2 border-green-500 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center level-badge shadow-xl">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-gaming text-white">
                  INICIAR BATALLA
                </h1>
                <p className="text-green-200">
                  Configura tu juego y prepárate para la acción
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Seleccionar Quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800 border-2 border-blue-500/30">
              <CardHeader className="border-b border-blue-500/30">
                <CardTitle className="text-white font-gaming">PASO 1: SELECCIONA TU QUIZ</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  </div>
                ) : (
                  <div>
                    <Label className="text-purple-200 font-gaming mb-2 block">Quiz</Label>
                    <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                      <SelectTrigger className="bg-slate-900 text-white border-purple-500/50">
                        <SelectValue placeholder="Selecciona un quiz..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-purple-500">
                        {quizzes.map((quiz) => (
                          <SelectItem key={quiz.set_id} value={quiz.set_id.toString()} className="text-white hover:bg-purple-500/20">
                            {quiz.title} ({quiz._count.questions} preguntas)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Configuración */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800 border-2 border-purple-500/30">
              <CardHeader className="border-b border-purple-500/30">
                <CardTitle className="text-white font-gaming">PASO 2: CONFIGURACIÓN</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-purple-200 font-gaming mb-2 block">Modo de Juego</Label>
                  <Select value={gameMode} onValueChange={setGameMode}>
                    <SelectTrigger className="bg-slate-900 text-white border-purple-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-500">
                      <SelectItem value="classic" className="text-white hover:bg-purple-500/20">
                        ⚡ Clásico - Todos responden al mismo tiempo
                      </SelectItem>
                      <SelectItem value="board" className="text-white hover:bg-purple-500/20">
                        🎲 Tablero - Avanza casillas
                      </SelectItem>
                      <SelectItem value="survival" className="text-white hover:bg-purple-500/20">
                        💀 Supervivencia - Eliminación progresiva
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-purple-200 font-gaming mb-2 block">Máximo de Jugadores</Label>
                  <Input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    min="2"
                    max="200"
                    className="bg-slate-900 text-white border-purple-500/50"
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="leaderboard"
                      checked={showLeaderboard}
                      onChange={(e) => setShowLeaderboard(e.target.checked)}
                      className="w-5 h-5 rounded border-purple-500"
                    />
                    <Label htmlFor="leaderboard" className="text-purple-200 font-gaming cursor-pointer">
                      🏆 Mostrar ranking en vivo
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="speed"
                      checked={speedPoints}
                      onChange={(e) => setSpeedPoints(e.target.checked)}
                      className="w-5 h-5 rounded border-purple-500"
                    />
                    <Label htmlFor="speed" className="text-purple-200 font-gaming cursor-pointer">
                      ⚡ Puntos por velocidad
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end gap-4"
          >
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateGame}
              disabled={!selectedQuiz || creating}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 min-w-40"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  ¡Crear Juego!
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

