import React from 'react';
import MorphText from '../components/ui/MorphText';
import { AsciiGlitchRipple } from '../components/ui/ascii-glitch-ripple';
import { FiStar, FiGlobe, FiAward } from 'react-icons/fi';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <MorphText
            words={["CRAFTED", "AUTHENTIC", "PREMIUM"]}
            interval={2500}
            subtext="The Weardon Heritage"
            fontSize="clamp(3rem, 10vw, 6rem)"
            className="about-hero-morph"
          />
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story container">
        <div className="about-story-grid">
          <div className="about-story-text">
            <h2>Our Story</h2>
            <p>
              Weardon was born out of a profound respect for Ghanaian craftsmanship and a vision to redefine premium footwear. We combine centuries-old techniques with modern comfort technologies to create slippers, slides, and sandals that stand the test of time.
            </p>
            <p>
              Every pair is a testament to the skill of our artisans. From the careful selection of materials to the final stitch, our dedication to quality is unwavering. When you wear Weardon, you are wearing a piece of Ghanaian pride.
            </p>
            
            <AsciiGlitchRipple as="div" className="about-glitch-text" dur={1200} spread={1.2}>
              Experience the difference of true craftsmanship.
            </AsciiGlitchRipple>
          </div>
          <div className="about-story-image-wrap">
            <img src="/assets/images/brand/weardon-story.jpg" alt="Weardon Craftsmanship" className="about-story-image" onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="about-image-placeholder">
              <span>W</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <h2 className="text-center">Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <FiStar size={40} className="value-icon" />
              <h3>Uncompromising Quality</h3>
              <p>We source only the finest materials, ensuring every pair of slippers feels luxurious and lasts for years.</p>
            </div>
            <div className="value-card">
              <FiGlobe size={40} className="value-icon" />
              <h3>Ghanaian Heritage</h3>
              <p>We are deeply rooted in our culture, infusing traditional Kente and Ankara elements into modern designs.</p>
            </div>
            <div className="value-card">
              <FiAward size={40} className="value-icon" />
              <h3>Sustainable Comfort</h3>
              <p>Comfort shouldn't cost the earth. Our ergonomic designs prioritize both your feet and sustainable practices.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
