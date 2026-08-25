import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiArrowRight, FiShoppingBag, FiUploadCloud } from 'react-icons/fi';
import './UserTour.css';

export default function UserTour() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('weardon-tour-seen');
    if (!hasSeenTour) {
      // Delay slightly so the page loads
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else {
      finishTour();
    }
  };

  const finishTour = () => {
    localStorage.setItem('weardon-tour-seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="tour-overlay">
      <div className="tour-modal">
        <button className="tour-close" onClick={finishTour}><FiX size={24} /></button>
        
        {step === 0 && (
          <div className="tour-content">
            <div className="tour-icon-wrap" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }}>
              <FiShoppingBag size={48} />
            </div>
            <h2>Discover Other Shops</h2>
            <p>Weardon is a thriving marketplace! You can now explore unique footwear from other independent sellers and brands.</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Look for the <strong>"View Other Shops"</strong> section on the homepage.</p>
            <button className="tour-btn" onClick={handleNext}>Next <FiArrowRight /></button>
          </div>
        )}

        {step === 1 && (
          <div className="tour-content">
            <div className="tour-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <FiUploadCloud size={48} />
            </div>
            <h2>Become a Vendor</h2>
            <p>Have shoes to sell? You can apply to become a verified vendor. Once approved, you can upload and sell your items directly to our customers.</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Click <strong>"Sell on Weardon"</strong> in the menu to get started.</p>
            <div className="tour-actions">
              <button className="tour-btn-outline" onClick={finishTour}>Got it, thanks!</button>
              <button className="tour-btn" onClick={() => { finishTour(); navigate('/sell'); }}>Apply Now</button>
            </div>
          </div>
        )}
        
        <div className="tour-dots">
          <span className={`tour-dot ${step === 0 ? 'active' : ''}`} />
          <span className={`tour-dot ${step === 1 ? 'active' : ''}`} />
        </div>
      </div>
    </div>
  );
}
