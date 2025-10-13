import { Router } from 'express';
import ShopController from '@controllers/ShopController';
import { requireAuth } from '@middleware/auth';

const router = Router();

/**
 * GET /api/shop/items
 * List shop items with filters and pagination
 */
router.get('/items', ShopController.getItems);

/**
 * GET /api/shop/items/:id
 * Get single item details
 */
router.get('/items/:id', ShopController.getItem);

/**
 * POST /api/shop/purchase
 * Purchase an item (requires authentication)
 */
router.post('/purchase', requireAuth, ShopController.purchase);

export default router;

