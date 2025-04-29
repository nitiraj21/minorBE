// Routes/wishlist.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../AuthMiddleware/auth');
const Wishlist = require('../Models/wishlist');
const Product = require('../Models/product');

// Get user's wishlist
router.get('/', authenticateUser, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) {
      return res.json({ products: [] });
    }
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add product to wishlist
router.post('/:productId', authenticateUser, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(product._id)) {
      wishlist.products.push(product._id);
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove product from wishlist
router.delete('/:productId', authenticateUser, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      productId => productId.toString() !== req.params.productId
    );
    await wishlist.save();

    res.json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

module.exports = router;