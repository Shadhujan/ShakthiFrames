import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import connectDB from './config/db';
import cors from 'cors';
import helmet from 'helmet';


// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import paymentRoutes from './routes/paymentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import chatbotRoutes from './routes/chatbotRoutes';

// Load environment variables from .env file
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://js.stripe.com"], // Allow scripts from your site and Stripe
      "connect-src": ["'self'", "https://api.stripe.com", "https://r.stripe.com"], // Allow connections to your API and Stripe's services
      "frame-src": ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"], // Allow iframes from Stripe
      "img-src": ["'self'", "https://*.stripe.com"], // Allow images from Stripe
    },
  })
);

// Enable CORS for all origins (you might want to restrict this in production)

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: clientUrl,  // Allow only your client to make requests
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Parse JSON request bodies
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);

// Simple GET route
app.get('/api/v1', (req, res) => {
  res.json({ message: 'Shakthi Picture Framing API is running!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});