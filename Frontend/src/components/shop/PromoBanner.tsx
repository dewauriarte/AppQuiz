/**
 * PromoBanner Component
 * Sprint 7: Promotional banner for special offers
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PromoBannerProps {
  title: string;
  description: string;
  imageUrl: string;
  discount?: number;
  endsAt?: Date;
  onAction?: () => void;
}

export function PromoBanner({
  title,
  description,
  imageUrl,
  discount,
  endsAt,
  onAction,
}: PromoBannerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endsAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Expirado');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <Card className="p-0 border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="grid md:grid-cols-[1fr_200px] gap-4 p-6">
          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h3 className="text-xl font-bold">{title}</h3>
              {discount && (
                <Badge className="bg-red-500 text-white">-{discount}%</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{description}</p>
            
            <div className="flex items-center gap-4">
              {endsAt && timeLeft && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Termina en: <span className="font-semibold">{timeLeft}</span></span>
                </div>
              )}
              {onAction && (
                <Button onClick={onAction} size="sm">
                  Ver Oferta
                </Button>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="hidden md:flex items-center justify-center">
            <motion.img
              src={imageUrl}
              alt={title}
              className="w-32 h-32 object-contain"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>

        {/* Animated background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse" />
        </div>
      </Card>
    </motion.div>
  );
}

