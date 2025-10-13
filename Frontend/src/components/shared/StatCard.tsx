import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'orange' | 'cyan';
  delay?: number;
}

export default function StatCard({ label, value, icon: Icon, color = 'blue', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`bg-slate-900/50 rounded-lg p-4 text-center border border-${color}-500/30 hover:border-${color}-500 transition-all`}>
        <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-${color}-500 to-${color}-700 flex items-center justify-center level-badge shadow-xl`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <p className={`text-3xl font-bold font-gaming text-${color}-400 mb-1`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      </Card>
    </motion.div>
  );
}

