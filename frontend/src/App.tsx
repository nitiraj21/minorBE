import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/Header';
import AIAssistant from './components/AIAssistant';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import AdminLogin from './pages/AdminLogin';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminDashboard from './pages/AdminDashboard';
import './cyberpunk-theme.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="main-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mt-2 mb-12">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/register" element={<AdminRegister />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                </Routes>
              </main>
              <AIAssistant />
              <footer className="footer">
                <div className="footer-container">
                  <div className='flex flex-row justify-between'>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Orion Rigs</h3>
                      <p className="text-sm text-gray-300">Premium PC builds for gamers, professionals, and tech enthusiasts</p>
                    </div>
                    <div >
                      <h3 className="footer-title">Products</h3>
                      <ul className="mt-4 space-y-2">
                        <span><a href="/products?type=CPU" className="footer-link">CPUs</a></span>
                        <span><a href="/products?type=GPU" className="footer-link">GPUs</a></span>
                        <span><a href="/products?type=RAM" className="footer-link">Memory</a></span>
                        <span><a href="/products?type=Storage" className="footer-link">Storage</a></span>
                        <span><a href="/products?type=Keyboard" className="footer-link">Keyboards</a></span>
                      </ul>
                    </div>

                  </div>
                  <div className="footer-bottom">
                    <p> Made with ❤️ by Team Orion</p>
                  </div>
                </div>
              </footer>
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
