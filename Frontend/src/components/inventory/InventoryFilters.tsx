/**
 * InventoryFilters Component
 * Sprint 7: Filter and sort inventory items
 */

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface InventoryFiltersProps {
  filters: {
    categories: string[];
    rarities: string[];
    showEquipped: boolean;
    showFavorites: boolean;
  };
  sortBy: string;
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

const categoryOptions = [
  { value: 'skin', label: 'Skins' },
  { value: 'accessory', label: 'Accesorios' },
  { value: 'frame', label: 'Marcos' },
  { value: 'emote', label: 'Emotes' },
  { value: 'boost', label: 'Boosts' },
];

const rarityOptions = [
  { value: 'common', label: 'Común' },
  { value: 'uncommon', label: 'No Común' },
  { value: 'rare', label: 'Raro' },
  { value: 'epic', label: 'Épico' },
  { value: 'legendary', label: 'Legendario' },
];

export function InventoryFilters({
  filters,
  sortBy,
  onFilterChange,
  onSortChange,
  onClearFilters,
}: InventoryFiltersProps) {
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleRarity = (rarity: string) => {
    const newRarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter((r) => r !== rarity)
      : [...filters.rarities, rarity];
    onFilterChange({ ...filters, rarities: newRarities });
  };

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-green-500 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-green-500/30 pb-3">
        <h3 className="font-gaming text-xl text-white flex items-center gap-2">
          🔍 Filtros
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="text-green-300 hover:text-white hover:bg-green-600/30"
        >
          <X className="w-4 h-4 mr-1" />
          Limpiar
        </Button>
      </div>

      {/* Sort */}
      <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <Label className="text-green-200 font-bold text-sm uppercase tracking-wide">Ordenar por</Label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="bg-slate-900 border-2 border-green-600 text-white font-gaming shadow-lg hover:bg-slate-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-2 border-green-500">
            <SelectItem value="newest" className="font-gaming">🆕 Más reciente</SelectItem>
            <SelectItem value="oldest" className="font-gaming">⏰ Más antiguo</SelectItem>
            <SelectItem value="rarity" className="font-gaming">⭐ Rareza</SelectItem>
            <SelectItem value="name" className="font-gaming">🔤 Nombre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <Label className="text-green-200 font-bold text-sm uppercase tracking-wide">Categorías</Label>
        <div className="space-y-2">
          {categoryOptions.map((cat) => (
            <div key={cat.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors">
              <Checkbox
                id={cat.value}
                checked={filters.categories.includes(cat.value)}
                onCheckedChange={() => toggleCategory(cat.value)}
                className="border-2"
              />
              <label
                htmlFor={cat.value}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white flex-1"
              >
                {cat.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Rarities */}
      <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <Label className="text-green-200 font-bold text-sm uppercase tracking-wide">Rareza</Label>
        <div className="space-y-2">
          {rarityOptions.map((rarity) => (
            <div key={rarity.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors">
              <Checkbox
                id={`rarity-${rarity.value}`}
                checked={filters.rarities.includes(rarity.value)}
                onCheckedChange={() => toggleRarity(rarity.value)}
                className="border-2"
              />
              <label
                htmlFor={`rarity-${rarity.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white flex-1"
              >
                ⭐ {rarity.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-3 pt-3 border-t border-green-500/30 bg-green-900/20 p-4 rounded-lg">
        <Label className="text-green-200 font-bold text-sm uppercase tracking-wide">⚡ Filtros rápidos</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors">
            <Checkbox
              id="equipped"
              checked={filters.showEquipped}
              onCheckedChange={(checked) =>
                onFilterChange({ ...filters, showEquipped: checked })
              }
              className="border-2"
            />
            <label
              htmlFor="equipped"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white flex-1"
            >
              ✅ Solo equipados
            </label>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors">
            <Checkbox
              id="favorites"
              checked={filters.showFavorites}
              onCheckedChange={(checked) =>
                onFilterChange({ ...filters, showFavorites: checked })
              }
              className="border-2"
            />
            <label
              htmlFor="favorites"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white flex-1"
            >
              ⭐ Solo favoritos
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
}

