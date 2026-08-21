import { useState, useEffect, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { heroBanners } from '../data/products';
import './HeroBanner.css';

function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroBanners.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + heroBanners.length) % heroBanners.length);
  }, [currentSlide, goToSlide]);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="hero-banner" id="hero-banner">
      <div className="hero-slider">
        {heroBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundColor: banner.bgColor }}
          >
            {/* Decorative kente-inspired geometric pattern */}
            <div className="hero-pattern"></div>

            <div className="hero-content container">
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
        {heroBanners.map((_, index) => (
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
