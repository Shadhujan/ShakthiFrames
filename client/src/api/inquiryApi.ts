// client/src/api/inquiryApi.ts
import axios from 'axios';
import { IInquiry } from '@/types';

// --- Inquiry Submission Form Interface ---
export interface InquiryFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const API_URL = '/api/v1/inquiries';

// --- 1. Public: Submit new inquiry (no token required) ---
export const submitInquiry = async (inquiryData: InquiryFormData): Promise<void> => {
  try {
    await axios.post(API_URL, inquiryData);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to submit inquiry.');
  }
};

// --- 2. Admin: Get all inquiries (with token) ---
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

// --- 3. Admin: Update inquiry status (e.g., mark as "Resolved") ---
export const updateInquiryStatus = async (
  inquiryId: string,
  status: 'New' | 'In Progress' | 'Resolved',
  token: string
): Promise<IInquiry> => {
  try {
    const response = await axios.put(
      `${API_URL}/${inquiryId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update inquiry status.');
  }
};
