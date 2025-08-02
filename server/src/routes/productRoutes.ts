import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, admin } from '../middleware/authMiddleware';

// Create Express router
const router = express.Router();

/**
 * @route GET /api/v1/products
 * @desc Get all products (with optional category filtering)
 * @access Public
 */
router.get('/', getProducts);

/**
 * @route POST /api/v1/products
 * @desc Create a new product
 * @access Private/Admin (Protected)
 */
router.post('/', protect, admin, createProduct);

/**
 * @route GET /api/v1/products/:id
 * @desc Get single product by ID
 * @access Public
 */
router.get('/:id', getProductById);

/**
 * @route PUT /api/v1/products/:id
 * @desc Update product by ID
 * @access Private/Admin (Protected)
 */
router.put('/:id', protect, admin, updateProduct);

/**
 * @route DELETE /api/v1/products/:id
 * @desc Delete product by ID
 * @access Private/Admin (Protected)
 */
router.delete('/:id', protect, admin, deleteProduct);

export default router;