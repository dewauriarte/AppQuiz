import { Router } from 'express';
import AdminShopController from '@controllers/AdminShopController';
import { requireAuth } from '@middleware/auth';
import { uploadItemImages } from '@config/multer';

const router = Router();

// Middleware: Require auth and admin/teacher role
const requireAdmin = (req: any, res: any, next: any) => {
  console.log('[requireAdmin] userRole:', req.userRole);
  console.log('[requireAdmin] userId:', req.userId);
  
  if (!req.userRole || (req.userRole !== 'admin' && req.userRole !== 'teacher')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Teacher role required.',
    });
  }
  next();
};

/**
 * GET /api/admin/shop/items
 * List all shop items
 */
router.get('/items', requireAuth, requireAdmin, AdminShopController.getAllItems);

/**
 * POST /api/admin/shop/items
 * Create new shop item (with image upload)
 */
router.post(
  '/items',
  requireAuth,
  requireAdmin,
  uploadItemImages,
  AdminShopController.createItem
);

/**
 * PUT /api/admin/shop/items/:id
 * Update shop item
 */
router.put(
  '/items/:id',
  requireAuth,
  requireAdmin,
  uploadItemImages,
  AdminShopController.updateItem
);

/**
 * DELETE /api/admin/shop/items/:id
 * Delete shop item
 */
router.delete('/items/:id', requireAuth, requireAdmin, AdminShopController.deleteItem);

/**
 * PATCH /api/admin/shop/items/:id/stock
 * Update item stock
 */
router.patch('/items/:id/stock', requireAuth, requireAdmin, AdminShopController.updateStock);

export default router;

