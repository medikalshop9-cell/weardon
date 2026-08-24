import { useState, useEffect } from 'react';
import { getProducts, addProduct, deleteProduct, getCategories } from '../../firebase/firestore';
import { uploadImageToCloudinary } from '../../firebase/cloudinary';
import { FiTrash2, FiPlus, FiImage } from 'react-icons/fi';
import './AdminForms.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isTrending, setIsTrending] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [sizes, setSizes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(prodData);
      setCategories(catData);
      if (catData.length > 0) {
        setCategory(catData[0].id);
      }
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
    if (!name || !price || !category) return;
    if (!imageFile) {
      alert("Please select an image");
      return;
    }
    
    setSubmitting(true);
    try {
      // 1. Upload image directly to Cloudinary
      const imageUrl = await uploadImageToCloudinary(imageFile);

      // 2. Save product to Firestore
      await addProduct({ 
        name,
        description,
        price: parseFloat(price),
        category,
        image: imageUrl,
        trending: isTrending,
        isNew,
        sizes: sizes.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s)),
        soldCount: 0
      });
      
      // 3. Reset and close
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to add product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImageFile(null);
    setIsTrending(false);
    setIsNew(true);
    setSizes('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Products</h1>
        <button className="admin-btn primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Add Product
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
                <th>Price</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <img src={prod.image} alt={prod.name} className="admin-table-img" />
                  </td>
                  <td>{prod.name}</td>
                  <td>₵{prod.price.toFixed(2)}</td>
                  <td>{prod.category}</td>
                  <td>
                    <button 
                      className="admin-icon-btn danger" 
                      onClick={() => handleDelete(prod.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                    No products found.
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
          <div className="admin-modal admin-modal-lg">
            <h2>New Product</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Product Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="admin-form-group">
                  <label>Price (₵)</label>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" required />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required>
                    {categories.length === 0 && <option value="">No categories exist</option>}
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Sizes (comma separated)</label>
                  <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} placeholder="e.g. 38, 39, 40" />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Product Image</label>
                <div className="admin-file-input">
                  <input type="file" accept="image/*" onChange={handleFileChange} id="file-upload" required />
                  <label htmlFor="file-upload" className="admin-btn secondary">
                    <FiImage /> {imageFile ? imageFile.name : 'Choose Image'}
                  </label>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-checkbox">
                  <input type="checkbox" id="isNew" checked={isNew} onChange={e => setIsNew(e.target.checked)} />
                  <label htmlFor="isNew">Mark as New</label>
                </div>
                <div className="admin-checkbox">
                  <input type="checkbox" id="isTrending" checked={isTrending} onChange={e => setIsTrending(e.target.checked)} />
                  <label htmlFor="isTrending">Mark as Trending</label>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={submitting}>
                  {submitting ? 'Uploading & Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
