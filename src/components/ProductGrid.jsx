import ProductCard from './ProductCard';
import './ProductGrid.css';

function ProductGrid({ title, products, columns = 4 }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="product-grid-section">
      {title && (
        <div className="product-grid-header container">
          <h2 className="product-grid-title">{title}</h2>
        </div>
      )}
      <div
        className="product-grid container"
        style={{ '--grid-columns': columns }}
      >
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;
