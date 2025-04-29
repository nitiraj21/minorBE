import api from './axios';
import { Product } from '../types';

/**
 * AI model response interface
 */
interface AIChatResponse {
  answer: string;
  recommendedProducts?: Product[];
  error?: string;
}

/**
 * Validate that a product has all required fields for AI processing
 */
const validateProduct = (product: Product): boolean => {
  const isValid = !!(
    product._id &&
    product.name &&
    product.brand &&
    product.type &&
    product.price &&
    typeof product.stock === 'number'
  );
  
  if (!isValid) {
    console.log('Invalid product:', {
      id: product._id,
      missingFields: {
        _id: !product._id,
        name: !product.name,
        brand: !product.brand,
        type: !product.type,
        price: !product.price,
        stock: typeof product.stock !== 'number'
      }
    });
  }
  
  return isValid;
};

/**
 * Use the Gemini AI to get product recommendations based on user query
 * @param query User's question or needs description
 * @param availableProducts List of products currently available in the store
 */
export const getAIProductRecommendations = async (
  query: string, 
  availableProducts: Product[]
): Promise<AIChatResponse> => {
  try {
    console.log('Starting AI recommendations with:', {
      query,
      totalProducts: availableProducts?.length || 0
    });

    if (!query.trim()) {
      throw new Error('Query is required');
    }

    if (!Array.isArray(availableProducts) || availableProducts.length === 0) {
      throw new Error('No available products to search through');
    }

    // Validate each product has required fields
    const validProducts = availableProducts.filter(validateProduct);
    
    console.log('Product validation results:', {
      totalProducts: availableProducts.length,
      validProducts: validProducts.length,
      invalidProducts: availableProducts.length - validProducts.length
    });

    if (validProducts.length === 0) {
      throw new Error('No valid products found with required fields');
    }

    // Send user query and validated products to backend endpoint
    console.log('Sending request to backend with:', {
      query,
      productsCount: validProducts.length
    });

    const response = await api.post('/ai/product-recommendations', {
      query,
      availableProducts: validProducts
    });
    
    console.log('Received response from backend:', {
      hasAnswer: !!response.data.answer,
      recommendedProductsCount: response.data.recommendedProducts?.length || 0
    });

    return response.data;
  } catch (error: any) {
    console.error('Error getting AI recommendations:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return {
      answer: error.message || "I'm sorry, I couldn't process your request at this time. Please try again later.",
      error: error.message || 'Unknown error'
    };
  }
};

/**
 * Simple chat with AI without product recommendations
 * For general questions about products or shopping
 */
export const chatWithAI = async (query: string): Promise<AIChatResponse> => {
  try {
    const response = await api.post('/ai/chat', {
      query
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error chatting with AI:', error);
    return {
      answer: "I'm sorry, I couldn't process your request at this time. Please try again later.",
      error: error.message || 'Unknown error'
    };
  }
}; 