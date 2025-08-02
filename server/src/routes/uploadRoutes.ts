// ----------------- START OF GUARANTEED FIX -----------------

import express, { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// --- 1. Validate environment variables individually ---
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (!cloud_name || !api_key || !api_secret) {
  console.error("FATAL ERROR: Cloudinary credentials are not defined in the .env file.");
  process.exit(1);
}

// --- 2. Configure Cloudinary with the now-guaranteed string values ---
cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});

// --- Configure Multer Storage for Cloudinary ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'spf-ecommerce-products',
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
  } as any,
});

const upload = multer({ storage: storage });

// --- Define the Upload Route ---
router.post('/', protect, admin, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    imageUrl: req.file.path,
  });
});

export default router;

// ----------------- END OF GUARANTEED FIX -----------------