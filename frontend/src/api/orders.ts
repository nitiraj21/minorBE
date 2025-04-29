import api from './axios';
import { Order } from '../types';
import axios from 'axios';

/**
 * Fetch the current user's orders
 */
export const getUserOrders = async (): Promise<Order[]> => {
  try {
    const response = await api.get('/user/purchases');
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Maximum number of retries for API calls
 */
const MAX_RETRIES = 2;

/**
 * Fetch all orders (admin only)
 * @param {number} retryCount - Number of retries attempted
 */
export const getAllOrders = async (retryCount = 0): Promise<Order[]> => {
  try {
    console.log('Fetching all orders for admin...');
    console.log('API URL:', api.defaults.baseURL);
    
    const response = await api.get('/admin/orders');
    console.log('Admin orders response:', response.status);
    console.log('Orders count:', response.data ? response.data.length : 0);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching admin orders:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
      
      // If the server returned a 500 and we haven't exceeded retries, try again
      if (error.response.status === 500 && retryCount < MAX_RETRIES) {
        console.log(`Retrying getAllOrders (attempt ${retryCount + 1})...`);
        // Wait for a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return getAllOrders(retryCount + 1);
      }
    }
    throw error;
  }
};

/**
 * Update the status of an order (admin only)
 * @param {string} orderId - The ID of the order to update
 * @param {string} status - The new status to set
 * @param {number} retryCount - Number of retries attempted
 */
export const updateOrderStatus = async (orderId: string, status: string, retryCount = 0): Promise<Order> => {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    const response = await api.put(`/admin/order-status/${orderId}`, { status });
    console.log('Update response:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('Error updating order status:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
      
      // If the server returned a 500 and we haven't exceeded retries, try again
      if (error.response.status === 500 && retryCount < MAX_RETRIES) {
        console.log(`Retrying updateOrderStatus (attempt ${retryCount + 1})...`);
        // Wait for a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return updateOrderStatus(orderId, status, retryCount + 1);
      }
    }
    throw error;
  }
};

/**
 * Delete an order (admin only)
 * @param {string} orderId - The ID of the order to delete
 * @param {number} retryCount - Number of retries attempted
 */
export const deleteOrder = async (orderId: string, retryCount = 0): Promise<void> => {
  try {
    console.log(`Deleting order ${orderId}`);
    console.log('API URL for delete:', `${api.defaults.baseURL}/admin/order/${orderId}`);
    
    const response = await api.delete(`/admin/order/${orderId}`);
    console.log('Delete response:', response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting order:', error.message);
    
    // Log more details about the error
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data));
      
      // If the server returned a 500 and we haven't exceeded retries, try again
      if (error.response.status === 500 && retryCount < MAX_RETRIES) {
        console.log(`Retrying deleteOrder (attempt ${retryCount + 1})...`);
        // Wait for a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return deleteOrder(orderId, retryCount + 1);
      }
    } else if (error.request) {
      console.error('No response received from server. Request details:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    throw error;
  }
};

export const createOrder = async (totalAmount: number, products: any[]): Promise<Order> => {
  try {
    const response = await api.post('/orders', {
      totalAmount,
      products: products.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }))
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrder = async (orderId: string): Promise<Order> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
}; 