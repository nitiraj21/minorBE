import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
              Orion PC Hardware
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Premium PC components for gamers, professionals, and tech enthusiasts
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
              Products
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products?type=CPU"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  CPUs
                </Link>
              </li>
              <li>
                <Link
                  to="/products?type=GPU"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  GPUs
                </Link>
              </li>
              <li>
                <Link
                  to="/products?type=RAM"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Memory
                </Link>
              </li>
              <li>
                <Link
                  to="/products?type=Storage"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Storage
                </Link>
              </li>
              <li>
                <Link
                  to="/products?type=Keyboard"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Keyboards
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-border">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Made with ❤️ by Team Orion
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 