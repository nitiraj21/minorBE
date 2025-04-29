import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((open) => !open);
  };

  return (
    <header className="header shadow-sm bg-primary-color">
      <nav className="navbar flex items-center justify-between max-w-6xl mx-auto px-4 py-3">
        {/* Logo */}
        <Link to="/" className="logo text-2xl font-bold text-light-text tracking-wide no-underline">
          Orion Rigs
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 ml-auto">
          <Link to="/products" className="nav-link text-light-text hover:text-secondary-color transition">
            Products
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="nav-link relative text-light-text hover:text-secondary-color transition">
                <ShoppingCartIcon className="h-6 w-6" />
                {/* <span className="absolute -top-2 -right-2 bg-secondary-color text-primary-color rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">0</span> */}
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard" className="nav-link text-light-text hover:text-secondary-color transition">
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="nav-link text-light-text hover:text-secondary-color transition bg-transparent border-none cursor-pointer px-0"
                style={{ background: 'none' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link text-light-text hover:text-secondary-color transition">
                Login
              </Link>
              <Link to="/register" className="nav-link text-light-text hover:text-secondary-color transition">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-light-text p-2 ml-auto"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav
          className="md:hidden bg-primary-color rounded-b-lg shadow-lg mx-2 mt-1"
          role="menu"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col px-4 py-3 space-y-2">
            <Link
              to="/products"
              className="block px-3 py-2 rounded text-light-text hover:bg-secondary-color/20 transition"
              onClick={toggleMobileMenu}
            >
              Products
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="block px-3 py-2 rounded text-light-text hover:bg-secondary-color/20 transition"
                  onClick={toggleMobileMenu}
                >
                  Cart
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 rounded text-light-text hover:bg-secondary-color/20 transition"
                    onClick={toggleMobileMenu}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded text-light-text hover:bg-secondary-color/20 transition bg-transparent border-none"
                  style={{ background: 'none' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded text-light-text hover:bg-secondary-color/20 transition"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded text-light-text hover:bg-secondary-color/20 transition"
                  onClick={toggleMobileMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header; 