import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { CartItem } from '../types';

const Cart: React.FC = () => {
  const { cart, loading, error, removeItemFromCart, getCartTotal, formatPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please Sign In</h2>
          <p className="mt-2 text-gray-600">You need to be signed in to view your cart</p>
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

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>
          <div className="mt-12">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-gray-500">Looks like you haven't added any items to your cart yet.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/products')}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check each item to ensure product data is valid
  const validCartItems = cart.filter((item: CartItem) => 
    item && item.product && typeof item.product.price === 'number'
  );

  // Calculate total amount with additional check
  const totalAmount = validCartItems.reduce(
    (total: number, item: CartItem) => total + (item.product.price * item.quantity), 0
  );

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItemFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      const order = await createOrder(totalAmount, validCartItems);
      navigate('/checkout', { state: { order, cart: validCartItems } });
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-7">
            <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {validCartItems.map((item: CartItem) => (
                <li key={item.product._id} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <img
                      src={Array.isArray(item.product.image) ? item.product.image[0] : item.product.image}
                      alt={item.product.name}
                      className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                    <div>
                      <div className="flex justify-between">
                        <h4 className="text-sm">
                          <a href={`/product/${item.product._id}`} className="font-medium text-gray-700 hover:text-gray-800">
                            {item.product.name}
                          </a>
                        </h4>
                        <p className="ml-4 text-sm font-medium text-gray-900">{formatPrice(item.product.price)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>
                    </div>

                    <div className="mt-4 flex flex-1 items-end justify-between">
                      <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                      <div className="ml-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">{formatPrice(totalAmount)}</p>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-base font-medium text-gray-900">Order total</p>
                <p className="text-base font-medium text-gray-900">{formatPrice(totalAmount)}</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 