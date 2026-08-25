import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FiPackage, FiDownload, FiXCircle, FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { downloadOrderReceipt } from '../utils/pdfReceipt';
import { formatPrice } from '../data/products';
import './OrdersPage.css';

export default function OrdersPage() {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Fetch user's orders
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt client-side since compound index might not exist yet
      ordersData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancelOrder = async (orderId, currentStatus) => {
    if (currentStatus !== 'pending' && currentStatus !== 'paid') {
      alert('This order cannot be cancelled anymore.');
      return;
    }
    
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: 'cancelled' });
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Failed to cancel order. Please try again.");
      }
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

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

  return (
    <div className="orders-page container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>View and track your Weardon purchases.</p>
      </div>

      {loading ? (
        <div className="orders-loading">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <FiPackage size={48} className="empty-icon" />
          <h2>No orders yet</h2>
          <p>You haven't placed any orders with us. Time to find something amazing!</p>
          <button className="theme-btn" onClick={() => navigate('/')}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta">
                  <h3>Order Ref: {order.orderRef}</h3>
                  <span className="order-date">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <div className={`order-status badge-${order.status?.toLowerCase()}`}>
                  {getStatusIcon(order.status)}
                  {order.status?.toUpperCase() || 'UNKNOWN'}
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <div className="order-item-info">
                        <span className="qty">{item.quantity}x</span>
                        <span className="name">{item.name}</span>
                        <span className="size">Size {item.size}</span>
                      </div>
                      <span className="price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-totals">
                  <div className="total-row">
                    <span>Delivery:</span>
                    <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total Paid:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="order-card-actions">
                <button 
                  className="order-btn download-btn" 
                  onClick={() => downloadOrderReceipt(order)}
                >
                  <FiDownload /> Download PDF
                </button>
                
                {(order.status === 'pending' || order.status === 'paid') && (
                  <button 
                    className="order-btn cancel-btn" 
                    onClick={() => handleCancelOrder(order.id, order.status)}
                  >
                    <FiXCircle /> Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
