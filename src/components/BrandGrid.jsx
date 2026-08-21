import { Link } from 'react-router-dom';
import { categories } from '../data/products';
import './BrandGrid.css';

function BrandGrid() {
  const displayCategories = categories.filter(c => c.id !== 'all');

  // Color map for category cards — kente-inspired palettes
  const colorMap = {
    slides: { bg: '#1a3a2a', accent: '#00B159' },
    'flip-flops': { bg: '#2a1a0a', accent: '#FFB800' },
    sandals: { bg: '#1a1a2a', accent: '#6C7AE0' },
    luxury: { bg: '#2a0a1a', accent: '#D22B2B' },
  };

  return (
    <section className="brand-grid-section">
      <div className="brand-grid-header container">
        <h2 className="brand-grid-title">Popular Categories</h2>
        <a href="#" className="brand-grid-see-all">See All →</a>
      </div>
      <div className="brand-grid container">
        {displayCategories.map(cat => {
          const colors = colorMap[cat.id] || { bg: '#1a1a1a', accent: '#00B159' };
          return (
            <Link
              key={cat.id}
              to={`/?category=${cat.id}`}
              className="brand-card"
              style={{ backgroundColor: colors.bg }}
              id={`category-${cat.id}`}
            >
              <div className="brand-card-content">
                <span className="brand-card-icon">{cat.icon}</span>
                <h3 className="brand-card-name">{cat.name}</h3>
              </div>
              <div
                className="brand-card-accent"
                style={{ backgroundColor: colors.accent }}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default BrandGrid;
