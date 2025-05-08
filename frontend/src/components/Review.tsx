import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { createReview, updateReview, deleteReview, getProductReviews, Review as ReviewType } from '../api/reviews';

interface ReviewProps {
  productId: string;
  onReviewUpdate: () => void;
}

const Review: React.FC<ReviewProps> = ({ productId, onReviewUpdate }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState<ReviewType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const fetchedReviews = await getProductReviews(productId);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit button clicked');
    console.log('User:', user);
    if (!user) return;

    try {
      setLoading(true);
      console.log('Submitting review with data:', { 
        productId, 
        rating, 
        comment, 
        isEditing: !!editingReview,
        editingReviewId: editingReview?._id
      });
      
      if (editingReview) {
        console.log('Updating review with ID:', editingReview._id);
        await updateReview(editingReview._id, { rating, comment });
      } else {
        console.log('Creating new review');
        const response = await createReview(productId, { rating, comment });
        console.log('Review creation response:', response);
      }
      setRating(0);
      setComment('');
      setEditingReview(null);
      await fetchReviews();
      onReviewUpdate();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: ReviewType) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      setLoading(true);
      await deleteReview(reviewId);
      await fetchReviews();
      onReviewUpdate();
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Review List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.user.name}</span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
              {user && user._id && review.user && review.user._id && user._id === review.user._id && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Form */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  {star <= rating ? (
                    <StarIcon className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <StarOutlineIcon className="h-6 w-6 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              required
            />
            <div className="flex justify-end space-x-2">
              {editingReview && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingReview(null);
                    setRating(0);
                    setComment('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading || rating === 0 || !comment.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Review; 