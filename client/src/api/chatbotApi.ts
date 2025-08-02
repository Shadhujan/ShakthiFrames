import axios from 'axios';

interface ChatbotResponse {
  reply: string;
}

export const sendMessageToBot = async (message: string): Promise<ChatbotResponse> => {
  try {
    const response = await axios.post('/api/v1/chatbot/message', { message });
    return response.data;
  } catch (error) {
    console.error("Error sending message to bot:", error);
    // Return a default error message so the UI can display it
    return { reply: "Sorry, I'm having trouble connecting right now." };
  }
};