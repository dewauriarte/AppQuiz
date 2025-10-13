/**
 * Inventory Service
 * Sprint 7: Inventory management logic
 */

import prisma from '@config/database';
import {
  InventoryQuery,
  InventoryItemResponse,
  GroupedInventoryResponse,
  EquipResponse,
} from '../types/inventory.types';
import { Prisma } from '@prisma/client';
import * as AvatarService from './AvatarService';

/**
 * Get user inventory with filters
 */
export async function getUserInventory(
  userId: number,
  query: InventoryQuery
): Promise<InventoryItemResponse[]> {
  const { category, is_equipped, is_favorite, sort_by = 'newest' } = query;

  console.log('[InventoryService] getUserInventory query:', query);

  const where: Prisma.user_inventoryWhereInput = {
    user_id: userId,
  };

  if (is_equipped !== undefined) {
    where.is_equipped = is_equipped;
    console.log('[InventoryService] Filtering by is_equipped:', is_equipped);
  }

  if (is_favorite !== undefined) {
    where.is_favorite = is_favorite;
    console.log('[InventoryService] Filtering by is_favorite:', is_favorite);
  }

  if (category) {
    where.shop_items = {
      category: category,
    };
  }
  
  console.log('[InventoryService] Final where clause:', where);

  let orderBy: Prisma.user_inventoryOrderByWithRelationInput = {};
  switch (sort_by) {
    case 'rarity':
      orderBy = { shop_items: { rarity: 'asc' } };
      break;
    case 'name':
      orderBy = { shop_items: { name: 'asc' } };
      break;
    case 'newest':
    default:
      orderBy = { acquired_at: 'desc' };
      break;
  }

  const items = await prisma.user_inventory.findMany({
    where,
    orderBy,
    include: {
      shop_items: {
        select: {
          item_id: true,
          name: true,
          description: true,
          item_type: true,
          rarity: true,
          image_url: true,
          icon_url: true,
          preview_url: true,
          category: true,
          tags: true,
          metadata: true,
        },
      },
    },
  });

  return items.map((item) => ({
    inventory_id: item.inventory_id.toString(),
    user_id: item.user_id,
    item_id: item.item_id,
    quantity: item.quantity,
    is_equipped: item.is_equipped,
    is_favorite: item.is_favorite,
    acquired_at: item.acquired_at,
    acquired_source: item.acquired_source,
    metadata: item.metadata,
    item: item.shop_items,
  }));
}

/**
 * Get inventory grouped by category
 */
export async function getGroupedInventory(
  userId: number
): Promise<GroupedInventoryResponse[]> {
  const items = await getUserInventory(userId, {});

  const grouped = items.reduce((acc, item) => {
    const category = item.item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, InventoryItemResponse[]>);

  return Object.entries(grouped).map(([category, items]) => ({
    category,
    items,
    count: items.length,
  }));
}

/**
 * Equip item
 */
export async function equipItem(userId: number, inventoryId: string): Promise<EquipResponse> {
  const inventoryIdNum = BigInt(inventoryId);

  // Get inventory item
  const inventoryItem = await prisma.user_inventory.findUnique({
    where: { inventory_id: inventoryIdNum },
    include: {
      shop_items: true,
    },
  });

  if (!inventoryItem) {
    return {
      success: false,
      message: 'Inventory item not found',
      data: {} as any,
    };
  }

  if (inventoryItem.user_id !== userId) {
    return {
      success: false,
      message: 'Item does not belong to user',
      data: {} as any,
    };
  }

  const itemType = inventoryItem.shop_items.item_type;

  // Handle different item types
  if (itemType === 'skin' || itemType === 'accessory') {
    // Avatar items - integrate with avatar system
    const avatar = await AvatarService.getUserAvatar(userId);
    const currentParts = (avatar?.avatar_parts as any) || {};

    // For now, just mark as equipped
    await prisma.user_inventory.update({
      where: { inventory_id: inventoryIdNum },
      data: { is_equipped: true },
    });

    const updatedItem = await getUserInventoryItem(inventoryIdNum);

    return {
      success: true,
      message: `${inventoryItem.shop_items.name} equipped successfully`,
      data: {
        inventory_item: updatedItem!,
        avatar_updated: {
          avatar_url: avatar?.composed_url || null,
          avatar_parts: currentParts,
          avatar_frame_url: avatar?.avatar_frame_url || null,
        },
      },
    };
  } else if (itemType === 'pet') {
    // Deactivate other pets
    await prisma.user_pets.updateMany({
      where: { user_id: userId, is_active: true },
      data: { is_active: false },
    });

    // Mark inventory item as equipped
    await prisma.user_inventory.updateMany({
      where: {
        user_id: userId,
        shop_items: { item_type: 'pet' },
        is_equipped: true,
      },
      data: { is_equipped: false },
    });

    await prisma.user_inventory.update({
      where: { inventory_id: inventoryIdNum },
      data: { is_equipped: true },
    });

    const updatedItem = await getUserInventoryItem(inventoryIdNum);

    return {
      success: true,
      message: `Pet ${inventoryItem.shop_items.name} activated`,
      data: {
        inventory_item: updatedItem!,
        pet_activated: true,
      },
    };
  } else if (itemType === 'boost') {
    // Activate boost with expiration
    const metadata = inventoryItem.shop_items.metadata as any;
    const durationMinutes = metadata?.duration_minutes || 60;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    await prisma.user_inventory.update({
      where: { inventory_id: inventoryIdNum },
      data: {
        is_equipped: true,
        metadata: {
          ...((inventoryItem.metadata as any) || {}),
          activated_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        },
      },
    });

    const updatedItem = await getUserInventoryItem(inventoryIdNum);

    return {
      success: true,
      message: `Boost ${inventoryItem.shop_items.name} activated`,
      data: {
        inventory_item: updatedItem!,
        boost_activated: {
          boost_type: metadata?.boost_type || 'unknown',
          expires_at: expiresAt,
        },
      },
    };
  } else {
    // Generic equip
    await prisma.user_inventory.update({
      where: { inventory_id: inventoryIdNum },
      data: { is_equipped: true },
    });

    const updatedItem = await getUserInventoryItem(inventoryIdNum);

    return {
      success: true,
      message: `${inventoryItem.shop_items.name} equipped`,
      data: {
        inventory_item: updatedItem!,
      },
    };
  }
}

/**
 * Unequip item
 */
export async function unequipItem(userId: number, inventoryId: string): Promise<EquipResponse> {
  const inventoryIdNum = BigInt(inventoryId);

  const inventoryItem = await prisma.user_inventory.findUnique({
    where: { inventory_id: inventoryIdNum },
    include: {
      shop_items: true,
    },
  });

  if (!inventoryItem) {
    return {
      success: false,
      message: 'Inventory item not found',
      data: {} as any,
    };
  }

  if (inventoryItem.user_id !== userId) {
    return {
      success: false,
      message: 'Item does not belong to user',
      data: {} as any,
    };
  }

  await prisma.user_inventory.update({
    where: { inventory_id: inventoryIdNum },
    data: { is_equipped: false },
  });

  const updatedItem = await getUserInventoryItem(inventoryIdNum);

  return {
    success: true,
    message: `${inventoryItem.shop_items.name} unequipped`,
    data: {
      inventory_item: updatedItem!,
    },
  };
}

/**
 * Toggle favorite
 */
export async function toggleFavorite(
  userId: number,
  inventoryId: string
): Promise<{ success: boolean; message: string; is_favorite: boolean }> {
  const inventoryIdNum = BigInt(inventoryId);

  const inventoryItem = await prisma.user_inventory.findUnique({
    where: { inventory_id: inventoryIdNum },
    include: {
      shop_items: true,
    },
  });

  if (!inventoryItem) {
    return {
      success: false,
      message: 'Inventory item not found',
      is_favorite: false,
    };
  }

  if (inventoryItem.user_id !== userId) {
    return {
      success: false,
      message: 'Item does not belong to user',
      is_favorite: false,
    };
  }

  const newFavoriteStatus = !inventoryItem.is_favorite;

  await prisma.user_inventory.update({
    where: { inventory_id: inventoryIdNum },
    data: { is_favorite: newFavoriteStatus },
  });

  return {
    success: true,
    message: newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites',
    is_favorite: newFavoriteStatus,
  };
}

/**
 * Helper: Get single inventory item
 */
async function getUserInventoryItem(
  inventoryId: bigint
): Promise<InventoryItemResponse | null> {
  const item = await prisma.user_inventory.findUnique({
    where: { inventory_id: inventoryId },
    include: {
      shop_items: {
        select: {
          item_id: true,
          name: true,
          description: true,
          item_type: true,
          rarity: true,
          image_url: true,
          icon_url: true,
          preview_url: true,
          category: true,
          tags: true,
          metadata: true,
        },
      },
    },
  });

  if (!item) return null;

  return {
    inventory_id: item.inventory_id.toString(),
    user_id: item.user_id,
    item_id: item.item_id,
    quantity: item.quantity,
    is_equipped: item.is_equipped,
    is_favorite: item.is_favorite,
    acquired_at: item.acquired_at,
    acquired_source: item.acquired_source,
    metadata: item.metadata,
    item: item.shop_items,
  };
}

