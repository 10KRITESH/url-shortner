import { Router } from 'express';
import { getAnalytics, getDeviceAnalytics, getCountryAnalytics } from '../controllers/analytics.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

// All analytics routes require authentication
router.get('/:code', authMiddleware, getAnalytics);
router.get('/:code/devices', authMiddleware, getDeviceAnalytics);
router.get('/:code/countries', authMiddleware, getCountryAnalytics);

export default router;
