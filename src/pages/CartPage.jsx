import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartTotal
} from '../store/cartSlice';
import { formatPrice } from '../data/products';
import './CartPage.css';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.items);
  const total = useSelector(selectCartTotal);

  const DELIVERY_THRESHOLD = 500;
  const deliveryFee = total >= DELIVERY_THRESHOLD ? 0 : 30;
  const grandTotal = total + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-page container" id="cart-page">
        <div className="cart-empty-inner">
          <FiShoppingBag size={64} className="cart-empty-icon" />
          <h1>Your bag is empty</h1>
          <p>Looks like you haven't added anything yet. Browse our collection and find something you love.</p>
          <Link to="/" className="cart-empty-cta" id="cart-continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" id="cart-page">
      <div className="cart-page-inner container">
        {/* Header */}
        <div className="cart-header">
          <button className="cart-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} /> Continue Shopping
          </button>
          <h1 className="cart-title">
            My Bag <span className="cart-count">{cartItems.reduce((a, i) => a + i.quantity, 0)}</span>
          </h1>
          <button
            className="cart-clear-btn"
            onClick={() => window.confirm('Clear your entire bag?') && dispatch(clearCart())}
            id="cart-clear-btn"
          >
            Clear All
          </button>
        </div>

        <div className="cart-layout">
          {/* Items List */}
          <div className="cart-items" id="cart-items-list">
            {cartItems.map((item, idx) => (
              <div className="cart-item" key={`${item.id}-${item.size}`} id={`cart-item-${idx}`}>
                {/* Image */}
                <div className="cart-item-img-wrap">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                  ) : (
                    <div className="cart-item-img-placeholder">
                      {item.name?.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="cart-item-info">
                  <div className="cart-item-header">
                    <div>
                      <p className="cart-item-brand">Weardon</p>
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-meta">Size: EU {item.size}</p>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => dispatch(removeFromCart({ id: item.id, size: item.size }))}
                      aria-label="Remove item"
                      id={`cart-remove-${idx}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="cart-item-footer">
                    {/* Quantity */}
                    <div className="cart-qty-control">
                      <button
                        className="cart-qty-btn"
                        onClick={() => dispatch(updateQuantity({ id: item.id, size: item.size, quantity: item.quantity - 1 }))}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        id={`cart-qty-dec-${idx}`}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => dispatch(updateQuantity({ id: item.id, size: item.size, quantity: item.quantity + 1 }))}
                        aria-label="Increase quantity"
                        id={`cart-qty-inc-${idx}`}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>

                    <p className="cart-item-price">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="cart-summary" id="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>

            {/* Free delivery progress bar */}
            {total < DELIVERY_THRESHOLD && (
              <div className="cart-delivery-progress">
                <p>
                  Add <strong>{formatPrice(DELIVERY_THRESHOLD - total)}</strong> more for free delivery!
                </p>
                <div className="cart-progress-bar">
                  <div
                    className="cart-progress-fill"
                    style={{ width: `${Math.min((total / DELIVERY_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {total >= DELIVERY_THRESHOLD && (
              <div className="cart-free-delivery-badge">
                🎉 You qualify for <strong>free delivery!</strong>
              </div>
            )}

            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'cart-free' : ''}>
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button className="cart-checkout-btn" id="cart-checkout-btn">
              Proceed to Checkout
            </button>

            <div className="cart-payment-methods">
              <span>We accept</span>
              <div className="cart-payment-icons">
                <span className="cart-pay-badge">MTN MoMo</span>
                <span className="cart-pay-badge">Telecel</span>
                <span className="cart-pay-badge">AirtelTigo</span>
                <span className="cart-pay-badge">Card</span>
              </div>
            </div>

            <div className="cart-trust-strip">
              <span>🔒 Secure checkout</span>
              <span>↩ 30-day returns</span>
              <span>✓ Authenticity guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
