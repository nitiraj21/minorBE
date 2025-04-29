import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItemToCart } = useCart();
  const { wishlist, addItemToWishlist, removeItemFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const isInWishlist = wishlist?.products?.some(p => p._id === product._id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please sign in to add items to your cart');
      return;
    }

    try {
      await addItemToCart(product._id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please sign in to add items to your wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await removeItemFromWishlist(product._id);
      } else {
        await addItemToWishlist(product._id);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };

  // Default image if none is provided
  const imageUrl = product.image && product.image.length > 0
    ? product.image[0]
    : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="card group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-48">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center lg:h-full lg:w-full"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            <Link to={`/products/${product._id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
          <p className="mt-1 text-sm text-gray-500">{product.type}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">₹{product.price.toLocaleString()}</p>
      </div>
      
      <div className="mt-4 flex justify-between">
        <div className="text-sm text-gray-700">
          {product.stock > 0 ? (
            <span className="text-green-600">In Stock ({product.stock})</span>
          ) : (
            <span className="text-red-600">Out of Stock</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleWishlistToggle}
            className="p-1 text-gray-400 hover:text-red-500 focus:outline-none"
            disabled={!isAuthenticated}
          >
            {isInWishlist ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={handleAddToCart}
            className="p-1 text-gray-400 hover:text-blue-500 focus:outline-none"
            disabled={!isAuthenticated || product.stock <= 0}
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 