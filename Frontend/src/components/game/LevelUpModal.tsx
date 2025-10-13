import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Gem, Gift } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LevelUpModalProps {
  isOpen: boolean;
  levelUpData: {
    oldLevel: number;
    newLevel: number;
    rewards: {
      coins: number;
      gems: number;
      items: Array<{ itemId: number; quantity: number }>;
    };
  };
  onClose: () => void;
}

export default function LevelUpModal({ isOpen, levelUpData, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
            transition={{ type: 'spring', damping: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 blur-3xl opacity-50 animate-pulse" />

            <Card className="relative bg-gradient-to-br from-purple-900 to-indigo-900 border-4 border-yellow-400 p-8 overflow-hidden">
              {/* Animated stars background */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-300"
                    initial={{
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%',
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full font-gaming text-3xl shadow-2xl border-4 border-yellow-300">
                    ✨ ¡LEVEL UP! ✨
                  </div>
                </motion.div>

                {/* Level transition */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-8 mb-8"
                >
                  {/* Old level */}
                  <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">Nivel Anterior</div>
                    <motion.div
                      className="text-7xl font-gaming text-white bg-slate-800/50 rounded-full w-32 h-32 flex items-center justify-center border-4 border-slate-600"
                    >
                      {levelUpData.oldLevel}
                    </motion.div>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-6xl"
                  >
                    →
                  </motion.div>

                  {/* New level */}
                  <div className="text-center">
                    <div className="text-yellow-400 text-lg mb-2">¡Nuevo Nivel!</div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.6 }}
                      className="text-7xl font-gaming text-white bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full w-32 h-32 flex items-center justify-center border-4 border-yellow-300 shadow-2xl"
                    >
                      {levelUpData.newLevel}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Rewards */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-gaming text-yellow-400">
                      🎁 Recompensas por Nivel 🎁
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Coins */}
                    {levelUpData.rewards.coins > 0 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 1.0 }}
                        className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-4 text-center border-3 border-yellow-300"
                      >
                        <Coins className="w-10 h-10 text-white mx-auto mb-2" />
                        <div className="text-4xl font-gaming text-white">
                          +{levelUpData.rewards.coins}
                        </div>
                        <div className="text-sm text-yellow-100">Monedas</div>
                      </motion.div>
                    )}

                    {/* Gems */}
                    {levelUpData.rewards.gems > 0 && (
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 1.1 }}
                        className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-center border-3 border-purple-300"
                      >
                        <Gem className="w-10 h-10 text-white mx-auto mb-2" />
                        <div className="text-4xl font-gaming text-white">
                          +{levelUpData.rewards.gems}
                        </div>
                        <div className="text-sm text-purple-100">Gemas</div>
                      </motion.div>
                    )}

                    {/* Items */}
                    {levelUpData.rewards.items.length > 0 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', delay: 1.2 }}
                        className="col-span-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 text-center border-3 border-blue-300"
                      >
                        <Gift className="w-10 h-10 text-white mx-auto mb-2" />
                        <div className="text-2xl font-gaming text-white">
                          ¡{levelUpData.rewards.items.length} Item(s) Desbloqueado(s)!
                        </div>
                        <div className="text-sm text-blue-100">
                          Revisa tu inventario
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Close button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-center mt-8"
                >
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-4 text-xl font-gaming"
                  >
                    ¡Continuar!
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

