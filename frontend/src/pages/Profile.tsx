import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, updatePassword, deleteAddress as apiDeleteAddress } from '../api/user';
import { getUserOrders } from '../api/orders';
import { User, Order, Address } from '../types';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  MapPinIcon, 
  LockClosedIcon, 
  ChevronRightIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import AddressForm from '../components/AddressForm';
import OrderItem from '../components/OrderItem';

type Tab = 'profile' | 'orders' | 'addresses' | 'security';

const Profile: React.FC = () => {
  const { isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchUserData();
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      setUser(userData);
      setProfileForm({
        name: userData.name || '',
        email: userData.email || ''
      });

      if (activeTab === 'orders') {
        const ordersData = await getUserOrders();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getUserOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(profileForm);
      setUser(updatedUser);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showNotification('Password updated successfully', 'success');
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification('Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setLoading(true);
      await apiDeleteAddress(addressId);
      fetchUserData();
      showNotification('Address deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting address:', error);
      showNotification('Failed to delete address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      
      {notification.message && (
        <div className={`mb-4 p-3 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-1/4">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-medium">Account Settings</h2>
            </div>
            <ul>
              <li>
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`flex items-center w-full p-3 hover:bg-gray-50 ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>Profile Information</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('orders')}
                  className={`flex items-center w-full p-3 hover:bg-gray-50 ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  <span>Orders & Tracking</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('addresses')}
                  className={`flex items-center w-full p-3 hover:bg-gray-50 ${activeTab === 'addresses' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>Addresses</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('security')}
                  className={`flex items-center w-full p-3 hover:bg-gray-50 ${activeTab === 'security' ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  <span>Security</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <form onSubmit={handleProfileSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}
            
            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Orders & Tracking</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <TruckIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <OrderItem key={order._id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">My Addresses</h2>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                  >
                    Add New Address
                  </button>
                </div>
                
                {showAddressForm && (
                  <AddressForm
                    address={editingAddress}
                    onCancel={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    onSuccess={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                      fetchUserData();
                      showNotification(
                        editingAddress ? 'Address updated successfully' : 'Address added successfully',
                        'success'
                      );
                    }}
                  />
                )}
                
                {user?.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {user.addresses.map((address, index) => {
                      const addressWithId = address as Address;
                      return (
                        <div key={addressWithId._id || index} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{addressWithId.address}</p>
                              <p className="text-gray-600">{addressWithId.city}, {addressWithId.state}, {addressWithId.pincode}</p>
                              <p className="text-gray-600">{addressWithId.country}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingAddress(addressWithId);
                                  setShowAddressForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (addressWithId._id) {
                                    handleDeleteAddress(addressWithId._id);
                                  } else {
                                    showNotification('Cannot delete address without ID', 'error');
                                  }
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPinIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">You haven't added any addresses yet.</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                    >
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Security */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Password & Security</h2>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 