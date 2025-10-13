/**
 * Inventory Service
 * Sprint 7: Inventory API calls
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface InventoryItem {
  inventory_id: string;
  user_id: number;
  item_id: number;
  quantity: number;
  is_equipped: boolean | null;
  is_favorite: boolean | null;
  acquired_at: string;
  acquired_source: string | null;
  metadata: any;
  item: {
    item_id: number;
    name: string;
    description: string | null;
    item_type: string;
    rarity: string;
    image_url: string;
    icon_url: string | null;
    preview_url: string | null;
    category: string | null;
    tags: string[];
    metadata: any;
  };
}

export interface GroupedInventory {
  category: string;
  items: InventoryItem[];
  count: number;
}

export const inventoryService = {
  /**
   * Get user inventory
   */
  async getInventory(
    token: string,
    params?: {
      category?: string;
      is_equipped?: boolean;
      is_favorite?: boolean;
      sort_by?: string;
      grouped?: boolean;
    }
  ): Promise<InventoryItem[] | GroupedInventory[]> {
    const response = await axios.get(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    console.log('[inventoryService] getInventory response:', response.data);
    return response.data.data;
  },

  /**
   * Equip item
   */
  async equipItem(inventoryId: string, token: string): Promise<any> {
    console.log('[inventoryService] Equipping item:', inventoryId);
    const response = await axios.put(
      `${API_URL}/inventory/${inventoryId}/equip`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('[inventoryService] Equip response:', response.data);
    return response.data.data;
  },

  /**
   * Unequip item
   */
  async unequipItem(inventoryId: string, token: string): Promise<any> {
    console.log('[inventoryService] Unequipping item:', inventoryId);
    const response = await axios.put(
      `${API_URL}/inventory/${inventoryId}/unequip`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('[inventoryService] Unequip response:', response.data);
    return response.data.data;
  },

  /**
   * Toggle favorite
   */
  async toggleFavorite(inventoryId: string, token: string): Promise<{ is_favorite: boolean }> {
    const response = await axios.post(
      `${API_URL}/inventory/${inventoryId}/favorite`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data;
  },
};

