import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Zap, ArrowUp, Users, Shield } from 'lucide-react';
import type { BoardPlayerState } from '@/types/board-game';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  effect: string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'extra_roll',
    name: 'Tirada Extra',
    description: 'Tira el dado una vez más en este turno',
    price: 100,
    icon: <Zap className="w-8 h-8" />,
    effect: 'extra_roll',
  },
  {
    id: 'teleport',
    name: 'Teletransporte',
    description: 'Avanza 5 casillas instantáneamente',
    price: 200,
    icon: <ArrowUp className="w-8 h-8" />,
    effect: 'teleport_forward',
  },
  {
    id: 'steal',
    name: 'Robo de Monedas',
    description: 'Roba 50 monedas del jugador líder',
    price: 300,
    icon: <Users className="w-8 h-8" />,
    effect: 'steal_coins',
  },
  {
    id: 'shield',
    name: 'Escudo Protector',
    description: 'Te protege de la próxima trampa',
    price: 150,
    icon: <Shield className="w-8 h-8" />,
    effect: 'shield',
  },
];

interface CheckpointShopProps {
  isOpen: boolean;
  onClose: () => void;
  playerCoins: number;
  onBuyItem: (itemId: string) => void;
  onSkip: () => void;
}

/**
 * CheckpointShop - Tienda en checkpoints
 */
export function CheckpointShop({
  isOpen,
  onClose,
  playerCoins,
  onBuyItem,
  onSkip,
}: CheckpointShopProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async (itemId: string) => {
    setIsPurchasing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay
    onBuyItem(itemId);
    setIsPurchasing(false);
    setSelectedItem(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onSkip();
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">¡Checkpoint Shop!</h2>
                    <p className="text-purple-100">Gasta tus monedas sabiamente</p>
                  </div>
                </div>
                <button
                  onClick={onSkip}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Player Coins */}
              <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 w-fit">
                <span className="text-2xl">💰</span>
                <span className="text-xl font-bold">{playerCoins}</span>
                <span className="text-sm text-purple-100">monedas</span>
              </div>
            </div>

            {/* Items Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHOP_ITEMS.map((item, index) => {
                  const canAfford = playerCoins >= item.price;
                  const isSelected = selectedItem === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        relative bg-white rounded-xl shadow-lg p-6
                        border-2 transition-all cursor-pointer
                        ${isSelected 
                          ? 'border-purple-500 ring-4 ring-purple-200' 
                          : canAfford
                          ? 'border-gray-200 hover:border-purple-300 hover:shadow-xl'
                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                        }
                      `}
                      onClick={() => canAfford && setSelectedItem(item.id)}
                    >
                      {/* Icon */}
                      <div className={`
                        w-16 h-16 rounded-xl flex items-center justify-center mb-4
                        ${canAfford 
                          ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' 
                          : 'bg-gray-300 text-gray-500'
                        }
                      `}>
                        {item.icon}
                      </div>

                      {/* Info */}
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {item.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💰</span>
                          <span className={`
                            text-2xl font-bold
                            ${canAfford ? 'text-yellow-600' : 'text-gray-400'}
                          `}>
                            {item.price}
                          </span>
                        </div>

                        {isSelected && canAfford && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchase(item.id);
                            }}
                            disabled={isPurchasing}
                            className="
                              bg-gradient-to-r from-green-500 to-emerald-600 
                              text-white px-6 py-2 rounded-lg font-bold
                              shadow-lg hover:shadow-xl
                              disabled:opacity-50 disabled:cursor-not-allowed
                            "
                          >
                            {isPurchasing ? 'Comprando...' : 'Comprar'}
                          </motion.button>
                        )}
                      </div>

                      {/* Not enough coins badge */}
                      {!canAfford && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                          Sin fondos
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-b-2xl border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Puedes saltar la tienda si no quieres comprar nada
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSkip}
                  className="
                    bg-gray-200 hover:bg-gray-300 
                    text-gray-700 px-6 py-3 rounded-lg font-bold
                    transition-colors
                  "
                >
                  Saltar →
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * CompactShopButton - Botón compacto para abrir tienda
 */
interface CompactShopButtonProps {
  onClick: () => void;
  hasAccess: boolean;
}

export function CompactShopButton({ onClick, hasAccess }: CompactShopButtonProps) {
  if (!hasAccess) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="
        fixed bottom-24 right-4 z-40
        bg-gradient-to-r from-purple-600 to-blue-600
        text-white p-4 rounded-full shadow-2xl
        hover:shadow-purple-500/50
      "
    >
      <ShoppingCart className="w-6 h-6" />
    </motion.button>
  );
}
