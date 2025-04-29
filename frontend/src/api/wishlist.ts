import api from './axios';

export const getWishlist = async () => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToWishlist = async (productId: string) => {
  try {
    const response = await api.post(`/wishlist/add/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromWishlist = async (productId: string) => {
  try {
    const response = await api.delete(`/wishlist/remove/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const clearWishlist = async () => {
  try {
    const response = await api.delete('/wishlist/clear');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 