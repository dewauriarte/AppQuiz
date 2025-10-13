/**
 * ItemDetailModal Component
 * Sprint 7: Detailed item view with preview
 */

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShopItem } from '@/services/shopService';
import { Coins, Gem, Star, Lock } from 'lucide-react';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';
import { useState } from 'react';

interface ItemDetailModalProps {
  item: ShopItem | null;
  open: boolean;
  onClose: () => void;
  onPurchase: (item: ShopItem, currency: 'coins' | 'gems') => void;
  userLevel?: number;
  userAvatarUrl?: string;
}

const rarityColors = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
  mythic: 'bg-pink-500',
};

export function ItemDetailModal({
  item,
  open,
  onClose,
  onPurchase,
  userLevel = 1,
  userAvatarUrl,
}: ItemDetailModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'coins' | 'gems'>('coins');
  const [showPreview, setShowPreview] = useState(false);

  if (!item) return null;

  const isLocked = item.required_level && item.required_level > userLevel;
  const isSoldOut = item.is_limited_edition && item.current_stock !== null && item.current_stock <= 0;
  const canPurchaseWithCoins = item.price_coins && item.price_coins > 0;
  const canPurchaseWithGems = item.price_gems && item.price_gems > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl !bg-slate-900 text-white border-2 border-purple-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {item.name}
            <Badge className={cn('text-white', rarityColors[item.rarity as keyof typeof rarityColors])}>
              {item.rarity}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-slate-300">{item.item_type}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg p-8 relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className={cn(
                'absolute inset-0 blur-3xl opacity-30',
                rarityColors[item.rarity as keyof typeof rarityColors]
              )} />

              <img
                src={getImageUrl(item.image_url)}
                alt={item.name}
                className="w-full h-full object-contain relative z-10"
                onError={(e) => {
                  e.currentTarget.src = '/items/placeholder.svg';
                }}
              />

              {item.is_premium && (
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Gem className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
            </motion.div>

            {/* Preview Button */}
            {(item.item_type === 'skin' || item.item_type === 'accessory') && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Ocultar' : 'Probar'} en Avatar
              </Button>
            )}

            {/* Avatar Preview */}
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex justify-center"
              >
                <AvatarDisplay
                  avatarUrl={userAvatarUrl}
                  size="large"
                />
              </motion.div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-sm text-muted-foreground">
                {item.description || 'Sin descripción'}
              </p>
            </div>

            {/* Stats/Metadata */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Estadísticas</h3>
                <div className="space-y-1">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Etiquetas</h3>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {item.required_level && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Lock className={cn('w-4 h-4', isLocked ? 'text-red-500' : 'text-green-500')} />
                <span className="text-sm">
                  Nivel {item.required_level} {isLocked ? 'requerido' : '✓'}
                </span>
              </div>
            )}

            {/* Stock */}
            {item.is_limited_edition && item.current_stock !== null && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Stock disponible</span>
                  <span className="font-medium">
                    {item.current_stock}/{item.stock_limit}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all',
                      item.current_stock > 10 ? 'bg-green-500' : 'bg-red-500'
                    )}
                    style={{
                      width: `${((item.current_stock || 0) / (item.stock_limit || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Popularity */}
            {item.times_purchased && item.times_purchased > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                <span>Comprado {item.times_purchased} veces</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {isLocked ? (
            <div className="text-sm text-red-500 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Nivel {item.required_level} requerido
            </div>
          ) : isSoldOut ? (
            <div className="text-sm text-red-500 font-semibold">AGOTADO</div>
          ) : (
            <div className="flex gap-2 w-full">
              {canPurchaseWithCoins && (
                <Button
                  variant={selectedCurrency === 'coins' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    setSelectedCurrency('coins');
                    onPurchase(item, 'coins');
                  }}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  {item.price_coins?.toLocaleString()}
                </Button>
              )}
              {canPurchaseWithGems && (
                <Button
                  variant={selectedCurrency === 'gems' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    setSelectedCurrency('gems');
                    onPurchase(item, 'gems');
                  }}
                >
                  <Gem className="w-4 h-4 mr-2" />
                  {item.price_gems?.toLocaleString()}
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

