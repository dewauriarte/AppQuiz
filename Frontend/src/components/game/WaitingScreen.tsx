import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WaitingScreenProps {
  countdown?: number | string | null;
}

export default function WaitingScreen({ countdown }: WaitingScreenProps) {
  // Si hay countdown, mostrar "Get Ready!"
  const showGetReady = countdown !== null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="bg-slate-800/90 border-4 border-purple-500 p-8 md:p-12 max-w-lg w-full relative overflow-hidden">
        {/* Retro grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          {showGetReady ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {/* Icono más pequeño y con efecto retro */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.3
                }}
                className="mb-6"
              >
                <div className="relative inline-block">
                  <Zap className="w-16 h-16 text-yellow-400 relative z-10" />
                  {/* Glow effect */}
                  <div className="absolute inset-0 w-16 h-16 bg-yellow-400 blur-xl opacity-50" />
                </div>
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-gaming text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-3 tracking-wider">
                ¡PREPÁRATE!
              </h2>

              <motion.div
                className="text-2xl text-cyan-400 font-gaming mb-4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                GET READY...
              </motion.div>

              {/* Retro scanlines effect */}
              <motion.div
                className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-4"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Pixelated waiting icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6"
              >
                <div className="w-12 h-12 mx-auto grid grid-cols-3 gap-1">
                  {[...Array(9)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="bg-purple-400 rounded-sm"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-gaming text-white mb-3 tracking-wider">
                ESPERANDO...
              </h2>
              <p className="text-lg text-purple-300 font-gaming">
                Siguiente pregunta en breve
              </p>

              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-6 text-cyan-400 text-2xl tracking-widest"
              >
                ▸ ▸ ▸
              </motion.div>

              {/* Bottom border decoration */}
              <div className="mt-6 flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </Card>
    </div>
  );
}

