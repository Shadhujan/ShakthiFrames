import { Request, Response } from 'express';
import Product from '../models/Product';

/**
 * Get all products with optional category and limit filtering
 * @route GET /api/v1/products
 * @access Public
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    // --- CHANGE 1: Destructure 'limit' from the query string ---
    const { category, limit } = req.query;

    // Build filter object (no changes here)
    const filter: any = {};
    if (category && typeof category === 'string') {
      filter.category = { $regex: category, $options: 'i' };
    }

    // --- CHANGE 2: Build the query in steps ---
    // Start building the query but don't execute it yet
    let query = Product.find(filter).sort({ createdAt: -1 });

    // If a 'limit' parameter is provided in the URL, apply it to the query
    if (limit && !isNaN(parseInt(limit as string))) {
      query = query.limit(parseInt(limit as string));
    }
    // --- END OF CHANGES ---

    // Now, execute the final query
    const products = await query;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message,
    });
  }
};

/**
 * Get single product by ID
 * @route GET /api/v1/products/:id
 * @access Public
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find product by ID
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error('Get product by ID error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message,
    });
  }
};

/**
 * Create new product
 * @route POST /api/v1/products
 * @access Private/Admin
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, images, stockStatus } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, and category',
      });
      return;
    }

    // Validate price is a positive number
    if (isNaN(price) || price < 0) {
      res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
      });
      return;
    }

    // Create new product
    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      category,
      images: images || [],
      stockStatus: stockStatus || 'In Stock',
    });

    // Save product to database
    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message,
    });
  }
};

/**
 * Update product by ID
 * @route PUT /api/v1/products/:id
 * @access Private/Admin
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, category, images, stockStatus } = req.body;

    // Find product by ID
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Validate price if provided
    if (price !== undefined && (isNaN(price) || price < 0)) {
      res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
      });
      return;
    }

    // Update product fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (images !== undefined) updateData.images = images;
    if (stockStatus !== undefined) updateData.stockStatus = stockStatus;

    // Update product in database
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error('Update product error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message,
    });
  }
};

/**
 * Delete product by ID
 * @route DELETE /api/v1/products/:id
 * @access Private/Admin
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find and delete product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        deletedProduct: {
          _id: product._id,
          name: product.name,
        },
      },
    });
  } catch (error: any) {
    console.error('Delete product error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message,
    });
  }
};