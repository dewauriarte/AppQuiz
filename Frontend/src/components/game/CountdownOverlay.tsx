import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface CountdownOverlayProps {
  count: number | string;
  show: boolean;
}

export default function CountdownOverlay({ count, show }: CountdownOverlayProps) {
  const isStarting = count === 'starting';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <Card className="bg-slate-800/95 border-4 border-cyan-500 p-8 md:p-12 max-w-md w-full relative overflow-hidden">
            {/* Retro grid background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            </div>

            <motion.div
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              className="relative text-center"
            >
              {isStarting ? (
                <>
                  {/* Icon para "starting" */}
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="mb-6"
                  >
                    <Zap className="w-20 h-20 text-yellow-400 mx-auto" />
                  </motion.div>

                  <h2 className="text-4xl md:text-5xl font-gaming text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4 tracking-wider">
                    ¡PREPARADOS!
                  </h2>

                  <motion.div
                    className="text-2xl text-cyan-400 font-gaming"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    El juego comienza...
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Contador numérico */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                    className="mb-4"
                  >
                    <div className="text-8xl md:text-9xl font-gaming font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 leading-none">
                      {count}
                    </div>
                  </motion.div>

                  {/* Pixelated border decoration */}
                  <div className="flex justify-center gap-2 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-cyan-400"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                          scale: [1, 1.5, 1]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Scanline effect */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                animate={{
                  top: ['0%', '100%'],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </motion.div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

