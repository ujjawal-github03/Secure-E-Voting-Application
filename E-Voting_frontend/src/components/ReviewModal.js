import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, onSubmit, candidateName }) => {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!review.trim()) {
      alert('Please write a review before submitting');
      return;
    }

    if (review.trim().length < 10) {
      alert('Review must be at least 10 characters long');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(review);
      setReview('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
            Share Your Experience
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Thank you for voting for <span className="font-semibold">{candidateName}</span>! 
            Please share your experience with our voting application.
          </p>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="5"
            disabled={loading}
          />

          <p className="text-xs text-gray-500 mt-2">
            {review.length} characters
          </p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !review.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReviewModal;