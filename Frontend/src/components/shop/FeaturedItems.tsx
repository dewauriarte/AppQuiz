/**
 * FeaturedItems Component
 * Sprint 7: Showcase featured/trending items
 */

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShopItem } from '@/services/shopService';
import { TrendingUp, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturedItemsProps {
  items: ShopItem[];
  onItemClick: (item: ShopItem) => void;
}

const rarityColors = {
  common: 'from-gray-500/20 to-gray-600/20',
  uncommon: 'from-green-500/20 to-green-600/20',
  rare: 'from-blue-500/20 to-blue-600/20',
  epic: 'from-purple-500/20 to-purple-600/20',
  legendary: 'from-yellow-500/20 to-orange-500/20',
  mythic: 'from-pink-500/20 to-purple-600/20',
};

export function FeaturedItems({ items, onItemClick }: FeaturedItemsProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold">Items Destacados</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.slice(0, 4).map((item, index) => (
          <motion.div
            key={item.item_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                'p-4 cursor-pointer transition-all hover:scale-105 relative overflow-hidden group',
                'bg-gradient-to-br',
                rarityColors[item.rarity as keyof typeof rarityColors]
              )}
              onClick={() => onItemClick(item)}
            >
              {/* Featured Badge */}
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-yellow-500 text-black">
                  <Star className="w-3 h-3 mr-1" />
                  Destacado
                </Badge>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent blur-xl" />
              </div>

              {/* Image */}
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-3 relative">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
                {item.is_premium && (
                  <Sparkles className="absolute top-2 left-2 w-5 h-5 text-yellow-500" />
                )}
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{item.rarity}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    {item.price_coins ? `${item.price_coins} 🪙` : `${item.price_gems} 💎`}
                  </div>
                  <Button size="sm" variant="ghost" className="h-8">
                    Ver
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

