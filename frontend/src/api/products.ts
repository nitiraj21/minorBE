import api from './axios';
import { Product } from '../types';

/**
 * Fetch all products
 */
export const getProducts = async (isAdmin: boolean = false): Promise<Product[]> => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch only available products (with stock > 0)
 */
export const getAvailableProducts = async (): Promise<Product[]> => {
  try {
    const products = await getProducts();
    return products.filter(product => product.stock > 0);
  } catch (error) {
    console.error('Error fetching available products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

/**
 * Search products based on a query string
 * This helps the AI assistant find relevant products
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // Get all available products first
    const availableProducts = await getAvailableProducts();
    
    // If no query, return all available products
    if (!query.trim()) return availableProducts;
    
    // Convert the query to lowercase for case-insensitive matching
    const queryLower = query.toLowerCase();
    
    // Filter products based on the query string matching name, type, brand, or additional details
    return availableProducts.filter(product => {
      return (
        product.name.toLowerCase().includes(queryLower) ||
        product.type.toLowerCase().includes(queryLower) ||
        product.brand.toLowerCase().includes(queryLower) ||
        (product.sspecs?.additionalDetails && 
         product.sspecs.additionalDetails.toLowerCase().includes(queryLower))
      );
    });
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Admin functions
export const addProduct = async (productData: Omit<Product, '_id'>) => {
  try {
    const response = await api.post('/admin/add-product', productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  try {
    const response = await api.put(`/admin/update-product/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const response = await api.delete(`/admin/delete-product/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 