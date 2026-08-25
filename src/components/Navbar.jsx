import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { setSearchQuery } from '../store/productsSlice';
import { toggleCart, selectCartCount } from '../store/cartSlice';
import { SpotlightNavbar } from './ui/spotlight-navbar';
import UserDropdown from './UserDropdown';
import './Navbar.css';

function Navbar({ theme, toggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const { user, isAdmin } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const navLinks = [
    { label: 'All', to: '/' },
    { label: 'Trending', to: '/?filter=trending' },
    { label: 'New', to: '/?filter=new' },
    { label: 'Slides', to: '/?category=slides' },
    { label: 'Sandals', to: '/?category=sandals' },
    { label: 'Flip-Flops', to: '/?category=flip-flops' },
    { label: 'Luxury', to: '/?category=luxury' },
  ];

  const spotlightItems = navLinks.map(link => ({
    label: link.label,
    href: link.to
  }));

  const currentPath = location.pathname + location.search;
  const activeIndex = Math.max(0, spotlightItems.findIndex(item => item.href === currentPath));

  return (
    <nav className="navbar" id="main-navbar">
      <div className="kente-trim"></div>
      
      {/* Top Bar */}
      <div className="navbar-top">
        <div className="navbar-top-inner container">
          <span className="navbar-promo">Free delivery on orders over ₵500 🇬🇭</span>
          <div className="navbar-top-links">
            <Link to="/about">About</Link>
            <Link to="/help">Help</Link>
            <Link to="/sell">Sell</Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="navbar-main">
        <div className="navbar-main-inner container">
          {/* Mobile Menu Toggle */}
          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="navbar-logo" id="navbar-logo">
            <span className="navbar-logo-text">Weardon</span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="navbar-search-desktop">
            <FiSearch className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search for brand, style, etc."
              className="navbar-search-input"
              onChange={handleSearch}
              id="search-input-desktop"
            />
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            <button
              className="navbar-action-btn theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              className="navbar-action-btn search-mobile-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              id="search-toggle-mobile"
            >
              <FiSearch size={20} />
            </button>
            <Link to="/wishlist" className="navbar-action-btn cart-btn" aria-label="Wishlist" id="wishlist-btn">
              <FiHeart size={20} />
              {wishlistItems.length > 0 && <span className="cart-badge">{wishlistItems.length}</span>}
            </Link>
            <Link
              to="/cart"
              className="navbar-action-btn cart-btn"
              aria-label="View cart"
              id="cart-toggle-btn"
            >
              <FiShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            
            <div style={{ position: 'relative' }}>
              <button 
                className="navbar-action-btn" 
                aria-label="Account" 
                id="account-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{ color: user ? (isAdmin ? '#8b5cf6' : '#10b981') : 'inherit' }}
              >
                <FiUser size={20} />
              </button>
              <UserDropdown 
                isOpen={userDropdownOpen} 
                onClose={() => setUserDropdownOpen(false)} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="navbar-search-mobile">
          <div className="container">
            <div className="navbar-search-mobile-inner">
              <FiSearch className="navbar-search-icon" />
              <input
                type="text"
                placeholder="Search for brand, style, etc."
                className="navbar-search-input"
                onChange={handleSearch}
                autoFocus
                id="search-input-mobile"
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Nav */}
      <div className="navbar-categories">
        <div className="navbar-categories-scroll">
          <SpotlightNavbar
            items={spotlightItems}
            defaultActiveIndex={activeIndex}
            onItemClick={(item) => navigate(item.href)}
          />
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="navbar-mobile-menu-inner">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className="navbar-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="navbar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}

export default Navbar;
