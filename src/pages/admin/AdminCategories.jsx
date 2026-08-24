import { useState, useEffect } from 'react';
import { getCategories, addCategory, deleteCategory } from '../../firebase/firestore';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import './AdminForms.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSubmitting(true);
    try {
      await addCategory({ 
        name,
        // Make the id slug-like for URLs
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
      });
      setIsModalOpen(false);
      setName('');
      loadCategories(); // reload
    } catch (err) {
      console.error(err);
      alert('Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Categories</h1>
        <button className="admin-btn primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID (Slug)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cat.id}</td>
                  <td>
                    <button 
                      className="admin-icon-btn danger" 
                      onClick={() => handleDelete(cat.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '32px' }}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>New Category</h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Slides"
                  required
                />
              </div>
              <div className="admin-modal-actions">
                <button 
                  type="button" 
                  className="admin-btn secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
