const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../AuthMiddleware/auth');
const Review = require('../Models/review');
const Product = require('../Models/product');

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Get all reviews by the authenticated user
router.get('/user', authenticateUser, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name image')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reviews', error: error.message });
  }
});

// Create a new review
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: req.user._id,
      product: productId,
      rating,
      comment
    });

    await review.save();

    // Update product's average rating
    await updateProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error creating review', error: error.message });
  }
});

// Update a review
router.put('/:reviewId', authenticateUser, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update product's average rating
    await updateProductRating(review.product);

    res.json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', authenticateUser, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const productId = review.product;
    await review.remove();

    // Update product's average rating
    await updateProductRating(productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting review', error: error.message });
  }
});

// Helper function to update product's average rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await Product.findByIdAndUpdate(productId, { averageRating });
}

module.exports = router; 