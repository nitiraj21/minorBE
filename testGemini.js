const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testGeminiAPI() {
  console.log('Testing Gemini API integration...');
  console.log('API Key exists:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
  console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0);

  if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not defined in the environment variables');
    return;
  }

  try {
    // Initialize the Google Generative AI with API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Successfully initialized GoogleGenerativeAI client');

    // List available models to check which ones we can use
    console.log('Listing available models...');
    try {
      const models = await genAI.listModels();
      console.log('Available models:', models);
    } catch (listError) {
      console.error('Error listing models:', listError);
    }

    // Configure the model - try gemini-1.5-pro if gemini-pro doesn't work
    console.log('Trying with gemini-1.5-pro model...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    console.log('Successfully created model instance');

    // Simple test prompt
    const prompt = 'Hello, can you help me find a good gaming laptop?';

    console.log('Sending test prompt to Gemini API:', prompt);
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('Successfully received response from Gemini API');
    console.log('Response:', response);
  } catch (error) {
    console.error('Error with Gemini API:', error);
    if (error.response) {
      console.error('Error response:', error.response);
    }
  }
}

// Run the test
testGeminiAPI(); 