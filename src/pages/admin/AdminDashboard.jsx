import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getCategories } from '../../firebase/firestore';

export default function AdminDashboard() {
  const products = useSelector(state => state.products.items);
  const [stats, setStats] = useState({
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const categories = await getCategories();
        setStats({
          categories: categories.length,
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Total Products</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>{products.length}</p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Total Categories</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            {loading ? '...' : stats.categories}
          </p>
        </div>
        
      </div>
    </div>
  );
}
