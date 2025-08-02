import express from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// This single route will provide all data for the admin dashboard
router.get('/', protect, admin, getDashboardData);

export default router;