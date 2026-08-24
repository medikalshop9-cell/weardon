import { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getBanners } from '../firebase/firestore';
import './HeroBanner.css';

function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    async function loadBanners() {
      try {
        const data = await getBanners();
        setBanners(data);
      } catch (err) {
        console.error('Failed to load banners', err);
      }
    }
    loadBanners();
  }, []);

  const goToSlide = useCallback((index) => {
    if (isAnimating || banners.length === 0) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, banners.length]);

  const nextSlide = useCallback(() => {
    if (banners.length === 0) return;
    goToSlide((currentSlide + 1) % banners.length);
  }, [currentSlide, goToSlide, banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length === 0) return;
    goToSlide((currentSlide - 1 + banners.length) % banners.length);
  }, [currentSlide, goToSlide, banners.length]);

  // Auto-rotate
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="hero-banner" id="hero-banner">
      <div className="hero-slider">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ 
              backgroundImage: `url(${banner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="hero-overlay" style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}></div>

            <div className="hero-content container" style={{ position: 'relative', zIndex: 10 }}>
              <div className="hero-text">
                <h1 className="hero-title">{banner.title}</h1>
                <p className="hero-subtitle">{banner.subtitle}</p>
                <button className="hero-cta">{banner.cta}</button>
              </div>
              <div className="hero-visual">
                {/* Decorative shoe silhouette area */}
                <div className="hero-product-showcase">
                  <span className="hero-showcase-text">W</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className="hero-nav hero-nav-left"
        onClick={prevSlide}
        aria-label="Previous slide"
        id="hero-prev"
      >
        <FiChevronLeft size={24} />
      </button>
      <button
        className="hero-nav hero-nav-right"
        onClick={nextSlide}
        aria-label="Next slide"
        id="hero-next"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="hero-dots">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroBanner;
