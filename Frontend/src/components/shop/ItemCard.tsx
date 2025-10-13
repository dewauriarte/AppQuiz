/**
 * ItemCard Component
 * Sprint 7: Shop item display card
 */

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShopItem } from '@/services/shopService';
import { Coins, Gem, Lock, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';
import '@/styles/rarity-glow.css';

interface ItemCardProps {
  item: ShopItem;
  onPurchase?: (item: ShopItem) => void;
  onView?: (item: ShopItem) => void;
  userLevel?: number;
}

const rarityColors = {
  common: 'from-gray-700 to-gray-800',
  uncommon: 'from-green-700 to-green-900',
  rare: 'from-blue-700 to-blue-900',
  epic: 'from-purple-700 to-purple-900',
  legendary: 'from-yellow-600 to-orange-800',
  mythic: 'from-pink-600 to-purple-800',
};

const rarityBorderColors = {
  common: 'border-gray-400',
  uncommon: 'border-green-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
  mythic: 'border-pink-400',
};

const rarityTextColors = {
  common: 'text-gray-300',
  uncommon: 'text-green-300',
  rare: 'text-blue-300',
  epic: 'text-purple-300',
  legendary: 'text-yellow-300',
  mythic: 'text-pink-300',
};

const rarityShadows = {
  common: 'shadow-lg shadow-gray-500/50',
  uncommon: 'shadow-xl shadow-green-500/50',
  rare: 'shadow-xl shadow-blue-500/50',
  epic: 'shadow-2xl shadow-purple-500/60',
  legendary: 'shadow-2xl shadow-yellow-500/70',
  mythic: 'shadow-2xl shadow-pink-500/70',
};

export function ItemCard({ item, onPurchase, onView, userLevel = 1 }: ItemCardProps) {
  const isLocked = item.required_level && item.required_level > userLevel;
  const isSoldOut =
    item.is_limited_edition && item.current_stock !== null && item.current_stock <= 0;
  const isPremium = item.is_premium;

  const handleClick = () => {
    if (isLocked || isSoldOut) return;
    onView?.(item);
  };

  return (
    <motion.div
      whileHover={{ 
        scale: isLocked || isSoldOut ? 1 : 1.05,
        rotateY: isLocked || isSoldOut ? 0 : 5
      }}
      whileTap={{ scale: isLocked || isSoldOut ? 1 : 0.95 }}
      transition={{ duration: 0.3, type: 'spring' }}
      className="relative"
    >
      <Card
        className={cn(
          'overflow-hidden cursor-pointer transition-all !bg-slate-900',
          rarityBorderColors[item.rarity as keyof typeof rarityBorderColors],
          rarityShadows[item.rarity as keyof typeof rarityShadows],
          `glow-${item.rarity}`,
          'border-3',
          (isLocked || isSoldOut) && 'opacity-60',
          isPremium && 'shimmer'
        )}
        onClick={handleClick}
      >
        {/* Rarity Background Gradient */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-20',
            rarityColors[item.rarity as keyof typeof rarityColors]
          )}
        />

        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg border border-yellow-300">
              <Gem className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}

        {/* Limited Edition Badge */}
        {item.is_limited_edition && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg border border-red-400">
              ⚡ Limitado
            </Badge>
          </div>
        )}

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/90 to-black/90 z-20 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <span className="text-red-300 font-gaming text-2xl block mb-1">AGOTADO</span>
              <span className="text-red-200 text-sm">Sin stock</span>
            </div>
          </div>
        )}

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-purple-900/90 z-20 flex items-center justify-center flex-col gap-3 backdrop-blur-sm">
            <Lock className="w-12 h-12 text-purple-300" />
            <div className="text-center">
              <span className="text-white font-gaming text-lg block">Nivel {item.required_level} requerido</span>
              <span className="text-purple-200 text-sm">Sube de nivel para desbloquear</span>
            </div>
          </div>
        )}

        {/* Item Image */}
        <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 p-6 relative border-b-2 border-slate-700">
          <img
            src={getImageUrl(item.image_url)}
            alt={item.name}
            className="w-full h-full object-contain drop-shadow-2xl"
            onError={(e) => {
              e.currentTarget.src = '/items/placeholder.svg';
            }}
          />
        </div>

        {/* Item Info */}
        <div className="p-4 space-y-2 bg-slate-800/90 relative z-10">
          <div>
            <h3 className="font-gaming text-white truncate text-lg">{item.name}</h3>
            <p
              className={cn(
                'text-xs font-bold uppercase tracking-wider',
                rarityTextColors[item.rarity as keyof typeof rarityTextColors]
              )}
            >
              ⭐ {item.rarity}
            </p>
          </div>

          {item.description && (
            <p className="text-sm text-slate-300 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <div className="flex gap-3">
              {item.price_coins !== null && item.price_coins > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-700/50 px-2 py-1 rounded-lg border border-yellow-500/30">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-gaming text-yellow-300">{item.price_coins.toLocaleString()}</span>
                </div>
              )}
              {item.price_gems !== null && item.price_gems > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-700/50 px-2 py-1 rounded-lg border border-cyan-500/30">
                  <Gem className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-gaming text-cyan-300">{item.price_gems.toLocaleString()}</span>
                </div>
              )}
            </div>

            {!isLocked && !isSoldOut && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPurchase?.(item);
                }}
                className="h-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold shadow-lg"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Comprar
              </Button>
            )}
          </div>

          {/* Stock indicator for limited items */}
          {item.is_limited_edition && item.current_stock !== null && (
            <div className="pt-2 border-t border-slate-700">
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span className="font-bold">Stock Restante</span>
                <span className="font-gaming text-red-400">
                  {item.current_stock}/{item.stock_limit}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-600">
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all shadow-lg shadow-red-500/50"
                  style={{
                    width: `${((item.current_stock || 0) / (item.stock_limit || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

