import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import ProductCarousel from '../components/ProductCarousel';
import BrandGrid from '../components/BrandGrid';
import ProductGrid from '../components/ProductGrid';
import './Home.css';

function Home() {
  const { items } = useSelector(state => state.products);
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const category = searchParams.get('category');

  // Curate different product selections
  const trendingProducts = items.filter(p => p.trending);
  const newProducts = items.filter(p => p.isNew);
  const popularProducts = [...items].sort((a, b) => b.soldCount - a.soldCount).slice(0, 6);
  const luxuryProducts = items.filter(p => p.category === 'luxury');

  // If a filter or category is active, show only that filtered grid
  if (filter || category) {
    let filteredItems = items;
    let title = 'Products';

    if (filter === 'trending') {
      filteredItems = trendingProducts;
      title = 'Trending 🔥';
    } else if (filter === 'new') {
      filteredItems = newProducts;
      title = 'New Arrivals ✨';
    } else if (category) {
      filteredItems = items.filter(p => p.category === category);
      title = category.charAt(0).toUpperCase() + category.slice(1);
    }

    return (
      <div className="home-page" id="home-page" style={{ paddingTop: '20px', minHeight: '60vh' }}>
        <ProductGrid
          title={title}
          products={filteredItems}
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
