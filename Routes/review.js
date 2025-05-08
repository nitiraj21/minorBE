const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../AuthMiddleware/auth');
const Review = require('../Models/review');
const Product = require('../Models/product');

// Submit a review
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    // Use either id or _id, whichever is available
    const userId = req.user._id || req.user.id;

    console.log('Review submission attempt:', { 
      userId, 
      productId, 
      rating, 
      comment,
      user: req.user
    });

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      console.log('User already reviewed this product:', { userId, productId });
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Create new review
    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment
    });

    const savedReview = await review.save();
    console.log('Review saved successfully:', savedReview._id);

    // Update product's average rating
    const reviews = await Review.find({ product: productId });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { averageRating });
    console.log('Updated product average rating:', averageRating);

    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: error.message });
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
    await Product.findByIdAndUpdate(review.product, { averageRating });

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
    await Product.findByIdAndUpdate(review.product, { averageRating });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 