import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WishlistItem, Product } from '../types';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../api/wishlist';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: WishlistItem | null;
  loading: boolean;
  error: string | null;
  addItemToWishlist: (productId: string) => Promise<void>;
  removeItemFromWishlist: (productId: string) => Promise<void>;
  clearAllWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist(null);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      setWishlist(data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const addItemToWishlist = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await addToWishlist(productId);
      setWishlist(data.wishlist);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to add item to wishlist');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromWishlist = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await removeFromWishlist(productId);
      setWishlist(data.wishlist);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to remove item from wishlist');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearAllWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      await clearWishlist();
      setWishlist(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to clear wishlist');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        addItemToWishlist,
        removeItemFromWishlist,
        clearAllWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 