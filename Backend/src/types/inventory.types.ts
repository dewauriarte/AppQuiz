/**
 * Inventory System Types
 * Sprint 7: Inventory management
 */

import { ItemType, ItemRarity } from '@prisma/client';

/**
 * Inventory query params
 */
export interface InventoryQuery {
  category?: string;
  is_equipped?: boolean;
  is_favorite?: boolean;
  sort_by?: 'newest' | 'rarity' | 'name';
}

/**
 * Inventory item response
 */
export interface InventoryItemResponse {
  inventory_id: string;
  user_id: number;
  item_id: number;
  quantity: number;
  is_equipped: boolean | null;
  is_favorite: boolean | null;
  acquired_at: Date;
  acquired_source: string | null;
  metadata: any;
  item: {
    item_id: number;
    name: string;
    description: string | null;
    item_type: ItemType;
    rarity: ItemRarity;
    image_url: string;
    icon_url: string | null;
    preview_url: string | null;
    category: string | null;
    tags: string[];
    metadata: any;
  };
}

/**
 * Grouped inventory response
 */
export interface GroupedInventoryResponse {
  category: string;
  items: InventoryItemResponse[];
  count: number;
}

/**
 * Equip/Unequip response
 */
export interface EquipResponse {
  success: boolean;
  message: string;
  data: {
    inventory_item: InventoryItemResponse;
    avatar_updated?: {
      avatar_url: string | null;
      avatar_parts: any;
      avatar_frame_url: string | null;
    };
    pet_activated?: boolean;
    boost_activated?: {
      boost_type: string;
      expires_at: Date;
    };
  };
}

