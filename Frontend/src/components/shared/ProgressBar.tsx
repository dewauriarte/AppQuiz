import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  max: number;
  level?: number;
  label?: string;
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'pink';
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  current,
  max,
  level,
  label = 'XP',
  color = 'blue',
  showPercentage = true,
  height = 'md',
}: ProgressBarProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const gradients = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    pink: 'from-pink-500 to-rose-500',
  };

  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-purple-200 font-gaming">
          {level && `NIVEL ${level}`}
          {!level && label.toUpperCase()}
        </span>
        <span className="text-sm text-purple-200">
          {current.toLocaleString()} / {max.toLocaleString()} {label}
          {showPercentage && ` (${percentage.toFixed(1)}%)`}
        </span>
      </div>
      <div className={`w-full ${heightClasses[height]} bg-slate-800 rounded-full overflow-hidden border-2 border-${color}-500/50`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${gradients[color]} transition-all duration-500`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

