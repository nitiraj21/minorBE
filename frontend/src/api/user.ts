import api from './axios';
import { User, Address } from '../types';

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (data: { name?: string; email?: string }): Promise<User> => {
  try {
    const response = await api.put('/user/profile', data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update user password
export const updatePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await api.put('/user/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Add a new address
export const addAddress = async (address: Omit<Address, '_id'>): Promise<{ message: string; addresses: Address[] }> => {
  try {
    const response = await api.post('/user/address', address);
    return response.data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

// Update an address
export const updateAddress = async (
  addressId: string,
  address: Partial<Omit<Address, '_id'>>
): Promise<{ message: string; addresses: Address[] }> => {
  try {
    const response = await api.put(`/user/address/${addressId}`, address);
    return response.data;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (addressId: string): Promise<{ message: string; addresses: Address[] }> => {
  try {
    const response = await api.delete(`/user/address/${addressId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting address:', error);
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