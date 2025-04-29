import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../api/orders';
import { Order } from '../types';
import { ChevronDownIcon, ChevronUpIcon, MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';

const AdminOrders: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, navigate, retryCount]);

  useEffect(() => {
    // Clear success message after 3 seconds
    if (deleteSuccess) {
      const timer = setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching orders for admin...");
      const data = await getAllOrders();
      console.log("Orders data received:", data);
      
      // Handle case where data might not be an array
      if (!Array.isArray(data)) {
        console.error("Orders data is not an array:", data);
        setOrders([]);
        setError("Received invalid data format from server. Please try again.");
        return;
      }
      
      setOrders(data);
      
      // Initialize selected status for each order
      const statusMap: Record<string, string> = {};
      data.forEach((order: Order) => {
        statusMap[order._id] = order.status;
      });
      setSelectedStatus(statusMap);
    } catch (error: any) {
      console.error("Error in fetchOrders:", error);
      // Create a user-friendly error message
      let errorMessage = "Failed to fetch orders.";
      if (error.response) {
        if (error.response.status === 500) {
          errorMessage += " Server encountered an error. Please try again later.";
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage += " Authentication error. Please log in again.";
          // Redirect to login after a brief delay
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else if (error.request) {
        errorMessage += " No response from server. Please check your connection.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId: string, status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled') => {
    setSelectedStatus(prev => ({
      ...prev,
      [orderId]: status
    }));
  };

  const handleUpdateStatus = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      setError(null);
      const status = selectedStatus[orderId] as 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
      
      console.log(`Updating order ${orderId} status to ${status}`);
      const updatedOrder = await updateOrderStatus(orderId, status);
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status } : order
        )
      );
      
      console.log("Order updated successfully:", updatedOrder);
    } catch (error: any) {
      console.error("Error updating order:", error);
      let errorMessage = `Failed to update order status.`;
      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMessage += ` ${error.response.data.error}`;
        } else if (error.response.status === 404) {
          errorMessage += " Order not found.";
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage += " Authentication error. Please log in again.";
        }
      }
      setError(errorMessage);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deletingOrderId) return;
    
    try {
      setError(null);
      console.log(`Attempting to delete order ${deletingOrderId}`);
      
      // Show loading indicator
      setUpdatingOrderId(deletingOrderId);
      
      await deleteOrder(deletingOrderId);
      
      // Remove the order from local state
      setOrders(prevOrders => prevOrders.filter(order => order._id !== deletingOrderId));
      
      // Show success message
      setDeleteSuccess(`Order #${deletingOrderId.substring(0, 8)} has been successfully deleted`);
      
      // Reset state
      setDeletingOrderId(null);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error("Error deleting order:", error);
      
      let errorMessage = `Failed to delete order.`;
      
      if (error.response) {
        // Server responded with an error
        if (error.response.status === 400) {
          errorMessage = `Cannot delete this order. ${error.response.data?.error || 'Only Delivered or Cancelled orders can be deleted.'}`;
        } else if (error.response.status === 404) {
          errorMessage = `Order not found. It may have been already deleted.`;
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = `Authentication error. Please log in again.`;
          // Redirect to login after a brief delay
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (error.response.data && error.response.data.error) {
          errorMessage += ` ${error.response.data.error}`;
        }
      } else if (error.request) {
        // Request was made but no response
        errorMessage = `Server did not respond. Please check your connection and try again.`;
      } else {
        // Error in setting up the request
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      setDeletingOrderId(null);
      setShowDeleteConfirm(false);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openDeleteConfirm = (orderId: string) => {
    setDeletingOrderId(orderId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setDeletingOrderId(null);
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get user name with fallback
  const getUserName = (order: Order) => {
    if (order.userId && typeof order.userId === 'object') {
      return (order.userId as any).name || 'Unknown User';
    }
    return 'Unknown User';
  };

  // Get user email with fallback
  const getUserEmail = (order: Order) => {
    if (order.userId && typeof order.userId === 'object') {
      return (order.userId as any).email || 'No email available';
    }
    return 'No email available';
  };

  // Format shipping address for display
  const formatShippingAddress = (order: Order) => {
    if (!order.shippingAddress) return 'No shipping address provided';
    
    const address = order.shippingAddress;
    const parts = [];
    
    if (address.address) parts.push(address.address);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode.toString());
    if (address.country) parts.push(address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'No shipping address provided';
  };

  // Toggle expanded order details
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Determine if order is deletable (only Delivered or Cancelled orders)
  const canDeleteOrder = (status: string) => {
    return status === 'Delivered' || status === 'Cancelled';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="mt-4 inline-block rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Manage Orders
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              View shipping addresses, update status, and manage customer orders.
            </p>
          </div>
        </div>

        {/* Success/error messages */}
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success message for deletion */}
        {deleteSuccess && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{deleteSuccess}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setDeleteSuccess(null)}
                    className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Order Deletion</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete this order? This action cannot be undone and all order data will be permanently removed.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No orders found</p>
                  <button
                    onClick={() => setRetryCount(prev => prev + 1)}
                    className="mt-4 inline-block rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Order ID
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Customer
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                        <th scope="col" className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Shipping Address
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Items
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Total
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {orders.map((order) => (
                        <React.Fragment key={order._id}>
                          <tr className={`${expandedOrderId === order._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              <button
                                onClick={() => toggleOrderDetails(order._id)}
                                className="flex items-center focus:outline-none"
                              >
                                {expandedOrderId === order._id ? (
                                  <ChevronUpIcon className="h-4 w-4 mr-1 text-gray-500" />
                                ) : (
                                  <ChevronDownIcon className="h-4 w-4 mr-1 text-gray-500" />
                                )}
                                {order._id.substring(0, 8)}...
                              </button>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <div className="font-medium text-gray-900">{getUserName(order)}</div>
                              <div className="text-gray-500 text-xs">{getUserEmail(order)}</div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatDate(order.orderDate)}
                            </td>
                            <td className="hidden md:table-cell px-3 py-4 text-sm text-gray-500">
                              <div className="flex items-start max-w-xs overflow-hidden">
                                <MapPinIcon className="h-4 w-4 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                                <p className="truncate">{formatShippingAddress(order)}</p>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {order.products.length} {order.products.length === 1 ? 'item' : 'items'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                              ₹{order.totalAmount.toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex items-center space-x-2">
                                <select
                                  value={selectedStatus[order._id]}
                                  onChange={(e) => handleStatusChange(order._id, e.target.value as 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled')}
                                  className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500"
                                  disabled={updatingOrderId === order._id}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => handleUpdateStatus(order._id)}
                                  className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium text-white shadow-sm focus:outline-none ${
                                    updatingOrderId === order._id
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : selectedStatus[order._id] === order.status
                                      ? 'bg-gray-300 cursor-not-allowed'
                                      : 'bg-blue-600 hover:bg-blue-500'
                                  }`}
                                  disabled={updatingOrderId === order._id || selectedStatus[order._id] === order.status}
                                >
                                  {updatingOrderId === order._id ? 'Updating...' : 'Update'}
                                </button>
                                {canDeleteOrder(order.status) && (
                                  <button
                                    onClick={() => openDeleteConfirm(order._id)}
                                    className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-500 focus:outline-none"
                                    title="Delete order"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded order details with shipping address */}
                          {expandedOrderId === order._id && (
                            <tr>
                              <td colSpan={8} className="px-4 py-4 sm:px-6">
                                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Customer information */}
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                        <p className="text-sm"><span className="font-medium">Name:</span> {getUserName(order)}</p>
                                        <p className="text-sm"><span className="font-medium">Email:</span> {getUserEmail(order)}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Shipping address details */}
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
                                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                        {order.shippingAddress ? (
                                          <>
                                            <p className="text-sm"><span className="font-medium">Address:</span> {order.shippingAddress.address || 'Not provided'}</p>
                                            <p className="text-sm"><span className="font-medium">City:</span> {order.shippingAddress.city || 'Not provided'}</p>
                                            <p className="text-sm"><span className="font-medium">State:</span> {order.shippingAddress.state || 'Not provided'}</p>
                                            <p className="text-sm"><span className="font-medium">Pincode:</span> {order.shippingAddress.pincode || 'Not provided'}</p>
                                            <p className="text-sm"><span className="font-medium">Country:</span> {order.shippingAddress.country || 'Not provided'}</p>
                                          </>
                                        ) : (
                                          <p className="text-sm text-red-500">No shipping address provided</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Order items */}
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200 bg-white">
                                        {order.products.map((product, index) => (
                                          <tr key={index}>
                                            <td className="px-3 py-2 text-sm">
                                              {typeof product.productId === 'object' ? 
                                                (product.productId as any).name || 'Unknown Product' : 
                                                'Unknown Product'
                                              }
                                            </td>
                                            <td className="px-3 py-2 text-sm">{product.quantity}</td>
                                            <td className="px-3 py-2 text-sm">₹{product.price.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-sm">₹{(product.price * product.quantity).toLocaleString()}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot className="bg-gray-50">
                                        <tr>
                                          <td colSpan={3} className="px-3 py-2 text-sm font-medium text-right">Total:</td>
                                          <td className="px-3 py-2 text-sm font-medium">₹{order.totalAmount.toLocaleString()}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                  
                                  {/* Payment and shipping information */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Information</h4>
                                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                        <p className="text-sm"><span className="font-medium">Payment Status:</span> {order.paymentStatus}</p>
                                        {order.razorpayPaymentId && (
                                          <p className="text-sm"><span className="font-medium">Payment ID:</span> {order.razorpayPaymentId}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Information</h4>
                                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                        <p className="text-sm"><span className="font-medium">Order Date:</span> {formatDate(order.orderDate)}</p>
                                        <p className="text-sm"><span className="font-medium">Order Status:</span> {order.status}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Delete button in expanded view */}
                                  {canDeleteOrder(order.status) && (
                                    <div className="mt-4 flex justify-end">
                                      <button
                                        onClick={() => openDeleteConfirm(order._id)}
                                        className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 focus:outline-none"
                                      >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        Delete Order
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders; 