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

        // Make sure we have a shipping address
        const orderShippingAddress = shippingAddress || {
            address: 'N/A',
            city: 'N/A',
            state: 'N/A',
            pincode: 0,
            country: 'N/A'
        };

        // Create purchase record
        const purchase = new purchaseModel({
            userId,
            products,
            totalAmount,
            paymentMethod,
            paymentStatus: 'Pending',
            status: 'Pending',
            shippingAddress: orderShippingAddress
        });
        
        await purchase.save();

        // Find the user and check if the order already exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the purchase is already in the user's orders
        if (!user.orders) {
            user.orders = [];
        }
        
        // Only add to orders array if it doesn't already exist
        if (!user.orders.includes(purchase._id)) {
            user.orders.push(purchase._id);
            await user.save();
        }

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

        // Ensure the purchase has a shipping address
        if (!purchase.shippingAddress) {
            purchase.shippingAddress = {
                address: 'N/A',
                city: 'N/A',
                state: 'N/A',
                pincode: 0,
                country: 'N/A'
            };
            await purchase.save();
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

// Update order status (Admin or User for certain statuses)
router.put('/order-status/:orderId', authenticateUser, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingId, trackingUrl, courierName } = req.body;
        const userId = req.user.id;

        // Find the order
        const order = await purchaseModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user is the owner of the order or an admin
        const user = await userModel.findById(userId);
        const isAdmin = user && user.isAdmin;
        const isOwner = order.userId.toString() === userId;

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        // Regular users can only cancel orders if they're still pending
        if (!isAdmin && status === 'Cancelled') {
            if (order.status !== 'Pending') {
                return res.status(400).json({ 
                    error: 'Cannot cancel order that is already being processed, shipped, or delivered' 
                });
            }
        }

        // Only admins can update to other statuses
        if (!isAdmin && status !== 'Cancelled') {
            return res.status(403).json({ error: 'Only administrators can update order status' });
        }

        // Update order status and tracking information
        const updateData = {
            status,
            ...(trackingId && { trackingId }),
            ...(trackingUrl && { trackingUrl }),
            ...(courierName && { courierName })
        };

        // Add tracking event to the history
        if (!order.trackingHistory) {
            order.trackingHistory = [];
        }

        order.trackingHistory.push({
            status,
            timestamp: new Date(),
            note: `Order ${status.toLowerCase()}${courierName ? ` via ${courierName}` : ''}${trackingId ? ` with tracking ID: ${trackingId}` : ''}`
        });

        // If status is updated to Delivered, update the payment status
        if (status === 'Delivered') {
            updateData.paymentStatus = 'Completed';
            updateData.deliveredAt = new Date();
        }

        // If status is updated to Shipped, add shipping date
        if (status === 'Shipped') {
            updateData.shippedAt = new Date();
        }

        // Update database
        await order.save();
        const updatedOrder = await purchaseModel.findByIdAndUpdate(
            orderId, 
            updateData, 
            { new: true }
        ).populate('products.productId');

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get tracking information for an order
router.get('/track/:orderId', authenticateUser, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await purchaseModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user is authorized to view this order
        if (order.userId.toString() !== userId) {
            const user = await userModel.findById(userId);
            if (!user || !user.isAdmin) {
                return res.status(403).json({ error: 'Unauthorized access' });
            }
        }

        // Prepare tracking information
        const trackingInfo = {
            orderId: order._id,
            status: order.status,
            trackingId: order.trackingId || null,
            trackingUrl: order.trackingUrl || null,
            courierName: order.courierName || null,
            orderDate: order.orderDate,
            shippedAt: order.shippedAt || null,
            deliveredAt: order.deliveredAt || null,
            trackingHistory: order.trackingHistory || []
        };

        res.status(200).json(trackingInfo);
    } catch (error) {
        console.error('Error fetching tracking information:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all orders with status updates
router.get('/orders', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;
        
        // Build query
        const query = { userId };
        if (status && ['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
            query.status = status;
        }
        
        const orders = await purchaseModel.find(query)
            .populate('products.productId')
            .sort({ orderDate: -1 });
            
        // Add a default shipping address for orders that might be missing it
        const fixedOrders = orders.map(order => {
            if (!order.shippingAddress) {
                order.shippingAddress = {
                    address: 'N/A',
                    city: 'N/A',
                    state: 'N/A',
                    pincode: 0,
                    country: 'N/A'
                };
            }
            return order;
        });
        
        // Remove potential duplicates by order ID
        const uniqueOrderIds = new Set();
        const uniqueOrders = fixedOrders.filter(order => {
            const isDuplicate = uniqueOrderIds.has(order._id.toString());
            uniqueOrderIds.add(order._id.toString());
            return !isDuplicate;
        });
            
        res.status(200).json(uniqueOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;