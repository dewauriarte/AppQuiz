/**
 * ShopPage Component
 * Sprint 7: Main shop interface
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItemCard } from './ItemCard';
import { ItemDetailModal } from './ItemDetailModal';
import { PurchaseSuccessModal } from './PurchaseSuccessModal';
import { ShopFilters } from './ShopFilters';
import { PromoBanner } from './PromoBanner';
import { FeaturedItems } from './FeaturedItems';
import { shopService, ShopItem } from '@/services/shopService';
import { getUserStats } from '@/services/userStatsService';
import { Search, Coins, Gem, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/animations/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [purchasedItem, setPurchasedItem] = useState<ShopItem | null>(null);
  const [userBalance, setUserBalance] = useState({ coins: 0, gems: 0 });
  const [filters, setFilters] = useState({
    rarities: [] as string[],
    priceRange: [0, 10000] as [number, number],
    showAvailable: false,
    showPremium: false,
  });
  const { toast } = useToast();
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  // Load user balance
  useEffect(() => {
    if (user && accessToken) {
      loadUserBalance();
    }
  }, [user, accessToken]);

  useEffect(() => {
    loadItems();
  }, [currentPage, selectedCategory, sortBy]);

  const loadUserBalance = async () => {
    try {
      if (!user?.id || !accessToken) {
        console.log('[ShopPage] User or token not available:', { userId: user?.id, hasToken: !!accessToken });
        return;
      }
      const stats = await getUserStats(user.id, accessToken);
      setUserBalance({
        coins: stats.currencies.coins,
        gems: stats.currencies.gems,
      });
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const result = await shopService.getItems({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        sort_by: sortBy,
        page: currentPage,
        limit: 12,
      });
      
      // Filtrar solo items de avatar (skin, accessory, frame)
      const avatarItems = result.items.filter((item: any) => 
        ['skin', 'accessory', 'frame'].includes(item.item_type)
      );
      
      setItems(avatarItems);
      setTotalPages(result.pagination.total_pages);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = (item: ShopItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handlePurchaseFromModal = async (item: ShopItem, currency: 'coins' | 'gems') => {
    try {
      if (!accessToken) {
        toast({
          title: 'Error',
          description: 'No estás autenticado',
          variant: 'destructive',
        });
        return;
      }
      
      const result = await shopService.purchase(
        {
          item_id: item.item_id,
          quantity: 1,
          currency_type: currency,
        },
        accessToken
      );

      // Update balance
      setUserBalance(result.new_balance);

      // Close detail modal
      setDetailModalOpen(false);

      // Show success modal
      setPurchasedItem(item);
      setSuccessModalOpen(true);

      // Reload items
      loadItems();
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al comprar el item',
        variant: 'destructive',
      });
    }
  };

  const filteredItems = items.filter((item) => {
    // Search filter
    if (!item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Rarity filter
    if (filters.rarities.length > 0 && !filters.rarities.includes(item.rarity)) {
      return false;
    }

    // Price range filter (use coins price)
    const price = item.price_coins || item.price_gems || 0;
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }

    // Availability filter
    if (filters.showAvailable) {
      if (item.is_limited_edition && item.current_stock !== null && item.current_stock <= 0) {
        return false;
      }
    }

    // Premium filter
    if (filters.showPremium && !item.is_premium) {
      return false;
    }

    return true;
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
              className="bg-slate-800 border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-gaming text-white flex items-center gap-3">
                ✨ Tienda de Avatares
              </h1>
              <p className="text-purple-200">
                🎭 Skins, accesorios y marcos exclusivos para tu avatar
              </p>
            </div>
          </div>

          {/* User Balance */}
          <Card className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-500 shadow-2xl">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-yellow-600 shadow-lg">
                  <Coins className="w-5 h-5 text-yellow-100" />
                </div>
                <div>
                  <p className="text-xs text-gray-300 uppercase font-medium">Monedas</p>
                  <span className="font-gaming text-yellow-400 text-xl font-bold">{userBalance.coins.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-cyan-600 shadow-lg">
                  <Gem className="w-5 h-5 text-cyan-100" />
                </div>
                <div>
                  <p className="text-xs text-gray-300 uppercase font-medium">Gemas</p>
                  <span className="font-gaming text-cyan-400 text-xl font-bold">{userBalance.gems.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

      {/* Promo Banner */}
      <PromoBanner
        title="¡Oferta de Temporada!"
        description="Obtén hasta 50% de descuento en items seleccionados"
        imageUrl="/assets/promo-banner.png"
        discount={50}
        endsAt={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // 7 days from now
        onAction={() => setSelectedCategory('all')}
      />

      {/* Featured Items */}
      {items.length > 0 && (
        <FeaturedItems
          items={items.filter((i) => i.is_premium || i.rarity === 'legendary')}
          onItemClick={handleViewItem}
        />
      )}

      {/* Filters and Search */}
      <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <Input
                placeholder="🔍 Buscar items por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-slate-900 border-2 border-blue-600 text-white placeholder:text-gray-400 font-medium shadow-inner text-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
              />
            </div>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-56 h-12 bg-slate-900 border-2 border-blue-600 text-white font-gaming shadow-lg hover:bg-slate-800 transition-colors">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-2 border-blue-500">
              <SelectItem value="newest" className="font-gaming">✨ Más nuevo</SelectItem>
              <SelectItem value="price_asc" className="font-gaming">💰 Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price_desc" className="font-gaming">💎 Precio: Mayor a Menor</SelectItem>
              <SelectItem value="rarity" className="font-gaming">⭐ Rareza</SelectItem>
              <SelectItem value="popular" className="font-gaming">🔥 Más popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-slate-800 to-slate-900 border-3 border-purple-500 shadow-2xl p-2 h-auto gap-2">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/50 font-gaming text-slate-300 hover:text-white transition-all h-12 data-[state=active]:border-2 data-[state=active]:border-purple-300"
          >
            🎯 Todos
          </TabsTrigger>
          <TabsTrigger 
            value="avatar" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/50 font-gaming text-slate-300 hover:text-white transition-all h-12 data-[state=active]:border-2 data-[state=active]:border-purple-300"
          >
            👕 Skins
          </TabsTrigger>
          <TabsTrigger 
            value="accessories" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/50 font-gaming text-slate-300 hover:text-white transition-all h-12 data-[state=active]:border-2 data-[state=active]:border-purple-300"
          >
            🎩 Accesorios
          </TabsTrigger>
          <TabsTrigger 
            value="frames" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/50 font-gaming text-slate-300 hover:text-white transition-all h-12 data-[state=active]:border-2 data-[state=active]:border-purple-300"
          >
            🖼️ Marcos
          </TabsTrigger>
          <TabsTrigger 
            value="emotes" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/50 font-gaming text-slate-300 hover:text-white transition-all h-12 data-[state=active]:border-2 data-[state=active]:border-purple-300"
          >
            😎 Emotes
          </TabsTrigger>
          <TabsTrigger 
            value="boosts" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/50 font-gaming text-slate-300 hover:text-white transition-all h-12 data-[state=active]:border-2 data-[state=active]:border-purple-300"
          >
            ⚡ Boosts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content with Sidebar */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block">
          <ShopFilters
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={() =>
              setFilters({
                rarities: [],
                priceRange: [0, 10000],
                showAvailable: false,
                showPremium: false,
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
            <ItemCard
              key={item.item_id}
              item={item}
              onPurchase={handleViewItem}
              onView={handleViewItem}
              userLevel={10} // TODO: Get from user context
            />
          ))}
        </motion.div>
      )}

          {filteredItems.length === 0 && !loading && (
            <Card className="p-12 text-center bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500 shadow-xl">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-white font-gaming text-2xl mb-2">No se encontraron items</p>
              <p className="text-slate-400">Intenta ajustar tus filtros o búsqueda</p>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-slate-800 border-2 border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed font-gaming shadow-lg h-12 px-6"
              >
                ← Anterior
              </Button>
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-2 border-purple-500 rounded-lg px-6 py-3 shadow-xl">
                <span className="text-white font-gaming text-lg">
                  Página <span className="text-purple-300">{currentPage}</span> de <span className="text-purple-300">{totalPages}</span>
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-slate-800 border-2 border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed font-gaming shadow-lg h-12 px-6"
              >
                Siguiente →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onPurchase={handlePurchaseFromModal}
        userLevel={10}
      />

      {/* Purchase Success Modal */}
      <PurchaseSuccessModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        item={purchasedItem}
      />
      </motion.div>
    </div>
  );
}

