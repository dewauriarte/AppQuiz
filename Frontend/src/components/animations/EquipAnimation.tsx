/**
 * EquipAnimation Component
 * Particle effect when equipping items
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/rarity-glow.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface EquipAnimationProps {
  show: boolean;
  rarity?: string;
  onComplete?: () => void;
}

const rarityColors: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#EAB308',
  mythic: '#EC4899',
};

export function EquipAnimation({ show, rarity = 'common', onComplete }: EquipAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100,
          color: rarityColors[rarity] || rarityColors.common,
        });
      }
      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1000);
    }
  }, [show, rarity, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: 0,
                opacity: 0,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

