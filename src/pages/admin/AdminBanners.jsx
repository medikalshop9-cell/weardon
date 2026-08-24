import { useState, useEffect } from 'react';
import { getBanners, addBanner, deleteBanner } from '../../firebase/firestore';
import { uploadImageToCloudinary } from '../../firebase/cloudinary';
import { FiTrash2, FiPlus, FiImage } from 'react-icons/fi';
import './AdminForms.css';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  // Temp state for seeding with local URL instead of File upload
  const [localImageUrl, setLocalImageUrl] = useState('');
  const [useLocalUrl, setUseLocalUrl] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    
    if (!useLocalUrl && !imageFile) {
      alert("Please select an image");
      return;
    }
    
    setSubmitting(true);
    try {
      let imageUrl = '';
      
      if (useLocalUrl) {
        imageUrl = localImageUrl;
      } else {
        // Upload image directly to Cloudinary
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      await addBanner({ 
        title,
        link: link || '/',
        image: imageUrl,
      });
      
      setIsModalOpen(false);
      resetForm();
      loadBanners();
    } catch (err) {
      console.error(err);
      alert('Failed to add banner: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setLink('');
    setImageFile(null);
    setLocalImageUrl('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await deleteBanner(id);
      loadBanners();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Banners</h1>
        <button className="admin-btn primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Add Banner
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
                <th>Title</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(banner => (
                <tr key={banner.id}>
                  <td>
                    <img 
                      src={banner.image} 
                      alt={banner.title} 
                      className="admin-table-img" 
                      style={{ width: '120px', height: '60px', objectFit: 'cover' }} 
                    />
                  </td>
                  <td>{banner.title}</td>
                  <td>{banner.link}</td>
                  <td>
                    <button 
                      className="admin-icon-btn danger" 
                      onClick={() => handleDelete(banner.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>
                    No banners found.
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
            <h2>New Banner</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="admin-form-group">
                <label>Banner Title (Internal)</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="admin-form-group">
                <label>Link (URL to go to when clicked)</label>
                <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="e.g. /?category=slides" />
              </div>

              <div className="admin-checkbox" style={{ marginBottom: '10px' }}>
                <input type="checkbox" id="useLocalUrl" checked={useLocalUrl} onChange={e => setUseLocalUrl(e.target.checked)} />
                <label htmlFor="useLocalUrl">Use Local Image Path (For testing/seeding)</label>
              </div>

              {useLocalUrl ? (
                <div className="admin-form-group">
                  <label>Local Image Path</label>
                  <input 
                    type="text" 
                    value={localImageUrl} 
                    onChange={e => setLocalImageUrl(e.target.value)} 
                    placeholder="e.g. /assets/images/banners/Q.jpg" 
                    required 
                  />
                </div>
              ) : (
                <div className="admin-form-group">
                  <label>Banner Image</label>
                  <div className="admin-file-input">
                    <input type="file" accept="image/*" onChange={handleFileChange} id="file-upload" required />
                    <label htmlFor="file-upload" className="admin-btn secondary">
                      <FiImage /> {imageFile ? imageFile.name : 'Choose Image'}
                    </label>
                  </div>
                </div>
              )}

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
