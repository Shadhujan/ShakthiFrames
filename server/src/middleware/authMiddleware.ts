import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthenticatedUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware to protect routes - requires valid JWT token
 * Verifies token and attaches user to request object
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from 'Bearer TOKEN'
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    // Find user by ID from token payload
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
      });
      return;
    }

    // Attach user to request object
    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.',
      });
      return;
    }

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Access denied. Token expired.',
      });
      return;
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
      error: error.message,
    });
  }
};

/**
 * Middleware to restrict access to admin users only
 * Must be used after the protect middleware
 */
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  // Check if user exists (should be set by protect middleware)
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Access denied. User not authenticated.',
    });
    return;
  }

  // Check if user role is admin
  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }

  // User is admin, proceed to next middleware/controller
  next();
};