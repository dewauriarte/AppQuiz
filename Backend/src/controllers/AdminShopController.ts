/**
 * Admin Shop Controller
 * Sprint 7: Admin endpoints for shop management
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import prisma from '@config/database';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AdminShopController {
  /**
   * GET /api/admin/shop/items
   * List all shop items (admin view)
   */
  getAllItems = asyncHandler(async (_req: Request, res: Response) => {
    const items = await prisma.shop_items.findMany({
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: items,
    });
  });

  /**
   * POST /api/admin/shop/items
   * Create a new shop item
   */
  createItem = asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      description,
      item_type,
      rarity,
      price_coins,
      price_gems,
      is_premium,
      is_available,
      is_limited_edition,
      stock_limit,
      required_level,
      category,
      tags,
      metadata,
    } = req.body;

    // Procesar imágenes si se subieron
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const image_url = files?.image?.[0] ? await this.saveImage(files.image[0]) : '/items/placeholder.png';
    const icon_url = files?.icon?.[0] ? await this.saveImage(files.icon[0]) : null;
    const preview_url = files?.preview?.[0] ? await this.saveImage(files.preview[0]) : null;

    // Parse tags and metadata safely
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
    const parsedMetadata = metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : {};

    const item = await prisma.shop_items.create({
      data: {
        name,
        description,
        item_type: item_type as any,
        rarity: rarity as any,
        image_url,
        icon_url,
        preview_url,
        price_coins: price_coins ? parseInt(price_coins) : null,
        price_gems: price_gems ? parseInt(price_gems) : null,
        is_premium: typeof is_premium === 'string' ? is_premium === 'true' : !!is_premium,
        is_available: is_available === 'false' ? false : true,
        is_limited_edition: typeof is_limited_edition === 'string' ? is_limited_edition === 'true' : !!is_limited_edition,
        stock_limit: stock_limit ? parseInt(stock_limit) : null,
        current_stock: stock_limit ? parseInt(stock_limit) : null,
        required_level: required_level ? parseInt(required_level) : null,
        category,
        tags: parsedTags,
        metadata: parsedMetadata,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  });

  /**
   * PUT /api/admin/shop/items/:id
   * Update shop item
   */
  updateItem = asyncHandler(async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    
    console.log('[AdminShop] Update request for item:', itemId);
    console.log('[AdminShop] Request body:', req.body);
    
    const {
      name,
      description,
      item_type,
      rarity,
      price_coins,
      price_gems,
      is_premium,
      is_available,
      is_limited_edition,
      stock_limit,
      required_level,
      category,
      tags,
      metadata,
    } = req.body;

    // Procesar imágenes si se subieron
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Build updates object, only including defined values
    const updates: any = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (item_type !== undefined) updates.item_type = item_type as any;
    if (rarity !== undefined) updates.rarity = rarity as any;
    if (price_coins !== undefined) updates.price_coins = price_coins ? parseInt(price_coins) : null;
    if (price_gems !== undefined) updates.price_gems = price_gems ? parseInt(price_gems) : null;
    if (is_premium !== undefined) {
      updates.is_premium = typeof is_premium === 'string' ? is_premium === 'true' : !!is_premium;
    }
    if (is_available !== undefined) {
      updates.is_available = is_available === 'false' ? false : true;
    }
    if (is_limited_edition !== undefined) {
      updates.is_limited_edition = typeof is_limited_edition === 'string' 
        ? is_limited_edition === 'true' 
        : !!is_limited_edition;
    }
    if (stock_limit !== undefined) updates.stock_limit = stock_limit ? parseInt(stock_limit) : null;
    if (required_level !== undefined) updates.required_level = required_level ? parseInt(required_level) : null;
    if (category !== undefined) updates.category = category;

    // Parse tags and metadata safely
    if (tags !== undefined) {
      try {
        updates.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        console.error('[AdminShop] Error parsing tags:', e);
        updates.tags = [];
      }
    }
    if (metadata !== undefined) {
      try {
        updates.metadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (e) {
        console.error('[AdminShop] Error parsing metadata:', e);
        updates.metadata = {};
      }
    }

    // Handle image uploads
    if (files?.image?.[0]) {
      updates.image_url = await this.saveImage(files.image[0]);
    }
    if (files?.icon?.[0]) {
      updates.icon_url = await this.saveImage(files.icon[0]);
    }
    if (files?.preview?.[0]) {
      updates.preview_url = await this.saveImage(files.preview[0]);
    }

    console.log('[AdminShop] Updates to apply:', updates);

    const item = await prisma.shop_items.update({
      where: { item_id: itemId },
      data: updates,
    });

    console.log('[AdminShop] Item updated successfully:', item.item_id);

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  });

  /**
   * DELETE /api/admin/shop/items/:id
   * Delete shop item
   */
  deleteItem = asyncHandler(async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);

    await prisma.shop_items.delete({
      where: { item_id: itemId },
    });

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  });

  /**
   * PATCH /api/admin/shop/items/:id/stock
   * Update item stock
   */
  updateStock = asyncHandler(async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    const { current_stock, stock_limit } = req.body;

    const item = await prisma.shop_items.update({
      where: { item_id: itemId },
      data: {
        current_stock: current_stock !== undefined ? parseInt(current_stock) : undefined,
        stock_limit: stock_limit !== undefined ? parseInt(stock_limit) : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: item,
    });
  });

  /**
   * Helper: Save image to file system
   */
  private async saveImage(file: Express.Multer.File): Promise<string> {
    try {
      // Sanitizar nombre de archivo
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      
      // Get the correct uploads directory
      // Since we're using tsx, __dirname points to the src directory
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'items');
      
      console.log('[AdminShop] Saving image to:', uploadsDir);
      console.log('[AdminShop] Filename:', filename);
      
      // Crear directorio si no existe
      await fs.mkdir(uploadsDir, { recursive: true });
      
      // Guardar archivo
      const filepath = path.join(uploadsDir, filename);
      await fs.writeFile(filepath, file.buffer);
      
      console.log('[AdminShop] Image saved successfully at:', filepath);
      
      // Retornar ruta pública
      return `/uploads/items/${filename}`;
    } catch (error) {
      console.error('[AdminShop] Error saving image:', error);
      throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new AdminShopController();

