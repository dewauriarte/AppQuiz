/**
 * PurchaseConfirmation Component
 * Sprint 7: Confirmation dialog before purchase
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShopItem } from '@/services/shopService';
import { Coins, Gem, AlertCircle, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PurchaseConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: ShopItem | null;
  currency: 'coins' | 'gems';
  currentBalance: { coins: number; gems: number };
  loading?: boolean;
}

const rarityColors = {
  common: 'border-gray-400',
  uncommon: 'border-green-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
  mythic: 'border-pink-400',
};

export function PurchaseConfirmation({
  open,
  onClose,
  onConfirm,
  item,
  currency,
  currentBalance,
  loading = false,
}: PurchaseConfirmationProps) {
  if (!item) return null;

  const price = currency === 'coins' ? item.price_coins || 0 : item.price_gems || 0;
  const balance = currency === 'coins' ? currentBalance.coins : currentBalance.gems;
  const balanceAfter = balance - price;
  const canAfford = balanceAfter >= 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Compra</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres comprar este item?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Preview */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'border-2 rounded-lg p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
              rarityColors[item.rarity as keyof typeof rarityColors]
            )}
          >
            <div className="flex gap-4">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-20 h-20 object-contain"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.rarity}</p>
                <div className="flex items-center gap-2 mt-2">
                  {currency === 'coins' ? (
                    <div className="flex items-center gap-1 font-semibold">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span>{price.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 font-semibold">
                      <Gem className="w-4 h-4 text-blue-500" />
                      <span>{price.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Balance Info */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Balance Actual:</span>
              <div className="flex items-center gap-1 font-semibold">
                {currency === 'coins' ? (
                  <>
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span>{currentBalance.coins.toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <Gem className="w-4 h-4 text-blue-500" />
                    <span>{currentBalance.gems.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Precio Total:</span>
              <div className="flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                <TrendingDown className="w-4 h-4" />
                <span>-{price.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-medium">Balance Después:</span>
              <div
                className={cn(
                  'flex items-center gap-1 font-bold text-lg',
                  canAfford ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {currency === 'coins' ? (
                  <>
                    <Coins className="w-5 h-5" />
                    <span>{balanceAfter.toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <Gem className="w-5 h-5" />
                    <span>{balanceAfter.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Warning if insufficient balance */}
          {!canAfford && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tienes suficiente {currency === 'coins' ? 'monedas' : 'gemas'} para esta compra.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!canAfford || loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Comprando...
              </>
            ) : (
              'Confirmar Compra'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
