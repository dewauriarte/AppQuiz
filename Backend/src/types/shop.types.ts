/**
 * Shop System Types
 * Sprint 7: Shop and Purchase System
 */

import { ItemType, ItemRarity } from '@prisma/client';

/**
 * Shop item list query params
 */
export interface ShopItemsQuery {
  category?: string;
  rarity?: ItemRarity;
  item_type?: ItemType;
  price_min?: number;
  price_max?: number;
  is_available?: boolean;
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'rarity' | 'popular';
  page?: number;
  limit?: number;
}

/**
 * Shop item response
 */
export interface ShopItemResponse {
  item_id: number;
  name: string;
  description: string | null;
  item_type: ItemType;
  rarity: ItemRarity;
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

/**
 * Shop items list response with pagination
 */
export interface ShopItemsListResponse {
  items: ShopItemResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Purchase request payload
 */
export interface PurchaseRequest {
  item_id: number;
  quantity?: number;
  currency_type: 'coins' | 'gems';
}

/**
 * Purchase response
 */
export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchase_id: string;
    item: ShopItemResponse;
    quantity: number;
    total_price: number;
    currency_type: 'coins' | 'gems';
    new_balance: {
      coins: number;
      gems: number;
    };
    inventory_item_id: string;
  };
}

/**
 * Purchase validation result
 */
export interface PurchaseValidation {
  valid: boolean;
  error?: string;
  item?: ShopItemResponse;
  user_balance?: {
    coins: number;
    gems: number;
  };
  total_cost?: number;
}

