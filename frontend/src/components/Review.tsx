import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { createReview, updateReview, deleteReview } from '../api/reviews';

interface ReviewProps {
  productId: string;
  reviews: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  onReviewUpdate: () => void;
}

const Review: React.FC<ReviewProps> = ({ productId, reviews, onReviewUpdate }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const userReview = reviews.find(review => review.user._id === user?._id);

  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    }
  }, [userReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (editingReview) {
        await updateReview(editingReview, { rating, comment });
      } else {
        await createReview(productId, { rating, comment });
      }
      setEditingReview(null);
      onReviewUpdate();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReview(reviewToDelete);
      onReviewUpdate();
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
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
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Review</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this review?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{review.user.name}</h4>
                <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
              </div>
              {user?._id === review.user._id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingReview(review._id);
                      setRating(review.rating);
                      setComment(review.comment);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(review._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Review; 