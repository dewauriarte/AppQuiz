/**
 * AvatarBuilder Component
 * Sprint 7: Complete avatar customization interface
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarDisplay } from './AvatarDisplay';
import { avatarService, AvatarParts } from '@/services/avatarService';
import { inventoryService, InventoryItem } from '@/services/inventoryService';
import { RotateCcw, Save, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/animations/LoadingSpinner';
import { getImageUrl } from '@/lib/image-utils';
import { useToast } from '@/hooks/use-toast';

interface AvatarBuilderProps {
  userId: number;
  onSave?: (avatarData: any) => void;
}

const rarityColors = {
  common: 'border-gray-400',
  uncommon: 'border-green-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

export function AvatarBuilder({ userId, onSave }: AvatarBuilderProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentParts, setCurrentParts] = useState<AvatarParts>({});
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('/avatars/default.png');
  const [frameId, setFrameId] = useState<number | null>(null);

  useEffect(() => {
    loadAvatarAndInventory();
  }, [userId]);

  const loadAvatarAndInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || '';
      
      console.log('[AvatarBuilder] Loading avatar for user:', userId);
      console.log('[AvatarBuilder] Token available:', !!token);

      if (!token) {
        toast({
          title: 'Error',
          description: 'No hay sesión activa. Por favor, inicia sesión.',
          variant: 'destructive',
        });
        return;
      }

      // Load current avatar
      const avatarData = await avatarService.getUserAvatar(userId, token);
      setCurrentParts(avatarData.avatar_parts || {});
      setPreviewUrl(avatarData.avatar_url || '/avatars/default.png');

      // Load inventory - filter avatar-related items
      const inventoryData = (await inventoryService.getInventory(token, {})) as InventoryItem[];
      // Filter only avatar items (skins, accessories, frames)
      const avatarItems = inventoryData.filter(item => 
        ['skin', 'accessory', 'frame', 'badge'].includes(item.item.item_type)
      );
      console.log('[AvatarBuilder] Avatar items in inventory:', avatarItems);
      setInventory(avatarItems);
    } catch (error: any) {
      console.error('Error loading avatar:', error);
      toast({
        title: 'Error al cargar avatar',
        description: error.response?.data?.message || 'No se pudo cargar el avatar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePartSelect = (partType: keyof AvatarParts, itemId: number | null) => {
    setCurrentParts((prev) => ({
      ...prev,
      [partType]: itemId,
    }));
  };

  const handleAccessoryToggle = (itemId: number) => {
    setCurrentParts((prev) => {
      const currentAccessories = prev.accessories || [];
      const hasAccessory = currentAccessories.includes(itemId);

      return {
        ...prev,
        accessories: hasAccessory
          ? currentAccessories.filter((id) => id !== itemId)
          : [...currentAccessories, itemId],
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken') || '';

      if (!token) {
        toast({
          title: 'Error',
          description: 'No hay sesión activa.',
          variant: 'destructive',
        });
        return;
      }

      const result = await avatarService.updateAvatar(
        {
          avatar_parts: currentParts,
          avatar_frame_id: frameId,
        },
        token
      );

      setPreviewUrl(result.avatar_url || '/avatars/default.png');
      onSave?.(result);

      // Show success message using toast
      toast({ 
        title: '¡Avatar guardado!', 
        description: 'Tu avatar ha sido actualizado exitosamente' 
      });
    } catch (error: any) {
      console.error('Error saving avatar:', error);
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Error al guardar avatar',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Resetear avatar al default?')) return;

    try {
      const token = localStorage.getItem('accessToken') || '';
      
      if (!token) {
        toast({
          title: 'Error',
          description: 'No hay sesión activa.',
          variant: 'destructive',
        });
        return;
      }

      const result = await avatarService.resetAvatar(token);
      setCurrentParts({});
      setPreviewUrl(result.avatar_url || '/avatars/default.png');
      setFrameId(null);
      
      toast({
        title: 'Avatar reseteado',
        description: 'Tu avatar ha sido reseteado al default.',
      });
    } catch (error: any) {
      console.error('Error resetting avatar:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo resetear el avatar',
        variant: 'destructive',
      });
    }
  };

  const getItemsByType = (type: string) => {
    return inventory.filter((item) => {
      if (type === 'skins') {
        return item.item.item_type === 'skin';
      }
      if (type === 'accessories') {
        return item.item.item_type === 'accessory';
      }
      if (type === 'frames') {
        return item.item.item_type === 'frame' || item.item.item_type === 'badge';
      }
      return false;
    });
  };

  if (loading) {
    return (
      <Card className="p-6 bg-slate-950 border-2 border-purple-500">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-950 border-2 border-purple-500">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Preview Section */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Vista Previa
          </h3>

          <div className="relative">
            <AvatarDisplay
              avatarUrl={previewUrl}
              frameUrl={frameId ? `/frames/frame-${frameId}.png` : null}
              size="xlarge"
              showFrame={true}
            />
          </div>

          <div className="flex gap-2 w-full">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 bg-slate-800 text-white border-slate-600 hover:bg-slate-700"
              disabled={saving}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" 
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>

        {/* Customization Section */}
        <div>
          <Tabs defaultValue="skins" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="skins" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Skins</TabsTrigger>
              <TabsTrigger value="accessories" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Accesorios</TabsTrigger>
              <TabsTrigger value="frames" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Marcos</TabsTrigger>
            </TabsList>

            <TabsContent value="skins" className="mt-4">
              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {/* Default option */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative p-2 border-2 rounded-lg cursor-pointer bg-slate-900',
                    !currentParts.base_skin
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-slate-700 hover:border-purple-500/50'
                  )}
                  onClick={() => handlePartSelect('base_skin', null)}
                >
                  <img
                    src="/avatars/default.png"
                    alt="Default"
                    className="w-full aspect-square object-cover rounded"
                  />
                  <p className="text-xs text-center mt-1 text-white">Default</p>
                </motion.div>

                {getItemsByType('skins').map((item) => (
                  <motion.div
                    key={item.inventory_id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative p-2 border-2 rounded-lg cursor-pointer bg-slate-900',
                      currentParts.base_skin === item.item_id
                        ? 'border-purple-500 bg-purple-900/30'
                        : rarityColors[item.item.rarity as keyof typeof rarityColors] ||
                            'border-slate-700',
                      'hover:border-purple-500/50'
                    )}
                    onClick={() => handlePartSelect('base_skin', item.item_id)}
                  >
                    <img
                      src={getImageUrl(item.item.image_url)}
                      alt={item.item.name}
                      className="w-full aspect-square object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/items/placeholder.svg';
                      }}
                    />
                    <p className="text-xs text-center mt-1 truncate text-white">
                      {item.item.name}
                    </p>
                    {item.is_equipped && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
                        ✓
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="accessories" className="mt-4">
              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {getItemsByType('accessories').map((item) => {
                  const isSelected = currentParts.accessories?.includes(item.item_id);
                  return (
                    <motion.div
                      key={item.inventory_id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'relative p-2 border-2 rounded-lg cursor-pointer bg-slate-900',
                        isSelected
                          ? 'border-purple-500 bg-purple-900/30'
                          : rarityColors[item.item.rarity as keyof typeof rarityColors] ||
                              'border-slate-700',
                        'hover:border-purple-500/50'
                      )}
                      onClick={() => handleAccessoryToggle(item.item_id)}
                    >
                      <img
                        src={getImageUrl(item.item.image_url)}
                        alt={item.item.name}
                        className="w-full aspect-square object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/items/placeholder.svg';
                        }}
                      />
                      <p className="text-xs text-center mt-1 truncate text-white">
                        {item.item.name}
                      </p>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-primary text-white text-xs px-1 rounded">
                          ✓
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="frames" className="mt-4">
              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {/* No frame option */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative p-2 border-2 rounded-lg cursor-pointer bg-slate-900',
                    !frameId
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-slate-700 hover:border-purple-500/50'
                  )}
                  onClick={() => setFrameId(null)}
                >
                  <div className="w-full aspect-square flex items-center justify-center border-2 border-dashed border-slate-700 rounded">
                    <span className="text-xs text-slate-400">Sin marco</span>
                  </div>
                </motion.div>

                {getItemsByType('frames').map((item) => (
                  <motion.div
                    key={item.inventory_id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative p-2 border-2 rounded-lg cursor-pointer bg-slate-900',
                      frameId === item.item_id
                        ? 'border-purple-500 bg-purple-900/30'
                        : rarityColors[item.item.rarity as keyof typeof rarityColors] ||
                            'border-slate-700',
                      'hover:border-purple-500/50'
                    )}
                    onClick={() => setFrameId(item.item_id)}
                  >
                    <img
                      src={getImageUrl(item.item.image_url)}
                      alt={item.item.name}
                      className="w-full aspect-square object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/items/placeholder.svg';
                      }}
                    />
                    <p className="text-xs text-center mt-1 truncate text-white">
                      {item.item.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  );
}

