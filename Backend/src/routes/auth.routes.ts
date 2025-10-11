import { Router } from 'express';
import AuthController from '@controllers/AuthController';
import { requireAuth } from '@middleware/auth';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/me', requireAuth, AuthController.getProfile);
router.put('/profile', requireAuth, AuthController.updateProfile);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/search-user', requireAuth, AuthController.searchUser);

export default router;

