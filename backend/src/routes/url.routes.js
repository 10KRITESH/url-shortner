import { Router } from 'express';
import { shortenUrl, getUserUrls, deleteUrl } from '../controllers/url.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

// All URL routes require authentication
router.post('/shorten', authMiddleware, shortenUrl);
router.get('/', authMiddleware, getUserUrls);
router.delete('/:code', authMiddleware, deleteUrl);

export default router;
