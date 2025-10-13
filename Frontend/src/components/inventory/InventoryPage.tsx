/**
 * InventoryPage Component
 * Sprint 7: User inventory management
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { inventoryService, InventoryItem } from '@/services/inventoryService';
import { EquippedItemsPanel } from './EquippedItemsPanel';
import { InventoryFilters } from './InventoryFilters';
import { Package, Star, Check, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { EquipAnimation } from '@/components/animations/EquipAnimation';
import { LoadingSpinner } from '@/components/animations/LoadingSpinner';
import { getImageUrl } from '@/lib/image-utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const rarityColors = {
  common: 'border-gray-400',
  uncommon: 'border-green-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
  mythic: 'border-pink-400',
};

const rarityBadgeColors = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
  mythic: 'bg-pink-500',
};

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    rarities: [] as string[],
    showEquipped: false,
    showFavorites: false,
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showEquipAnimation, setShowEquipAnimation] = useState(false);
  const [equipAnimationRarity, setEquipAnimationRarity] = useState('common');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      if (!accessToken) {
        console.log('[InventoryPage] No access token available');
        return;
      }
      const result = (await inventoryService.getInventory(accessToken, {})) as InventoryItem[];
      console.log('[InventoryPage] Loaded inventory:', result);
      console.log('[InventoryPage] Equipped items:', result.filter(i => i.is_equipped));
      console.log('[InventoryPage] Favorite items:', result.filter(i => i.is_favorite));
      setItems(result);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (item: InventoryItem) => {
    try {
      if (!accessToken) {
        toast({
          title: 'Error',
          description: 'No estás autenticado',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('[InventoryPage] Equipping item:', item);
      
      if (item.is_equipped) {
        const result = await inventoryService.unequipItem(item.inventory_id, accessToken);
        console.log('[InventoryPage] Unequip result:', result);
        toast({ title: 'Item desequipado', description: `${item.item.name} ha sido desequipado` });
      } else {
        // Show equip animation
        setEquipAnimationRarity(item.item.rarity);
        setShowEquipAnimation(true);
        
        const result = await inventoryService.equipItem(item.inventory_id, accessToken);
        console.log('[InventoryPage] Equip result:', result);
        toast({ title: 'Item equipado', description: `${item.item.name} ha sido equipado` });
      }
      
      // Reload inventory
      await loadInventory();
    } catch (error: any) {
      console.error('Error equipping item:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al equipar item',
        variant: 'destructive',
      });
    }
  };

  const handleUnequipFromPanel = async (inventoryId: number) => {
    const item = items.find((i) => parseInt(i.inventory_id) === inventoryId);
    if (item) {
      await handleEquip(item);
    }
  };

  const handleToggleFavorite = async (item: InventoryItem) => {
    try {
      if (!accessToken) {
        toast({
          title: 'Error',
          description: 'No estás autenticado',
          variant: 'destructive',
        });
        return;
      }
      await inventoryService.toggleFavorite(item.inventory_id, accessToken);
      loadInventory();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredItems = items
    .filter((item) => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(item.item.item_type)) {
        return false;
      }

      // Rarity filter
      if (filters.rarities.length > 0 && !filters.rarities.includes(item.item.rarity)) {
        return false;
      }

      // Equipped filter
      if (filters.showEquipped && !item.is_equipped) {
        return false;
      }

      // Favorites filter
      if (filters.showFavorites && !item.is_favorite) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.acquired_at).getTime() - new Date(a.acquired_at).getTime();
        case 'oldest':
          return new Date(a.acquired_at).getTime() - new Date(b.acquired_at).getTime();
        case 'name':
          return a.item.name.localeCompare(b.item.name);
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
          return rarityOrder.indexOf(b.item.rarity) - rarityOrder.indexOf(a.item.rarity);
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="bg-slate-800 border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-white shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-gaming text-white flex items-center gap-3">
                <Package className="w-8 h-8 text-green-400" />
                Mi Inventario
              </h1>
              <p className="text-purple-200">
                Gestiona tus items y personaliza tu experiencia
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-900 to-blue-950 border-2 border-blue-500 shadow-xl">
            <h3 className="text-sm font-medium text-gray-200 uppercase">Total de Items</h3>
            <p className="text-4xl font-gaming text-blue-300 mt-2 font-bold">{items.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-900 to-green-950 border-2 border-green-500 shadow-xl">
            <h3 className="text-sm font-medium text-gray-200 uppercase">Items Equipados</h3>
            <p className="text-4xl font-gaming text-green-300 mt-2 font-bold">
              {items.filter((i) => i.is_equipped).length}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-900 to-yellow-950 border-2 border-yellow-500 shadow-xl">
            <h3 className="text-sm font-medium text-gray-200 uppercase">Favoritos</h3>
            <p className="text-4xl font-gaming text-yellow-300 mt-2 font-bold">
              {items.filter((i) => i.is_favorite).length}
            </p>
          </Card>
        </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[280px_1fr_300px] gap-6">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block">
          <InventoryFilters
            filters={filters}
            sortBy={sortBy}
            onFilterChange={setFilters}
            onSortChange={setSortBy}
            onClearFilters={() =>
              setFilters({
                categories: [],
                rarities: [],
                showEquipped: false,
                showFavorites: false,
              })
            }
          />
        </aside>

        {/* Items Grid */}
        <div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredItems.map((item) => (
            <Card
              key={item.inventory_id}
              className={cn(
                'overflow-hidden relative border-3 bg-slate-900 hover:shadow-2xl transition-all shadow-lg',
                rarityColors[item.item.rarity as keyof typeof rarityColors]
              )}
            >
              {/* Badges */}
              <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                {item.is_equipped && (
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg border border-green-400">
                    <Check className="w-3 h-3 mr-1" />
                    Equipado
                  </Badge>
                )}
                {item.quantity > 1 && (
                  <Badge className="bg-slate-700 text-white font-bold border border-slate-500 shadow-lg">
                    x{item.quantity}
                  </Badge>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => handleToggleFavorite(item)}
                className={cn(
                  'absolute top-2 right-2 z-10 p-2 rounded-full transition-all shadow-lg',
                  item.is_favorite
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/50 border border-yellow-300'
                    : 'bg-slate-700 text-slate-400 hover:text-yellow-400 hover:bg-slate-600 border border-slate-600'
                )}
              >
                <Star className="w-5 h-5" fill={item.is_favorite ? 'currentColor' : 'none'} />
              </button>

              {/* Item Image */}
              <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 p-6 border-b-2 border-slate-700">
                <img
                  src={getImageUrl(item.item.image_url)}
                  alt={item.item.name}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.src = '/items/placeholder.svg';
                  }}
                />
              </div>

              {/* Item Info */}
              <div className="p-4 space-y-3 bg-slate-800/90">
                <div>
                  <h3 className="font-gaming text-white truncate text-lg">{item.item.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      className={cn(
                        'text-xs font-bold shadow-md border',
                        rarityBadgeColors[item.item.rarity as keyof typeof rarityBadgeColors]
                      )}
                    >
                      ⭐ {item.item.rarity}
                    </Badge>
                    <span className="text-xs text-slate-300 font-medium bg-slate-700/50 px-2 py-0.5 rounded">
                      {item.item.item_type}
                    </span>
                  </div>
                </div>

                {item.item.description && (
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {item.item.description}
                  </p>
                )}

                {/* Actions */}
                <Button
                  onClick={() => handleEquip(item)}
                  className={cn(
                    "w-full font-gaming shadow-lg h-10",
                    item.is_equipped 
                      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                  )}
                >
                  {item.is_equipped ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Desequipar
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Equipar
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

          {filteredItems.length === 0 && !loading && (
            <Card className="p-12 text-center bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500 shadow-2xl">
              <Package className="w-20 h-20 mx-auto text-purple-400 mb-4 drop-shadow-lg" />
              <p className="text-white font-gaming text-2xl mb-2">No tienes items en esta categoría</p>
              <p className="text-slate-400 mb-6">¡Visita la tienda para conseguir items épicos!</p>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-gaming shadow-xl h-12 px-8"
                onClick={() => (window.location.href = '/shop')}
              >
                🛍️ Ir a la Tienda
              </Button>
            </Card>
          )}
        </div>

        {/* Equipped Items Panel */}
        <aside className="hidden lg:block">
          <EquippedItemsPanel
            items={items
              .filter((i) => i.is_equipped)
              .map((i) => ({
                id: parseInt(i.inventory_id),
                name: i.item.name,
                image_url: i.item.image_url,
                slot: i.item.item_type,
                rarity: i.item.rarity,
              }))}
            onUnequip={handleUnequipFromPanel}
          />
        </aside>
      </div>

      {/* Equip Animation */}
      <EquipAnimation
        show={showEquipAnimation}
        rarity={equipAnimationRarity}
        onComplete={() => setShowEquipAnimation(false)}
      />
      </motion.div>
    </div>
  );
}

