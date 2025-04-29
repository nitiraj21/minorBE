const mongoose = require('mongoose');
require('dotenv').config();
const { purchaseModel } = require('./db');

async function testDatabaseConnection() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URL:', process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB successfully');
    
    console.log('Database connection state:', mongoose.connection.readyState);
    
    console.log('Testing purchaseModel schema...');
    const purchaseSchema = purchaseModel.schema;
    console.log('PurchaseModel schema paths:', Object.keys(purchaseSchema.paths));
    
    console.log('Attempting to find all purchases...');
    try {
      const purchases = await purchaseModel.find().lean();
      console.log(`Found ${purchases.length} purchases`);
      if (purchases.length > 0) {
        console.log('First purchase (sample):', JSON.stringify(purchases[0], null, 2));
      } else {
        console.log('No purchases found in the database');
      }
    } catch (findError) {
      console.error('Error finding purchases:', findError);
    }
    
    // Test the purchaseModel methods
    console.log('Testing purchaseModel methods...');
    const methods = Object.getOwnPropertyNames(purchaseModel);
    console.log('PurchaseModel methods:', methods);
    
  } catch (error) {
    console.error('Database connection or test error:', error);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
}

testDatabaseConnection()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 