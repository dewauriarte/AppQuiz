/**
 * Avatar Service
 * Sprint 7: Handles avatar customization and validation
 */

import prisma from '@config/database';
import {
  AvatarParts,
  AvatarUpdatePayload,
  AvatarUpdateResponse,
  AvatarItemValidation,
  AvatarComposition
} from '../types/avatar.types';
import { ItemType, Prisma } from '@prisma/client';

/**
 * Valid item types that can be equipped on avatar
 */
const AVATAR_EQUIPPABLE_TYPES: ItemType[] = [
  'skin',
  'accessory',
  // Add more as needed
];

/**
 * Valid item types for frames
 */
const FRAME_ITEM_TYPES: ItemType[] = [
  'badge', // Frames could be stored as badges
  // Add custom frame type if added to schema
];

/**
 * Get user's current avatar configuration
 */
export async function getUserAvatar(userId: number): Promise<AvatarComposition | null> {
  const profile = await prisma.user_profiles.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      avatar_url: true,
      avatar_parts: true,
      avatar_frame_url: true,
      updated_at: true,
    }
  });

  if (!profile) {
    return null;
  }

  return {
    user_id: profile.user_id,
    avatar_parts: profile.avatar_parts as AvatarParts | null,
    avatar_frame_url: profile.avatar_frame_url,
    composed_url: profile.avatar_url,
  };
}

/**
 * Validate that an item belongs to user and can be equipped
 */
async function validateAvatarItem(
  userId: number, 
  itemId: number | null,
  allowedTypes?: ItemType[]
): Promise<AvatarItemValidation> {
  // null is valid (means unequip)
  if (itemId === null) {
    return { valid: true, item_id: 0 };
  }

  // Check if item exists in user's inventory
  const inventoryItem = await prisma.user_inventory.findFirst({
    where: {
      user_id: userId,
      item_id: itemId,
    },
    include: {
      shop_items: {
        select: {
          item_id: true,
          name: true,
          item_type: true,
          image_url: true,
          metadata: true,
        }
      }
    }
  });

  if (!inventoryItem) {
    return {
      valid: false,
      item_id: itemId,
      error: `Item ${itemId} not found in user inventory`
    };
  }

  // Check if item type is allowed for avatar
  const itemType = inventoryItem.shop_items.item_type;
  const typesToCheck = allowedTypes || AVATAR_EQUIPPABLE_TYPES;
  
  if (!typesToCheck.includes(itemType)) {
    return {
      valid: false,
      item_id: itemId,
      error: `Item type ${itemType} cannot be equipped on avatar`
    };
  }

  return {
    valid: true,
    item_id: itemId,
    item: {
      item_id: inventoryItem.shop_items.item_id,
      name: inventoryItem.shop_items.name,
      item_type: inventoryItem.shop_items.item_type,
      image_url: inventoryItem.shop_items.image_url,
    }
  };
}

/**
 * Validate all avatar parts
 */
async function validateAvatarParts(
  userId: number, 
  avatarParts: AvatarParts
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const itemsToValidate: Array<{ itemId: number | null | undefined, name: string }> = [
    { itemId: avatarParts.base_skin, name: 'base_skin' },
    { itemId: avatarParts.hair, name: 'hair' },
    { itemId: avatarParts.eyes, name: 'eyes' },
    { itemId: avatarParts.mouth, name: 'mouth' },
    { itemId: avatarParts.clothes, name: 'clothes' },
    { itemId: avatarParts.background, name: 'background' },
  ];

  // Validate single items
  for (const { itemId, name } of itemsToValidate) {
    if (itemId !== undefined && itemId !== null) {
      const validation = await validateAvatarItem(userId, itemId);
      if (!validation.valid) {
        errors.push(`${name}: ${validation.error}`);
      }
    }
  }

  // Validate accessories array
  if (avatarParts.accessories && Array.isArray(avatarParts.accessories)) {
    for (const accessoryId of avatarParts.accessories) {
      if (accessoryId !== null && accessoryId !== undefined) {
        const validation = await validateAvatarItem(userId, accessoryId);
        if (!validation.valid) {
          errors.push(`accessory ${accessoryId}: ${validation.error}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate avatar URL from parts
 * For now, returns a simple string representation
 * In production, this could trigger image composition service
 */
function generateAvatarUrl(avatarParts: AvatarParts | null): string {
  if (!avatarParts) {
    return '/avatars/default.png';
  }

  // For now, use default. In production:
  // 1. Call image composition service
  // 2. Or return JSON path for frontend to render
  // 3. Or generate hash-based URL
  const partsHash = JSON.stringify(avatarParts);
  const hash = Buffer.from(partsHash).toString('base64').substring(0, 16);
  
  return `/avatars/composed/${hash}.png`;
}

/**
 * Get frame URL from item
 */
async function getFrameUrl(frameId: number | null | undefined): Promise<string | null> {
  if (!frameId) {
    return null;
  }

  const frameItem = await prisma.shop_items.findUnique({
    where: { item_id: frameId },
    select: { image_url: true }
  });

  return frameItem?.image_url || null;
}

/**
 * Update user's avatar
 */
export async function updateUserAvatar(
  userId: number,
  payload: AvatarUpdatePayload
): Promise<AvatarUpdateResponse> {
  // Validate all avatar parts
  const validation = await validateAvatarParts(userId, payload.avatar_parts);
  
  if (!validation.valid) {
    return {
      success: false,
      message: `Validation failed: ${validation.errors.join(', ')}`,
      data: {
        user_id: userId,
        avatar_url: null,
        avatar_parts: null,
        avatar_frame_url: null,
        updated_at: new Date(),
      }
    };
  }

  // Validate frame if provided
  if (payload.avatar_frame_id !== undefined && payload.avatar_frame_id !== null) {
    const frameValidation = await validateAvatarItem(
      userId, 
      payload.avatar_frame_id,
      FRAME_ITEM_TYPES
    );
    
    if (!frameValidation.valid) {
      return {
        success: false,
        message: `Frame validation failed: ${frameValidation.error}`,
        data: {
          user_id: userId,
          avatar_url: null,
          avatar_parts: null,
          avatar_frame_url: null,
          updated_at: new Date(),
        }
      };
    }
  }

  // Generate composed avatar URL
  const avatarUrl = generateAvatarUrl(payload.avatar_parts);
  
  // Get frame URL if provided
  const frameUrl = await getFrameUrl(payload.avatar_frame_id);

  // Update user profile with new avatar configuration
  const updatedProfile = await prisma.user_profiles.update({
    where: { user_id: userId },
    data: {
      avatar_parts: payload.avatar_parts as any, // Prisma Json type
      avatar_url: avatarUrl,
      avatar_frame_url: frameUrl,
      updated_at: new Date(),
    },
    select: {
      user_id: true,
      avatar_url: true,
      avatar_parts: true,
      avatar_frame_url: true,
      updated_at: true,
    }
  });

  // Update inventory items: mark equipped items
  await updateEquippedItems(userId, payload.avatar_parts, payload.avatar_frame_id);

  return {
    success: true,
    message: 'Avatar updated successfully',
    data: {
      user_id: updatedProfile.user_id,
      avatar_url: updatedProfile.avatar_url,
      avatar_parts: updatedProfile.avatar_parts as AvatarParts | null,
      avatar_frame_url: updatedProfile.avatar_frame_url,
      updated_at: updatedProfile.updated_at,
    }
  };
}

/**
 * Update equipped status for avatar items in inventory
 */
async function updateEquippedItems(
  userId: number, 
  avatarParts: AvatarParts,
  frameId?: number | null
): Promise<void> {
  // Collect all equipped item IDs
  const equippedItemIds: number[] = [];
  
  if (avatarParts.base_skin) equippedItemIds.push(avatarParts.base_skin);
  if (avatarParts.hair) equippedItemIds.push(avatarParts.hair);
  if (avatarParts.eyes) equippedItemIds.push(avatarParts.eyes);
  if (avatarParts.mouth) equippedItemIds.push(avatarParts.mouth);
  if (avatarParts.clothes) equippedItemIds.push(avatarParts.clothes);
  if (avatarParts.background) equippedItemIds.push(avatarParts.background);
  if (avatarParts.accessories) {
    equippedItemIds.push(...avatarParts.accessories.filter(id => id !== null) as number[]);
  }
  if (frameId) equippedItemIds.push(frameId);

  // First, unequip all avatar-related items for this user
  await prisma.user_inventory.updateMany({
    where: {
      user_id: userId,
      is_equipped: true,
      shop_items: {
        item_type: {
          in: [...AVATAR_EQUIPPABLE_TYPES, ...FRAME_ITEM_TYPES]
        }
      }
    },
    data: {
      is_equipped: false
    }
  });

  // Then, equip the new items
  if (equippedItemIds.length > 0) {
    await prisma.user_inventory.updateMany({
      where: {
        user_id: userId,
        item_id: {
          in: equippedItemIds
        }
      },
      data: {
        is_equipped: true
      }
    });
  }
}

/**
 * Reset avatar to default
 */
export async function resetUserAvatar(userId: number): Promise<AvatarUpdateResponse> {
  const updatedProfile = await prisma.user_profiles.update({
    where: { user_id: userId },
    data: {
      avatar_parts: Prisma.JsonNull,
      avatar_url: '/avatars/default.png',
      avatar_frame_url: null,
      updated_at: new Date(),
    },
    select: {
      user_id: true,
      avatar_url: true,
      avatar_parts: true,
      avatar_frame_url: true,
      updated_at: true,
    }
  });

  // Unequip all avatar items
  await prisma.user_inventory.updateMany({
    where: {
      user_id: userId,
      is_equipped: true,
      shop_items: {
        item_type: {
          in: [...AVATAR_EQUIPPABLE_TYPES, ...FRAME_ITEM_TYPES]
        }
      }
    },
    data: {
      is_equipped: false
    }
  });

  return {
    success: true,
    message: 'Avatar reset to default',
    data: {
      user_id: updatedProfile.user_id,
      avatar_url: updatedProfile.avatar_url,
      avatar_parts: updatedProfile.avatar_parts as AvatarParts | null,
      avatar_frame_url: updatedProfile.avatar_frame_url,
      updated_at: updatedProfile.updated_at,
    }
  };
}

