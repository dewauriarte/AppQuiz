import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  count: number | string;
  show: boolean;
}

export default function CountdownOverlay({ count, show }: CountdownOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            key={count}
            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-full animate-pulse" />
            </div>
            
            {/* Countdown number */}
            <motion.div
              className="relative text-[20rem] font-gaming font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500"
              animate={{
                textShadow: [
                  '0 0 20px rgba(139, 92, 246, 0.8)',
                  '0 0 60px rgba(139, 92, 246, 1)',
                  '0 0 20px rgba(139, 92, 246, 0.8)',
                ],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {count}
            </motion.div>

            {/* Rings */}
            <motion.div
              className="absolute inset-0 border-8 border-purple-500 rounded-full"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [1, 0.5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute inset-0 border-8 border-cyan-500 rounded-full"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [1, 0.5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.2,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

