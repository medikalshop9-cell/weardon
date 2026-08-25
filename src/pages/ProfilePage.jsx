import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { updateProfile, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { clearAuth } from '../store/authSlice';
import { FiUser, FiMail, FiEdit2, FiLogOut, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [orderStats, setOrderStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchOrderStats = async () => {
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        let total = querySnapshot.size;
        let completed = 0;
        
        querySnapshot.forEach((doc) => {
          if (doc.data().status === 'delivered') {
            completed++;
          }
        });
        
        setOrderStats({ total, completed });
      } catch (error) {
        console.error("Error fetching order stats:", error);
      }
    };

    fetchOrderStats();
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName
      });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearAuth());
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="profile-page container">
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Manage your personal information and preferences.</p>
      </div>

      <div className="profile-grid">
        {/* Left Column: Personal Info */}
        <div className="profile-section profile-info-card">
          <div className="profile-avatar">
            <FiUser size={48} />
          </div>
          
          {message && (
            <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {!isEditing ? (
            <div className="profile-view-mode">
              <h2>{user.displayName || 'Add your name'}</h2>
              <p className="profile-email"><FiMail /> {user.email}</p>
              
              <button className="theme-btn-secondary edit-btn" onClick={() => setIsEditing(true)}>
                <FiEdit2 /> Edit Profile
              </button>
            </div>
          ) : (
            <form className="profile-edit-form" onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  title="Email cannot be changed here"
                />
              </div>
              <div className="profile-form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="theme-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          <div className="profile-logout-wrap">
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: Stats & Links */}
        <div className="profile-sidebar">
          <div className="profile-section stats-card">
            <h3>Account Activity</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <FiShoppingBag className="stat-icon" />
                <span className="stat-value">{orderStats.total}</span>
                <span className="stat-label">Total Orders</span>
              </div>
              <div className="stat-box">
                <FiCheckCircle className="stat-icon success" />
                <span className="stat-value">{orderStats.completed}</span>
                <span className="stat-label">Delivered</span>
              </div>
            </div>
            
            <button className="theme-btn-secondary w-100 mt-4" onClick={() => navigate('/orders')}>
              View Order History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
