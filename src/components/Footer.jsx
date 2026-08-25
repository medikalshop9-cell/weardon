import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiPhone } from 'react-icons/fi';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="kente-trim"></div>
      <div className="footer-inner container">
        {/* Brand */}
        <div className="footer-col footer-brand-col">
          <h3 className="footer-logo">Weardon</h3>
          <p className="footer-tagline">
            Premium unisex slippers crafted with pride in Ghana 🇬🇭
          </p>
          <div className="footer-socials">
            <a
              href="https://www.facebook.com/WearDon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              id="footer-facebook"
            >
              <FiFacebook size={18} />
            </a>
            <a
              href="https://www.instagram.com/weardon70"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              id="footer-instagram"
            >
              <FiInstagram size={18} />
            </a>
            <a href="#" aria-label="Twitter" id="footer-twitter">
              <FiTwitter size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/?category=slides">Slides</Link></li>
            <li><Link to="/?category=sandals">Sandals</Link></li>
            <li><Link to="/?category=flip-flops">Flip-Flops</Link></li>
            <li><Link to="/?category=luxury">Luxury</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <ul className="footer-links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/about#careers">Careers</Link></li>
            <li><Link to="/about#press">Press</Link></li>
            <li><Link to="/about#sustainability">Sustainability</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div className="footer-col">
          <h4 className="footer-col-title">Help</h4>
          <ul className="footer-links">
            <li><Link to="/help#delivery">Delivery Info</Link></li>
            <li><Link to="/help#returns">Returns</Link></li>
            <li><Link to="/help#sizing">Size Guide</Link></li>
            <li><Link to="/help#faq">FAQ</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contact</h4>
          <ul className="footer-links footer-contact-links">
            <li>
              <FiPhone size={14} />
              <a href="tel:233556008189">+233 556 008 189</a>
            </li>
            <li>
              <FiMail size={14} />
              <a href="mailto:weadon70@gmail.com">weadon70@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} Weardon. All rights reserved.</p>
          <p className="footer-country">Made with ❤️ in Ghana</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
