import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../api/products';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';

type ProductType = 'CPU' | 'GPU' | 'RAM' | 'Storage' | 'Motherboard' | 'Keyboard' | 'Mouse' | 'Monitor' | 'Cabinet' | 'Others';

// Define the specs object type to ensure proper typing
interface ProductSpecs {
  processor: string;
  cores: number;
  memory: string;
  storage: string;
  dimensions: string;
  weight: string;
  wattage: number;
  additionalDetails: string;
}

interface ProductFormData {
  name: string;
  description: string;
  brand: string;
  price: number;
  type: ProductType;
  category: string;
  stock: number;
  image: string[];
  sspecs: ProductSpecs;
}

const AdminProducts: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    brand: '',
    price: 0,
    type: 'CPU',
    category: '',
    stock: 0,
    image: [''],
    sspecs: {
      processor: '',
      cores: 0,
      memory: '',
      storage: '',
      dimensions: '',
      weight: '',
      wattage: 0,
      additionalDetails: ''
    }
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }

    fetchProducts();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/products');
      setProducts(response.data);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'sspecs') {
        setFormData(prev => ({
          ...prev,
          sspecs: {
            ...prev.sspecs,
            [child]: child === 'cores' || child === 'wattage' ? parseInt(value) || 0 : value
          }
        }));
      } else {
        // For any other nested properties - cast the parent safely
        setFormData(prev => {
          const updatedValue = {
            ...prev,
            [parent]: {
              // Type assertion to any for safety
              ...((prev as any)[parent] || {}),
              [child]: value
            }
          };
          return updatedValue;
        });
      }
    } else if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value as ProductType
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'stock' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    const newImages = [...formData.image];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, image: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, image: [...prev.image, ''] }));
  };

  const removeImageField = (index: number) => {
    const newImages = [...formData.image];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, image: newImages }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addProduct(formData as any);
      setShowAddForm(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      setError(error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;
    
    try {
      setLoading(true);
      await updateProduct(currentProduct._id, formData as any);
      setShowEditForm(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      setError(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await deleteProduct(productId);
        fetchProducts();
      } catch (error: any) {
        setError(error.message || 'Failed to delete product');
      } finally {
        setLoading(false);
      }
    }
  };

  const prepareEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      brand: product.brand,
      price: product.price,
      type: product.type as ProductType,
      category: product.category || '',
      stock: product.stock,
      image: Array.isArray(product.image) ? product.image : [product.image || ''],
      sspecs: {
        processor: product.sspecs?.processor || '',
        cores: product.sspecs?.cores || 0,
        memory: product.sspecs?.memory || '',
        storage: product.sspecs?.storage || '',
        dimensions: product.sspecs?.dimensions || '',
        weight: product.sspecs?.weight || '',
        wattage: product.sspecs?.wattage || 0,
        additionalDetails: product.sspecs?.additionalDetails || ''
      }
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      brand: '',
      price: 0,
      type: 'CPU',
      category: '',
      stock: 0,
      image: [''],
      sspecs: {
        processor: '',
        cores: 0,
        memory: '',
        storage: '',
        dimensions: '',
        weight: '',
        wattage: 0,
        additionalDetails: ''
      }
    });
    setCurrentProduct(null);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => fetchProducts()}
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
              Manage Products
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Add, edit, or remove products from your store.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => { setShowAddForm(true); setShowEditForm(false); resetForm(); }}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Add Product
            </button>
          </div>
        </div>

        {/* Success/error messages */}
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="mt-8 flow-root">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Image
                    </th>
                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                      Brand
                    </th>
                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                      Stock
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={product.image && product.image.length > 0 
                                ? product.image[0] 
                                : 'https://via.placeholder.com/40x40?text=No+Image'}
                              alt={product.name}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {product.brand}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {product.type}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button
                          onClick={() => prepareEditProduct(product)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add/Edit Product Form */}
        {(showAddForm || showEditForm) && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full max-h-full overflow-y-auto">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {showAddForm ? 'Add New Product' : 'Edit Product'}
                </h2>
              </div>
              <form onSubmit={showAddForm ? handleAddProduct : handleEditProduct} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price (₹) *
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                      Stock *
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="stock"
                        id="stock"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Product Type *
                    </label>
                    <div className="mt-1">
                      <select
                        id="type"
                        name="type"
                        required
                        value={formData.type}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="CPU">CPU</option>
                        <option value="GPU">GPU</option>
                        <option value="RAM">RAM</option>
                        <option value="Storage">Storage</option>
                        <option value="Motherboard">Motherboard</option>
                        <option value="Keyboard">Keyboard</option>
                        <option value="Mouse">Mouse</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Cabinet">Cabinet</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Images
                    </label>
                    <div className="mt-1">
                      {formData.image.map((img, index) => (
                        <div key={index} className="flex mb-2">
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={img}
                            onChange={(e) => handleImageChange(e, index)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeImageField(index)}
                              className="ml-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addImageField}
                        className="mt-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      >
                        Add Another Image
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-6 border-t border-gray-200 pt-5">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Specifications
                    </h3>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="sspecs.processor" className="block text-sm font-medium text-gray-700">
                      Processor
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sspecs.processor"
                        id="sspecs.processor"
                        value={formData.sspecs.processor}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="sspecs.cores" className="block text-sm font-medium text-gray-700">
                      Cores
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="sspecs.cores"
                        id="sspecs.cores"
                        value={formData.sspecs.cores}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="sspecs.memory" className="block text-sm font-medium text-gray-700">
                      Memory
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sspecs.memory"
                        id="sspecs.memory"
                        value={formData.sspecs.memory}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="sspecs.storage" className="block text-sm font-medium text-gray-700">
                      Storage
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sspecs.storage"
                        id="sspecs.storage"
                        value={formData.sspecs.storage}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="sspecs.dimensions" className="block text-sm font-medium text-gray-700">
                      Dimensions
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sspecs.dimensions"
                        id="sspecs.dimensions"
                        value={formData.sspecs.dimensions}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="sspecs.weight" className="block text-sm font-medium text-gray-700">
                      Weight
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sspecs.weight"
                        id="sspecs.weight"
                        value={formData.sspecs.weight}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="sspecs.wattage" className="block text-sm font-medium text-gray-700">
                      Wattage
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="sspecs.wattage"
                        id="sspecs.wattage"
                        value={formData.sspecs.wattage}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="sspecs.additionalDetails" className="block text-sm font-medium text-gray-700">
                      Additional Details
                    </label>
                    <div className="mt-1">
                      <textarea
                        name="sspecs.additionalDetails"
                        id="sspecs.additionalDetails"
                        rows={3}
                        value={formData.sspecs.additionalDetails}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : showAddForm ? 'Add Product' : 'Update Product'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setShowEditForm(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts; 