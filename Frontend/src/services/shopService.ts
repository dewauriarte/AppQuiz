/**
 * Shop Service
 * Sprint 7: Shop and purchase API calls
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface ShopItem {
  item_id: number;
  name: string;
  description: string | null;
  item_type: string;
  rarity: string;
  image_url: string;
  icon_url: string | null;
  preview_url: string | null;
  price_coins: number | null;
  price_gems: number | null;
  is_premium: boolean | null;
  is_available: boolean | null;
  is_limited_edition: boolean | null;
  stock_limit: number | null;
  current_stock: number | null;
  times_purchased: number | null;
  required_level: number | null;
  category: string | null;
  tags: string[];
  metadata: any;
}

export interface ShopItemsResponse {
  items: ShopItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PurchaseRequest {
  item_id: number;
  quantity?: number;
  currency_type: 'coins' | 'gems';
}

export interface PurchaseResponse {
  purchase_id: string;
  item: ShopItem;
  quantity: number;
  total_price: number;
  currency_type: string;
  new_balance: {
    coins: number;
    gems: number;
  };
  inventory_item_id: string;
}

export const shopService = {
  /**
   * Get shop items with filters
   */
  async getItems(params?: {
    category?: string;
    rarity?: string;
    item_type?: string;
    price_min?: number;
    price_max?: number;
    sort_by?: string;
    page?: number;
    limit?: number;
  }): Promise<ShopItemsResponse> {
    const response = await axios.get(`${API_URL}/shop/items`, { params });
    return {
      items: response.data.data,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get single item details
   */
  async getItem(itemId: number): Promise<ShopItem> {
    const response = await axios.get(`${API_URL}/shop/items/${itemId}`);
    return response.data.data;
  },

  /**
   * Purchase item
   */
  async purchase(request: PurchaseRequest, token: string): Promise<PurchaseResponse> {
    const response = await axios.post(`${API_URL}/shop/purchase`, request, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },
};

