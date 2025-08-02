import axios from 'axios';
import { User } from '@/types';

const API_URL = '/api/v1/auth';

// --- Interfaces for data shapes ---
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const loginUser = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
  }
};