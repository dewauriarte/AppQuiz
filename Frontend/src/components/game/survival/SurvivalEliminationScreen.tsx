import { motion, AnimatePresence } from 'framer-motion';
import { Skull, TrendingDown, Users, ChevronRight } from 'lucide-react';
import type { SurvivalRoundEndPayload } from '@/types/survival.types';

interface SurvivalEliminationScreenProps {
  roundEndData: SurvivalRoundEndPayload;
  onContinue: () => void;
  wasEliminated: boolean;
}

/**
 * SurvivalEliminationScreen - Muestra resultados de la ronda y eliminados
 */
export function SurvivalEliminationScreen({
  roundEndData,
  onContinue,
  wasEliminated,
}: SurvivalEliminationScreenProps) {
  const { round, eliminated, survivors_count, safe_zone_size, is_final_round } = roundEndData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          {wasEliminated ? (
            <div className="inline-flex items-center gap-3 bg-red-500 px-8 py-4 rounded-full border-4 border-red-300 shadow-2xl">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Skull className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black text-white">ELIMINADO</h1>
                <p className="text-white/90 text-lg">Has sido eliminado en la ronda {round}</p>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 bg-green-500 px-8 py-4 rounded-full border-4 border-green-300 shadow-2xl">
              <h1 className="text-4xl font-black text-white">¡SOBREVIVISTE!</h1>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-white/20"
        >
          <div className="grid grid-cols-3 gap-6 mb-6">
            <StatCard
              icon={<TrendingDown className="w-8 h-8" />}
              label="Eliminados"
              value={eliminated.length}
              color="text-red-400"
            />
            <StatCard
              icon={<Users className="w-8 h-8" />}
              label="Sobrevivientes"
              value={survivors_count}
              color="text-green-400"
            />
            <StatCard
              icon={<Users className="w-8 h-8" />}
              label="Zona Segura"
              value={`${safe_zone_size}%`}
              color="text-yellow-400"
            />
          </div>

          {is_final_round && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 mb-6"
            >
              <h3 className="text-white font-black text-xl text-center">
                🔥 ¡RONDA FINAL ACTIVADA! 🔥
              </h3>
              <p className="text-white/90 text-center mt-1">
                Solo los mejores {survivors_count} jugadores continúan
              </p>
            </motion.div>
          )}

          {/* Eliminated Players List */}
          {eliminated.length > 0 && (
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Skull className="w-5 h-5 text-red-400" />
                Jugadores Eliminados
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {eliminated.map((player, index) => (
                    <motion.div
                      key={player.userId}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className={`
                        flex items-center justify-between p-3 rounded-lg
                        ${player.userId === parseInt(localStorage.getItem('userId') || '0')
                          ? 'bg-red-500/40 border-2 border-red-400'
                          : 'bg-white/5'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/50 flex items-center justify-center">
                          <span className="text-white font-bold">#{player.rank}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {player.nickname}
                            {player.userId === parseInt(localStorage.getItem('userId') || '0') && (
                              <span className="text-red-300 ml-2">(TÚ)</span>
                            )}
                          </p>
                          <p className="text-white/60 text-sm">{player.score} puntos</p>
                        </div>
                      </div>
                      <Skull className="w-5 h-5 text-red-400" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {wasEliminated ? (
            <div className="text-center">
              <p className="text-white/80 mb-4">
                Puedes seguir viendo el resto de la partida como espectador
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all"
              >
                Continuar Viendo
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold text-xl rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <span>Continuar a Siguiente Ronda</span>
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white/5 rounded-xl p-4 text-center">
      <div className={`flex justify-center mb-2 ${color}`}>
        {icon}
      </div>
      <div className={`text-4xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-white/70 text-sm">{label}</div>
    </div>
  );
}
