import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './BrandGrid.css';

function BrandGrid() {
  const { categories } = useSelector((state) => state.products);

  // Use a fallback gradient if no image is uploaded
  const getGradient = (index) => {
    const hues = [160, 40, 240, 340, 200, 280];
    const h = hues[index % hues.length];
    return `linear-gradient(135deg, hsl(${h}, 50%, 20%) 0%, hsl(${h}, 50%, 10%) 100%)`;
  };

  return (
    <section className="brand-grid-section">
      <div className="brand-grid-header container">
        <h2 className="brand-grid-title">Popular Categories</h2>
        <a href="#" className="brand-grid-see-all">See All →</a>
      </div>
      <div className="brand-grid container">
        {categories.map((cat, index) => {
          return (
            <Link
              key={cat.id}
              to={`/?category=${cat.id}`}
              className="brand-card"
              style={{ background: cat.image ? `url(${cat.image}) center/cover` : getGradient(index) }}
              id={`category-${cat.id}`}
            >
              <div className="brand-card-overlay"></div>
              <div className="brand-card-content">
                <h3 className="brand-card-name">{cat.name}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default BrandGrid;
