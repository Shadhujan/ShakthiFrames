import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// This route should only be accessible to authenticated admins
router.route('/').get(protect, admin, getDashboardStats);

export default router;