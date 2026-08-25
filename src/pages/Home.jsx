import { useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import HeroBanner from '../components/HeroBanner';
import ProductCarousel from '../components/ProductCarousel';
import BrandGrid from '../components/BrandGrid';
import ProductGrid from '../components/ProductGrid';
import './Home.css';

function Home() {
  const { items, searchQuery, filteredItems } = useSelector(state => state.products);
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const category = searchParams.get('category');

  // Curate different product selections
  const trendingProducts = items.filter(p => p.trending);
  const newProducts = items.filter(p => p.isNew);
  const popularProducts = [...items].sort((a, b) => b.soldCount - a.soldCount).slice(0, 6);
  const luxuryProducts = items.filter(p => p.category === 'luxury');

  // If a filter or category or search is active, show only that filtered grid
  if (filter || category || searchQuery) {
    let finalItems = items;
    let title = 'Products';

    if (searchQuery) {
      finalItems = filteredItems;
      title = `Search Results for "${searchQuery}"`;
    } else if (filter === 'trending') {
      finalItems = trendingProducts;
      title = 'Trending 🔥';
    } else if (filter === 'new') {
      finalItems = newProducts;
      title = 'New Arrivals ✨';
    } else if (category) {
      finalItems = items.filter(p => p.category === category);
      title = category.charAt(0).toUpperCase() + category.slice(1);
    }

    return (
      <div className="home-page" id="home-page" style={{ paddingTop: '20px', minHeight: '60vh' }}>
        <ProductGrid
          title={title}
          products={finalItems}
          columns={4}
        />
      </div>
    );
  }

  return (
    <div className="home-page" id="home-page">
      {/* Hero Banner Carousel */}
      <HeroBanner />

      {/* Recommended For You (Trending) */}
      <ProductCarousel
        title="Recommended For You 🔥"
        products={trendingProducts}
        seeAllLink="#"
      />

      {/* Popular Categories */}
      <BrandGrid />
      
      {/* Discover Other Shops Promo */}
      <section className="container" style={{ margin: '4rem auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(37, 211, 102, 0.1) 100%)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '64px', height: '64px', background: '#25D366', color: 'white', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
          }}>
            <FiShoppingBag size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>View Other Shops</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Weardon is a thriving marketplace. Discover unique footwear from independent sellers and brands.
          </p>
          <Link to="/shops" id="view-other-shops-btn" style={{
            display: 'inline-block', background: 'var(--text-primary)', color: 'var(--bg-primary)',
            padding: '1rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
            marginTop: '1rem', transition: 'transform 0.2s'
          }}>
            Explore All Shops
          </Link>
        </div>
      </section>

      {/* Trending Slippers */}
      <div className="section-divider container"></div>
      <ProductGrid
        title="Trending Slippers 🔥"
        products={trendingProducts}
        columns={4}
      />

      {/* Seasonal Promo Banner */}
      <section className="seasonal-banner container">
        <div className="seasonal-banner-inner">
          <div className="seasonal-banner-content">
            <span className="seasonal-tag">New Collection</span>
            <h2 className="seasonal-title">PACK LIKE A PRO</h2>
            <p className="seasonal-subtitle">Essential slippers for every occasion</p>
            <button className="seasonal-cta">Shop Now</button>
          </div>
          <div className="seasonal-banner-visual">
            <div className="seasonal-visual-circle"></div>
          </div>
        </div>
      </section>

      {/* Most Popular */}
      <ProductCarousel
        title="Most Popular Shoes 👟"
        products={popularProducts}
        seeAllLink="#"
      />

      {/* New Arrivals Grid */}
      <div className="section-divider container"></div>
      <ProductGrid
        title="New Arrivals ✨"
        products={newProducts}
        columns={4}
      />

      {/* Luxury Collection */}
      <ProductCarousel
        title="Luxury Collection 💎"
        products={luxuryProducts}
        seeAllLink="#"
      />
    </div>
  );
}

export default Home;
