const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { purchaseModel, cartModel, productModel, userModel } = require('../db');
const { authenticateUser } = require('../AuthMiddleware/auth');
require('dotenv').config();


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


router.post('/create-order', authenticateUser, async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const options = {
            amount: amount * 100, 
            currency: 'INR',
            receipt: crypto.randomBytes(16).toString('hex')
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/verify-payment', authenticateUser, async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            shippingAddress 
        } = req.body;
        
        const userId = req.user.id;

        // Verification
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Get cart items
        const cart = await cartModel.findOne({ userId }).populate('items.productId');
        
        if (!cart || !cart.items.length) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate total and prepare purchase document
        let totalAmount = 0;
        const purchaseProducts = [];

        for (const item of cart.items) {
            const product = await productModel.findById(item.productId);
            
            if (!product) {
                return res.status(404).json({ error: `Product not found: ${item.productId}` });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    error: `Not enough stock for product: ${product.name}` 
                });
            }
            
            // Update product stock
            product.stock -= item.quantity;
            await product.save();
            
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;
            
            purchaseProducts.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            });
        }

        // Create purchase record
        const purchase = new purchaseModel({
            userId,
            products: purchaseProducts,
            totalAmount,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paymentStatus: 'Completed',
            shippingAddress
        });
        
        await purchase.save();


        await userModel.findByIdAndUpdate(userId, {
            $push: { orders: purchase._id }
        });

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Payment successful',
            purchase
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: error.message });
    }
});

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

module.exports = router;