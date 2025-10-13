/**
 * PurchaseSuccessModal Component
 * Sprint 7: Success animation after purchase
 */

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShopItem } from '@/services/shopService';
import { Check, Package, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import { RarityReveal } from '@/components/animations/RarityReveal';
import { getImageUrl } from '@/lib/image-utils';
import { useState, useEffect } from 'react';

interface PurchaseSuccessModalProps {
  open: boolean;
  onClose: () => void;
  item: ShopItem | null;
}

export function PurchaseSuccessModal({ open, onClose, item }: PurchaseSuccessModalProps) {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (open && item && (item.rarity === 'epic' || item.rarity === 'legendary' || item.rarity === 'mythic')) {
      setShowReveal(true);
    }
  }, [open, item]);

  if (!item) return null;

  // Show rarity reveal for epic+ items
  if (showReveal) {
    return (
      <RarityReveal
        rarity={item.rarity}
        itemName={item.name}
        imageUrl={item.image_url}
        onComplete={() => setShowReveal(false)}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md !bg-slate-900 text-white border-2 border-green-500">
        <DialogTitle className="sr-only">Compra Exitosa</DialogTitle>
        <DialogDescription className="sr-only">
          Has comprado {item.name} exitosamente
        </DialogDescription>

        {/* Confetti */}
        {open && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}

        <div className="text-center space-y-6 py-6">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center border-2 border-green-500"
          >
            <Check className="w-10 h-10 text-green-400" />
          </motion.div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold mb-2 text-green-400">¡Compra Exitosa!</h2>
            <p className="text-slate-300">Item agregado a tu inventario</p>
          </div>

          {/* Item Preview */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600"
          >
            <img
              src={getImageUrl(item.image_url)}
              alt={item.name}
              className="w-24 h-24 mx-auto object-contain mb-3"
              onError={(e) => {
                e.currentTarget.src = '/items/placeholder.svg';
              }}
            />
            <h3 className="font-semibold text-white">{item.name}</h3>
            <p className="text-sm text-slate-400 capitalize">{item.rarity}</p>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Seguir Comprando
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onClose();
                navigate('/inventory');
              }}
            >
              <Package className="w-4 h-4 mr-2" />
              Ver Inventario
            </Button>
          </div>

          {/* Equip Now */}
          {(item.item_type === 'skin' || item.item_type === 'accessory') && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                onClose();
                navigate('/avatar');
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Equipar Ahora
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

