import axios from 'axios';
import { IOrder } from '@/types';

const API_URL = '/api/v1/orders';

export const getOrders = async (token: string): Promise<IOrder[]> => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // The getOrders controller returns 'orders'
    return response.data.order || [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string, token: string): Promise<IOrder> => {
  try {
    const response = await axios.put(`${API_URL}/${orderId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // The update controller returns 'order'
    return response.data.order;
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
};


export const createOrder = async (orderData: any, token: string): Promise<IOrder> => {
  try {
    const response = await axios.post(API_URL, orderData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.order;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};

export const getMyOrders = async (token: string): Promise<IOrder[]> => {
  try {
    // This will call a new backend route: GET /api/v1/orders/myorders
    const response = await axios.get(`${API_URL}/myorders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.orders || [];
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    throw error;
  }
};