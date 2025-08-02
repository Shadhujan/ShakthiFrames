import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';

// Create Express router
const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerUser);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', loginUser);

export default router;