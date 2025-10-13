/**
 * Avatar Controller
 * Sprint 7: Handles avatar customization endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import * as AvatarService from '@services/AvatarService';
import { AvatarUpdatePayload } from '../types/avatar.types';

export class AvatarController {
  /**
   * GET /api/users/:id/avatar
   * Get user's current avatar configuration
   */
  getAvatar = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check permissions: user can only view their own avatar (or admin)
    if (req.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    const avatar = await AvatarService.getUserAvatar(userId);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: avatar,
      message: 'Avatar retrieved successfully'
    });
  });

  /**
   * PUT /api/users/avatar
   * Update authenticated user's avatar
   */
  updateAvatar = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const payload: AvatarUpdatePayload = req.body;

    // Validate payload structure
    if (!payload.avatar_parts) {
      return res.status(400).json({
        success: false,
        message: 'avatar_parts is required'
      });
    }

    const result = await AvatarService.updateUserAvatar(req.userId, payload);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message
    });
  });

  /**
   * PUT /api/users/:id/avatar
   * Update specific user's avatar (admin only)
   */
  updateUserAvatar = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check permissions: only admin can update other users' avatars
    if (req.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    const payload: AvatarUpdatePayload = req.body;

    // Validate payload structure
    if (!payload.avatar_parts) {
      return res.status(400).json({
        success: false,
        message: 'avatar_parts is required'
      });
    }

    const result = await AvatarService.updateUserAvatar(userId, payload);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.data
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message
    });
  });

  /**
   * DELETE /api/users/avatar
   * Reset authenticated user's avatar to default
   */
  resetAvatar = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await AvatarService.resetUserAvatar(req.userId);

    return res.status(200).json({
      success: true,
      data: result.data,
      message: result.message
    });
  });
}

export default new AvatarController();

