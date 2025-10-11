import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import AuthService from '@services/AuthService';
import { registerSchema, loginSchema } from '@/types/auth.types';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body);
    const result = await AuthService.register(validatedData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body);
    const result = await AuthService.login(validatedData);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const user = await AuthService.getProfile(req.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const { refreshToken } = req.body;
    await AuthService.logout(req.userId, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new Error('User not authenticated');
    }

    const { displayName, email } = req.body;
    const updatedUser = await AuthService.updateProfile(req.userId, {
      displayName,
      email,
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    await AuthService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  });

  searchUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Username query parameter is required',
      });
      return;
    }

    const user = await AuthService.searchUserByUsername(username);

    res.status(200).json({
      success: true,
      data: user,
    });
  });
}

export default new AuthController();

