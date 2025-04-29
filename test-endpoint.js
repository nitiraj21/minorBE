const axios = require('axios');

// Get token from command line argument
const token = process.argv[2];

if (!token) {
  console.error('Please provide a token as a command line argument');
  console.error('Usage: node test-endpoint.js <token>');
  process.exit(1);
}

async function testEndpoint() {
  try {
    // Test the create-order endpoint first
    console.log('Testing /payment/create-order endpoint...');
    const createOrderResponse = await axios.post('http://localhost:3000/payment/create-order', 
      { amount: 100 },
      { headers: { token } }
    );
    
    console.log('Create Order Response:', createOrderResponse.data);
    
    // Then test the place-order endpoint
    console.log('\nTesting /payment/place-order endpoint...');
    const placeOrderResponse = await axios.post('http://localhost:3000/payment/place-order', 
      { 
        orderId: createOrderResponse.data.id,
        paymentMethod: 'COD',
        shippingAddress: {
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          pincode: 123456,
          country: 'India'
        }
      },
      { headers: { token } }
    );
    
    console.log('Place Order Response:', placeOrderResponse.data);
    console.log('\nBoth endpoints working correctly!');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testEndpoint(); 