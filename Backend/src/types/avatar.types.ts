/**
 * Avatar System Types
 * Sprint 7: Avatar customization system
 */

import { ItemType } from '@prisma/client';

/**
 * Structure for avatar parts stored in user_profiles.avatar_parts
 */
export interface AvatarParts {
  base_skin?: number | null;           // item_id of base skin
  hair?: number | null;                // item_id of hair style
  eyes?: number | null;                // item_id of eyes
  mouth?: number | null;               // item_id of mouth
  clothes?: number | null;             // item_id of clothes/outfit
  accessories?: number[];              // array of item_ids for accessories (hat, glasses, etc.)
  background?: number | null;          // item_id of background
}

/**
 * Avatar update payload from client
 */
export interface AvatarUpdatePayload {
  avatar_parts: AvatarParts;
  avatar_frame_id?: number | null;    // item_id of frame (goes in avatar_frame_url)
}

/**
 * Response after updating avatar
 */
export interface AvatarUpdateResponse {
  success: boolean;
  message: string;
  data: {
    user_id: number;
    avatar_url: string | null;
    avatar_parts: AvatarParts | null;
    avatar_frame_url: string | null;
    updated_at: Date;
  };
}

/**
 * Avatar item validation result
 */
export interface AvatarItemValidation {
  valid: boolean;
  item_id: number;
  error?: string;
  item?: {
    item_id: number;
    name: string;
    item_type: ItemType;
    image_url: string;
  };
}

/**
 * Avatar composition data
 */
export interface AvatarComposition {
  user_id: number;
  avatar_parts: AvatarParts | null;
  avatar_frame_url: string | null;
  composed_url: string | null;
}

/**
 * Valid avatar part categories for equipment
 */
export enum AvatarPartCategory {
  BASE_SKIN = 'base_skin',
  HAIR = 'hair',
  EYES = 'eyes',
  MOUTH = 'mouth',
  CLOTHES = 'clothes',
  ACCESSORIES = 'accessories',
  BACKGROUND = 'background',
  FRAME = 'frame'
}

/**
 * Mapping of ItemType to AvatarPartCategory
 */
export const ITEM_TYPE_TO_AVATAR_PART: Partial<Record<ItemType, AvatarPartCategory>> = {
  skin: AvatarPartCategory.BASE_SKIN,
  accessory: AvatarPartCategory.ACCESSORIES,
  // Add more mappings as needed based on metadata or subcategories
};

