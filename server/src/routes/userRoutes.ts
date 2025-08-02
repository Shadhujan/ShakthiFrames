import express from 'express';
import {
  getUsers,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserProfile
} from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// --- ADD THESE TWO ROUTES ---
// These are for the currently logged-in user to manage their own profile.
// They only need the 'protect' middleware, not 'admin'.
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

// --- Admin-only routes ---
router.route('/').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser);
router.post('/change-password', protect, changeUserPassword);

export default router;