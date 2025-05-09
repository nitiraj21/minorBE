import api from './axios';

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewInput {
  rating: number;
  comment: string;
}

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const response = await api.get(`/review/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error;
  }
};

export const getUserReviews = async (): Promise<Review[]> => {
  try {
    const response = await api.get('/review/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

export const createReview = async (productId: string, review: ReviewInput): Promise<Review> => {
  try {
    console.log('Sending review data to API:', { productId, ...review });
    const response = await api.post('/review', { productId, ...review });
    console.log('Review creation successful, response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, review: ReviewInput): Promise<Review> => {
  try {
    const response = await api.put(`/review/${reviewId}`, review);
    return response.data;
  } catch (error) {
    console.error(`Error updating review ${reviewId}:`, error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await api.delete(`/review/${reviewId}`);
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error;
  }
}; 