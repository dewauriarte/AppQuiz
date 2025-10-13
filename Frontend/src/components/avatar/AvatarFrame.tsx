/**
 * AvatarFrame Component
 * Sprint 7: Decorative frame with rarity animations
 */

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface AvatarFrameProps {
  frameUrl: string;
  rarity?: Rarity;
  size?: number;
  animated?: boolean;
  className?: string;
}

const rarityGlowColors: Record<Rarity, string> = {
  common: 'shadow-gray-400',
  uncommon: 'shadow-green-400',
  rare: 'shadow-blue-400',
  epic: 'shadow-purple-400',
  legendary: 'shadow-yellow-400',
  mythic: 'shadow-pink-400',
};

const rarityGradients: Record<Rarity, string> = {
  common: 'from-gray-400/20 to-gray-400/0',
  uncommon: 'from-green-400/30 to-green-400/0',
  rare: 'from-blue-400/40 to-blue-400/0',
  epic: 'from-purple-400/50 to-purple-400/0',
  legendary: 'from-yellow-400/60 via-orange-400/40 to-yellow-400/0',
  mythic: 'from-pink-400/70 via-purple-400/50 to-pink-400/0',
};

export function AvatarFrame({
  frameUrl,
  rarity = 'common',
  size = 128,
  animated = true,
  className,
}: AvatarFrameProps) {
  const isRare = ['epic', 'legendary', 'mythic'].includes(rarity);

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      {/* Glow Effect for Rare Items */}
      {animated && isRare && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full blur-xl',
            rarityGlowColors[rarity]
          )}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Gradient Ring */}
      {animated && isRare && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br',
            rarityGradients[rarity]
          )}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Frame Image */}
      <img
        src={frameUrl}
        alt="Frame"
        className="w-full h-full object-contain relative z-10"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Sparkle Effect for Legendary */}
      {animated && rarity === 'legendary' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                top: `${30 + i * 20}%`,
                left: `${20 + i * 25}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.5,
                repeat: Infinity,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

