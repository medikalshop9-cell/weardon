import { useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiArrowLeft, FiHeart, FiShare2, FiTruck, FiShield,
  FiRefreshCw, FiChevronDown, FiChevronLeft, FiChevronRight,
  FiInstagram, FiCopy, FiCheck
} from 'react-icons/fi';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import { formatPrice } from '../data/products';
import ProductCarousel from '../components/ProductCarousel';
import './ProductDetail.css';

/* ─── Sub-components ─── */

function ProductGallery({ product }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);

  const hue = (parseInt(product.id) * 47) % 360;
  // Build a "gallery" from the single product image for now
  const images = product.image
    ? [product.image, product.image, product.image, product.image]
    : null;

  const prev = useCallback(() => {
    setActiveIdx(i => (i - 1 + 4) % 4);
  }, []);
  const next = useCallback(() => {
    setActiveIdx(i => (i + 1) % 4);
  }, []);

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="pdp-gallery" id="pdp-gallery">
      {/* Badges */}
      <div className="pdp-gallery-badges">
        {product.isNew && <span className="pdp-badge pdp-badge--new">New Arrival</span>}
        {product.trending && <span className="pdp-badge pdp-badge--trending">🔥 Trending</span>}
      </div>

      {/* Main image */}
      <div
        className={`pdp-main-img-wrap ${zoomed ? 'zoomed' : ''}`}
        ref={imgRef}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        style={
          zoomed && images
            ? { '--zx': `${zoomPos.x}%`, '--zy': `${zoomPos.y}%` }
            : {}
        }
      >
        {images ? (
          <img
            src={images[activeIdx]}
            alt={product.name}
            className="pdp-main-img"
            draggable={false}
          />
        ) : (
          <div
            className="pdp-main-img-placeholder"
            style={{
              background: `linear-gradient(135deg, hsl(${hue},15%,82%) 0%, hsl(${hue + 30},20%,90%) 100%)`,
            }}
          >
            <span>{product.name?.split(' ').slice(0, 2).map(w => w[0]).join('')}</span>
          </div>
        )}
        {/* Arrow controls */}
        <button className="pdp-gallery-arrow pdp-gallery-arrow--left" onClick={prev} aria-label="Previous image">
          <FiChevronLeft size={18} />
        </button>
        <button className="pdp-gallery-arrow pdp-gallery-arrow--right" onClick={next} aria-label="Next image">
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="pdp-thumbnails">
        {(images || [null, null, null, null]).map((img, i) => (
          <button
            key={i}
            className={`pdp-thumb ${i === activeIdx ? 'active' : ''}`}
            onClick={() => setActiveIdx(i)}
            aria-label={`View image ${i + 1}`}
          >
            {img ? (
              <img src={img} alt="" />
            ) : (
              <div
                style={{
                  width: '100%', height: '100%',
                  background: `linear-gradient(135deg, hsl(${hue + i * 20},15%,82%) 0%, hsl(${hue + i * 20 + 30},20%,90%) 100%)`,
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`pdp-accordion-item ${open ? 'open' : ''}`}>
      <button className="pdp-accordion-trigger" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <FiChevronDown className="pdp-accordion-icon" size={18} />
      </button>
      <div className="pdp-accordion-body">
        <div className="pdp-accordion-content">{children}</div>
      </div>
    </div>
  );
}

function ShareModal({ product, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pdp-share-overlay" onClick={onClose}>
      <div className="pdp-share-modal" onClick={e => e.stopPropagation()}>
        <h3>Share this product</h3>
        <p>{product.name}</p>
        <div className="pdp-share-options">
          <button className="pdp-share-btn" onClick={copy}>
            {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a
            className="pdp-share-btn"
            href={`https://www.instagram.com/`}
            target="_blank"
            rel="noreferrer"
          >
            <FiInstagram size={18} /> Instagram
          </a>
        </div>
        <button className="pdp-share-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.products);
  const wishlistItems = useSelector(state => state.wishlist?.items || []);

  // Support both string and number IDs (Firestore returns string IDs)
  const product = items.find(p => String(p.id) === String(id) || p.id === parseInt(id));

  const [selectedSize, setSelectedSize] = useState(null);
  const liked = wishlistItems.some(item => String(item.id) === String(id));
  const [cartState, setCartState] = useState('idle'); // 'idle' | 'adding' | 'added'
  const [showShare, setShowShare] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  if (!product) {
    return (
      <div className="pdp-not-found container">
        <div className="pdp-not-found-inner">
          <span className="pdp-not-found-icon">👟</span>
          <h2>Product not found</h2>
          <p>This product may have been removed or the link is incorrect.</p>
          <Link to="/" className="pdp-back-btn">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const relatedProducts = items
    .filter(p => p.category === product.category && String(p.id) !== String(id))
    .slice(0, 8);

  const trendingProducts = items
    .filter(p => p.trending && String(p.id) !== String(id))
    .slice(0, 8);

  const newProducts = items
    .filter(p => p.isNew && String(p.id) !== String(id))
    .slice(0, 8);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    setCartState('adding');
    setTimeout(() => {
      dispatch(addToCart({ product, size: selectedSize }));
      setCartState('added');
      setTimeout(() => setCartState('idle'), 2500);
    }, 400);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    dispatch(addToCart({ product, size: selectedSize }));
    navigate('/');
  };

  const categoryLabel = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : 'Weardon';

  return (
    <div className="pdp" id="product-detail-page">
      {/* ── Breadcrumb ── */}
      <div className="pdp-breadcrumb container">
        <button className="pdp-breadcrumb-back" onClick={() => navigate(-1)}>
          <FiArrowLeft size={14} /> Back
        </button>
        <span className="pdp-sep">/</span>
        <Link to={`/?category=${product.category}`} className="pdp-breadcrumb-link">
          {categoryLabel}
        </Link>
        <span className="pdp-sep">/</span>
        <span className="pdp-breadcrumb-current">{product.name}</span>
      </div>

      {/* ── Hero: Gallery + Info ── */}
      <section className="pdp-hero container" aria-label="Product hero">
        {/* Left: Gallery */}
        <ProductGallery product={product} />

        {/* Right: Info */}
        <div className="pdp-info" id="pdp-info">
          {/* Brand + actions row */}
          <div className="pdp-info-top">
            <span className="pdp-brand">Weardon</span>
            <div className="pdp-info-actions">
              <button
                className={`pdp-icon-btn ${liked ? 'liked' : ''}`}
                onClick={() => dispatch(toggleWishlist(product))}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                id="pdp-wishlist-btn"
              >
                <FiHeart size={18} fill={liked ? '#D22B2B' : 'none'} stroke={liked ? '#D22B2B' : 'currentColor'} />
              </button>
              <button
                className="pdp-icon-btn"
                onClick={() => setShowShare(true)}
                aria-label="Share product"
                id="pdp-share-btn"
              >
                <FiShare2 size={18} />
              </button>
            </div>
          </div>

          {/* Name */}
          <h1 className="pdp-name" id="pdp-product-name">{product.name}</h1>
          <p className="pdp-category-tag">{categoryLabel}</p>

          {/* Sold count */}
          {product.soldCount > 0 && (
            <div className="pdp-sold-badge">
              <span className="pdp-sold-dot" />
              <span>{product.soldCount.toLocaleString()} sold</span>
            </div>
          )}

          {/* Price block */}
          <div className="pdp-price-block">
            <div className="pdp-price-row">
              <div>
                <p className="pdp-price-label">Lowest Ask</p>
                <p className="pdp-price" id="pdp-price">{formatPrice(product.price)}</p>
              </div>
              <div className="pdp-price-tag">
                <span>✓ In Stock</span>
              </div>
            </div>
          </div>

          {/* Size selector */}
          <div className={`pdp-size-section ${sizeError ? 'error' : ''}`} id="pdp-size-selector">
            <div className="pdp-size-header">
              <h3>Size <span className="pdp-size-unit">(EU)</span></h3>
              {sizeError && <span className="pdp-size-error">Please select a size</span>}
            </div>
            <div className="pdp-sizes">
              {(product.sizes || []).map(size => (
                <button
                  key={size}
                  className={`pdp-size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  id={`pdp-size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="pdp-cta" id="pdp-cta">
            <button
              className={`pdp-add-to-bag ${cartState}`}
              onClick={handleAddToCart}
              disabled={cartState === 'adding'}
              id="pdp-add-to-bag-btn"
            >
              {cartState === 'idle' && (selectedSize ? `Add to Bag — ${formatPrice(product.price)}` : 'Add to Bag')}
              {cartState === 'adding' && <span className="pdp-btn-spinner" />}
              {cartState === 'added' && <><FiCheck size={16} /> Added to Bag!</>}
            </button>
            <button
              className="pdp-buy-now"
              onClick={handleBuyNow}
              id="pdp-buy-now-btn"
            >
              Buy Now
            </button>
          </div>

          {/* Trust signals */}
          <div className="pdp-trust">
            <div className="pdp-trust-item">
              <FiTruck size={16} className="pdp-trust-icon" />
              <div>
                <strong>Free Delivery</strong>
                <span>On orders over ₵500</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <FiShield size={16} className="pdp-trust-icon" />
              <div>
                <strong>Authenticity Guaranteed</strong>
                <span>Every product verified</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <FiRefreshCw size={16} className="pdp-trust-icon" />
              <div>
                <strong>30-Day Returns</strong>
                <span>Hassle-free returns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Details Accordions ── */}
      <section className="pdp-details container" id="pdp-details" aria-label="Product details">
        <div className="pdp-details-grid">
          <div className="pdp-accordions">
            <AccordionItem title="Highlights" defaultOpen>
              <ul className="pdp-highlights-list">
                <li>Premium handcrafted quality</li>
                <li>Ergonomic footbed for all-day comfort</li>
                <li>Anti-slip textured sole</li>
                <li>Water-resistant finish</li>
                <li>Made in Ghana 🇬🇭</li>
              </ul>
            </AccordionItem>

            <AccordionItem title="Description">
              <p className="pdp-desc-text">
                {product.description || `The ${product.name} represents the pinnacle of Weardon's craftsmanship. Every pair is made with precision, care, and a deep appreciation for Ghanaian artistry. Designed for the modern individual who values both style and substance.`}
              </p>
            </AccordionItem>

            <AccordionItem title="Measurements & Sizing">
              <div className="pdp-measurements">
                <div className="pdp-meas-row">
                  <span>Sole Height</span><span>2.5 cm</span>
                </div>
                <div className="pdp-meas-row">
                  <span>Strap Width</span><span>3 cm</span>
                </div>
                <div className="pdp-meas-row">
                  <span>Sizing</span><span>True to size</span>
                </div>
                <div className="pdp-meas-row">
                  <span>Fit</span><span>Regular</span>
                </div>
              </div>
            </AccordionItem>

            <AccordionItem title="Materials & Composition">
              <div className="pdp-materials">
                <div className="pdp-material-item">
                  <span className="pdp-material-label">Upper</span>
                  <span>Premium synthetic / genuine leather blend</span>
                </div>
                <div className="pdp-material-item">
                  <span className="pdp-material-label">Lining</span>
                  <span>Soft textile lining</span>
                </div>
                <div className="pdp-material-item">
                  <span className="pdp-material-label">Sole</span>
                  <span>Rubber outsole with EVA foam midsole</span>
                </div>
                <div className="pdp-material-item">
                  <span className="pdp-material-label">Care</span>
                  <span>Wipe clean with damp cloth</span>
                </div>
              </div>
            </AccordionItem>
          </div>

          {/* Right: product metadata card */}
          <div className="pdp-metadata-card">
            <h3 className="pdp-metadata-title">Product Info</h3>
            <div className="pdp-metadata-list">
              <div className="pdp-metadata-row">
                <span>SKU</span>
                <span>WD-{String(product.id).slice(0, 6).toUpperCase()}</span>
              </div>
              <div className="pdp-metadata-row">
                <span>Category</span>
                <span>{categoryLabel}</span>
              </div>
              <div className="pdp-metadata-row">
                <span>Condition</span>
                <span>Brand New</span>
              </div>
              <div className="pdp-metadata-row">
                <span>Available Sizes</span>
                <span>{(product.sizes || []).join(', ')}</span>
              </div>
              {product.isNew && (
                <div className="pdp-metadata-row">
                  <span>Status</span>
                  <span className="pdp-meta-new">New Arrival ✨</span>
                </div>
              )}
              {product.trending && (
                <div className="pdp-metadata-row">
                  <span>Trend</span>
                  <span className="pdp-meta-trending">Trending 🔥</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Delivery & Returns ── */}
      <section className="pdp-delivery container" id="pdp-delivery" aria-label="Delivery and returns">
        <h2 className="pdp-section-title">Delivery & Returns</h2>
        <div className="pdp-delivery-grid">
          <div className="pdp-delivery-card">
            <FiTruck size={24} className="pdp-delivery-icon" />
            <h4>Standard Delivery</h4>
            <p>3–5 business days across Ghana. Free on orders over ₵500.</p>
          </div>
          <div className="pdp-delivery-card">
            <FiShield size={24} className="pdp-delivery-icon" />
            <h4>Authenticity Check</h4>
            <p>Every item passes our quality and authenticity verification before shipping.</p>
          </div>
          <div className="pdp-delivery-card">
            <FiRefreshCw size={24} className="pdp-delivery-icon" />
            <h4>Easy Returns</h4>
            <p>Changed your mind? Return within 30 days for a full refund, no questions asked.</p>
          </div>
        </div>
      </section>

      {/* ── Carousels ── */}
      {trendingProducts.length > 0 && (
        <ProductCarousel
          title="Bestsellers 🏆"
          products={trendingProducts}
          seeAllLink="/?filter=trending"
        />
      )}

      {relatedProducts.length > 0 && (
        <ProductCarousel
          title={`More in ${categoryLabel}`}
          products={relatedProducts}
          seeAllLink={`/?category=${product.category}`}
        />
      )}

      {newProducts.length > 0 && (
        <ProductCarousel
          title="You May Also Like ✨"
          products={newProducts}
          seeAllLink="/?filter=new"
        />
      )}

      {/* ── Share Modal ── */}
      {showShare && <ShareModal product={product} onClose={() => setShowShare(false)} />}
    </div>
  );
}

export default ProductDetail;
