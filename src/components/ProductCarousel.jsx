import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import ProductCard from './ProductCard';
import './ProductCarousel.css';

function ProductCarousel({ title, products, seeAllLink }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="product-carousel">
      <div className="product-carousel-header container">
        <h2 className="product-carousel-title">
          {title}
        </h2>
        {seeAllLink && (
          <a href={seeAllLink} className="product-carousel-see-all">
            See All <FiArrowRight size={14} />
          </a>
        )}
      </div>

      <div className="product-carousel-wrapper">
        <button
          className="carousel-nav carousel-nav-left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <FiChevronLeft size={20} />
        </button>

        <div className="product-carousel-track" ref={scrollRef}>
          <div className="product-carousel-items container">
            {products.map(product => (
              <div className="product-carousel-item" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <button
          className="carousel-nav carousel-nav-right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

export default ProductCarousel;
