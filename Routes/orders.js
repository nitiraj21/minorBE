const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../AuthMiddleware/auth');
const { purchaseModel } = require('../db');

// Create a new order
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { totalAmount, products } = req.body;
    const userId = req.user.id;

    const order = new purchaseModel({
      userId,
      products,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Pending',
      orderDate: new Date()
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders for the authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await purchaseModel.find({ userId })
      .populate('products.productId')
      .sort({ orderDate: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific order by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const order = await purchaseModel.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('products.productId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 