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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const fetchedReviews = await getProductReviews(productId);
      setReviews(fetchedReviews);
      
      // Check if user has already reviewed this product
      if (user && user._id) {
        const userReview = fetchedReviews.find(review => 
          review.user && review.user._id === user._id
        );
        
        if (userReview) {
          setEditingReview(userReview);
          setRating(userReview.rating);
          setComment(userReview.comment);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (editingReview) {
        await updateReview(editingReview._id, { rating, comment });
        setSuccess('Your review has been updated successfully!');
      } else {
        await createReview(productId, { rating, comment });
        setSuccess('Your review has been submitted successfully!');
      }
      
      // Refresh reviews
      await fetchReviews();
      onReviewUpdate();
      
      // Reset form if creating a new review (not editing)
      if (!editingReview) {
        setRating(0);
        setComment('');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      const errorMessage = err.response?.data?.error || 'Failed to submit review. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setRating(0);
    setComment('');
    setError(null);
  };

  const handleEdit = (review: ReviewType) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      setLoading(true);
      setError(null);
      await deleteReview(reviewId);
      setSuccess('Your review has been deleted successfully!');
      
      // After deletion, reset form
      setEditingReview(null);
      setRating(0);
      setComment('');
      
      await fetchReviews();
      onReviewUpdate();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      setError(err.response?.data?.error || 'Failed to delete review. Please try again.');
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

  // Check if the user has already reviewed this product
  const hasUserReviewed = user && reviews.some(review => 
    review.user && user._id && review.user._id === user._id
  );

  return (
    <div className="space-y-6">
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
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
                  <span className="text-sm font-medium">{review.user?.name || 'Anonymous'}</span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
              {user && user._id && review.user && review.user._id && user._id === review.user._id && (
                <div className="mt-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(review)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
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

      {/* Review Form - Show only if user hasn't reviewed or is editing their review */}
      {user && (editingReview || !hasUserReviewed) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
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
                <span className="ml-2 text-sm text-gray-500">
                  {rating === 0 ? 'Select a rating' : `${rating} star${rating !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              {editingReview && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading || rating === 0 || !comment.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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