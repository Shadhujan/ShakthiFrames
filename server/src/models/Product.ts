import mongoose, { Document, Schema } from 'mongoose';

// Define the Product interface
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stockStatus: 'In Stock' | 'Out of Stock';
  createdAt: Date;
  updatedAt: Date;
}

// Define the Product schema
const productSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    stockStatus: {
      type: String,
      required: true,
      enum: ['In Stock', 'Out of Stock'],
      default: 'In Stock',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the Product model
const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;