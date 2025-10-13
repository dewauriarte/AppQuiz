/**
 * Inventory Controller
 * Sprint 7: Inventory endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import * as InventoryService from '@services/InventoryService';
import { InventoryQuery } from '../types/inventory.types';

export class InventoryController {
  /**
   * GET /api/inventory
   * Get user inventory
   */
  getInventory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    console.log('[InventoryController] Getting inventory for user:', req.userId);
    console.log('[InventoryController] Query params:', req.query);

    const query: InventoryQuery = {
      category: req.query.category as string,
      is_equipped: req.query.is_equipped === 'true' ? true : req.query.is_equipped === 'false' ? false : undefined,
      is_favorite: req.query.is_favorite === 'true' ? true : req.query.is_favorite === 'false' ? false : undefined,
      sort_by: req.query.sort_by as any,
    };
    
    console.log('[InventoryController] Processed query:', query);

    const grouped = req.query.grouped === 'true';

    if (grouped) {
      const inventory = await InventoryService.getGroupedInventory(req.userId);
      console.log('[InventoryController] Grouped inventory count:', inventory.length);
      return res.status(200).json({
        success: true,
        data: inventory,
      });
    } else {
      const inventory = await InventoryService.getUserInventory(req.userId, query);
      console.log('[InventoryController] Inventory count:', inventory.length);
      console.log('[InventoryController] Inventory items:', inventory);
      return res.status(200).json({
        success: true,
        data: inventory,
        count: inventory.length,
      });
    }
  });

  /**
   * PUT /api/inventory/:id/equip
   * Equip item
   */
  equipItem = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const inventoryId = req.params.id;

    const result = await InventoryService.equipItem(req.userId, inventoryId);

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

  /**
   * PUT /api/inventory/:id/unequip
   * Unequip item
   */
  unequipItem = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const inventoryId = req.params.id;

    const result = await InventoryService.unequipItem(req.userId, inventoryId);

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

  /**
   * POST /api/inventory/:id/favorite
   * Toggle favorite
   */
  toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const inventoryId = req.params.id;

    const result = await InventoryService.toggleFavorite(req.userId, inventoryId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        is_favorite: result.is_favorite,
      },
    });
  });
}

export default new InventoryController();

