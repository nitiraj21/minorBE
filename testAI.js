const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a test JWT token
function createTestToken() {
  // Create a user object with admin permissions
  const user = {
    _id: '123456789012345678901234', // fake user ID
    name: 'Test User',
    email: 'test@example.com',
    isAdmin: true
  };
  
  // Sign the token with the JWT_SECRET from .env
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function testAIEndpoint() {
  try {
    console.log('Testing AI chat endpoint...');
    
    // Create a test token
    const token = createTestToken();
    console.log('Created test token for authentication');
    
    const response = await fetch('http://localhost:8000/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        query: 'Hello, can you help me find a good gaming laptop?'
      })
    });
    
    if (!response.ok) {
      console.error('Error response:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('AI Response:', data);
  } catch (error) {
    console.error('Error testing AI endpoint:', error);
  }
}

// Run the test
testAIEndpoint(); 