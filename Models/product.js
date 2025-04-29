const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'Keyboard', 'Mouse', 'Monitor', 'Cabinet', 'Others']
  },
  brand: {
    type: String,
    required: true
  },
  image: {
    type: [String],
    required: true
  },
  sspecs: {
    processor: String,
    cores: Number,
    memory: String,
    storage: String,
    dimensions: String,
    weight: String,
    wattage: Number,
    additionalDetails: String
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = productSchema; 