// client/src/api/productApi.ts
import axios from 'axios';
import { IProduct } from '@/types';

// The base URL will be proxied by Vite to your backend server
const API_URL = '/api/v1/products';
const UPLOAD_API_URL = '/api/v1/upload';

export const uploadImage = async (imageFile: File, token: string): Promise<string> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(UPLOAD_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    // The backend returns an object like { imageUrl: '...' }
    return response.data.imageUrl;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Image upload failed");
  }
};

// Fetches all products from the backend API.
export const getProducts = async (): Promise<IProduct[]> => {
  try {
    const response = await axios.get(API_URL); // Now this line will work
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

export const getLatestProducts = async (limit = 4): Promise<IProduct[]> => {
  try {
    const response = await axios.get(`${API_URL}?limit=${limit}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch latest products:', error);
    return [];
  }
};

// Deletes a product by its ID.
export const deleteProduct = async (productId: string, token: string): Promise<void> => {
    try {
      // Use a more specific path here
      await axios.delete(`${API_URL}/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    }
};

// Fetches a single product by its ID.
export const getProductById = async (productId: string): Promise<IProduct> => {
  try {
    const response = await axios.get(`/api/v1/products/${productId}`);
    return response.data.data;

  } catch (error) {
    console.error(`Failed to fetch product with id ${productId}:`, error);
    throw error;
  }
};

// Creates a new product with the provided data.
export const createProduct = async (productData: Partial<IProduct>, token: string): Promise<IProduct> => {
  try {
    const response = await axios.post(API_URL, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
};

// Updates a product by its ID.
export const updateProduct = async (productId: string, productData: Partial<IProduct>, token: string): Promise<IProduct> => {
  try {
    const response = await axios.put(`${API_URL}/${productId}`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};