import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../api/products';
import { Product } from '../types';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { getProductReviews } from '../api/reviews';
import Review from '../components/Review';
import { Review as ReviewType } from '../api/reviews';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  
  const { addItemToCart } = useCart();
  const { wishlist, addItemToWishlist, removeItemFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  
  const isInWishlist = wishlist?.products?.some(p => p._id === id);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const [productData, reviewsData] = await Promise.all([
          getProductById(id),
          getProductReviews(id)
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      alert('Please sign in to add items to your cart');
      return;
    }

    try {
      await addItemToCart(product._id, quantity);
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      alert('Please sign in to manage your wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await removeItemFromWishlist(product._id);
        alert('Product removed from wishlist!');
      } else {
        await addItemToWishlist(product._id);
        alert('Product added to wishlist!');
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };

  const handleReviewUpdate = async () => {
    try {
      const updatedReviews = await getProductReviews(id!);
      setReviews(updatedReviews);
    } catch (err) {
      console.error('Error updating reviews:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error || 'Product not found'}</p>
          <Link to="/products" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Default image if none is provided
  const imageUrl = product.image && product.image.length > 0
    ? product.image[0]
    : 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="bg-white">
      <div className="pt-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <li>
              <div className="flex items-center">
                <Link to="/products" className="mr-2 text-sm font-medium text-gray-900">
                  Products
                </Link>
                <span className="text-gray-400">/</span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <Link to={`/products?type=${product.type}`} className="mr-2 text-sm font-medium text-gray-900">
                  {product.type}
                </Link>
                <span className="text-gray-400">/</span>
              </div>
            </li>
            <li className="text-sm">
              <span className="text-sm font-medium text-gray-500" aria-current="page">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* Product info */}
        <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>
            <p className="mt-2 text-gray-600">{product.brand}</p>
          </div>

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">₹{product.price.toLocaleString()}</p>

            {/* Stock status */}
            <div className="mt-6">
              <h3 className="sr-only">Stock status</h3>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="ml-2 text-sm text-gray-600">
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </p>
              </div>
            </div>

            <form className="mt-10">
              {/* Quantity */}
              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="rounded-l-md border border-gray-300 bg-gray-100 px-3 py-1 text-gray-600 hover:bg-gray-200"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="h-8 w-16 border-y border-gray-300 text-center"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={product.stock}
                    />
                    <button
                      type="button"
                      className="rounded-r-md border border-gray-300 bg-gray-100 px-3 py-1 text-gray-600 hover:bg-gray-200"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex space-x-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isAuthenticated || product.stock <= 0}
                  className={`flex w-full items-center justify-center rounded-md px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    !isAuthenticated || product.stock <= 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <ShoppingCartIcon className="mr-2 h-5 w-5" />
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={!isAuthenticated}
                  className={`flex items-center justify-center rounded-md px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    !isAuthenticated
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isInWishlist
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500'
                  }`}
                >
                  {isInWishlist ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
            {/* Product image */}
            <div className="aspect-h-4 aspect-w-3 overflow-hidden rounded-lg">
              <img
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            </div>

            {/* Description and details */}
            <div className="mt-10">
              <h3 className="text-sm font-medium text-gray-900">Details</h3>

              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-500">Category</td>
                      <td className="whitespace-nowrap py-2 pl-3 text-sm text-gray-900">{product.type}</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-500">Brand</td>
                      <td className="whitespace-nowrap py-2 pl-3 text-sm text-gray-900">{product.brand}</td>
                    </tr>
                    {product.sspecs && (
                      <>
                        {product.sspecs.processor && (
                          <tr>
                            <td className="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-500">Processor</td>
                            <td className="whitespace-nowrap py-2 pl-3 text-sm text-gray-900">{product.sspecs.processor}</td>
                          </tr>
                        )}
                        {product.sspecs.cores !== undefined && (
                          <tr>
                            <td className="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-500">Cores</td>
                            <td className="whitespace-nowrap py-2 pl-3 text-sm text-gray-900">{product.sspecs.cores}</td>
                          </tr>
                        )}
                        {product.sspecs.memory && (
                          <tr>
                            <td className="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-500">Memory</td>
                            <td className="whitespace-nowrap py-2 pl-3 text-sm text-gray-900">{product.sspecs.memory}</td>
                          </tr>
                        )}
                        {product.sspecs.storage && (
                          <tr>
                            <td className="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-500">Storage</td>
                            <td className="whitespace-nowrap py-2 pl-3 text-sm text-gray-900">{product.sspecs.storage}</td>
                          </tr>
                        )}
                        {product.sspecs.dimensions && (
                          <tr>
                            <td className="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-500">Dimensions</td>
                            <td className="whitespace-nowrap py-2 pl-3 text-sm text-gray-900">{product.sspecs.dimensions}</td>
                          </tr>
                        )}
                        {product.sspecs.weight && (
                          <tr>
                            <td className="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-500">Weight</td>
                            <td className="whitespace-nowrap py-2 pl-3 text-sm text-gray-900">{product.sspecs.weight}</td>
                          </tr>
                        )}
                        {product.sspecs.wattage !== undefined && (
                          <tr>
                            <td className="whitespace-nowrap py-2 pr-3 text-sm font-medium text-gray-500">Wattage</td>
                            <td className="whitespace-nowrap py-2 pl-3 text-sm text-gray-900">{product.sspecs.wattage}W</td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional details */}
            {product.sspecs?.additionalDetails && (
              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">Additional Details</h2>
                <div className="mt-4 space-y-6">
                  <p className="text-sm text-gray-600">{product.sspecs.additionalDetails}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <Review
          productId={product._id}
          reviews={reviews}
          onReviewUpdate={handleReviewUpdate}
        />
      </div>
    </div>
  );
};

export default ProductDetail; 