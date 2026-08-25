import { useSelector, useDispatch } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowLeft, FiHeart } from 'react-icons/fi';
import { toggleWishlist, clearWishlist } from '../store/wishlistSlice';
import { formatPrice } from '../data/products';
import './CartPage.css'; // Reuse CartPage styles for layout consistency

export default function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlistItems = useSelector(state => state.wishlist.items);

  if (wishlistItems.length === 0) {
    return (
      <div className="cart-empty-page container" id="wishlist-page">
        <div className="cart-empty-inner">
          <FiHeart size={64} className="cart-empty-icon" />
          <h1>Your wishlist is empty</h1>
          <p>You haven't saved any items yet. Find something you love and tap the heart icon.</p>
          <Link to="/" className="cart-empty-cta">
            Discover Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" id="wishlist-page">
      <div className="cart-page-inner container">
        {/* Header */}
        <div className="cart-header">
          <button className="cart-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} /> Back
          </button>
          <h1 className="cart-title">
            Wishlist <span className="cart-count">{wishlistItems.length}</span>
          </h1>
          <button
            className="cart-clear-btn"
            onClick={() => window.confirm('Clear your entire wishlist?') && dispatch(clearWishlist())}
          >
            Clear All
          </button>
        </div>

        <div className="cart-layout" style={{ gridTemplateColumns: '1fr' }}>
          {/* Items List */}
          <div className="cart-items" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {wishlistItems.map((item, idx) => (
              <div className="cart-item" key={item.id} style={{ flexDirection: 'column' }}>
                <Link to={`/product/${item.id}`} className="cart-item-img-wrap" style={{ width: '100%', height: '220px' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                  ) : (
                    <div className="cart-item-img-placeholder">
                      {item.name?.charAt(0)}
                    </div>
                  )}
                </Link>

                <div className="cart-item-info" style={{ width: '100%' }}>
                  <div className="cart-item-header">
                    <div>
                      <p className="cart-item-brand">Weardon</p>
                      <h3 className="cart-item-name">{item.name}</h3>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => dispatch(toggleWishlist(item))}
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="cart-item-footer" style={{ marginTop: '16px' }}>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>
                    <Link to={`/product/${item.id}`} className="cart-qty-btn" style={{ width: 'auto', padding: '0 12px', background: 'var(--border-color)', borderRadius: '6px', fontSize: '13px' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
