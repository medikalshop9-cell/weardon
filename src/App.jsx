import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { subscribeToProducts } from './store/productsSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import SellPage from './pages/SellPage';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBanners from './pages/admin/AdminBanners';

import './App.css';

function App() {
  const dispatch = useDispatch();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('weardon-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('weardon-theme', theme);
  }, [theme]);

  // Real-time Firestore listener — storefront auto-updates on any admin change
  useEffect(() => {
    const unsubscribe = subscribeToProducts(dispatch);
    return () => unsubscribe(); // Cleanup on unmount
  }, [dispatch]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="banners" element={<AdminBanners />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}

export default App;
