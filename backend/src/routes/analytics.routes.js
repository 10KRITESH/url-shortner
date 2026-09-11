import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

// All analytics routes require authentication
router.get('/:code', authMiddleware, getAnalytics);

export default router;
