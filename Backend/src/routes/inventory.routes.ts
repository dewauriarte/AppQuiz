import { Router } from 'express';
import InventoryController from '@controllers/InventoryController';
import { requireAuth } from '@middleware/auth';

const router = Router();

/**
 * GET /api/inventory
 * Get user inventory (requires authentication)
 */
router.get('/', requireAuth, InventoryController.getInventory);

/**
 * PUT /api/inventory/:id/equip
 * Equip item
 */
router.put('/:id/equip', requireAuth, InventoryController.equipItem);

/**
 * PUT /api/inventory/:id/unequip
 * Unequip item
 */
router.put('/:id/unequip', requireAuth, InventoryController.unequipItem);

/**
 * POST /api/inventory/:id/favorite
 * Toggle favorite status
 */
router.post('/:id/favorite', requireAuth, InventoryController.toggleFavorite);

export default router;

