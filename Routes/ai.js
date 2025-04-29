const express = require('express');
const { authenticateUser } = require('../AuthMiddleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Initialize the Google Generative AI with API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: 'v1'
});

// Debug endpoint to list available models
router.get('/debug/models', async (req, res) => {
  try {
    const models = await genAI.listModels();
    console.log('Available models:', models);
    res.json({ models });
  } catch (error) {
    console.error('Error listing models:', error);
    res.status(500).json({ 
      error: error.message,
      details: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        status: error.status
      }
    });
  }
});

/**
 * Format products data into a concise string representation for the AI
 * @param {Array} products - List of products to format
 * @returns {String} - Formatted product string
 */
function formatProductsForAI(products) {
  return products.map((product, index) => {
    const specs = product.sspecs 
      ? Object.entries(product.sspecs)
          .filter(([key, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      : '';
    
    return `Product ${index + 1}:
ID: ${product._id}
Name: ${product.name}
Brand: ${product.brand}
Type: ${product.type}
Price: ₹${product.price}
Stock: ${product.stock}
${specs ? `Specifications: ${specs}` : ''}`;
  }).join('\n\n');
}

/**
 * Get product recommendations from Gemini API
 */
router.post('/product-recommendations', authenticateUser, async (req, res) => {
  try {
    const { query, availableProducts } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (!availableProducts || !Array.isArray(availableProducts) || availableProducts.length === 0) {
      return res.status(400).json({ 
        answer: "I'm sorry, there are no available products in our inventory at the moment.",
        recommendedProducts: []
      });
    }
    
    // Format available products for the AI
    const formattedProducts = formatProductsForAI(availableProducts);
    
    // Configure the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Build the prompt
    const prompt = `You are a helpful shopping assistant for an online computer hardware store. 
A user has asked: "${query}"

Based on their query, recommend suitable products from our inventory.
Here are the available products:

${formattedProducts}

First, provide a helpful response addressing their needs. 
Then, recommend up to 3 most relevant products from the inventory that match their requirements.
For each recommendation, include a brief explanation of why it's a good match.
Format your product recommendations in JSON at the end of your response, like:
RECOMMENDATIONS: [{"id": "product_id_1"}, {"id": "product_id_2"}, {"id": "product_id_3"}]

Only recommend products from the inventory I provided. Do not make up any products.`;

    // Generate response from Gemini
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract product recommendations if present
    let recommendedProductIds = [];
    const recommendationsMatch = response.match(/RECOMMENDATIONS:\s*(\[.*?\])/s);
    
    if (recommendationsMatch && recommendationsMatch[1]) {
      try {
        const recommendationsJson = JSON.parse(recommendationsMatch[1]);
        recommendedProductIds = recommendationsJson.map(item => item.id);
      } catch (e) {
        console.error('Error parsing product recommendations:', e);
      }
    }
    
    // Filter for the recommended products from our available products
    const recommendedProducts = availableProducts.filter(product => 
      recommendedProductIds.includes(product._id)
    );
    
    // Clean up the response to remove the JSON part
    const cleanResponse = response.replace(/RECOMMENDATIONS:\s*(\[.*?\])/s, '').trim();
    
    res.json({
      answer: cleanResponse,
      recommendedProducts
    });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    // Log the full error for debugging
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
    res.status(500).json({ 
      answer: "I'm sorry, I couldn't process your request at this time. Please try again later.",
      error: error.message
    });
  }
});

/**
 * General chat endpoint without product recommendations
 */
router.post('/chat', authenticateUser, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Configure the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Build the prompt
    const prompt = `You are a helpful shopping assistant for an online computer hardware store. 
A user has asked: "${query}"

Provide a helpful and friendly response. You specialize in computer hardware and electronics.
Keep your response concise but informative.`;

    // Generate response from Gemini
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    res.json({
      answer: response
    });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    // Log the full error for debugging
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
    res.status(500).json({ 
      answer: "I'm sorry, I couldn't process your request at this time. Please try again later.",
      error: error.message
    });
  }
});

module.exports = router; 