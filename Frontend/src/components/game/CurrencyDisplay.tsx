import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Gem, TrendingUp } from 'lucide-react';

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  coinsEarned?: number;
  gemsEarned?: number;
  level?: number;
  xp?: number;
  xpToNextLevel?: number;
  className?: string;
  showAnimation?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  coins,
  gems,
  coinsEarned = 0,
  gemsEarned = 0,
  level = 1,
  xp = 0,
  xpToNextLevel = 100,
  className = '',
  showAnimation = true,
}) => {
  const xpPercentage = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}
    >
      {/* Monedas */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Monedas</div>
              <div className="text-xl font-bold">{coins.toLocaleString()}</div>
              {coinsEarned > 0 && (
                <motion.div
                  initial={showAnimation ? { opacity: 0, scale: 0.8 } : {}}
                  animate={showAnimation ? { opacity: 1, scale: 1 } : {}}
                  className="flex items-center gap-1 text-xs text-green-600"
                >
                  <TrendingUp className="w-3 h-3" />
                  +{coinsEarned}
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gemas */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Gem className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Gemas</div>
              <div className="text-xl font-bold">{gems.toLocaleString()}</div>
              {gemsEarned > 0 && (
                <motion.div
                  initial={showAnimation ? { opacity: 0, scale: 0.8 } : {}}
                  animate={showAnimation ? { opacity: 1, scale: 1 } : {}}
                  className="flex items-center gap-1 text-xs text-purple-600"
                >
                  <TrendingUp className="w-3 h-3" />
                  +{gemsEarned}
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nivel */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Badge className="w-5 h-5 bg-blue-600 text-white text-xs font-bold">
                {level}
              </Badge>
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Nivel</div>
              <div className="text-xl font-bold">{level}</div>
              {xpToNextLevel > 0 && (
                <div className="text-xs text-muted-foreground">
                  {xp}/{xpToNextLevel} XP
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barra de progreso de XP */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progreso</span>
              <span className="text-sm font-medium">
                {Math.round(xpPercentage)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
