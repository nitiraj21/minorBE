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
  const response = await api.get(`/review/product/${productId}`);
  return response.data;
};

export const getUserReviews = async (): Promise<Review[]> => {
  const response = await api.get('/review/user');
  return response.data;
};

export const createReview = async (productId: string, review: ReviewInput): Promise<Review> => {
  const response = await api.post('/review', { productId, ...review });
  return response.data;
};

export const updateReview = async (reviewId: string, review: ReviewInput): Promise<Review> => {
  const response = await api.put(`/review/${reviewId}`, review);
  return response.data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`/review/${reviewId}`);
}; 