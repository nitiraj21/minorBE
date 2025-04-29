/**
 * Utility functions for handling orders
 */

/**
 * Process an order to ensure all references are properly handled
 * @param {Object} order - The order object from database
 * @returns {Object} - Processed order with all references properly handled
 */
const processOrder = (order) => {
  if (!order) return null;
  
  const processedOrder = { ...order };
  
  // Handle userId population
  if (processedOrder.userId && typeof processedOrder.userId !== 'object') {
    processedOrder.userId = { 
      _id: processedOrder.userId, 
      name: 'Unknown User', 
      email: 'No email available' 
    };
  }
  
  // Ensure products exists and is an array
  if (!processedOrder.products) {
    processedOrder.products = [];
  } else if (!Array.isArray(processedOrder.products)) {
    processedOrder.products = [];
  }
  
  // Process products array if it exists and isn't empty
  if (Array.isArray(processedOrder.products)) {
    processedOrder.products = processedOrder.products.map(product => {
      if (!product) return null;
      
      const processedProduct = { ...product };
      
      // Handle case where productId is missing or isn't an object
      if (!processedProduct.productId) {
        processedProduct.productId = { 
          _id: 'unknown',
          name: 'Unknown Product',
          brand: 'Unknown',
          price: processedProduct.price || 0,
          type: 'Others',
          stock: 0
        };
      } else if (typeof processedProduct.productId !== 'object') {
        processedProduct.productId = { 
          _id: processedProduct.productId,
          name: 'Unknown Product',
          brand: 'Unknown',
          price: processedProduct.price || 0,
          type: 'Others',
          stock: 0
        };
      }
      
      return processedProduct;
    }).filter(Boolean); // Remove null items
  }
  
  // Ensure required fields have default values if missing
  if (!processedOrder.totalAmount) processedOrder.totalAmount = 0;
  if (!processedOrder.status) processedOrder.status = 'Pending';
  if (!processedOrder.paymentStatus) processedOrder.paymentStatus = 'Pending';
  if (!processedOrder.orderDate) processedOrder.orderDate = new Date().toISOString();
  
  // Ensure shipping address is present
  if (!processedOrder.shippingAddress) {
    processedOrder.shippingAddress = {
      address: '',
      city: '',
      state: '',
      pincode: 0,
      country: ''
    };
  }
  
  return processedOrder;
};

/**
 * Process multiple orders to ensure all references are properly handled
 * @param {Array} orders - Array of order objects
 * @returns {Array} - Processed orders
 */
const processOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  
  return orders.map(processOrder).filter(Boolean);
};

/**
 * Validate order status
 * @param {string} status - Status to validate
 * @returns {boolean} - Whether status is valid
 */
const isValidOrderStatus = (status) => {
  return ['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status);
};

module.exports = {
  processOrder,
  processOrders,
  isValidOrderStatus
}; 