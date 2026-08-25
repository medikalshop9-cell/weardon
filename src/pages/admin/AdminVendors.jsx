import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiCheckCircle, FiXCircle, FiClock, FiMessageCircle } from 'react-icons/fi';
import './AdminVendors.css';

export default function AdminVendors() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'vendor_applications'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(apps);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching vendor applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (app) => {
    if (!window.confirm(`Approve ${app.name} as a vendor?`)) return;

    try {
      // 1. Update application status
      await updateDoc(doc(db, 'vendor_applications', app.id), {
        status: 'approved'
      });

      // 2. Update user document to grant vendor role
      const userRef = doc(db, 'users', app.userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          role: 'vendor',
          whatsapp: app.whatsapp,
          brandName: app.brandName
        });
      } else {
        await setDoc(userRef, {
          email: app.email,
          role: 'vendor',
          whatsapp: app.whatsapp,
          brandName: app.brandName
        });
      }
      
      alert(`${app.name} has been approved as a vendor.`);
    } catch (error) {
      console.error("Error approving vendor:", error);
      alert("Failed to approve vendor.");
    }
  };

  const handleReject = async (appId) => {
    if (!window.confirm("Reject this application?")) return;

    try {
      await updateDoc(doc(db, 'vendor_applications', appId), {
        status: 'rejected'
      });
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      alert("Failed to reject vendor.");
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading applications...</div>;
  }

  return (
    <div className="admin-vendors">
      <div className="admin-header">
        <h2>Vendor Applications</h2>
      </div>

      <div className="applications-list">
        {applications.length === 0 ? (
          <div className="admin-empty">No vendor applications found.</div>
        ) : (
          applications.map(app => (
            <div key={app.id} className={`application-card status-${app.status}`}>
              <div className="app-header">
                <h3>{app.brandName}</h3>
                <span className={`status-badge ${app.status}`}>
                  {app.status === 'pending' && <FiClock />}
                  {app.status === 'approved' && <FiCheckCircle />}
                  {app.status === 'rejected' && <FiXCircle />}
                  {app.status.toUpperCase()}
                </span>
              </div>
              
              <div className="app-details">
                <div className="detail-item">
                  <strong>Applicant:</strong> {app.name}
                </div>
                <div className="detail-item">
                  <strong>Email:</strong> {app.email}
                </div>
                <div className="detail-item">
                  <strong>WhatsApp:</strong> <a href={`https://wa.me/${app.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="whatsapp-link"><FiMessageCircle /> {app.whatsapp}</a>
                </div>
                <div className="detail-item">
                  <strong>Product Type:</strong> {app.productType}
                </div>
              </div>

              {app.message && (
                <div className="app-message">
                  <strong>Message:</strong>
                  <p>{app.message}</p>
                </div>
              )}

              {app.status === 'pending' && (
                <div className="app-actions">
                  <button className="approve-btn" onClick={() => handleApprove(app)}>
                    <FiCheckCircle /> Approve Vendor
                  </button>
                  <button className="reject-btn" onClick={() => handleReject(app.id)}>
                    <FiXCircle /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
