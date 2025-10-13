/**
 * Admin Shop Service
 * Sprint 7: Admin API calls for shop management
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface ShopItemCreate {
  name: string;
  description?: string;
  item_type: string;
  rarity: string;
  price_coins?: number;
  price_gems?: number;
  is_premium?: boolean;
  is_available?: boolean;
  is_limited_edition?: boolean;
  stock_limit?: number;
  required_level?: number;
  category?: string;
  tags?: string[];
  metadata?: any;
}

export const adminShopService = {
  /**
   * Get all shop items (admin view)
   */
  async getAllItems(token: string) {
    const response = await axios.get(`${API_URL}/admin/shop/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },

  /**
   * Create new shop item with images
   */
  async createItem(data: ShopItemCreate, files: {
    image?: File;
    icon?: File;
    preview?: File;
  }, token: string) {
    const formData = new FormData();
    
    // Append all fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Append files
    if (files.image) formData.append('image', files.image);
    if (files.icon) formData.append('icon', files.icon);
    if (files.preview) formData.append('preview', files.preview);

    const response = await axios.post(`${API_URL}/admin/shop/items`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Update shop item
   */
  async updateItem(itemId: number, data: ShopItemCreate, files: {
    image?: File;
    icon?: File;
    preview?: File;
  }, token: string) {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (files.image) formData.append('image', files.image);
    if (files.icon) formData.append('icon', files.icon);
    if (files.preview) formData.append('preview', files.preview);

    const response = await axios.put(`${API_URL}/admin/shop/items/${itemId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Delete shop item
   */
  async deleteItem(itemId: number, token: string) {
    const response = await axios.delete(`${API_URL}/admin/shop/items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Update item stock
   */
  async updateStock(itemId: number, data: {
    current_stock?: number;
    stock_limit?: number;
  }, token: string) {
    const response = await axios.patch(`${API_URL}/admin/shop/items/${itemId}/stock`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  },
};

