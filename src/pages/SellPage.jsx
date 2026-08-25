import React, { useState } from 'react';
import { FiCheckCircle, FiUploadCloud, FiTrendingUp } from 'react-icons/fi';
import './SellPage.css';

export default function SellPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    brandName: '',
    productType: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
    }, 800);
  };

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
                  <FiCheckCircle size={64} className="success-icon" />
                  <h3>Application Received!</h3>
                  <p>Thank you for your interest in selling on Weardon. Our team will review your application and get back to you within 3-5 business days.</p>
                  <button className="sell-btn" onClick={() => setSubmitted(false)}>Submit Another</button>
                </div>
              ) : (
                <form className="application-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Brand/Business Name *</label>
                      <input type="text" name="brandName" required value={formData.brandName} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>What type of footwear do you sell? *</label>
                    <select name="productType" required value={formData.productType} onChange={handleChange}>
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

                  <button type="submit" className="sell-submit-btn">Submit Application</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
