import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { setUser, setAdmin, clearAuth } from '../store/authSlice';
import './UserDropdown.css';

export default function UserDropdown({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAdmin } = useSelector((state) => state.auth);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setMode('login');
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let authError = false;

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        dispatch(setUser(userCredential.user));
        dispatch(setAdmin(false));
      } else if (mode === 'login' || mode === 'admin') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const tokenResult = await userCredential.user.getIdTokenResult();
        
        if (mode === 'admin') {
          if (tokenResult.claims.admin) {
            dispatch(setUser(userCredential.user));
            dispatch(setAdmin(true));
            // Navigate admin to dashboard after successful login
            navigate('/admin');
          } else {
            await signOut(auth);
            setError('Access denied. Admin privileges required.');
            authError = true;
          }
        } else {
          // Regular user login
          dispatch(setUser(userCredential.user));
          // Check if they happen to be an admin anyway
          dispatch(setAdmin(!!tokenResult.claims.admin));
        }
      }
      
      if (!authError) {
        setEmail('');
        setPassword('');
        onClose();
      }
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' 
        ? 'Invalid email or password.' 
        : err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.message || 'Authentication failed.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearAuth());
      navigate('/');
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const renderLoggedInState = () => (
    <div className="user-dropdown-content">
      <div className="user-info">
        <span>{isAdmin ? 'Admin Logged In' : 'Welcome!'}</span>
        <small>{user.email}</small>
      </div>
      
      {isAdmin && (
        <>
          <button className="user-nav-btn" onClick={() => { navigate('/admin'); onClose(); }}>Dashboard</button>
          <button className="user-nav-btn" onClick={() => { navigate('/admin/products'); onClose(); }}>Manage Products</button>
          <button className="user-nav-btn" onClick={() => { navigate('/admin/banners'); onClose(); }}>Manage Banners</button>
        </>
      )}

      {!isAdmin && (
        <>
          <button className="user-nav-btn" onClick={() => { navigate('/orders'); onClose(); }}>My Orders</button>
          <button className="user-nav-btn" onClick={() => { onClose(); }}>Profile</button>
        </>
      )}

      <button className="user-logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      {user ? (
        renderLoggedInState()
      ) : (
        <form className="user-dropdown-content" onSubmit={handleSubmit}>
          <h4>
            {mode === 'login' ? 'Customer Login' : 
             mode === 'signup' ? 'Create Account' : 
             'Admin Access'}
          </h4>
          
          {error && <div className="user-error">{error}</div>}
          
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="user-input"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="user-input"
          />
          
          <button type="submit" disabled={loading} className="user-submit-btn">
            {loading ? 'Please wait...' : 
             mode === 'login' ? 'Login' : 
             mode === 'signup' ? 'Sign Up' : 'Login as Admin'}
          </button>

          <div className="user-mode-toggles">
            {mode === 'login' && (
              <>
                <p>New here? <button type="button" onClick={() => setMode('signup')}>Sign Up</button></p>
                <p><button type="button" className="admin-toggle" onClick={() => setMode('admin')}>Admin Login</button></p>
              </>
            )}
            {mode === 'signup' && (
              <p>Already have an account? <button type="button" onClick={() => setMode('login')}>Login</button></p>
            )}
            {mode === 'admin' && (
              <p><button type="button" onClick={() => setMode('login')}>Back to Customer Login</button></p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
