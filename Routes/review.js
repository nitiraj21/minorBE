const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../AuthMiddleware/auth');
const Review = require('../Models/review');
const { productModel } = require('../db');

// Submit a review
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Get userId from the decoded token
    let userId;
    if (req.user.id) {
      userId = req.user.id;
    } else if (req.user._id) {
      userId = req.user._id;
    } else {
      console.error('No user ID found in token:', req.user);
      return res.status(400).json({ error: 'Invalid user authentication' });
    }

    console.log('Review submission attempt:', { 
      userId, 
      productId, 
      rating, 
      comment
    });

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields: productId, rating, and comment are required' });
    }

    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      console.log('User already reviewed this product:', { userId, productId });
      return res.status(400).json({ error: 'You have already reviewed this product. Please edit your existing review instead.' });
    }

    // Create new review
    const review = new Review({
      user: userId,
      product: productId,
      rating: Number(rating),
      comment
    });

    try {
      const savedReview = await review.save();
      console.log('Review saved successfully:', savedReview._id);

      // Update product's average rating
      const reviews = await Review.find({ product: productId });
      const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
      await productModel.findByIdAndUpdate(productId, { averageRating });
      console.log('Updated product average rating:', averageRating);

      res.status(201).json(savedReview);
    } catch (saveError) {
      // Check if it's a duplicate key error (user already reviewed this product)
      if (saveError.code === 11000 || saveError.name === 'MongoError' && saveError.code === 11000) {
        console.log('Duplicate review detected:', saveError);
        return res.status(400).json({ error: 'You have already reviewed this product. Please edit your existing review instead.' });
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred while submitting your review' });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('Fetching reviews for product:', productId);
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name email') // Include email field for better user identification
      .sort({ createdAt: -1 });
      
    console.log(`Found ${reviews.length} reviews for product ${productId}`);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a review
router.put('/:reviewId', authenticateUser, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update product's average rating
    const reviews = await Review.find({ product: review.product });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    await productModel.findByIdAndUpdate(review.product, { averageRating });

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', authenticateUser, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    // Update product's average rating
    const reviews = await Review.find({ product: review.product });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
      : 0;
    await productModel.findByIdAndUpdate(review.product, { averageRating });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 