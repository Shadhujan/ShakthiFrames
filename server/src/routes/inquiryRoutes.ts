import express from 'express';
import { createInquiry, getInquiries, updateInquiryStatus } from '../controllers/inquiryController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(createInquiry);
router.use(protect); // All routes require login, but only admins can access them via the main server file


// GET /api/v1/inquiries - Get all inquiries (Admin only)
router.route('/').get(admin, getInquiries);

// PUT /api/v1/inquiries/:id/status - Update status (Admin only)
router.route('/:id/status').put(admin, updateInquiryStatus);

export default router;