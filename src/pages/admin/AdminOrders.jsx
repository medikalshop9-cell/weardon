import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiClock, FiCheckCircle, FiTruck, FiXCircle, FiPackage, FiDownload } from 'react-icons/fi';
import { downloadOrderReceipt } from '../../utils/pdfReceipt';
import { formatPrice } from '../../data/products';
import useRateLimit from '../../hooks/useRateLimit';
import './AdminOrders.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const rateLimit = useRateLimit(1500); // 1.5s cooldown for status updates

  useEffect(() => {
    // Fetch all orders
    const q = query(collection(db, 'orders'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort newest first
      ordersData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (rateLimit.isLocked) return;

    rateLimit.execute(async () => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status.");
      }
    });
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return <FiClock className="status-icon pending" />;
      case 'paid': return <FiCheckCircle className="status-icon paid" />;
      case 'shipped': return <FiTruck className="status-icon shipped" />;
      case 'delivered': return <FiCheckCircle className="status-icon delivered" />;
      case 'cancelled': return <FiXCircle className="status-icon cancelled" />;
      default: return <FiPackage className="status-icon" />;
    }
  };

  if (loading) return <div className="admin-loading">Loading orders...</div>;

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <h1>Orders Management</h1>
        <p>View and manage all customer orders.</p>
      </div>

      <div className="admin-orders-list">
        {orders.map(order => (
          <div key={order.id} className="admin-order-card">
            <div className="order-header-row">
              <div className="order-id-block">
                <h3>{order.orderRef}</h3>
                <span className="order-date">
                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Recent'}
                </span>
              </div>
              
              <div className="order-status-block">
                <div className={`current-status badge-${order.status?.toLowerCase()}`}>
                  {getStatusIcon(order.status)}
                  {order.status?.toUpperCase() || 'UNKNOWN'}
                </div>
                
                <select 
                  className="status-dropdown"
                  value={order.status || 'pending'}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={rateLimit.isLocked}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="order-details-grid">
              {/* Customer Info */}
              <div className="order-section">
                <h4>Customer & Delivery</h4>
                <p><strong>Name:</strong> {order.deliveryInfo?.name || order.userEmail}</p>
                <p><strong>Phone:</strong> {order.deliveryInfo?.phone}</p>
                <p><strong>Address:</strong> {order.deliveryInfo?.address}</p>
                <p><strong>City:</strong> {order.deliveryInfo?.city}</p>
                {order.deliveryInfo?.notes && (
                  <p className="order-notes"><strong>Notes:</strong> {order.deliveryInfo.notes}</p>
                )}
              </div>

              {/* Items */}
              <div className="order-section">
                <h4>Items</h4>
                <div className="admin-order-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="admin-item-row">
                      <span>{item.quantity}x {item.name} (EU {item.size})</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="admin-order-totals">
                  <div className="admin-total-row">
                    <span>Delivery</span>
                    <span>{formatPrice(order.deliveryFee)}</span>
                  </div>
                  <div className="admin-total-row grand">
                    <span>Total</span>
                    <span className="highlight-price">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-order-actions">
              <button 
                className="admin-btn-secondary"
                onClick={() => downloadOrderReceipt(order)}
              >
                <FiDownload /> Download PDF
              </button>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="admin-empty">No orders found.</div>
        )}
      </div>
    </div>
  );
}
