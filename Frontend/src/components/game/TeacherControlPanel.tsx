import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, BarChart3, Trophy, ArrowRight, Target, Award, Zap, TrendingUp } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

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
    const { width, height } = useWindowSize();
    const topThree = finalResults.leaderboard.slice(0, 3);
    const totalPlayers = finalResults.leaderboard.length;

    // Calcular estadísticas generales
    const totalQuestions = topThree[0] ? topThree[0].correct_answers + topThree[0].wrong_answers : 0;
    const totalCorrectAnswers = finalResults.leaderboard.reduce((sum: number, p: any) => sum + p.correct_answers, 0);
    const totalAnswers = finalResults.leaderboard.reduce((sum: number, p: any) => sum + p.correct_answers + p.wrong_answers, 0);
    const averageAccuracy = totalAnswers > 0 ? (totalCorrectAnswers / totalAnswers) * 100 : 0;
    const highestCombo = Math.max(...finalResults.leaderboard.map((p: any) => p.highest_combo || 0));
    const averageScore = finalResults.leaderboard.reduce((sum: number, p: any) => sum + p.score, 0) / totalPlayers;

    return (
      <>
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.3}
          colors={['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']}
        />

        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-gaming text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
                ¡JUEGO TERMINADO!
              </h1>
              <p className="text-xl md:text-2xl text-purple-300 mb-2">{totalPlayers} jugadores compitieron</p>
              <p className="text-lg text-purple-400">Código: {gameCode}</p>
            </motion.div>

            {/* Podium - Top 3 */}
            {topThree.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="flex items-end justify-center gap-4 mb-8">
                  {/* 2nd Place */}
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex-1 max-w-xs"
                  >
                    <Card className="bg-gradient-to-br from-gray-300 to-gray-500 border-4 border-gray-200 p-4 md:p-6 text-center h-40 md:h-48 flex flex-col justify-end shadow-xl">
                      <div className="text-5xl md:text-6xl mb-2">🥈</div>
                      <div className="text-lg md:text-xl font-bold text-white truncate">{topThree[1]?.nickname || topThree[1]?.username}</div>
                      <div className="text-2xl md:text-3xl font-gaming text-white">{topThree[1]?.score.toLocaleString()}</div>
                    </Card>
                  </motion.div>

                  {/* 1st Place */}
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex-1 max-w-xs"
                  >
                    <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-300 p-4 md:p-6 text-center h-52 md:h-64 flex flex-col justify-end shadow-2xl">
                      <div className="text-7xl md:text-8xl mb-2">👑</div>
                      <div className="text-xl md:text-2xl font-bold text-white truncate">{topThree[0]?.nickname || topThree[0]?.username}</div>
                      <div className="text-3xl md:text-4xl font-gaming text-white">{topThree[0]?.score.toLocaleString()}</div>
                    </Card>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex-1 max-w-xs"
                  >
                    <Card className="bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-orange-300 p-4 md:p-6 text-center h-32 md:h-40 flex flex-col justify-end shadow-xl">
                      <div className="text-4xl md:text-5xl mb-2">🥉</div>
                      <div className="text-base md:text-lg font-bold text-white truncate">{topThree[2]?.nickname || topThree[2]?.username}</div>
                      <div className="text-xl md:text-2xl font-gaming text-white">{topThree[2]?.score.toLocaleString()}</div>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Game Statistics */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-4 border-purple-500 p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-gaming text-white mb-6 text-center flex items-center justify-center gap-3">
                  <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />
                  Estadísticas del Juego
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <Target className="w-6 h-6 md:w-8 md:h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-gaming text-white">{averageAccuracy.toFixed(1)}%</div>
                    <div className="text-xs md:text-sm text-gray-400">Precisión Promedio</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-gaming text-white">{totalCorrectAnswers}</div>
                    <div className="text-xs md:text-sm text-gray-400">Respuestas Correctas</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <Zap className="w-6 h-6 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-gaming text-white">{highestCombo}</div>
                    <div className="text-xs md:text-sm text-gray-400">Mejor Combo</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <Trophy className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-gaming text-white">{Math.round(averageScore)}</div>
                    <div className="text-xs md:text-sm text-gray-400">Puntaje Promedio</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-gaming text-white">{totalPlayers}</div>
                    <div className="text-xs md:text-sm text-gray-400">Total Jugadores</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-gaming text-white">{totalQuestions}</div>
                    <div className="text-xs md:text-sm text-gray-400">Total Preguntas</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Full Leaderboard */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-gaming text-white mb-4 text-center">Clasificación Completa</h2>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {finalResults.leaderboard.map((player: any, index: number) => {
                  const getMedalStyle = (rank: number) => {
                    switch (rank) {
                      case 1:
                        return {
                          bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                          border: 'border-yellow-500',
                          shadow: 'shadow-lg shadow-yellow-500/50',
                        };
                      case 2:
                        return {
                          bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
                          border: 'border-gray-400',
                          shadow: 'shadow-lg shadow-gray-400/50',
                        };
                      case 3:
                        return {
                          bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
                          border: 'border-orange-500',
                          shadow: 'shadow-lg shadow-orange-500/50',
                        };
                      default:
                        return {
                          bg: 'bg-slate-600',
                          border: 'border-slate-500',
                          shadow: '',
                        };
                    }
                  };

                  const medalStyle = getMedalStyle(player.rank);

                  return (
                    <motion.div
                      key={player.user_id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1.0 + index * 0.05 }}
                    >
                      <Card className={`p-4 bg-slate-800 ${player.rank <= 3 ? 'border-3 ' + medalStyle.border : 'border border-slate-600'}`}>
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 ${medalStyle.bg} ${medalStyle.shadow} rounded-full flex items-center justify-center font-gaming text-white border-2 ${medalStyle.border} text-lg md:text-xl`}>
                            {player.rank}
                          </div>
                          <div className="flex-1">
                            <div className="text-base md:text-lg font-bold text-white truncate">
                              {player.nickname || player.username}
                            </div>
                            <div className="text-xs md:text-sm text-gray-400">
                              ✓ {player.correct_answers} correctas • ✗ {player.wrong_answers} incorrectas • 🔥 Combo {player.highest_combo || 0}
                            </div>
                          </div>
                          <div className="text-xl md:text-2xl font-gaming text-yellow-400">
                            {player.score.toLocaleString()}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <Button
                onClick={onContinue}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 px-8 md:px-12 py-4 md:py-6 text-lg md:text-2xl font-gaming shadow-2xl"
              >
                Volver al Dashboard
                <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </motion.div>
          </div>
        </div>
      </>
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
                  Top {Math.min(5, leaderboard.length)}
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {leaderboard.slice(0, 5).map((player: any, index: number) => {
                    const getMedalStyle = (rank: number) => {
                      switch (rank) {
                        case 1:
                          return {
                            bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                            text: 'text-white',
                            border: 'border-yellow-500',
                            shadow: 'shadow-lg shadow-yellow-500/50',
                            size: 'w-12 h-12 text-xl'
                          };
                        case 2:
                          return {
                            bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
                            text: 'text-white',
                            border: 'border-gray-400',
                            shadow: 'shadow-lg shadow-gray-400/50',
                            size: 'w-11 h-11 text-lg'
                          };
                        case 3:
                          return {
                            bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
                            text: 'text-white',
                            border: 'border-orange-500',
                            shadow: 'shadow-lg shadow-orange-500/50',
                            size: 'w-11 h-11 text-lg'
                          };
                        default:
                          return {
                            bg: 'bg-slate-600',
                            text: 'text-white',
                            border: 'border-slate-500',
                            shadow: '',
                            size: 'w-10 h-10 text-base'
                          };
                      }
                    };

                    const medalStyle = getMedalStyle(player.rank);

                    return (
                      <motion.div
                        key={player.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-slate-700 rounded-lg p-4 ${player.rank <= 3 ? 'border-2 ' + medalStyle.border : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${medalStyle.size} ${medalStyle.bg} ${medalStyle.shadow} rounded-full flex items-center justify-center font-gaming ${medalStyle.text} border-2 ${medalStyle.border}`}>
                            {player.rank}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-bold truncate">
                              {player.nickname || player.username}
                            </div>
                            <div className="text-xs text-gray-400">
                              ✓ {player.correct_answers} correctas
                            </div>
                          </div>
                          <div className="text-lg font-gaming text-yellow-400">
                            {player.score.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

