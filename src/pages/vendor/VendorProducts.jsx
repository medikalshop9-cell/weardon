import { useState, useEffect } from 'react';
import { getVendorProducts, addProduct, updateProduct, deleteProduct, getCategories } from '../../firebase/firestore';
import { uploadImageToCloudinary } from '../../firebase/cloudinary';
import { useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiTrash2, FiPlus, FiImage, FiAlertCircle, FiCheckCircle, FiX, FiZap, FiEdit2 } from 'react-icons/fi';
import '../admin/AdminForms.css';

// Highlight suggestions for auto-assist
const HIGHLIGHT_SUGGESTIONS = [
  'Premium handcrafted quality',
  'Ergonomic footbed for all-day comfort',
  'Anti-slip textured outsole',
  'Water-resistant finish',
  'Made in Ghana 🇬🇭',
  'Lightweight EVA foam midsole',
  'Adjustable strap for perfect fit',
  'Breathable textile lining',
  'Durable rubber sole',
  'Machine washable insole',
  'Vegan-friendly materials',
  'True to size fit',
];

function Alert({ type, message, onClose }) {
  if (!message) return null;
  return (
    <div className={`admin-alert admin-alert--${type}`}>
      {type === 'error' ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
      <span style={{ whiteSpace: 'pre-line' }}>{message}</span>
      {onClose && <button className="admin-alert-close" onClick={onClose}><FiX size={14} /></button>}
    </div>
  );
}

function HighlightBuilder({ value, onChange }) {
  const lines = value ? value.split('\n').filter(Boolean) : [];
  const [input, setInput] = useState('');

  const add = (text) => {
    const trimmed = text.trim();
    if (!trimmed || lines.includes(trimmed)) return;
    onChange([...lines, trimmed].join('\n'));
    setInput('');
  };

  const remove = (idx) => {
    const updated = lines.filter((_, i) => i !== idx);
    onChange(updated.join('\n'));
  };

  return (
    <div className="admin-highlights-builder">
      <div className="admin-highlights-list">
        {lines.map((line, i) => (
          <div className="admin-highlight-chip" key={i}>
            <span>✓ {line}</span>
            <button type="button" onClick={() => remove(i)}><FiX size={12} /></button>
          </div>
        ))}
      </div>
      <div className="admin-highlight-input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add(input))}
          placeholder="Type a highlight and press Enter…"
        />
        <button type="button" className="admin-btn secondary" onClick={() => add(input)}>Add</button>
      </div>
      <div className="admin-highlight-suggestions">
        <span className="admin-suggest-label"><FiZap size={12} /> Quick add:</span>
        {HIGHLIGHT_SUGGESTIONS.filter(s => !lines.includes(s)).slice(0, 5).map(s => (
          <button
            type="button"
            key={s}
            className="admin-suggest-chip"
            onClick={() => add(s)}
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function VendorProducts() {
  const { user } = useSelector(state => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  // Basic fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isTrending, setIsTrending] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [sizes, setSizes] = useState('');

  // Rich detail fields
  const [highlights, setHighlights] = useState('');
  const [measurements, setMeasurements] = useState('');
  const [materials, setMaterials] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [pageError, setPageError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setPageError('');
    try {
      const [prodData, catData] = await Promise.all([getVendorProducts(user.uid), getCategories()]);
      setProducts(prodData);
      setCategories(catData);
      if (catData.length > 0) setCategory(catData[0].id);
    } catch (err) {
      setPageError('Failed to load data. Check your Firestore connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setFormError('Only image files are allowed'); return; }
    if (file.size > 10 * 1024 * 1024) { setFormError('Image must be smaller than 10MB'); return; }
    setImageFile(file);
    setFormError('');
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!name.trim()) { setFormError('Product name is required'); return; }
    if (!price || isNaN(parseFloat(price))) { setFormError('Valid price is required'); return; }
    if (!imageFile && !existingImageUrl) { setFormError('Please select a product image'); return; }

    setSubmitting(true);
    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }
      
      // Fetch vendor details
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const vendorData = userDoc.exists() ? userDoc.data() : {};
      
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        image: imageUrl,
        trending: isTrending,
        isNew,
        sizes: sizes.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s)),
        highlights: highlights.split('\n').filter(Boolean),
        measurements: measurements.trim(),
        materials: materials.trim(),
        vendorId: user.uid,
        vendorName: vendorData.brandName || user.displayName || 'Vendor',
        vendorWhatsApp: vendorData.whatsapp || ''
      };

      if (editingId) {
        await updateProduct(editingId, productData);
        setFormSuccess(`"${name}" updated successfully!`);
      } else {
        await addProduct({ ...productData, soldCount: 0 });
        setFormSuccess(`"${name}" added successfully!`);
      }
      
      resetForm();
      await loadData();
      setTimeout(() => { setIsModalOpen(false); setFormSuccess(''); }, 1800);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (prod) => {
    setEditingId(prod.id);
    setName(prod.name);
    setDescription(prod.description || '');
    setPrice(prod.price.toString());
    setCategory(prod.category);
    setExistingImageUrl(prod.image);
    setImagePreview(prod.image);
    setIsTrending(prod.trending || false);
    setIsNew(prod.isNew || false);
    setSizes((prod.sizes || []).join(', '));
    setHighlights((prod.highlights || []).join('\n'));
    setMeasurements(prod.measurements || '');
    setMaterials(prod.materials || '');
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setExistingImageUrl(null);
    setName(''); setDescription(''); setPrice(''); setCategory(categories[0]?.id || '');
    setImageFile(null); setImagePreview(null); setIsTrending(false); setIsNew(true);
    setSizes(''); setHighlights(''); setMeasurements(''); setMaterials('');
    setFormError(''); setFormSuccess('');
  };

  const handleDelete = async (id, productName) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      await loadData(); // Reload to reflect changes immediately
    } catch (err) {
      setPageError(`Failed to delete "${productName}". Try again.`);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Products</h1>
        <button className="admin-btn primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <FiPlus /> Add Product
        </button>
      </div>

      {pageError && <Alert type="error" message={pageError} onClose={() => setPageError('')} />}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><p>Loading products...</p></div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Tags</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <img src={prod.image} alt={prod.name} className="admin-table-img" onError={e => { e.target.style.opacity = '0.3'; }} />
                  </td>
                  <td><strong>{prod.name}</strong></td>
                  <td>₵{parseFloat(prod.price).toFixed(2)}</td>
                  <td style={{ textTransform: 'capitalize' }}>{prod.category}</td>
                  <td>
                    {prod.isNew && <span className="admin-tag tag-new">New</span>}
                    {prod.trending && <span className="admin-tag tag-trending">🔥</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="admin-icon-btn" onClick={() => openEditModal(prod)} title="Edit" style={{ color: '#60a5fa' }}>
                        <FiEdit2 />
                      </button>
                      <button className="admin-icon-btn danger" onClick={() => handleDelete(prod.id, prod.name)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>No products yet. Add your first!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="admin-modal admin-modal-lg">
            <div className="admin-modal-header">
              <h2>{editingId ? 'Edit Product' : 'New Product'}</h2>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}><FiX size={20} /></button>
            </div>

            {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}
            {formSuccess && <Alert type="success" message={formSuccess} />}

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Basic Info ── */}
              <div className="admin-section-label">Basic Info</div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Product Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Classic Slide Pro" required />
                </div>
                <div className="admin-form-group">
                  <label>Price (₵) *</label>
                  <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="150.00" required />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Category (Optional)</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">No Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Sizes <span style={{ fontWeight: 400 }}>(comma separated)</span></label>
                  <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} placeholder="38, 39, 40, 41, 42" />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-checkbox">
                  <input type="checkbox" id="isNew" checked={isNew} onChange={e => setIsNew(e.target.checked)} />
                  <label htmlFor="isNew">New Arrival</label>
                </div>
                <div className="admin-checkbox">
                  <input type="checkbox" id="isTrending" checked={isTrending} onChange={e => setIsTrending(e.target.checked)} />
                  <label htmlFor="isTrending">Trending 🔥</label>
                </div>
              </div>

              {/* ── Image Upload ── */}
              <div className="admin-section-label">Product Image</div>
              <div className="admin-form-group">
                <label>Product Image {!editingId && '*'} <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Max 10MB · JPG/PNG/WEBP</span></label>
                <div className="admin-file-upload-area">
                  {imagePreview ? (
                    <div className="admin-img-preview-wrap">
                      <img src={imagePreview} alt="Preview" className="admin-img-preview" />
                      <button type="button" className="admin-img-remove" onClick={() => { setImageFile(null); setImagePreview(null); setExistingImageUrl(null); }}>
                        <FiX size={14} /> Remove
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="admin-file-drop-zone">
                      <FiImage size={28} />
                      <span>Click to choose image</span>
                      <small>or drag and drop</small>
                    </label>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} id="file-upload" style={{ display: 'none' }} />
                </div>
              </div>

              {/* ── Product Details ── */}
              <div className="admin-section-label">Product Details</div>

              <div className="admin-form-group">
                <label>Description *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="Describe the product, its design, and what makes it special…" required />
              </div>

              <div className="admin-form-group">
                <label>Highlights <span style={{ fontWeight: 400 }}>(key selling points shown on product page)</span></label>
                <HighlightBuilder value={highlights} onChange={setHighlights} />
              </div>

              <div className="admin-form-group">
                <label>Measurements & Sizing</label>
                <textarea
                  value={measurements}
                  onChange={e => setMeasurements(e.target.value)}
                  rows="3"
                  placeholder="e.g.&#10;Sole Height: 2.5cm&#10;Strap Width: 3cm&#10;Sizing: True to size"
                />
              </div>

              <div className="admin-form-group">
                <label>Materials & Composition</label>
                <textarea
                  value={materials}
                  onChange={e => setMaterials(e.target.value)}
                  rows="3"
                  placeholder="e.g.&#10;Upper: Premium leather&#10;Lining: Soft textile&#10;Sole: EVA foam + rubber outsole"
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={submitting}>
                  {submitting ? <><span className="admin-btn-spinner" /> Saving…</> : (editingId ? 'Update Product' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
