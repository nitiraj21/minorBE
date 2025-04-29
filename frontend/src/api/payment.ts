import api from './axios';
import { ShippingAddress, OrderItem } from '../types';

export const createOrder = async (amount: number) => {
  try {
    console.log('Creating order with amount:', amount);
    console.log('API URL:', api.defaults.baseURL);
    
    const response = await api.post('/payment/create-order', { amount });
    console.log('Create order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

export const completeOrder = async (orderData: {
  orderId: string;
  amount: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  paymentMethod: string;
}) => {
  try {
    console.log('Completing order with data:', orderData);
    
    // Ensure shipping address has all required fields
    if (!orderData.shippingAddress.address || 
        !orderData.shippingAddress.city || 
        !orderData.shippingAddress.state || 
        !orderData.shippingAddress.pincode || 
        !orderData.shippingAddress.country) {
      throw new Error('Shipping address is incomplete');
    }
    
    const response = await api.post('/payment/place-order', {
      orderId: orderData.orderId,
      paymentMethod: orderData.paymentMethod,
      shippingAddress: orderData.shippingAddress
    });
    
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Failed to place order');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Order completion error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to place order');
    }
    throw new Error(error.message || 'Failed to place order');
  }
};

export const processPayment = async (orderId: string) => {
  try {
    // In testing/development, we'll simulate a successful payment
    // In production, this would integrate with the actual Razorpay frontend SDK
    return {
      success: true,
      paymentId: 'mock-payment-' + Date.now()
    };
    
    // For actual Razorpay integration, you would open their payment dialog here
    // const response = await api.post('/payment/process', { orderId });
    // return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderHistory = async () => {
  try {
    const response = await api.get('/user/purchases');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderDetails = async (orderId: string) => {
  try {
    const response = await api.get(`/payment/order/${orderId}`);
    return response.data.purchase;
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    const response = await api.delete(`/payment/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 