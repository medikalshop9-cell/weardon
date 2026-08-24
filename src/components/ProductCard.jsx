import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { formatPrice } from '../data/products';
import './ProductCard.css';

function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);

  // Generate a placeholder gradient based on product id for visual variety
  const hue = (product.id * 47) % 360;
  const gradientStyle = {
    background: `linear-gradient(135deg, hsl(${hue}, 15%, 85%) 0%, hsl(${hue + 30}, 20%, 92%) 100%)`,
  };

  return (
    <div className="product-card" id={`product-card-${product.id}`}>
      <Link to={`/product/${product.id}`} className="product-card-image-link">
        <div className="product-card-image" style={gradientStyle}>
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <span className="product-card-placeholder-text">
              {product.name.split(' ').slice(1, 3).map(w => w[0]).join('')}
            </span>
          )}
          {product.isNew && <span className="product-badge badge-new">New</span>}
          {product.trending && <span className="product-badge badge-trending">🔥</span>}
        </div>
      </Link>

      <button
        className={`product-card-heart ${liked ? 'liked' : ''}`}
        onClick={() => setLiked(!liked)}
        aria-label="Toggle favorite"
      >
        <FiHeart size={16} fill={liked ? '#D22B2B' : 'none'} stroke={liked ? '#D22B2B' : 'currentColor'} />
      </button>

      <Link to={`/product/${product.id}`} className="product-card-info">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-price-label">Lowest Ask</p>
        <p className="product-card-price">{formatPrice(product.price)}</p>
        {product.soldCount && (
          <p className="product-card-sold">
            <span className="sold-count">{product.soldCount.toLocaleString()}</span> sold
          </p>
        )}
      </Link>
    </div>
  );
}

export default ProductCard;
