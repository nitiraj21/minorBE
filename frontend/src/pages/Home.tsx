import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const categoryItems = [
  { name: 'CPUs', type: 'CPU', image: 'https://fdn.gsmarena.com/imgroot/news/25/01/amd-ces-2025/inline/-1200/gsmarena_001.jpg' },
  { name: 'GPUs', type: 'GPU', image: 'https://www.techinside.com/wp-content/uploads/2024/10/48f80034e5eafa799eda424978faa9fb1d1be0c2-768x432.jpeg' },
  { name: 'RAM', type: 'RAM', image: 'https://image.made-in-china.com/2f0j00mYpkDITRJUcJ/Corsair-Vengeance-RGB-RS-32GB-4-X-8GB-288-Pin-PC-RAM-DDR4-3600-PC4-28800-Intel-Xmp-2-0-Desktop-Memory.webp' },
  { name: 'Storage', type: 'Storage', image: 'https://www.loyalparts.com/wp-content/uploads/2020/04/AORUS-256GB-RGB-M.2-NVMe-SSD-LOYALPARTS.png' },
  { name: 'Motherboards', type: 'Motherboard', image: 'https://dlcdnwebimgs.asus.com/gain/F88C5852-B527-4022-8817-E2ECEB1251D1/w750/h470' },
  { name: 'Peripherals', type: 'Keyboard', image: 'https://itgadgetsonline.com/wp-content/uploads/2023/12/Razer-BlackWidow-V4-X-Mechanical-Yellow-Switches-Gaming-Keyboard-2-1.webp' },
];

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = await getProducts();
        // Get random 4 products for featured section
        const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 4);
        setFeaturedProducts(randomProducts);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className=" text-cyan-300">
      {/* Hero section */}
      <div className="relative" >
        {/* Decorative image and overlay */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1626218174358-7769486c4b79?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nJTIwcGN8ZW58MHx8MHx8fDA%3D"
            alt="PC"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-black opacity-50" />

        <div className="relative mx-auto max-w-3xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white glow sm:text-5xl md:text-6xl">
              <span className="glitch-effect" data-text="ORION RIGS">ORION RIGS</span>
            </h1>
            <p className="mt-4 text-xl text-white">
              Premium PC Parts for gamers, professionals, and tech enthusiasts
            </p>
            <Link
              to="/products"
              className="mt-8 inline-block rounded-md border border-cyan-500 px-8 py-3 text-base font-medium text-white hover:border-cyan-400 hover:text-cyan-100 cyberpunk-button"
            >
              EXPLORE BUILDS
            </Link>
          </div>
        </div>
      </div>

      {/* Category section */}
      <div className="bg-gray-800 cyber-angle hex-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
            <h2 className="text-2xl font-bold text-cyan-400 glow">SYSTEM COMPONENTS</h2>

            <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12 lg:space-y-0">
              {categoryItems.map((category) => (
                <div key={category.name} className="group relative cyberpunk-card">
                  <div className="relative h-80 w-full overflow-hidden rounded-lg bg-gray-900 sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 group-hover:opacity-75 sm:h-64">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  </div>
                  <h3 className="mt-6 text-sm text-cyan-300">
                    <Link to={`/products?type=${category.type}`}>
                      <span className="absolute inset-0" />
                      {category.name}
                    </Link>
                  </h3>
                  <p className="text-base font-semibold text-cyan-400 glow">UPGRADE {category.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured products section */}
      <div className="bg-gray-900">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-cyan-400 glow">FEATURED HARDWARE</h2>
          
          {loading ? (
            <div className="mt-8 flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <p className="mt-8 text-center text-pink-500">{error}</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 glow-pink"
            >
              Browse all products <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cyberpunk terminal section */}
    </div>
  );
};

export default Home; 