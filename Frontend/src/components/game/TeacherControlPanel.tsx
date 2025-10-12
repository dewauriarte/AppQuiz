import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, BarChart3, Trophy, ArrowRight } from 'lucide-react';

interface TeacherControlPanelProps {
  gameCode: string;
  currentQuestion: any;
  timeRemaining: number;
  answersReceived: number;
  totalPlayers: number;
  leaderboard: any[];
  phase: string;
  finalResults: any;
  onContinue: () => void;
}

export default function TeacherControlPanel({
  gameCode,
  currentQuestion,
  timeRemaining,
  answersReceived,
  totalPlayers,
  leaderboard,
  phase,
  finalResults,
  onContinue,
}: TeacherControlPanelProps) {
  if (phase === 'finished' && finalResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-6xl font-gaming text-white mb-4">¡Juego Finalizado!</h1>
            <p className="text-xl text-purple-300">Código: {gameCode}</p>
          </motion.div>

          <Card className="bg-slate-800 border-2 border-purple-500 p-8 mb-8">
            <h2 className="text-3xl font-gaming text-white mb-6">Resultados Finales</h2>
            <div className="space-y-3">
              {finalResults.leaderboard.slice(0, 10).map((player: any) => (
                <div
                  key={player.user_id}
                  className="flex items-center gap-4 bg-slate-700 p-4 rounded-lg"
                >
                  <div className="w-12 text-center">
                    <span className="text-2xl font-gaming text-yellow-400">#{player.rank}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-white">{player.nickname || player.username}</div>
                    <div className="text-sm text-gray-400">
                      ✓ {player.correct_answers} correctas • ✗ {player.wrong_answers} incorrectas
                    </div>
                  </div>
                  <div className="text-2xl font-gaming text-yellow-400">
                    {player.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="text-center">
            <Button
              onClick={onContinue}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 px-8 py-4 text-xl"
            >
              Volver al Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-gaming text-white mb-2">Panel de Control</h1>
              <p className="text-purple-300">Código: {gameCode}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-gaming text-cyan-400">{timeRemaining}s</div>
              <div className="text-sm text-gray-400">Tiempo restante</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question Display */}
          <div className="lg:col-span-2 space-y-6">
            {currentQuestion && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-slate-800 border-2 border-purple-500 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-gaming text-white">
                      Pregunta {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
                    </h2>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Clock className="w-5 h-5" />
                      <span className="text-xl font-gaming">{timeRemaining}s</span>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-6 mb-6">
                    <p className="text-xl text-white leading-relaxed">
                      {currentQuestion.question.question_text}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.question.options.map((option: any, index: number) => (
                      <div
                        key={option.option_id}
                        className="bg-slate-700 border-2 border-slate-600 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-white">{option.option_text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800 border-2 border-blue-500 p-6">
                <h3 className="text-xl font-gaming text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estadísticas en Vivo
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-3xl font-gaming text-white">{totalPlayers}</div>
                    <div className="text-sm text-gray-400">Jugadores</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-3xl font-gaming text-white">{answersReceived}</div>
                    <div className="text-sm text-gray-400">Respuestas</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-3xl font-gaming text-white">
                      {totalPlayers > 0 ? Math.round((answersReceived / totalPlayers) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-400">Respondieron</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Leaderboard */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-slate-800 border-2 border-yellow-500 p-6">
                <h3 className="text-xl font-gaming text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Top 5
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {leaderboard.slice(0, 5).map((player: any, index: number) => (
                    <div
                      key={player.user_id}
                      className="bg-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-gaming ${
                          index === 0 ? 'bg-yellow-600' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-slate-600'
                        }`}>
                          {player.rank}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold truncate">
                            {player.nickname || player.username}
                          </div>
                          <div className="text-xs text-gray-400">
                            {player.correct_answers} correctas
                          </div>
                        </div>
                        <div className="text-lg font-gaming text-yellow-400">
                          {player.score.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

