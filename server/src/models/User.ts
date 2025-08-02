import mongoose, { Document, Schema } from 'mongoose';
import { Types } from 'mongoose';

// Define the User interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Define the User schema
const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      required: true,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the User model
const User = mongoose.model<IUser>('User', userSchema);

export default User;