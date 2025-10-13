/**
 * ShopFilters Component
 * Sprint 7: Sidebar filters for shop
 */

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ShopFiltersProps {
  filters: {
    rarities: string[];
    priceRange: [number, number];
    showAvailable: boolean;
    showPremium: boolean;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const rarityOptions = [
  { value: 'common', label: 'Común', color: 'bg-gray-500' },
  { value: 'uncommon', label: 'No Común', color: 'bg-green-500' },
  { value: 'rare', label: 'Raro', color: 'bg-blue-500' },
  { value: 'epic', label: 'Épico', color: 'bg-purple-500' },
  { value: 'legendary', label: 'Legendario', color: 'bg-yellow-500' },
  { value: 'mythic', label: 'Mítico', color: 'bg-pink-500' },
];

export function ShopFilters({ filters, onFilterChange, onClearFilters }: ShopFiltersProps) {
  const toggleRarity = (rarity: string) => {
    const newRarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter((r) => r !== rarity)
      : [...filters.rarities, rarity];
    
    onFilterChange({ ...filters, rarities: newRarities });
  };

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
        <h3 className="font-gaming text-xl text-white flex items-center gap-2">
          🔍 Filtros
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="text-purple-300 hover:text-white hover:bg-purple-600/30"
        >
          <X className="w-4 h-4 mr-1" />
          Limpiar
        </Button>
      </div>

      {/* Rarity Filter */}
      <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <Label className="text-purple-200 font-bold text-sm uppercase tracking-wide">Rareza</Label>
        <div className="space-y-2">
          {rarityOptions.map((rarity) => (
            <div key={rarity.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors">
              <Checkbox
                id={rarity.value}
                checked={filters.rarities.includes(rarity.value)}
                onCheckedChange={() => toggleRarity(rarity.value)}
                className="border-2"
              />
              <label
                htmlFor={rarity.value}
                className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white flex-1"
              >
                <div className={`w-4 h-4 rounded-full ${rarity.color} shadow-lg`} />
                {rarity.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center">
          <Label className="text-purple-200 font-bold text-sm uppercase tracking-wide">Rango de Precio</Label>
          <div className="flex items-center gap-1 bg-yellow-900/30 px-2 py-1 rounded border border-yellow-500/30">
            <span className="text-sm font-gaming text-yellow-300">
              {filters.priceRange[0]} - {filters.priceRange[1] === 10000 ? '10000+' : filters.priceRange[1]}
            </span>
          </div>
        </div>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={filters.priceRange}
          onValueChange={(value) =>
            onFilterChange({ ...filters, priceRange: value as [number, number] })
          }
          className="w-full"
        />
      </div>

      {/* Availability */}
      <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <Label className="text-purple-200 font-bold text-sm uppercase tracking-wide">Disponibilidad</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors">
            <Checkbox
              id="available"
              checked={filters.showAvailable}
              onCheckedChange={(checked) =>
                onFilterChange({ ...filters, showAvailable: checked })
              }
              className="border-2"
            />
            <label
              htmlFor="available"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white flex-1"
            >
              ✅ Solo disponibles
            </label>
          </div>
          <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700/50 transition-colors">
            <Checkbox
              id="premium"
              checked={filters.showPremium}
              onCheckedChange={(checked) =>
                onFilterChange({ ...filters, showPremium: checked })
              }
              className="border-2"
            />
            <label
              htmlFor="premium"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white flex-1"
            >
              💎 Solo premium
            </label>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.rarities.length > 0 || filters.showAvailable || filters.showPremium) && (
        <div className="pt-3 border-t border-purple-500/30 bg-purple-900/20 p-4 rounded-lg">
          <Label className="mb-3 block text-purple-200 font-bold text-sm uppercase tracking-wide">
            🔖 Filtros Activos ({filters.rarities.length + (filters.showAvailable ? 1 : 0) + (filters.showPremium ? 1 : 0)})
          </Label>
          <div className="flex flex-wrap gap-2">
            {filters.rarities.map((rarity) => (
              <Badge 
                key={rarity} 
                className={`text-xs font-bold shadow-lg ${
                  rarityOptions.find((r) => r.value === rarity)?.color
                } text-white border border-white/30`}
              >
                ⭐ {rarityOptions.find((r) => r.value === rarity)?.label}
              </Badge>
            ))}
            {filters.showAvailable && (
              <Badge className="text-xs font-bold bg-green-600 text-white shadow-lg border border-green-400">
                ✅ Disponible
              </Badge>
            )}
            {filters.showPremium && (
              <Badge className="text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border border-yellow-300">
                💎 Premium
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

