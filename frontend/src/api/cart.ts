import api from './axios';
import { CartItem } from '../types';

interface CartResponse {
  items: Array<{
    productId: any;
    quantity: number;
  }>;
  message?: string;
}

export const getCart = async (): Promise<CartResponse> => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (productId: string, quantity: number): Promise<CartResponse> => {
  try {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const removeFromCart = async (productId: string): Promise<CartResponse> => {
  try {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}; 