import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiCheckCircle, FiMessageCircle, FiPrinter } from 'react-icons/fi';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { setUser, setAdmin } from '../store/authSlice';
import { clearCart, selectCartTotal } from '../store/cartSlice';
import { formatPrice } from '../data/products';
import './CheckoutModal.css';

export default function CheckoutModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector(state => state.cart.items);
  const total = useSelector(selectCartTotal);
  
  const DELIVERY_THRESHOLD = 500;
  const deliveryFee = total >= DELIVERY_THRESHOLD ? 0 : 30;
  const grandTotal = total + deliveryFee;

  // View states: 'auth', 'delivery', 'success'
  const [view, setView] = useState('auth');
  
  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Delivery Form State
  const [deliveryData, setDeliveryData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Order Result State
  const [orderRef, setOrderRef] = useState('');

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setView('delivery');
      } else {
        setView('auth');
      }
      setAuthError('');
      setDeliveryData({ name: '', phone: '', address: '', city: '', notes: '' });
      setOrderRef('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // ─── AUTHENTICATION HANDLER ─────────────────────────────────────────────
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        dispatch(setUser(userCred.user));
        dispatch(setAdmin(false));
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const tokenResult = await userCred.user.getIdTokenResult();
        dispatch(setUser(userCred.user));
        dispatch(setAdmin(!!tokenResult.claims.admin));
      }
      // If successful, user state changes, triggering useEffect to switch to 'delivery'
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' 
        ? 'Invalid email or password.' 
        : err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.message || 'Authentication failed.';
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── DELIVERY SUBMIT HANDLER ────────────────────────────────────────────
  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    setDeliveryLoading(true);

    // Generate a unique short order reference
    const timestampRef = Date.now().toString(36).toUpperCase().slice(-5);
    const randomRef = Math.random().toString(36).toUpperCase().slice(2, 5);
    const generatedRef = `WRD-${timestampRef}${randomRef}`;

    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        orderRef: generatedRef,
        items: cartItems,
        subtotal: total,
        deliveryFee,
        total: grandTotal,
        deliveryInfo: deliveryData,
        status: 'pending', // pending whatsapp confirmation
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      setOrderRef(generatedRef);
      setView('success');
    } catch (err) {
      console.error("Error saving order:", err);
      alert("There was an error generating your order. Please try again.");
    } finally {
      setDeliveryLoading(false);
    }
  };

  // ─── WHATSAPP INTEGRATION ───────────────────────────────────────────────
  const handleWhatsAppRedirect = () => {
    const itemsList = cartItems.map(item => `• ${item.quantity}x ${item.name} (Size: EU ${item.size})`).join('%0a');
    
    const message = `Hello Weardon! I'd like to pay for my order.%0a%0a` +
      `*Order Ref:* ${orderRef}%0a` +
      `*Recipient Name:* ${deliveryData.name}%0a` +
      `*Recipient Contact:* ${deliveryData.phone}%0a` +
      `*Delivery Address:* ${deliveryData.address}, ${deliveryData.city}%0a` +
      `*Total Amount:* ${formatPrice(grandTotal)}%0a%0a` +
      `*Items:*%0a${itemsList}%0a%0a` +
      `Please let me know how to proceed with payment.`;

    const whatsappUrl = `https://wa.me/233556008189?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear the cart since the order is placed
    dispatch(clearCart());
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal-content">
        <button className="checkout-close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>

        {view === 'auth' && (
          <div className="checkout-auth-view">
            <h2>{authMode === 'login' ? 'Login to Checkout' : 'Create an Account'}</h2>
            <p>You need an account to track your orders and speed up future checkouts.</p>
            
            {authError && <div className="checkout-error">{authError}</div>}
            
            <form onSubmit={handleAuthSubmit}>
              <div className="checkout-form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="checkout-form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
              </div>
              <button type="submit" className="checkout-btn" disabled={authLoading}>
                {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Sign Up')}
              </button>
            </form>

            <div className="checkout-auth-toggle">
              {authMode === 'login' ? (
                <p>New here? <button type="button" onClick={() => setAuthMode('signup')}>Sign Up</button></p>
              ) : (
                <p>Already have an account? <button type="button" onClick={() => setAuthMode('login')}>Login</button></p>
              )}
            </div>
          </div>
        )}

        {view === 'delivery' && (
          <div className="checkout-delivery-view">
            <h2>Delivery Details</h2>
            <p>Where should we send your order?</p>

            <form onSubmit={handleDeliverySubmit}>
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    value={deliveryData.name} 
                    onChange={(e) => setDeliveryData({...deliveryData, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="checkout-form-group">
                  <label>Phone Number (WhatsApp) *</label>
                  <input 
                    type="tel" 
                    value={deliveryData.phone} 
                    onChange={(e) => setDeliveryData({...deliveryData, phone: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label>Delivery Address *</label>
                <input 
                  type="text" 
                  value={deliveryData.address} 
                  onChange={(e) => setDeliveryData({...deliveryData, address: e.target.value})} 
                  required 
                  placeholder="Street name, House number, Landmark"
                />
              </div>

              <div className="checkout-form-group">
                <label>City / Region *</label>
                <input 
                  type="text" 
                  value={deliveryData.city} 
                  onChange={(e) => setDeliveryData({...deliveryData, city: e.target.value})} 
                  required 
                />
              </div>

              <div className="checkout-form-group">
                <label>Additional Notes (Optional)</label>
                <textarea 
                  rows="2"
                  value={deliveryData.notes} 
                  onChange={(e) => setDeliveryData({...deliveryData, notes: e.target.value})} 
                  placeholder="E.g. Call upon arrival"
                />
              </div>

              <div className="checkout-summary-mini">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery:</span>
                  <span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total to Pay:</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button type="submit" className="checkout-btn" disabled={deliveryLoading}>
                {deliveryLoading ? 'Processing...' : 'Generate Order'}
              </button>
            </form>
          </div>
        )}

        {view === 'success' && (
          <div className="checkout-success-view printable-section">
            <FiCheckCircle size={64} className="success-icon" />
            <h2>Order Generated!</h2>
            <p>Your order has been recorded. To complete your purchase, please send payment via WhatsApp.</p>
            
            <div className="order-reference-box">
              <span>Order Reference</span>
              <strong>{orderRef}</strong>
            </div>

            <div className="order-details-box">
              <div className="detail-row"><span>Name:</span> <strong>{deliveryData.name}</strong></div>
              <div className="detail-row"><span>Phone:</span> <strong>{deliveryData.phone}</strong></div>
              <div className="detail-row"><span>Address:</span> <strong>{deliveryData.address}, {deliveryData.city}</strong></div>
              <div className="detail-row"><span>Total Due:</span> <strong className="highlight">{formatPrice(grandTotal)}</strong></div>
            </div>

            <div className="success-actions no-print">
              <button className="whatsapp-btn" onClick={handleWhatsAppRedirect}>
                <FiMessageCircle size={20} /> Complete Payment on WhatsApp
              </button>
              <button className="print-btn" onClick={handlePrint}>
                <FiPrinter size={18} /> Print Order Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
