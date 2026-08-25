import { useState, useEffect } from 'react';
import { getCategories, addCategory, deleteCategory, updateCategory } from '../../firebase/firestore';
import { uploadImageToCloudinary } from '../../firebase/cloudinary';
import { FiTrash2, FiPlus, FiImage, FiX, FiEdit2 } from 'react-icons/fi';
import './AdminForms.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSubmitting(true);
    try {
      let imageUrl = imagePreview && !imageFile ? imagePreview : ''; // Keep existing image if no new file
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      if (editingId) {
        await updateCategory(editingId, {
          name,
          image: imageUrl
        });
      } else {
        await addCategory({ 
          name,
          image: imageUrl,
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
        });
      }

      closeModal();
      loadCategories(); // reload
    } catch (err) {
      console.error(err);
      alert('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setImageFile(null);
    setImagePreview(cat.image || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setImageFile(null);
    setImagePreview(null);
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
        <button className="admin-btn primary" onClick={openAddModal}>
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
                <th>Image</th>
                <th>Name</th>
                <th>ID (Slug)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '10px' }}>No Img</div>
                    )}
                  </td>
                  <td>{cat.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cat.id}</td>
                  <td>
                    <button 
                      className="admin-icon-btn" 
                      onClick={() => openEditModal(cat)}
                      title="Edit"
                      style={{ marginRight: '8px' }}
                    >
                      <FiEdit2 />
                    </button>
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
            <h2>{editingId ? 'Edit Category' : 'New Category'}</h2>
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

              <div className="admin-form-group">
                <label>Category Image</label>
                <div className="admin-file-upload-area">
                  {imagePreview ? (
                    <div className="admin-img-preview-wrap">
                      <img src={imagePreview} alt="Preview" className="admin-img-preview" />
                      <button type="button" className="admin-img-remove" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                        <FiX size={14} /> Remove
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="cat-img-upload" className="admin-file-drop-zone">
                      <FiImage size={28} />
                      <span>Click to choose image</span>
                    </label>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} id="cat-img-upload" style={{ display: 'none' }} />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button 
                  type="button" 
                  className="admin-btn secondary" 
                  onClick={closeModal}
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
