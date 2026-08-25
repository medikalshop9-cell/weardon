import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiGrid, FiList, FiBox, FiPackage } from 'react-icons/fi';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <FiGrid className="admin-icon" /> Dashboard
          </NavLink>
          <NavLink 
            to="/admin/categories" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <FiList className="admin-icon" /> Categories
          </NavLink>
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <FiBox className="admin-icon" /> Products
          </NavLink>
          <NavLink 
            to="/admin/banners" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <FiGrid className="admin-icon" /> Banners
          </NavLink>
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <FiPackage className="admin-icon" /> Orders
          </NavLink>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
