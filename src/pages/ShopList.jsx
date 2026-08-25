import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVendors } from '../firebase/firestore';
import { FiShoppingBag } from 'react-icons/fi';
import './ShopList.css';

export default function ShopList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await getVendors();
        setVendors(data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  return (
    <div className="shops-page container">
      <div className="shops-header">
        <h1>Discover Other Shops</h1>
        <p>Explore trusted third-party sellers on Weardon.</p>
      </div>

      {loading ? (
        <div className="shops-loading">Loading shops...</div>
      ) : vendors.length === 0 ? (
        <div className="shops-empty">
          <FiShoppingBag size={48} />
          <p>No other shops available right now. Check back later!</p>
        </div>
      ) : (
        <div className="shops-grid">
          {vendors.map(vendor => (
            <Link to={`/shop/${vendor.id}`} key={vendor.id} className="shop-card">
              <div className="shop-card-icon">
                {vendor.brandName ? vendor.brandName.charAt(0).toUpperCase() : 'S'}
              </div>
              <h3>{vendor.brandName || vendor.email.split('@')[0]}</h3>
              <p className="shop-card-link">View Shop &rarr;</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
