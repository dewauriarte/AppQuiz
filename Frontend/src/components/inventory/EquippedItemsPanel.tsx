/**
 * EquippedItemsPanel Component
 * Sprint 7: Show currently equipped items
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { getImageUrl } from '@/lib/image-utils';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface EquippedItem {
  id: number;
  name: string;
  image_url: string;
  slot: string;
  rarity: string;
}

interface EquippedItemsPanelProps {
  items: EquippedItem[];
  avatarUrl?: string;
  onUnequip: (itemId: number) => void;
}

const slotLabels: Record<string, string> = {
  hair: 'Cabello',
  eyes: 'Ojos',
  mouth: 'Boca',
  clothes: 'Ropa',
  accessory: 'Accesorio',
  frame: 'Marco',
  background: 'Fondo',
};

export function EquippedItemsPanel({ items, avatarUrl, onUnequip }: EquippedItemsPanelProps) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Items Equipados</h3>
        <p className="text-sm text-muted-foreground">
          Estos son los items que llevas actualmente
        </p>
      </div>

      {/* Avatar Preview */}
      <div className="flex justify-center">
        <AvatarDisplay avatarUrl={avatarUrl} size="large" />
      </div>

      {/* Equipped Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No tienes items equipados
          </p>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="p-3 flex items-center gap-3 group">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="w-12 h-12 object-contain bg-slate-100 dark:bg-slate-800 rounded p-1"
                  onError={(e) => {
                    e.currentTarget.src = '/items/placeholder.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {slotLabels[item.slot] || item.slot}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.rarity}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUnequip(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}

