import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Disclosure } from '@headlessui/react';
import { MinusIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

const productTypes = [
  { value: 'CPU', label: 'CPUs' },
  { value: 'GPU', label: 'Graphics Cards' },
  { value: 'RAM', label: 'Memory' },
  { value: 'Storage', label: 'Storage' },
  { value: 'Motherboard', label: 'Motherboards' },
  { value: 'Keyboard', label: 'Keyboards' },
  { value: 'Mouse', label: 'Mice' },
  { value: 'Monitor', label: 'Monitors' },
  { value: 'Cabinet', label: 'Cabinets' },
  { value: 'Others', label: 'Other Components' },
];

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get('type') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 });
  const [selectedTypes, setSelectedTypes] = useState<string[]>(typeFilter ? [typeFilter] : []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (typeFilter && !selectedTypes.includes(typeFilter)) {
      setSelectedTypes([...selectedTypes, typeFilter]);
    }
  }, [typeFilter, selectedTypes]);

  useEffect(() => {
    let filtered = [...products];

    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(product => selectedTypes.includes(product.type));
    }

    // Filter by price range
    filtered = filtered.filter(
      product => product.price >= priceRange.min && product.price <= priceRange.max
    );

    setFilteredProducts(filtered);
  }, [products, selectedTypes, priceRange]);

  const handleTypeFilterChange = (type: string) => {
    const updatedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(updatedTypes);

    // Update URL parameters
    if (updatedTypes.length === 1) {
      searchParams.set('type', updatedTypes[0]);
    } else if (updatedTypes.length === 0) {
      searchParams.delete('type');
    } else {
      // For multiple types, we might just show the first one in URL for simplicity
      searchParams.set('type', updatedTypes[0]);
    }
    setSearchParams(searchParams);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, bound: 'min' | 'max') => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange(prev => ({ ...prev, [bound]: value }));
  };

  return (
    <div className="bg-white">
      <div>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Products</h1>

            <div className="flex items-center">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="sr-only">Filters</span>
                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pb-24 pt-6">
            <h2 id="products-heading" className="sr-only">
              Products
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              {/* Filters */}
              <div className="hidden lg:block">
                <h3 className="sr-only">Categories</h3>

                <Disclosure as="div" className="border-b border-gray-200 py-6">
                  {({ open }) => (
                    <>
                      <h3 className="-my-3 flow-root">
                        <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                          <span className="font-medium text-gray-900">Product Type</span>
                          <span className="ml-6 flex items-center">
                            {open ? (
                              <MinusIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <PlusIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                          </span>
                        </Disclosure.Button>
                      </h3>
                      <Disclosure.Panel className="pt-6">
                        <div className="space-y-4">
                          {productTypes.map((option) => (
                            <div key={option.value} className="flex items-center">
                              <input
                                id={`filter-${option.value}`}
                                name={`type-${option.value}`}
                                type="checkbox"
                                checked={selectedTypes.includes(option.value)}
                                onChange={() => handleTypeFilterChange(option.value)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label
                                htmlFor={`filter-${option.value}`}
                                className="ml-3 text-sm text-gray-600"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>

                <Disclosure as="div" className="border-b border-gray-200 py-6">
                  {({ open }) => (
                    <>
                      <h3 className="-my-3 flow-root">
                        <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                          <span className="font-medium text-gray-900">Price</span>
                          <span className="ml-6 flex items-center">
                            {open ? (
                              <MinusIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <PlusIcon className="h-5 w-5" aria-hidden="true" />
                            )}
                          </span>
                        </Disclosure.Button>
                      </h3>
                      <Disclosure.Panel className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="min-price" className="block text-sm font-medium text-gray-700">
                              Min Price (₹)
                            </label>
                            <input
                              type="number"
                              id="min-price"
                              value={priceRange.min}
                              onChange={(e) => handlePriceChange(e, 'min')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="max-price" className="block text-sm font-medium text-gray-700">
                              Max Price (₹)
                            </label>
                            <input
                              type="number"
                              id="max-price"
                              value={priceRange.max}
                              onChange={(e) => handlePriceChange(e, 'max')}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>

              {/* Product grid */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="flex h-96 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : error ? (
                  <div className="flex h-96 items-center justify-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex h-96 items-center justify-center">
                    <p className="text-gray-500">No products found matching your criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:gap-x-8">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Products; 