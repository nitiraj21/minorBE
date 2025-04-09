// Routes/wishlist.js
const express = require('express');
const router = express.Router();
const { wishlistModel, productModel } = require('../db');
const { authenticateUser } = require('../AuthMiddleware/auth');

// Get user's wishlist
router.get('/', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        
        let wishlist = await wishlistModel.findOne({ userId }).populate('products');
        
        if (!wishlist) {
            wishlist = new wishlistModel({ userId, products: [] });
            await wishlist.save();
        }
        
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add product to wishlist
router.post('/add/:productId', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        
        // Check if product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Find or create wishlist
        let wishlist = await wishlistModel.findOne({ userId });
        
        if (!wishlist) {
            wishlist = new wishlistModel({ userId, products: [] });
        }
        
        // Check if product is already in wishlist
        if (wishlist.products.includes(productId)) {
            return res.status(400).json({ error: 'Product already in wishlist' });
        }
        
        // Add product to wishlist
        wishlist.products.push(productId);
        await wishlist.save();
        
        res.status(200).json({ 
            message: 'Product added to wishlist',
            wishlist
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove product from wishlist
router.delete('/remove/:productId', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        
        // Find wishlist
        const wishlist = await wishlistModel.findOne({ userId });
        
        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }
        
        // Remove product from wishlist
        wishlist.products = wishlist.products.filter(
            id => id.toString() !== productId
        );
        
        await wishlist.save();
        
        res.status(200).json({ 
            message: 'Product removed from wishlist',
            wishlist
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear wishlist
router.delete('/clear', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find and update wishlist
        await wishlistModel.findOneAndUpdate(
            { userId },
            { $set: { products: [] } }
        );
        
        res.status(200).json({ message: 'Wishlist cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;