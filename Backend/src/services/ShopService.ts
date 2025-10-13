/**
 * Shop Service
 * Sprint 7: Shop and purchase logic
 */

import prisma from '@config/database';
import {
  ShopItemsQuery,
  ShopItemResponse,
  ShopItemsListResponse,
  PurchaseRequest,
  PurchaseResponse,
  PurchaseValidation,
} from '../types/shop.types';
import { Prisma } from '@prisma/client';

/**
 * Get shop items with filters and pagination
 */
export async function getShopItems(query: ShopItemsQuery): Promise<ShopItemsListResponse> {
  const {
    category,
    rarity,
    item_type,
    price_min,
    price_max,
    is_available = true,
    sort_by = 'newest',
    page = 1,
    limit = 20,
  } = query;

  // Build where clause
  const where: Prisma.shop_itemsWhereInput = {
    deleted_at: null,
  };

  if (is_available !== undefined) {
    where.is_available = is_available;
  }

  if (category) {
    where.category = category;
  }

  if (rarity) {
    where.rarity = rarity;
  }

  if (item_type) {
    where.item_type = item_type;
  }

  if (price_min !== undefined || price_max !== undefined) {
    where.OR = [
      {
        price_coins: {
          ...(price_min !== undefined && { gte: price_min }),
          ...(price_max !== undefined && { lte: price_max }),
        },
      },
      {
        price_gems: {
          ...(price_min !== undefined && { gte: price_min }),
          ...(price_max !== undefined && { lte: price_max }),
        },
      },
    ];
  }

  // Build order by
  let orderBy: Prisma.shop_itemsOrderByWithRelationInput = {};
  switch (sort_by) {
    case 'price_asc':
      orderBy = { price_coins: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price_coins: 'desc' };
      break;
    case 'rarity':
      orderBy = { rarity: 'asc' };
      break;
    case 'popular':
      orderBy = { times_purchased: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { created_at: 'desc' };
      break;
  }

  // Get total count
  const total = await prisma.shop_items.count({ where });

  // Get items
  const skip = (page - 1) * limit;
  const items = await prisma.shop_items.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    select: {
      item_id: true,
      name: true,
      description: true,
      item_type: true,
      rarity: true,
      image_url: true,
      icon_url: true,
      preview_url: true,
      price_coins: true,
      price_gems: true,
      is_premium: true,
      is_available: true,
      is_limited_edition: true,
      stock_limit: true,
      current_stock: true,
      times_purchased: true,
      required_level: true,
      category: true,
      tags: true,
      metadata: true,
    },
  });

  return {
    items: items as ShopItemResponse[],
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single shop item by ID
 */
export async function getShopItem(itemId: number): Promise<ShopItemResponse | null> {
  const item = await prisma.shop_items.findUnique({
    where: {
      item_id: itemId,
      deleted_at: null,
    },
    select: {
      item_id: true,
      name: true,
      description: true,
      item_type: true,
      rarity: true,
      image_url: true,
      icon_url: true,
      preview_url: true,
      price_coins: true,
      price_gems: true,
      is_premium: true,
      is_available: true,
      is_limited_edition: true,
      stock_limit: true,
      current_stock: true,
      times_purchased: true,
      required_level: true,
      required_achievement_id: true,
      category: true,
      tags: true,
      metadata: true,
    },
  });

  return item as ShopItemResponse | null;
}

/**
 * Validate purchase before executing
 */
async function validatePurchase(
  userId: number,
  request: PurchaseRequest
): Promise<PurchaseValidation> {
  const { item_id, quantity = 1, currency_type } = request;

  // Get item
  const item = await prisma.shop_items.findUnique({
    where: { item_id, deleted_at: null },
  });

  if (!item) {
    return { valid: false, error: 'Item not found' };
  }

  if (!item.is_available) {
    return { valid: false, error: 'Item is not available for purchase' };
  }

  // Get user profile and currencies
  const userProfile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
    select: { level: true },
  });

  const userCurrency = await prisma.user_currencies.findUnique({
    where: { user_id: userId },
  });

  if (!userProfile || !userCurrency) {
    return { valid: false, error: 'User not found' };
  }

  // Check level requirement
  if (item.required_level && userProfile.level < item.required_level) {
    return {
      valid: false,
      error: `Requires level ${item.required_level}. Current level: ${userProfile.level}`,
    };
  }

  // Check achievement requirement
  if (item.required_achievement_id) {
    const hasAchievement = await prisma.user_achievements.findFirst({
      where: {
        user_id: userId,
        achievement_id: item.required_achievement_id,
        is_unlocked: true,
      },
    });

    if (!hasAchievement) {
      return {
        valid: false,
        error: `Requires achievement ID ${item.required_achievement_id}`,
      };
    }
  }

  // Check stock
  if (item.is_limited_edition && item.current_stock !== null) {
    if (item.current_stock < quantity) {
      return {
        valid: false,
        error: `Insufficient stock. Available: ${item.current_stock}`,
      };
    }
  }

  // Calculate total cost
  const pricePerUnit = currency_type === 'coins' ? item.price_coins : item.price_gems;
  
  if (!pricePerUnit) {
    return {
      valid: false,
      error: `Item cannot be purchased with ${currency_type}`,
    };
  }

  const totalCost = pricePerUnit * quantity;

  // Check user balance
  const userBalance = currency_type === 'coins' ? userCurrency.coins : userCurrency.gems;

  if (userBalance < totalCost) {
    return {
      valid: false,
      error: `Insufficient ${currency_type}. Required: ${totalCost}, Available: ${userBalance}`,
      user_balance: {
        coins: userCurrency.coins,
        gems: userCurrency.gems,
      },
    };
  }

  return {
    valid: true,
    item: item as ShopItemResponse,
    user_balance: {
      coins: userCurrency.coins,
      gems: userCurrency.gems,
    },
    total_cost: totalCost,
  };
}

/**
 * Purchase item
 */
export async function purchaseItem(
  userId: number,
  request: PurchaseRequest
): Promise<PurchaseResponse> {
  const { item_id, quantity = 1, currency_type } = request;

  // Validate purchase
  const validation = await validatePurchase(userId, request);

  if (!validation.valid) {
    return {
      success: false,
      message: validation.error || 'Purchase validation failed',
      data: {} as any,
    };
  }

  const item = validation.item!;
  const totalCost = validation.total_cost!;

  // Execute purchase in transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Deduct currency
    const updatedCurrency = await tx.user_currencies.update({
      where: { user_id: userId },
      data: {
        ...(currency_type === 'coins'
          ? {
              coins: { decrement: totalCost },
              total_coins_spent: { increment: totalCost },
            }
          : {
              gems: { decrement: totalCost },
              total_gems_spent: { increment: totalCost },
            }),
        updated_at: new Date(),
      },
    });

    // 2. Create currency transaction
    const transaction = await tx.currency_transactions.create({
      data: {
        user_id: userId,
        currency_type: currency_type,
        amount: -totalCost,
        balance_after: currency_type === 'coins' ? updatedCurrency.coins : updatedCurrency.gems,
        source: 'shop_purchase',
        reference_id: item_id,
        description: `Purchased ${item.name} x${quantity}`,
        metadata: { item_id, quantity },
      },
    });

    // 3. Add to inventory or increment quantity
    const existingInventoryItem = await tx.user_inventory.findUnique({
      where: {
        user_id_item_id: {
          user_id: userId,
          item_id: item_id,
        },
      },
    });

    console.log('[ShopService] Existing inventory item:', existingInventoryItem);

    let inventoryItem;
    if (existingInventoryItem) {
      inventoryItem = await tx.user_inventory.update({
        where: {
          user_id_item_id: {
            user_id: userId,
            item_id: item_id,
          },
        },
        data: {
          quantity: { increment: quantity },
        },
      });
      console.log('[ShopService] Updated inventory item:', inventoryItem);
    } else {
      inventoryItem = await tx.user_inventory.create({
        data: {
          user_id: userId,
          item_id: item_id,
          quantity: quantity,
          acquired_source: 'shop_purchase',
          metadata: { purchase_transaction_id: transaction.transaction_id.toString() },
        },
      });
      console.log('[ShopService] Created new inventory item:', inventoryItem);
    }

    // 4. Record purchase history
    const purchase = await tx.purchase_history.create({
      data: {
        user_id: userId,
        item_id: item_id,
        quantity: quantity,
        price_paid_coins: currency_type === 'coins' ? totalCost : 0,
        price_paid_gems: currency_type === 'gems' ? totalCost : 0,
        transaction_id: transaction.transaction_id,
      },
    });

    // 5. Update item stock if limited
    if (item.is_limited_edition && item.current_stock !== null) {
      await tx.shop_items.update({
        where: { item_id: item_id },
        data: {
          current_stock: { decrement: quantity },
          times_purchased: { increment: 1 },
        },
      });
    } else {
      await tx.shop_items.update({
        where: { item_id: item_id },
        data: {
          times_purchased: { increment: 1 },
        },
      });
    }

    return {
      purchase,
      updatedCurrency,
      inventoryItem,
    };
  });

  return {
    success: true,
    message: `Successfully purchased ${item.name} x${quantity}`,
    data: {
      purchase_id: result.purchase.purchase_id.toString(),
      item: item,
      quantity: quantity,
      total_price: totalCost,
      currency_type: currency_type,
      new_balance: {
        coins: result.updatedCurrency.coins,
        gems: result.updatedCurrency.gems,
      },
      inventory_item_id: result.inventoryItem.inventory_id.toString(),
    },
  };
}

