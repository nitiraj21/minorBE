import api from './axios';
import { ShippingAddress, User } from '../types';

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get('/user/profile');
    if (!response.data) {
      throw new Error('No user data received');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await api.put('/user/profile', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addUserAddress = async (address: ShippingAddress): Promise<User> => {
  try {
    const response = await api.post('/user/addresses', address);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserAddress = async (addressId: string, address: ShippingAddress): Promise<User> => {
  try {
    const response = await api.put(`/user/addresses/${addressId}`, address);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUserAddress = async (addressId: string): Promise<User> => {
  try {
    const response = await api.delete(`/user/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderHistory = async () => {
  try {
    const response = await api.get('/user/orders');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 