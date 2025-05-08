import React, { useState } from 'react';
import { Order, TrackingEvent } from '../types';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon, TruckIcon } from '@heroicons/react/24/outline';
import { getTrackingInfo, cancelOrder } from '../api/orders';

interface OrderItemProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const toggleExpand = async () => {
    setExpanded(!expanded);
    
    if (!expanded && !trackingInfo && order.trackingHistory) {
      try {
        setLoading(true);
        const info = await getTrackingInfo(order._id);
        setTrackingInfo(info.trackingHistory);
      } catch (error) {
        console.error('Error fetching tracking info:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setCancelling(true);
      await cancelOrder(order._id);
      window.location.reload(); // Refresh the page to show updated order status
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      {/* Order header */}
      <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center">
            <h3 className="font-medium">Order #{order._id.substring(order._id.length - 8)}</h3>
            <span className={`ml-3 text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.orderDate)}</p>
        </div>
        <div className="mt-2 md:mt-0 flex items-center space-x-4">
          <span className="font-medium">₹{order.totalAmount.toLocaleString()}</span>
          <button
            onClick={toggleExpand}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            {expanded ? (
              <>
                <ChevronUpIcon className="h-5 w-5 mr-1" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-5 w-5 mr-1" />
                <span>View Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="p-4 bg-gray-50">
          {/* Products */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Products</h4>
            <div className="space-y-3">
              {order.products.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={
                        item.productId.image && 
                        (typeof item.productId.image === 'string' 
                          ? item.productId.image 
                          : item.productId.image[0])
                      }
                      alt={item.productId.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <Link to={`/products/${item.productId._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      {item.productId.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.productId.brand} &middot; Qty: {item.quantity} &middot; ₹{item.price.toLocaleString()} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-600">
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No shipping address available</p>
            )}
          </div>

          {/* Tracking Information */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Tracking Information</h4>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading tracking information...</p>
              </div>
            ) : order.trackingId ? (
              <div className="text-sm">
                <p>
                  <span className="font-medium">Tracking ID:</span> {order.trackingId}
                </p>
                {order.courierName && (
                  <p>
                    <span className="font-medium">Courier:</span> {order.courierName}
                  </p>
                )}
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center mt-1"
                  >
                    <TruckIcon className="h-4 w-4 mr-1" />
                    Track Package
                  </a>
                )}

                {/* Tracking History */}
                {trackingInfo && trackingInfo.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-xs font-medium uppercase text-gray-500 mb-2">Tracking History</h5>
                    <div className="space-y-3">
                      {trackingInfo.map((event, index) => (
                        <div key={index} className="relative pl-6 pb-3 border-l border-gray-200">
                          <div className="absolute left-0 top-0 -ml-1.5 h-3 w-3 rounded-full bg-blue-500"></div>
                          <p className="text-xs font-medium">{event.status}</p>
                          <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                          {event.note && <p className="text-xs text-gray-600 mt-1">{event.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {order.status === 'Cancelled' 
                  ? 'This order has been cancelled.' 
                  : order.status === 'Delivered'
                    ? 'This order has been delivered.'
                    : 'Tracking information will be available once the order ships.'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 border-t pt-4">
            {order.status === 'Pending' && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItem; 