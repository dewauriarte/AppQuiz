import { motion } from 'framer-motion';
import { Star, Coins, Gem } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface RewardCardProps {
  type: 'xp' | 'coins' | 'gems';
  amount: number;
  delay?: number;
  animate?: boolean;
}

export default function RewardCard({ type, amount, delay = 0, animate = true }: RewardCardProps) {
  const animatedAmount = useCountUp(animate ? amount : 0, 2000);

  const config = {
    xp: {
      icon: Star,
      label: 'XP',
      gradient: 'from-blue-600 to-cyan-600',
      border: 'border-blue-300',
      iconColor: 'text-white',
    },
    coins: {
      icon: Coins,
      label: 'Monedas',
      gradient: 'from-yellow-600 to-orange-600',
      border: 'border-yellow-300',
      iconColor: 'text-white',
    },
    gems: {
      icon: Gem,
      label: 'Gemas',
      gradient: 'from-purple-600 to-pink-600',
      border: 'border-purple-300',
      iconColor: 'text-white',
    },
  };

  const { icon: Icon, label, gradient, border, iconColor } = config[type];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', delay }}
      className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-center border-3 ${border} shadow-xl`}
    >
      <Icon className={`w-12 h-12 ${iconColor} mx-auto mb-3`} />
      <div className="text-4xl font-gaming text-white mb-1">
        {animate ? `+${animatedAmount.toLocaleString()}` : `+${amount.toLocaleString()}`}
      </div>
      <div className="text-base text-white/90 font-semibold">{label}</div>
    </motion.div>
  );
}

