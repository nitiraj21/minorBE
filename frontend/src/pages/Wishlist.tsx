import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const Wishlist: React.FC = () => {
  const { wishlist, loading, error, removeItemFromWishlist } = useWishlist();
  const { addItemToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please Sign In</h2>
          <p className="mt-2 text-gray-600">You need to be signed in to view your wishlist</p>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-block rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Wishlist</h1>
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <div className="lg:col-span-7">
              <div className="mt-10 flex justify-center">
                <div className="text-center">
                  <h2 className="text-lg font-medium text-gray-900">Your wishlist is empty</h2>
                  <p className="mt-2 text-gray-500">
                    Looks like you haven't added any items to your wishlist yet.
                  </p>
                  <Link
                    to="/products"
                    className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItemFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addItemToCart(productId, 1);
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Wishlist</h1>
        <div className="mt-12">
          <div className="flow-root">
            <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {wishlist.products.map((product) => (
                <li key={product._id} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <img
                      src={product.image && product.image.length > 0 
                        ? product.image[0] 
                        : 'https://via.placeholder.com/128x128?text=No+Image'}
                      alt={product.name}
                      className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link to={`/products/${product._id}`} className="font-medium text-gray-700 hover:text-gray-800">
                              {product.name}
                            </Link>
                          </h3>
                        </div>
                        <div className="mt-1 flex text-sm">
                          <p className="text-gray-500">{product.brand}</p>
                          <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">{product.type}</p>
                        </div>
                        <p className="mt-1 text-sm font-medium text-gray-900">₹{product.price.toLocaleString()}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="absolute right-0 top-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(product._id)}
                            className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Remove</span>
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                      <p className="flex space-x-2 text-sm text-gray-700">
                        <span>
                          {product.stock > 0 ? (
                            <span className="text-green-500">In stock</span>
                          ) : (
                            <span className="text-red-500">Out of stock</span>
                          )}
                        </span>
                      </p>
                      {product.stock > 0 && (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product._id)}
                          className="ml-4 flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          <ShoppingCartIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 