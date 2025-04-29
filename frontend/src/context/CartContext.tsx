import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import { addToCart as addToCartAPI, removeFromCart, getCart } from '../api/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  addItemToCart: (productId: string, quantity: number) => Promise<void>;
  removeItemFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  getCartTotal: () => number;
  formatPrice: (price: number) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      if (data.items) {
        setCart(data.items.map((item: any) => ({
          product: item.productId,
          quantity: item.quantity
        })));
      } else {
        setCart([]);
      }
    } catch (err) {
      setError('Failed to fetch cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItemToCart = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      await addToCartAPI(productId, quantity);
      await fetchCart();
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Error adding to cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromCart = async (productId: string) => {
    try {
      setLoading(true);
      await removeFromCart(productId);
      await fetchCart();
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Error removing from cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (Math.round(item.product.price) * item.quantity), 0);
  };

  const formatPrice = (price: number): string => {
    return `₹${Math.round(price).toLocaleString('en-IN')}`;
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      error,
      addItemToCart,
      removeItemFromCart,
      clearCart,
      getCartTotal,
      formatPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 