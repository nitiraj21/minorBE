import React, { useState, useEffect } from 'react';
import { Address } from '../types';
import { addAddress, updateAddress } from '../api/user';

interface AddressFormProps {
  address: Address | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onCancel, onSuccess }) => {
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (address) {
      setForm({
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode?.toString() || '',
        country: address.country || ''
      });
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!form.address || !form.city || !form.state || !form.pincode || !form.country) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      
      if (address && address._id) {
        // Update existing address
        await updateAddress(address._id, {
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: parseInt(form.pincode),
          country: form.country
        });
      } else {
        // Add new address
        await addAddress({
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: parseInt(form.pincode),
          country: form.country
        });
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 mb-6 rounded-md border">
      <h3 className="text-lg font-medium mb-4">
        {address ? 'Edit Address' : 'Add New Address'}
      </h3>
      
      {error && (
        <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={form.address}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="number"
              id="pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm; 