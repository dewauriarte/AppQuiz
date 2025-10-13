import { Router } from 'express';
import authRoutes from './auth.routes';
import aiRoutes from './ai.routes';
import questionSetRoutes from './questionSet.routes';
import questionRoutes from './question.routes';
import aiQuestionSetRoutes from './aiQuestionSet.routes';
import classListRoutes from './classList.routes';
import gameRoutes from './game.routes';
import userRoutes from './user.routes';
import leaderboardRoutes from './leaderboard.routes';
import teacherRoutes from './teacher.routes';
import shopRoutes from './shop.routes';
import inventoryRoutes from './inventory.routes';
import adminShopRoutes from './admin-shop.routes';
import boardGameRoutes from './boardGame.routes';
import survivalRoutes from './survivalRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/question-sets', questionSetRoutes);
router.use('/questions', questionRoutes);
router.use('/ai-question-sets', aiQuestionSetRoutes);
router.use('/lists', classListRoutes);
router.use('/games', gameRoutes);
router.use('/games', boardGameRoutes); // Board mode endpoints
router.use('/games', survivalRoutes); // Survival mode endpoints
router.use('/users', userRoutes);
router.use('/leaderboards', leaderboardRoutes);
router.use('/teachers', teacherRoutes);
router.use('/shop', shopRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/admin/shop', adminShopRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;

