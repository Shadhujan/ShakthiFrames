// ----------------- START OF CORRECTED orderRoutes.ts -----------------
import express from 'express';
import { getOrders, updateOrderStatus, createOrder, getMyOrders } from '../controllers/orderController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// --- Define the routes with specific middleware ---
// This route only uses 'protect', as any logged-in user can see their own orders.
router.route('/myorders').get(protect, getMyOrders);

// POST /api/v1/orders - A logged-in customer can create an order.
router.route('/').post(protect, createOrder);

// GET /api/v1/orders - Only an admin can see all orders.
router.route('/').get(protect, admin, getOrders);

// PUT /api/v1/orders/:id/status - Only an admin can update status.
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
// ----------------- END OF CORRECTED orderRoutes.ts -----------------