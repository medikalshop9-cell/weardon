import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiArrowLeft, FiHeart, FiShare2, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { addToCart } from '../store/cartSlice';
import { formatPrice } from '../data/products';
import ProductCarousel from '../components/ProductCarousel';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items } = useSelector(state => state.products);
  const product = items.find(p => p.id === parseInt(id));
  const [selectedSize, setSelectedSize] = useState(null);
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="product-detail-not-found container">
        <h2>Product not found</h2>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    );
  }

  const relatedProducts = items
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    dispatch(addToCart({ product, size: selectedSize }));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Generate a placeholder gradient
  const hue = (product.id * 47) % 360;
  const gradientStyle = {
    background: `linear-gradient(135deg, hsl(${hue}, 15%, 85%) 0%, hsl(${hue + 30}, 20%, 92%) 100%)`,
  };

  return (
    <div className="product-detail" id="product-detail-page">
      {/* Breadcrumb */}
      <div className="product-detail-breadcrumb container">
        <Link to="/" className="breadcrumb-link">
          <FiArrowLeft size={16} /> Back
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-category">{product.category}</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-detail-main container">
        {/* Image Gallery */}
        <div className="product-detail-gallery">
          <div className="product-detail-main-image" style={gradientStyle}>
            <span className="product-detail-placeholder">
              {product.name.split(' ').slice(1, 3).map(w => w[0]).join('')}
            </span>
            {product.isNew && <span className="product-badge badge-new">New</span>}
          </div>
          {/* Thumbnail row */}
          <div className="product-detail-thumbnails">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`product-detail-thumb ${i === 0 ? 'active' : ''}`}
                style={{
                  background: `linear-gradient(135deg, hsl(${hue + i * 20}, 15%, 85%) 0%, hsl(${hue + i * 20 + 30}, 20%, 92%) 100%)`
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-detail-info">
          <div className="product-detail-info-top">
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-detail-actions-top">
              <button
                className={`detail-icon-btn ${liked ? 'liked' : ''}`}
                onClick={() => setLiked(!liked)}
                aria-label="Toggle favorite"
              >
                <FiHeart size={20} fill={liked ? '#D22B2B' : 'none'} stroke={liked ? '#D22B2B' : 'currentColor'} />
              </button>
              <button className="detail-icon-btn" aria-label="Share">
                <FiShare2 size={20} />
              </button>
            </div>
          </div>

          <p className="product-detail-category">{product.category}</p>

          <div className="product-detail-price-block">
            <span className="product-detail-price-label">Price</span>
            <span className="product-detail-price">{formatPrice(product.price)}</span>
          </div>

          <p className="product-detail-description">{product.description}</p>

          {/* Size Selector */}
          <div className="product-detail-sizes">
            <h3 className="sizes-title">Select Size</h3>
            <div className="sizes-grid">
              {product.sizes.map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  EU {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-detail-cta">
            <button
              className={`cta-add-to-cart ${!selectedSize ? 'disabled' : ''} ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={!selectedSize}
              id="add-to-cart-btn"
            >
              {addedToCart ? '✓ Added to Cart' : selectedSize ? `Add to Cart — ${formatPrice(product.price)}` : 'Select a Size'}
            </button>
            <button className="cta-buy-now" disabled={!selectedSize} id="buy-now-btn">
              Buy Now
            </button>
          </div>

          {/* Features */}
          <div className="product-detail-features">
            <div className="feature-item">
              <FiTruck size={18} />
              <div>
                <strong>Free Delivery</strong>
                <span>On orders over ₵500</span>
              </div>
            </div>
            <div className="feature-item">
              <FiShield size={18} />
              <div>
                <strong>Authenticity Guarantee</strong>
                <span>100% genuine Weardon product</span>
              </div>
            </div>
            <div className="feature-item">
              <FiRefreshCw size={18} />
              <div>
                <strong>Easy Returns</strong>
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <ProductCarousel
          title="Related Products"
          products={relatedProducts}
        />
      )}
    </div>
  );
}

export default ProductDetail;
