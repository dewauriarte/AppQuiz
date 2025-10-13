import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { adminShopService, ShopItemCreate } from '@/services/adminShopService';
import { Plus, Edit, Trash2, Image as ImageIcon, Package, Search, Filter, X, SortAsc, ArrowLeft, Sparkles, Crown, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';
import Topbar from '@/components/layout/Topbar';

export default function AdminShopManagement() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();
  const { accessToken, user } = useAuthStore();

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterAvailable, setFilterAvailable] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Form state
  const [formData, setFormData] = useState<ShopItemCreate>({
    name: '',
    description: '',
    item_type: 'skin',
    rarity: 'common',
    price_coins: undefined,
    price_gems: undefined,
    is_premium: false,
    is_available: true,
    is_limited_edition: false,
    stock_limit: undefined,
    required_level: undefined,
    category: '',
    tags: [],
    metadata: {},
  });

  const [files, setFiles] = useState<{
    image?: File;
    icon?: File;
    preview?: File;
  }>({});

  const [imagePreviews, setImagePreviews] = useState<{
    image?: string;
    icon?: string;
    preview?: string;
  }>({});

  useEffect(() => {
    // Debug: verificar rol del usuario
    console.log('[AdminShop] Usuario:', user);
    console.log('[AdminShop] Rol:', user?.role);
    console.log('[AdminShop] Token presente:', !!accessToken);
    
    if (user && user.role !== 'admin' && user.role !== 'teacher') {
      toast({
        title: '⚠️ Acceso Denegado',
        description: `Tu rol es "${user.role}", necesitas ser "admin" o "teacher"`,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    if (accessToken) {
      loadItems();
    }
  }, [accessToken, user]);

  const loadItems = async () => {
    try {
      setLoading(true);
      if (!accessToken) return;
      const data = await adminShopService.getAllItems(accessToken);
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (type: 'image' | 'icon' | 'preview', file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFiles(prev => ({ ...prev, [type]: undefined }));
      setImagePreviews(prev => ({ ...prev, [type]: undefined }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!accessToken) return;

      if (editingItem) {
        await adminShopService.updateItem(editingItem.item_id, formData, files, accessToken);
        toast({
          title: 'Item actualizado',
          description: 'El item ha sido actualizado exitosamente',
        });
      } else {
        await adminShopService.createItem(formData, files, accessToken);
        toast({
          title: 'Item creado',
          description: 'El item ha sido creado exitosamente',
        });
      }

      setModalOpen(false);
      resetForm();
      loadItems();
    } catch (error: any) {
      console.error('Error saving item:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al guardar el item',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return;

    try {
      if (!accessToken) return;
      await adminShopService.deleteItem(itemId, accessToken);
      toast({
        title: 'Item eliminado',
        description: 'El item ha sido eliminado exitosamente',
      });
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el item',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      item_type: item.item_type,
      rarity: item.rarity,
      price_coins: item.price_coins,
      price_gems: item.price_gems,
      is_premium: item.is_premium,
      is_available: item.is_available,
      is_limited_edition: item.is_limited_edition,
      stock_limit: item.stock_limit,
      required_level: item.required_level,
      category: item.category || '',
      tags: item.tags || [],
      metadata: item.metadata || {},
    });
    setImagePreviews({
      image: item.image_url ? getImageUrl(item.image_url) : undefined,
      icon: item.icon_url ? getImageUrl(item.icon_url) : undefined,
      preview: item.preview_url ? getImageUrl(item.preview_url) : undefined,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      item_type: 'skin',
      rarity: 'common',
      price_coins: undefined,
      price_gems: undefined,
      is_premium: false,
      is_available: true,
      is_limited_edition: false,
      stock_limit: undefined,
      required_level: undefined,
      category: '',
      tags: [],
      metadata: {},
    });
    setFiles({});
    setImagePreviews({});
  };

  // Función para remover imagen
  const removeImage = (type: 'image' | 'icon' | 'preview') => {
    setFiles(prev => ({ ...prev, [type]: undefined }));
    setImagePreviews(prev => ({ ...prev, [type]: undefined }));
  };

  // Filtrado y ordenamiento de items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Búsqueda por nombre
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      result = result.filter(item => item.item_type === filterType);
    }

    // Filtrar por rareza
    if (filterRarity !== 'all') {
      result = result.filter(item => item.rarity === filterRarity);
    }

    // Filtrar por disponibilidad
    if (filterAvailable !== 'all') {
      result = result.filter(item => 
        filterAvailable === 'available' ? item.is_available : !item.is_available
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.item_id - a.item_id);
        break;
      case 'oldest':
        result.sort((a, b) => a.item_id - b.item_id);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price_coins || 0) - (a.price_coins || 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.price_coins || 0) - (b.price_coins || 0));
        break;
    }

    return result;
  }, [items, searchTerm, filterType, filterRarity, filterAvailable, sortBy]);

  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Topbar />
        <div className="container mx-auto p-6">
          <Card className="p-12 text-center bg-slate-800 border-red-500">
            <h2 className="text-2xl font-gaming text-white mb-4">Acceso Denegado</h2>
            <p className="text-gray-300">No tienes permisos para acceder a esta página</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Topbar />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header con botón volver */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="bg-slate-900/50 border-2 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/20 text-purple-200 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </Button>
            <div className="h-8 w-px bg-purple-500/30" />
            <div className="flex-1">
              <h1 className="text-4xl font-gaming text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 flex items-center gap-3 drop-shadow-lg">
                <div className="relative">
                  <Package className="w-10 h-10 text-purple-400 animate-pulse" />
                  <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                </div>
                Administración de Tienda
              </h1>
              <p className="text-purple-300 text-sm mt-1 font-semibold">
                ✨ Gestiona los items del shop • {filteredAndSortedItems.length} items disponibles
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-gaming shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 border-2 border-purple-400/50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Item Nuevo
            </Button>
          </motion.div>

          {/* Filtros y Búsqueda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border-2 border-purple-500/40 backdrop-blur-md shadow-2xl shadow-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-gaming text-purple-200">Filtros Avanzados</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Búsqueda */}
                <div className="md:col-span-2">
                  <Label className="text-purple-300 mb-2 flex items-center gap-2 font-semibold">
                    <Search className="w-4 h-4" />
                    Buscar Item
                  </Label>
                  <Input
                    placeholder="Escribe para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-slate-500 transition-all duration-300 shadow-lg"
                  />
                </div>

              {/* Tipo */}
              <div>
                <Label className="text-purple-300 mb-2 flex items-center gap-2 font-semibold">
                  <Package className="w-4 h-4" />
                  Tipo
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white transition-all shadow-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-2 border-purple-500/50">
                    <SelectItem value="all">📦 Todos</SelectItem>
                    <SelectItem value="skin">👕 Skin</SelectItem>
                    <SelectItem value="accessory">💎 Accesorio</SelectItem>
                    <SelectItem value="frame">🖼️ Marco</SelectItem>
                    <SelectItem value="emote">😊 Emote</SelectItem>
                    <SelectItem value="boost">⚡ Boost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rareza */}
              <div>
                <Label className="text-purple-300 mb-2 flex items-center gap-2 font-semibold">
                  <Crown className="w-4 h-4" />
                  Rareza
                </Label>
                <Select value={filterRarity} onValueChange={setFilterRarity}>
                  <SelectTrigger className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white transition-all shadow-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-2 border-purple-500/50">
                    <SelectItem value="all">✨ Todas</SelectItem>
                    <SelectItem value="common">⚪ Común</SelectItem>
                    <SelectItem value="uncommon">🟢 No Común</SelectItem>
                    <SelectItem value="rare">🔵 Raro</SelectItem>
                    <SelectItem value="epic">🟣 Épico</SelectItem>
                    <SelectItem value="legendary">🟡 Legendario</SelectItem>
                    <SelectItem value="mythic">🔴 Mítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Disponibilidad */}
              <div>
                <Label className="text-purple-300 mb-2 flex items-center gap-2 font-semibold">
                  <Gem className="w-4 h-4" />
                  Estado
                </Label>
                <Select value={filterAvailable} onValueChange={setFilterAvailable}>
                  <SelectTrigger className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white transition-all shadow-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-2 border-purple-500/50">
                    <SelectItem value="all">📋 Todos</SelectItem>
                    <SelectItem value="available">✅ Disponible</SelectItem>
                    <SelectItem value="unavailable">❌ No Disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar */}
              <div>
                <Label className="text-purple-300 mb-2 flex items-center gap-2 font-semibold">
                  <SortAsc className="w-4 h-4" />
                  Ordenar
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white transition-all shadow-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-2 border-purple-500/50">
                    <SelectItem value="newest">🆕 Más Reciente</SelectItem>
                    <SelectItem value="oldest">📅 Más Antiguo</SelectItem>
                    <SelectItem value="name-asc">🔤 Nombre A-Z</SelectItem>
                    <SelectItem value="name-desc">🔡 Nombre Z-A</SelectItem>
                    <SelectItem value="price-high">💰 Precio Mayor</SelectItem>
                    <SelectItem value="price-low">💸 Precio Menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Limpiar filtros */}
            <AnimatePresence>
              {(searchTerm || filterType !== 'all' || filterRarity !== 'all' || filterAvailable !== 'all') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setFilterRarity('all');
                      setFilterAvailable('all');
                    }}
                    className="mt-4 border-2 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
          </motion.div>

          {/* Items Grid */}
          {loading ? (
            <motion.div 
              className="flex flex-col justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <Package className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-purple-300 text-xl font-gaming mt-6 animate-pulse">Cargando items mágicos...</p>
            </motion.div>
          ) : filteredAndSortedItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-16 text-center bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border-2 border-purple-500/40 backdrop-blur-md shadow-2xl">
                <div className="relative inline-block mb-6">
                  <Package className="w-24 h-24 text-slate-700" />
                  <Sparkles className="w-8 h-8 text-purple-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h3 className="text-2xl font-gaming text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
                  {searchTerm || filterType !== 'all' || filterRarity !== 'all' || filterAvailable !== 'all'
                    ? '🔍 No se encontraron items'
                    : '✨ Comienza tu aventura'}
                </h3>
                <p className="text-slate-400 text-lg mb-6">
                  {searchTerm || filterType !== 'all' || filterRarity !== 'all' || filterAvailable !== 'all'
                    ? 'Prueba con otros filtros o busca algo diferente'
                    : 'Crea tu primer item mágico y empieza a llenar tu tienda'}
                </p>
                {!(searchTerm || filterType !== 'all' || filterRarity !== 'all' || filterAvailable !== 'all') && (
                  <Button
                    onClick={() => {
                      resetForm();
                      setModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-gaming shadow-xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Primer Item
                  </Button>
                )}
              </Card>
            </motion.div>
          ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {filteredAndSortedItems.map((item, index) => {
              const rarityColors = {
                legendary: 'from-yellow-500/20 to-orange-500/20 border-yellow-500',
                epic: 'from-purple-500/20 to-pink-500/20 border-purple-500',
                rare: 'from-blue-500/20 to-cyan-500/20 border-blue-500',
                uncommon: 'from-green-500/20 to-emerald-500/20 border-green-500',
                common: 'from-gray-500/20 to-slate-500/20 border-gray-500',
                mythic: 'from-red-500/20 to-pink-500/20 border-red-500',
              };

              return (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="group"
                >
                  <Card
                    className={cn(
                      "overflow-hidden bg-gradient-to-br border-2 shadow-2xl transition-all duration-300",
                      rarityColors[item.rarity as keyof typeof rarityColors] || rarityColors.common,
                      "hover:shadow-purple-500/30"
                    )}
                  >
                    <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 p-4 relative">
                      {item.image_url ? (
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-16 h-16" />
                        </div>
                      )}
                      {item.is_premium && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 p-1 rounded-full">
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3 bg-slate-900/80 backdrop-blur-sm">
                      <h3 className="font-gaming text-white truncate text-lg">{item.name}</h3>
                      <div className="flex gap-2 text-xs flex-wrap">
                        <span className={cn(
                          "px-3 py-1 rounded-full font-bold shadow-lg",
                          item.rarity === 'legendary' && 'bg-gradient-to-r from-yellow-600 to-orange-600',
                          item.rarity === 'epic' && 'bg-gradient-to-r from-purple-600 to-pink-600',
                          item.rarity === 'rare' && 'bg-gradient-to-r from-blue-600 to-cyan-600',
                          item.rarity === 'uncommon' && 'bg-gradient-to-r from-green-600 to-emerald-600',
                          item.rarity === 'common' && 'bg-gradient-to-r from-gray-600 to-slate-600',
                          item.rarity === 'mythic' && 'bg-gradient-to-r from-red-600 to-pink-600'
                        )}>
                          {item.rarity.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-700 font-semibold">
                          {item.item_type}
                        </span>
                      </div>
                      <div className="flex gap-3 items-center text-sm font-bold">
                        {item.price_coins && (
                          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                            <span className="text-yellow-400">🪙</span>
                            <span className="text-yellow-300">{item.price_coins}</span>
                          </div>
                        )}
                        {item.price_gems && (
                          <div className="flex items-center gap-1 bg-cyan-500/20 px-2 py-1 rounded-lg">
                            <span className="text-cyan-400">💎</span>
                            <span className="text-cyan-300">{item.price_gems}</span>
                          </div>
                        )}
                      </div>
                      {item.is_limited_edition && (
                        <div className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded font-semibold">
                          📦 Stock: {item.current_stock}/{item.stock_limit}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(item)}
                          className="flex-1 bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30 hover:border-blue-500 transition-all shadow-lg"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.item_id)}
                          className="bg-red-500/20 border-2 border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-500 transition-all shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
          )}
        </motion.div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 text-white border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20">
          <DialogHeader className="border-b border-purple-500/30 pb-4">
            <DialogTitle className="text-3xl font-gaming text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-3">
              {editingItem ? (
                <>
                  <Edit className="w-7 h-7 text-purple-400" />
                  Editar Item
                </>
              ) : (
                <>
                  <Plus className="w-7 h-7 text-purple-400" />
                  Crear Nuevo Item
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm text-purple-300 mt-2">
              Complete todos los campos requeridos (*)
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-gaming text-purple-300 flex items-center gap-2 mb-2">
                <Package className="w-5 h-5" />
                Información Básica
              </h3>
              <div>
                <Label className="text-purple-300 font-semibold">Nombre del Item *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white mt-1.5"
                  placeholder="Ej: Espada Legendaria"
                />
              </div>

              <div>
                <Label className="text-purple-300 font-semibold">Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white mt-1.5"
                  rows={3}
                  placeholder="Describe el item..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-purple-300 font-semibold">Tipo</Label>
                  <Select value={formData.item_type} onValueChange={(v) => setFormData({ ...formData, item_type: v })}>
                    <SelectTrigger className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-2 border-purple-500/50">
                      <SelectItem value="skin">👕 Skin</SelectItem>
                      <SelectItem value="accessory">💎 Accesorio</SelectItem>
                      <SelectItem value="frame">🖼️ Marco</SelectItem>
                      <SelectItem value="emote">😊 Emote</SelectItem>
                      <SelectItem value="boost">⚡ Boost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-purple-300 font-semibold">Rareza</Label>
                  <Select value={formData.rarity} onValueChange={(v) => setFormData({ ...formData, rarity: v })}>
                    <SelectTrigger className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-2 border-purple-500/50">
                      <SelectItem value="common">⚪ Común</SelectItem>
                      <SelectItem value="uncommon">🟢 No Común</SelectItem>
                      <SelectItem value="rare">🔵 Raro</SelectItem>
                      <SelectItem value="epic">🟣 Épico</SelectItem>
                      <SelectItem value="legendary">🟡 Legendario</SelectItem>
                      <SelectItem value="mythic">🔴 Mítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-purple-300 font-semibold flex items-center gap-1">
                    🪙 Precio (Monedas)
                  </Label>
                  <Input
                    type="number"
                    value={formData.price_coins || ''}
                    onChange={(e) => setFormData({ ...formData, price_coins: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white mt-1.5"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label className="text-purple-300 font-semibold flex items-center gap-1">
                    💎 Precio (Gemas)
                  </Label>
                  <Input
                    type="number"
                    value={formData.price_gems || ''}
                    onChange={(e) => setFormData({ ...formData, price_gems: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white mt-1.5"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label className="text-purple-300 font-semibold">Nivel Requerido</Label>
                <Input
                  type="number"
                  value={formData.required_level || ''}
                  onChange={(e) => setFormData({ ...formData, required_level: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white mt-1.5"
                  placeholder="1"
                />
              </div>

              <div className="space-y-3 bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_limited_edition}
                    onChange={(e) => setFormData({ ...formData, is_limited_edition: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-purple-500 bg-slate-800 checked:bg-purple-600"
                  />
                  <span className="text-purple-200 font-semibold">⏱️ Edición Limitada</span>
                </label>

                {formData.is_limited_edition && (
                  <Input
                    type="number"
                    placeholder="Stock Límite"
                    value={formData.stock_limit || ''}
                    onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="bg-slate-800/80 border-2 border-purple-500/30 focus:border-purple-500 text-white"
                  />
                )}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-gaming text-purple-300 flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5" />
                Imágenes del Item
              </h3>
              <div>
                <Label className="flex items-center justify-between text-purple-300 font-semibold">
                  <span>📷 Imagen Principal *</span>
                  <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">JPG, PNG, GIF, WEBP (max 5MB)</span>
                </Label>
                <div className="mt-2">
                  {imagePreviews.image && (
                    <div className="mb-3 relative aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 border-2 border-purple-500/50 shadow-xl">
                      <img src={imagePreviews.image} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 shadow-lg"
                        onClick={() => removeImage('image')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleImageChange('image', e.target.files?.[0] || null)}
                    className="bg-slate-800/80 border-2 border-purple-500/30 text-white file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4 file:font-semibold hover:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center justify-between text-purple-300 font-semibold">
                  <span>🎯 Icono (Opcional)</span>
                  <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">64x64px recomendado</span>
                </Label>
                <div className="mt-2">
                  {imagePreviews.icon && (
                    <div className="mb-3 relative w-28 h-28 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-2 border-2 border-blue-500/50 shadow-xl">
                      <img src={imagePreviews.icon} alt="Icon" className="w-full h-full object-contain rounded-lg" />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full bg-red-500/90 hover:bg-red-600 shadow-lg"
                        onClick={() => removeImage('icon')}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleImageChange('icon', e.target.files?.[0] || null)}
                    className="bg-slate-800/80 border-2 border-blue-500/30 text-white file:bg-gradient-to-r file:from-blue-600 file:to-cyan-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4 file:font-semibold hover:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center justify-between text-purple-300 font-semibold">
                  <span>🖼️ Preview (Opcional)</span>
                  <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">16:9 recomendado</span>
                </Label>
                <div className="mt-2">
                  {imagePreviews.preview && (
                    <div className="mb-3 relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 border-2 border-green-500/50 shadow-xl">
                      <img src={imagePreviews.preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 shadow-lg"
                        onClick={() => removeImage('preview')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleImageChange('preview', e.target.files?.[0] || null)}
                    className="bg-slate-800/80 border-2 border-green-500/30 text-white file:bg-gradient-to-r file:from-green-600 file:to-emerald-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4 file:font-semibold hover:border-green-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-purple-500/30 pt-4 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setModalOpen(false)}
              className="bg-slate-800/50 border-2 border-slate-700 hover:border-red-500/50 hover:bg-red-500/20 text-slate-300 hover:text-red-300 transition-all shadow-lg"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-gaming shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all border-2 border-purple-400/50"
            >
              {editingItem ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Actualizar Item
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Crear Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

