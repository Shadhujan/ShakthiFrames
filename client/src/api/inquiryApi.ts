import axios from 'axios';
import { IInquiry } from '@/types'; // Assuming IInquiry is defined in your types

// Define the shape of the data for the contact form
interface InquiryFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const API_URL = '/api/v1/inquiries';

// --- THIS IS THE NEW FUNCTION ---
// For the public contact page to submit a new inquiry. No token needed.
export const submitInquiry = async (inquiryData: InquiryFormData): Promise<void> => {
  try {
    await axios.post(API_URL, inquiryData);
  } catch (error: any) {
    // Throw a specific error message from the backend if it exists
    throw new Error(error.response?.data?.message || 'Failed to submit inquiry.');
  }
};


// --- EXISTING FUNCTIONS FOR ADMIN PANEL ---

// For the admin page to get all inquiries. Requires an admin token.
export const getInquiries = async (token: string): Promise<IInquiry[]> => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.inquiries || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch inquiries.');
  }
};

// For the admin page to update the status of an inquiry. Requires an admin token.
export const updateInquiryStatus = async (inquiryId: string, status: string, token: string): Promise<IInquiry> => {
  try {
    const response = await axios.put(`${API_URL}/${inquiryId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update inquiry status.');
  }
};
