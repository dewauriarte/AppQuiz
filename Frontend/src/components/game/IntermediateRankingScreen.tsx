import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Trophy, Zap, Flame, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface LeaderboardPlayer {
  rank: number;
  user_id: number;
  nickname: string;
  username: string;
  score: number;
  correct_answers: number;
  combo_streak: number;
}

interface IntermediateRankingScreenProps {
  leaderboard: LeaderboardPlayer[];
  currentUserId: number;
  previousRank?: number;
  lastResult?: {
    pointsEarned: number;
    breakdown: {
      basePoints: number;
      speedBonus: number;
      comboMultiplier: number;
      totalPoints: number;
    };
  } | null;
}

export default function IntermediateRankingScreen({
  leaderboard,
  currentUserId,
  previousRank,
  lastResult,
}: IntermediateRankingScreenProps) {
  const { width, height } = useWindowSize();
  const [rankChange, setRankChange] = useState<'up' | 'down' | 'same'>('same');
  
  const currentPlayer = leaderboard.find(p => p.user_id === currentUserId);
  const currentRank = currentPlayer?.rank || 0;
  const totalPlayers = leaderboard.length;

  useEffect(() => {
    if (previousRank !== undefined && previousRank !== currentRank) {
      if (currentRank < previousRank) {
        setRankChange('up');
      } else if (currentRank > previousRank) {
        setRankChange('down');
      } else {
        setRankChange('same');
      }
    }
  }, [currentRank, previousRank]);

  const isTopThree = currentRank <= 3;
  const isTopHalf = currentRank <= Math.ceil(totalPlayers / 2);
  
  // Calcular recompensas estimadas
  const estimatedXP = currentPlayer ? Math.floor(currentPlayer.score * 0.03) : 0;
  const estimatedCoins = currentPlayer ? Math.floor(currentPlayer.score * 0.015) : 0;

  // **MODO PROFESOR**: Si no se encuentra el jugador (profesor), mostrar ranking general
  if (!currentPlayer) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl my-auto"
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-yellow-500 p-6 md:p-10 shadow-2xl">
            {/* Título */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 animate-pulse" />
                <h1 className="text-4xl md:text-6xl font-gaming text-white">RANKING</h1>
                <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-lg md:text-xl text-purple-300">Top {Math.min(10, leaderboard.length)} Jugadores</p>
            </motion.div>

            {/* Leaderboard */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {leaderboard.slice(0, 10).map((player, index) => {
                const getMedalStyle = (rank: number) => {
                  switch (rank) {
                    case 1:
                      return {
                        bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                        border: 'border-yellow-500',
                        shadow: 'shadow-xl shadow-yellow-500/50',
                      };
                    case 2:
                      return {
                        bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
                        border: 'border-gray-400',
                        shadow: 'shadow-xl shadow-gray-400/50',
                      };
                    case 3:
                      return {
                        bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
                        border: 'border-orange-500',
                        shadow: 'shadow-xl shadow-orange-500/50',
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
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, type: 'spring' }}
                  >
                    <Card className={`bg-slate-700 p-4 md:p-5 ${player.rank <= 3 ? 'border-3 ' + medalStyle.border : 'border-2 border-slate-600'}`}>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-14 h-14 md:w-16 md:h-16 ${medalStyle.bg} ${medalStyle.shadow} rounded-full flex items-center justify-center font-gaming text-white border-3 ${medalStyle.border} text-xl md:text-2xl`}>
                          {player.rank}
                        </div>
                        <div className="flex-1">
                          <div className="text-lg md:text-xl font-bold text-white">
                            {player.nickname || player.username}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-3">
                            <span>✓ {player.correct_answers} correctas</span>
                            {player.combo_streak > 0 && (
                              <span className="text-orange-400">
                                🔥 Combo x{player.combo_streak}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-gaming text-yellow-400">
                          {player.score.toLocaleString()}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Mensaje siguiente pregunta */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center mt-8 text-cyan-400 text-xl font-gaming"
            >
              Siguiente pregunta en breve...
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-y-auto">
      {lastResult && lastResult.pointsEarned > 0 && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl my-auto"
      >
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-purple-500 p-8 md:p-12 shadow-2xl">
          {/* Indicador de cambio de ranking - Más compacto */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-center mb-6"
          >
            {rankChange === 'up' && (
              <div className="flex items-center justify-center gap-3">
                <TrendingUp className="w-16 h-16 text-green-400 animate-bounce" />
                <h2 className="text-3xl md:text-5xl font-gaming text-green-400">¡SUBISTE!</h2>
              </div>
            )}

            {rankChange === 'down' && (
              <div className="flex items-center justify-center gap-3">
                <TrendingDown className="w-16 h-16 text-red-400" />
                <h2 className="text-3xl md:text-5xl font-gaming text-red-400">BAJASTE</h2>
              </div>
            )}

            {rankChange === 'same' && (
              <div className="flex items-center justify-center gap-3">
                <Minus className="w-16 h-16 text-yellow-400" />
                <h2 className="text-3xl md:text-5xl font-gaming text-yellow-400">MANTUVISTE POSICIÓN</h2>
              </div>
            )}
          </motion.div>

          {/* Breakdown de puntos (solo si lastResult existe) */}
          {lastResult && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              {/* Si ganó puntos (correcta) */}
              {lastResult.pointsEarned > 0 && (
                <>
                  <div className="text-center mb-5">
                    <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-4 border-yellow-400 p-4 md:p-6 inline-block shadow-xl">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-12 h-12 md:w-14 md:h-14 text-white" />
                        <div>
                          <div className="text-5xl md:text-6xl font-gaming text-white">+{lastResult.pointsEarned}</div>
                          <div className="text-yellow-100 text-sm md:text-base">PUNTOS GANADOS</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              )}

              {/* Si no ganó puntos (incorrecta) */}
              {lastResult.pointsEarned === 0 && (
                <div className="text-center mb-5">
                  <Card className="bg-gradient-to-br from-red-700 to-red-900 border-3 border-red-500 p-4 md:p-5 inline-block shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">😔</div>
                      <div>
                        <div className="text-3xl md:text-4xl font-gaming text-white">Respuesta Incorrecta</div>
                        <div className="text-red-200 text-sm md:text-base">¡Sigue intentando!</div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Breakdown solo si ganó puntos */}
              {lastResult.pointsEarned > 0 && (
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5">
                  <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-400 p-3 md:p-4 text-center shadow-lg">
                    <Zap className="w-6 h-6 md:w-7 md:h-7 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-gaming text-white">{lastResult.breakdown.basePoints}</div>
                    <div className="text-xs md:text-sm text-gray-300">Base</div>
                  </Card>

                  <Card className="bg-gradient-to-br from-cyan-900 to-cyan-800 border-2 border-cyan-400 p-3 md:p-4 text-center shadow-lg">
                    <Zap className="w-6 h-6 md:w-7 md:h-7 text-cyan-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-gaming text-white">+{lastResult.breakdown.speedBonus}</div>
                    <div className="text-xs md:text-sm text-gray-300">Velocidad</div>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-400 p-3 md:p-4 text-center shadow-lg">
                    <Flame className="w-6 h-6 md:w-7 md:h-7 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-gaming text-white">x{lastResult.breakdown.comboMultiplier.toFixed(1)}</div>
                    <div className="text-xs md:text-sm text-gray-300">Combo</div>
                  </Card>
                </div>
              )}

              {/* Combo Indicator */}
              {currentPlayer && currentPlayer.combo_streak >= 3 && (
                <div className="text-center mb-5">
                  <div className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 rounded-full border-3 border-yellow-400 shadow-xl">
                    <Flame className="w-6 h-6 text-white animate-pulse" />
                    <span className="text-xl md:text-2xl font-gaming text-white">¡COMBO x{currentPlayer.combo_streak}!</span>
                    <Flame className="w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Información de posición */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="space-y-6"
          >
            {/* Top 3 Badge */}
            {isTopThree && (
              <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-600 to-orange-600 p-4 rounded-lg border-4 border-yellow-400">
                <Trophy className="w-8 h-8 text-white animate-pulse" />
                <span className="text-2xl font-gaming text-white">¡ESTÁS EN EL TOP 3!</span>
                <Trophy className="w-8 h-8 text-white animate-pulse" />
              </div>
            )}

            {/* Top Half Badge */}
            {!isTopThree && isTopHalf && (
              <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-lg border-2 border-blue-400">
                <Zap className="w-6 h-6 text-white" />
                <span className="text-xl font-gaming text-white">¡Estás en la mitad superior!</span>
              </div>
            )}

            {/* Puntuación actual */}
            <div className="text-center bg-gradient-to-br from-slate-700 to-slate-800 p-5 md:p-6 rounded-xl border-3 border-yellow-500 shadow-xl">
              <div className="text-gray-300 text-base mb-2 font-gaming">Tu Puntuación</div>
              <div className="text-5xl md:text-6xl font-gaming text-yellow-400">
                {currentPlayer?.score.toLocaleString() || 0}
              </div>
              <div className="text-gray-400 text-sm mt-1">puntos</div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 p-4 md:p-5 rounded-xl border-2 border-green-500 text-center shadow-lg">
                <div className="text-4xl md:text-5xl font-gaming text-green-400">
                  {currentPlayer?.correct_answers || 0}
                </div>
                <div className="text-sm md:text-base text-gray-300 mt-2 flex items-center justify-center gap-2">
                  <span>✓</span> Correctas
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 p-4 md:p-5 rounded-xl border-2 border-orange-500 text-center shadow-lg">
                <div className="text-4xl md:text-5xl font-gaming text-orange-400">
                  {currentPlayer?.combo_streak || 0}
                </div>
                <div className="text-sm md:text-base text-gray-300 mt-2 flex items-center justify-center gap-2">
                  <Flame className="w-4 h-4" /> Combo
                </div>
              </div>
            </div>

            {/* Recompensas acumuladas (estimadas hasta ahora) */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-xl border-3 border-purple-500 mt-6 shadow-xl">
              <h4 className="text-center text-purple-200 font-gaming mb-4 text-base md:text-lg">Recompensas Acumuladas</h4>
              <div className="flex justify-around">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-cyan-400" />
                  <div>
                    <div className="text-3xl md:text-4xl font-gaming text-cyan-300">~{estimatedXP}</div>
                    <div className="text-sm text-gray-400">XP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-3xl md:text-4xl font-gaming text-yellow-300">~{estimatedCoins}</div>
                    <div className="text-sm text-gray-400">Monedas</div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-400 mt-3">*Recompensas finales al terminar</p>
            </div>
          </motion.div>

          {/* Mensaje de siguiente pregunta */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-center mt-8"
          >
            <p className="text-gray-300 text-xl md:text-2xl font-gaming animate-pulse">
              Siguiente pregunta en breve...
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>

          {/* Mensaje motivacional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center mt-8 text-cyan-400 text-xl font-gaming"
          >
            Siguiente pregunta en breve...
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}

