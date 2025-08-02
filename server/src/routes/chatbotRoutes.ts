import express from 'express';
import { getChatbotResponse } from '../controllers/chatbotController';

const router = express.Router();

// This sets up the endpoint: POST /api/v1/chatbot/message
router.post('/message', getChatbotResponse);

export default router;