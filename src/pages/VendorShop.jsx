import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import './ShopList.css'; // We'll reuse some layout styles from here

export default function VendorShop() {
  const { vendorId } = useParams();
  const { items: allProducts } = useSelector(state => state.products);
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter products that belong to this vendor
  const vendorProducts = allProducts.filter(p => p.vendorId === vendorId);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', vendorId));
        if (userDoc.exists()) {
          setVendorData(userDoc.data());
        }
      } catch (err) {
        console.error("Error fetching vendor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [vendorId]);

  if (loading) {
    return <div className="shops-loading">Loading shop...</div>;
  }

  if (!vendorData) {
    return (
      <div className="shops-empty">
        <h2>Shop Not Found</h2>
        <Link to="/shops" style={{ color: 'var(--text-secondary)' }}>&larr; Back to all shops</Link>
      </div>
    );
  }

  return (
    <div className="vendor-shop-page container" style={{ padding: '3rem 1rem' }}>
      <Link to="/shops" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}>
        <FiArrowLeft /> Back to all shops
      </Link>

      <div className="vendor-shop-header" style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="shop-card-icon" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
            {vendorData.brandName ? vendorData.brandName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>{vendorData.brandName || vendorData.email}</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Official Weardon Trusted Seller</p>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '2rem' }}>All Products from {vendorData.brandName}</h2>

      {vendorProducts.length === 0 ? (
        <div className="shops-empty">
          <FiShoppingBag size={48} />
          <p>This seller hasn't listed any products yet.</p>
        </div>
      ) : (
        <div className="product-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '2rem'
        }}>
          {vendorProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
