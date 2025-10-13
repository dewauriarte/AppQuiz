/**
 * Shop Controller
 * Sprint 7: Shop endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import * as ShopService from '@services/ShopService';
import { ShopItemsQuery, PurchaseRequest } from '../types/shop.types';

export class ShopController {
  /**
   * GET /api/shop/items
   * List shop items with filters
   */
  getItems = asyncHandler(async (req: Request, res: Response) => {
    const query: ShopItemsQuery = {
      category: req.query.category as string,
      rarity: req.query.rarity as any,
      item_type: req.query.item_type as any,
      price_min: req.query.price_min ? parseInt(req.query.price_min as string) : undefined,
      price_max: req.query.price_max ? parseInt(req.query.price_max as string) : undefined,
      is_available: req.query.is_available === 'false' ? false : true,
      sort_by: req.query.sort_by as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await ShopService.getShopItems(query);

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/shop/items/:id
   * Get single item details
   */
  getItem = asyncHandler(async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID',
      });
    }

    const item = await ShopService.getShopItem(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  });

  /**
   * POST /api/shop/purchase
   * Purchase an item
   */
  purchase = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const purchaseRequest: PurchaseRequest = {
      item_id: req.body.item_id,
      quantity: req.body.quantity || 1,
      currency_type: req.body.currency_type || 'coins',
    };

    // Validate request
    if (!purchaseRequest.item_id) {
      return res.status(400).json({
        success: false,
        message: 'item_id is required',
      });
    }

    if (!['coins', 'gems'].includes(purchaseRequest.currency_type)) {
      return res.status(400).json({
        success: false,
        message: 'currency_type must be "coins" or "gems"',
      });
    }

    const result = await ShopService.purchaseItem(req.userId, purchaseRequest);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  });
}

export default new ShopController();

