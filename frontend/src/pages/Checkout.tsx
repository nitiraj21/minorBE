import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShippingAddress, OrderItem, Order } from '../types';
import { createOrder, completeOrder } from '../api/payment';
import { getUserProfile } from '../api/user';

interface LocationState {
  order: Order;
  cart: OrderItem[];
}

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    state: '',
    pincode: 0,
    country: 'India',
  });
  const [error, setError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod] = useState('COD');

  const locationState = location.state as LocationState;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!locationState?.order || !locationState?.cart) {
      navigate('/cart');
      return;
    }

    setOrder(locationState.order);
    fetchUserAddresses();
  }, [isAuthenticated, navigate, locationState]);

  const fetchUserAddresses = async () => {
    try {
      const userData = await getUserProfile();
      
      if (userData?.addresses && userData.addresses.length > 0) {
        setAddresses(userData.addresses);
        setSelectedAddress(userData.addresses[0]);
      } else {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Failed to fetch user addresses:', error);
      setError('Failed to load your saved addresses. Please try again.');
      setShowAddressForm(true);
    }
  };

  const handleSelectAddress = (address: ShippingAddress) => {
    setSelectedAddress(address);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: name === 'pincode' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddAddress = () => {
    if (
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode ||
      !newAddress.country
    ) {
      setError('Please fill in all address fields');
      return;
    }

    setAddresses(prev => [...prev, newAddress]);
    setSelectedAddress(newAddress);
    setShowAddressForm(false);
    setError(null);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }

    if (!order) {
      setError('Order information is missing');
      return;
    }

    try {
      setProcessingPayment(true);
      setError(null);
      
      const response = await completeOrder({
        orderId: order._id,
        amount: order.totalAmount,
        shippingAddress: selectedAddress,
        items: locationState.cart,
        paymentMethod: 'COD',
      });

      if (response.success) {
        setOrder(response.purchase);
        setOrderConfirmed(true);
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Order placement failed:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
          <p className="mt-2 text-gray-600">Please return to your cart and try again.</p>
          <button
            onClick={() => navigate('/cart')}
            className="mt-4 inline-block rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  if (orderConfirmed) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Order Confirmed!
            </h1>
            <p className="mt-4 text-base text-gray-500">
              Your order has been confirmed and will be shipping soon.
            </p>
            <p className="mt-2 text-base font-medium text-gray-900">
              Order number: {order._id}
            </p>
          </div>

          <div className="mt-16">
            <h2 className="text-lg font-medium text-gray-900">Order details</h2>

            <div className="mt-6 rounded-lg border border-gray-200">
              <ul role="list" className="divide-y divide-gray-200">
                {order.products?.map((item) => {
                  if (!item?.productId) return null;
                  
                  const product = item.productId;
                  
                  let imageUrl = 'https://via.placeholder.com/80x80?text=No+Image';
                  if (product.image) {
                    if (typeof product.image === 'string') {
                      imageUrl = product.image;
                    } else if (Array.isArray(product.image) && product.image.length > 0) {
                      imageUrl = product.image[0];
                    }
                  }

                  return (
                    <li key={product._id} className="flex py-6 px-4 sm:px-6">
                      <div className="flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={product.name || 'Product image'}
                          className="h-20 w-20 rounded-md object-cover object-center"
                        />
                      </div>
                      <div className="ml-6 flex flex-1 flex-col">
                        <div className="flex">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm">
                              <Link to={`/products/${product._id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                {product.name}
                              </Link>
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">Brand: {product.brand}</p>
                          </div>
                          <div className="ml-4 flex-shrink-0 flow-root">
                            <p className="text-sm font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                            <p className="mt-1 text-sm text-gray-500">x {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">₹{order.totalAmount.toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">Shipping</dt>
                  <dd className="text-sm font-medium text-gray-900">₹0.00</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <dt className="text-base font-medium">Total</dt>
                  <dd className="text-base font-medium text-gray-900">₹{order.totalAmount.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
              {selectedAddress && (
                <>
                  <p className="text-sm text-gray-900">{selectedAddress.address}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{selectedAddress.country}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-16">
            <Link
              to="/orders"
              className="inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
          
          {!showAddressForm ? (
            <div className="mt-4">
              {addresses.length > 0 && (
                <div className="space-y-4">
                  {addresses.map((address, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border p-4 cursor-pointer ${
                        selectedAddress === address ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleSelectAddress(address)}
                    >
                      <p className="text-sm text-gray-900">{address.address}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {address.city}, {address.state} {address.pincode}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{address.country}</p>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="mt-4 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Add New Address
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Street address
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={newAddress.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={newAddress.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  value={newAddress.state}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal code
                </label>
                <input
                  type="number"
                  name="pincode"
                  id="pincode"
                  value={newAddress.pincode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  name="country"
                  id="country"
                  value={newAddress.country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="India">India</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Save Address
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
          <div className="mt-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">Cash on Delivery (COD)</p>
              <p className="mt-1 text-sm text-gray-500">Pay when you receive your order</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          <div className="mt-4 rounded-lg border border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {locationState.cart?.map((item) => {
                if (!item?.productId) return null;
                
                const productImage = typeof item.productId.image === 'string' 
                  ? item.productId.image 
                  : Array.isArray(item.productId.image) && item.productId.image.length > 0
                    ? item.productId.image[0]
                    : 'https://via.placeholder.com/80x80?text=No+Image';

                return (
                  <li key={item.productId._id} className="flex py-6 px-4 sm:px-6">
                    <div className="flex-shrink-0">
                      <img
                        src={productImage}
                        alt={item.productId.name || 'Product image'}
                        className="h-20 w-20 rounded-md object-cover object-center"
                      />
                    </div>
                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm">
                            <Link to={`/products/${item.productId._id}`} className="font-medium text-gray-700 hover:text-gray-800">
                              {item.productId.name || 'Unnamed Product'}
                            </Link>
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">Brand: {item.productId.brand || 'Unknown'}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flow-root">
                          <p className="text-sm font-medium text-gray-900">₹{item.productId.price?.toLocaleString() || '0'}</p>
                          <p className="mt-1 text-sm text-gray-500">x {item.quantity || 0}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <dt className="text-sm">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">₹{order.totalAmount.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <dt className="text-base font-medium">Total</dt>
                <dd className="text-base font-medium text-gray-900">₹{order.totalAmount.toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={processingPayment || !selectedAddress}
            className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:opacity-50"
          >
            {processingPayment ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 