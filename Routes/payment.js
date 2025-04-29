const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../AuthMiddleware/auth');
const { purchaseModel, userModel, cartModel, productModel } = require('../db');

// Create a new order
router.post('/create-order', authenticateUser, async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        // Create a temporary order ID
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        res.json({
            id: orderId,
            amount,
            currency: 'INR'
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Place order with COD
router.post('/place-order', authenticateUser, async (req, res) => {
    try {
        const { orderId, paymentMethod, shippingAddress } = req.body;
        const userId = req.user.id;

        // Get user's cart with populated product details
        const cart = await cartModel.findOne({ userId }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Prepare products array with prices
        const products = cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.productId.price
        }));

        // Calculate total amount
        const totalAmount = products.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Create purchase record
        const purchase = new purchaseModel({
            userId,
            products,
            totalAmount,
            paymentMethod,
            paymentStatus: 'Pending',
            status: 'Pending',
            shippingAddress
        });
        
        await purchase.save();

        // Update user's orders
        await userModel.findByIdAndUpdate(userId, {
            $push: { orders: purchase._id }
        });

        // Clear cart
        cart.items = [];
        await cart.save();

        // Get the populated purchase for response
        const populatedPurchase = await purchaseModel.findById(purchase._id)
            .populate('products.productId');

        res.status(200).json({
            success: true,
            message: 'Order placed successfully',
            purchase: populatedPurchase
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get order details
router.get('/order/:orderId', authenticateUser, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const purchase = await purchaseModel.findOne({
            _id: orderId,
            userId
        }).populate('products.productId');

        if (!purchase) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ purchase });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete order (Admin only)
router.delete('/order/:orderId', authenticateUser, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        // Check if user is admin
        const user = await userModel.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        // Check if order exists
        const order = await purchaseModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Delete the order
        await purchaseModel.findByIdAndDelete(orderId);

        // Remove order reference from user's orders array
        await userModel.updateMany(
            { orders: orderId },
            { $pull: { orders: orderId } }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Order deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;