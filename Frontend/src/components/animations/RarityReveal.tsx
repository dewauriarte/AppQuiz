/**
 * RarityReveal Component
 * Dramatic reveal animation for rare items
 */

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';

interface RarityRevealProps {
  rarity: string;
  itemName: string;
  imageUrl: string;
  onComplete?: () => void;
}

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  uncommon: 'from-green-500 to-green-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-orange-500',
  mythic: 'from-pink-500 to-purple-600',
};

export function RarityReveal({ rarity, itemName, imageUrl, onComplete }: RarityRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onComplete}
    >
      <div className="relative">
        {/* Glow Background */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: 0.5 }}
          transition={{ duration: 0.8 }}
          className={cn(
            'absolute inset-0 blur-3xl rounded-full bg-gradient-to-r',
            rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common
          )}
        />

        {/* Item Card */}
        <motion.div
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl"
        >
          {/* Sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-4 -right-4"
          >
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </motion.div>

          {/* Image */}
          <motion.img
            src={getImageUrl(imageUrl)}
            alt={itemName}
            className="w-48 h-48 object-contain mb-4"
            onError={(e) => {
              e.currentTarget.src = '/items/placeholder.svg';
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          />

          {/* Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold mb-2">{itemName}</h3>
            <p className={cn(
              'text-sm font-semibold uppercase tracking-wider',
              `text-transparent bg-clip-text bg-gradient-to-r`,
              rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common
            )}>
              {rarity}
            </p>
          </motion.div>

          {/* Tap to continue */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, repeat: Infinity, duration: 1.5 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            Toca para continuar
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}

