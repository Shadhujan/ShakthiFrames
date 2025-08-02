// ----------------- START OF CORRECTED Order.ts -----------------

import mongoose, { Document, Schema, Types } from 'mongoose';

// --- 1. THE COMPLETE INTERFACE ---
export interface IOrder extends Document {
  user: Types.ObjectId;
  orderItems: {
    name: string;
    qty: number;
    image: string;
    price: number;
    product: Types.ObjectId;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalPrice: number;
  isPaid: boolean; // <-- ADDED
  paidAt?: Date;   // <-- ADDED
  paymentResult?: { // <-- ADDED
    id: string;
    status: string;
  };
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Combined enum
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// --- 2. THE COMPLETE SCHEMA ---
const orderSchema: Schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true, default: 0.0 },

    // --- ADDED missing payment fields ---
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    paymentResult: {
      id: { type: String },
      status: { type: String },
    },

    orderStatus: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] // Combined enum
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// --- 3. CONNECT THE INTERFACE TO THE MODEL (No change here) ---
const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;

// ----------------- END OF CORRECTED Order.ts -----------------