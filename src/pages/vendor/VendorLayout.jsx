import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiBox, FiLogOut } from 'react-icons/fi';
import '../admin/AdminLayout.css'; // Reuse styles

export default function VendorLayout() {
  const { user, isVendor } = useSelector((state) => state.auth);

  if (!user || !isVendor) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Vendor Panel</h2>
        </div>
        <nav className="admin-nav">
          <NavLink 
            to="/vendor/products" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <FiBox className="admin-icon" /> My Products
          </NavLink>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
