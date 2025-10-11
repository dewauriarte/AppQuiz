import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoinEffectProps {
  coins: number;
  position: { x: number; y: number };
  onComplete?: () => void;
}

export const CoinEffect: React.FC<CoinEffectProps> = ({
  coins,
  position,
  onComplete,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
          scale: 0,
          x: position.x,
          y: position.y,
        }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0, 1.2, 1, 0.8],
          y: position.y - 60,
        }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
          times: [0, 0.2, 0.7, 1],
        }}
        onAnimationComplete={onComplete}
        className="fixed pointer-events-none z-50 flex items-center gap-2"
      >
        {/* Monedas individuales */}
        {Array.from({ length: Math.min(coins, 5) }).map((_, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.8],
              rotate: [0, 180, 360],
              x: Math.sin(index) * 20,
              y: Math.cos(index) * 15,
            }}
            transition={{
              duration: 1.2,
              delay: index * 0.1,
              ease: "easeOut",
            }}
            className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
          >
            <span className="text-xs font-bold text-yellow-900">¢</span>
          </motion.div>
        ))}

        {/* Texto de cantidad */}
        {coins > 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="bg-black/80 text-white px-2 py-1 rounded-full text-sm font-bold"
          >
            +{coins}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
