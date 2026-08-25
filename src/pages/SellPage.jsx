import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiCheckCircle, FiUploadCloud, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import VendorProducts from './vendor/VendorProducts';
import './SellPage.css';

export default function SellPage() {
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    whatsapp: '',
    brandName: '',
    productType: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to apply.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'vendor_applications'), {
        userId: user.uid,
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        brandName: formData.brandName,
        productType: formData.productType,
        message: formData.message,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { isVendor } = useSelector((state) => state.auth);

  if (isVendor) {
    return (
      <div className="sell-page vendor-mode">
        <div className="container" style={{ padding: '2rem 0' }}>
          <VendorProducts />
        </div>
      </div>
    );
  }

  return (
    <div className="sell-page">
      {/* Hero Section */}
      <section className="sell-hero">
        <div className="container sell-hero-inner">
          <h1>Sell on Weardon</h1>
          <p>Join Ghana's premium footwear marketplace. We are looking for authentic, high-quality, and passionate third-party vendors to grow with us.</p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="sell-benefits container">
        <h2 className="text-center">Why Partner With Us?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <FiTrendingUp size={48} className="benefit-icon" />
            <h3>Reach More Customers</h3>
            <p>Access our growing customer base of footwear enthusiasts who appreciate quality craftsmanship and premium design.</p>
          </div>
          <div className="benefit-card">
            <FiCheckCircle size={48} className="benefit-icon" />
            <h3>Premium Branding</h3>
            <p>Sell alongside other high-quality products. We maintain a curated marketplace to protect your brand's prestige.</p>
          </div>
          <div className="benefit-card">
            <FiUploadCloud size={48} className="benefit-icon" />
            <h3>Easy Management</h3>
            <p>Our upcoming vendor portal makes it easy to track your sales, manage inventory, and fulfill orders.</p>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="sell-application">
        <div className="container">
          <div className="application-wrapper">
            <div className="application-text">
              <h2>Apply to become a Vendor</h2>
              <p>Tell us about your brand and products. Our curation team reviews all applications to ensure alignment with our quality standards.</p>
              <ul className="application-requirements">
                <li><FiCheckCircle className="req-icon" /> High-quality product images</li>
                <li><FiCheckCircle className="req-icon" /> Consistent inventory capabilities</li>
                <li><FiCheckCircle className="req-icon" /> Commitment to excellent customer service</li>
              </ul>
            </div>
            
            <div className="application-form-container">
              {submitted ? (
                <div className="application-success">
                  <FiCheckCircle size={64} className="success-icon" style={{ color: '#25D366' }} />
                  <h3>Application Received!</h3>
                  <p>Thank you for your interest in selling on Weardon. To complete your application and get approved instantly, please pay the service fee via WhatsApp.</p>
                  
                  <a 
                    href="https://wa.me/233556008189?text=Hi%20Admin,%20I%20just%20submitted%20my%20vendor%20application%20on%20Weardon.%20I%20want%20to%20pay%20the%20service%20fee%20to%20get%20approved." 
                    target="_blank" 
                    rel="noreferrer" 
                    className="sell-submit-btn" 
                    style={{ background: '#25D366', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}
                  >
                    Pay Service Fee on WhatsApp
                  </a>
                  
                  <button className="sell-btn" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={() => setSubmitted(false)}>Submit Another</button>
                </div>
              ) : (
                <form className="application-form" onSubmit={handleSubmit}>
                  {error && (
                    <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiAlertCircle /> {error}
                    </div>
                  )}

                  {!user && (
                    <div style={{ color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiAlertCircle /> Please log in from the top right menu before applying.
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} readOnly={!!user} style={user ? { opacity: 0.7, cursor: 'not-allowed' } : {}} />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>WhatsApp Number (For customer orders) *</label>
                      <input type="tel" name="whatsapp" required value={formData.whatsapp} onChange={handleChange} placeholder="e.g. +233 55 123 4567" />
                    </div>
                    <div className="form-group">
                      <label>Brand/Business Name *</label>
                      <input type="text" name="brandName" required value={formData.brandName} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>What type of footwear do you sell? (Optional)</label>
                    <select name="productType" value={formData.productType} onChange={handleChange}>
                      <option value="">Select an option</option>
                      <option value="slides">Slides & Slippers</option>
                      <option value="sandals">Sandals</option>
                      <option value="sneakers">Sneakers</option>
                      <option value="formal">Formal Shoes</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tell us about your brand & products (Optional)</label>
                    <textarea name="message" rows="4" value={formData.message} onChange={handleChange}></textarea>
                  </div>

                  <button type="submit" className="sell-submit-btn" disabled={!user || loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
