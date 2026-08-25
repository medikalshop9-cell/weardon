import React, { useState } from 'react';
import { FiChevronDown, FiTruck, FiRefreshCcw, FiMaximize } from 'react-icons/fi';
import './HelpPage.css';

export default function HelpPage() {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const faqs = [
    {
      question: "How long does delivery take?",
      answer: "Standard delivery within Ghana takes 2-4 business days. Express delivery in Accra is available for same-day or next-day delivery."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 14 days of delivery. The items must be unworn, in their original packaging, and with all tags attached."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship globally via DHL Express. International shipping usually takes 5-10 business days."
    },
    {
      question: "How do I care for my Weardon slippers?",
      answer: "Wipe with a damp cloth for regular cleaning. Avoid machine washing or drying under direct sunlight to preserve the premium materials."
    }
  ];

  return (
    <div className="help-page">
      <div className="help-header">
        <div className="container">
          <h1>How can we help you?</h1>
          <p>Find answers to common questions and our store policies.</p>
        </div>
      </div>

      <div className="help-content container">
        {/* Quick Links / Navigation Cards */}
        <div className="help-cards">
          <a href="#delivery" className="help-card">
            <FiTruck size={32} />
            <h3>Delivery Info</h3>
            <p>Shipping rates & times</p>
          </a>
          <a href="#returns" className="help-card">
            <FiRefreshCcw size={32} />
            <h3>Returns</h3>
            <p>Return & exchange policy</p>
          </a>
          <a href="#sizing" className="help-card">
            <FiMaximize size={32} />
            <h3>Size Guide</h3>
            <p>Find your perfect fit</p>
          </a>
        </div>

        {/* FAQs */}
        <div className="help-section" id="faq">
          <h2>Frequently Asked Questions</h2>
          <div className="accordion">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`accordion-item ${activeAccordion === index ? 'active' : ''}`}
              >
                <button className="accordion-header" onClick={() => toggleAccordion(index)}>
                  {faq.question}
                  <FiChevronDown className="accordion-icon" />
                </button>
                <div className="accordion-body">
                  <div className="accordion-content">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="help-section" id="delivery">
          <h2>Delivery Information</h2>
          <div className="policy-block">
            <h3>Domestic Shipping (Ghana)</h3>
            <ul>
              <li><strong>Standard Delivery:</strong> ₵30.00 (2-4 business days)</li>
              <li><strong>Express Delivery (Accra Only):</strong> ₵50.00 (Same or Next day)</li>
              <li><strong>Free Shipping:</strong> On all orders over ₵500</li>
            </ul>
            
            <h3>International Shipping</h3>
            <ul>
              <li><strong>DHL Express:</strong> Rates calculated at checkout based on destination (5-10 business days)</li>
            </ul>
          </div>
        </div>

        {/* Returns */}
        <div className="help-section" id="returns">
          <h2>Returns & Exchanges</h2>
          <div className="policy-block">
            <p>We want you to be completely satisfied with your purchase. If you are not, you can return your items within 14 days.</p>
            <h3>Conditions for Return</h3>
            <ul>
              <li>Items must be unworn and unwashed.</li>
              <li>Items must be in original packaging with tags.</li>
              <li>Return shipping costs are the responsibility of the customer unless the item is defective.</li>
            </ul>
          </div>
        </div>

        {/* Size Guide */}
        <div className="help-section" id="sizing">
          <h2>Size Guide</h2>
          <div className="policy-block">
            <p>Our footwear runs true to size. If you are between sizes, we recommend sizing up for slides and sandals.</p>
            <div className="table-responsive">
              <table className="size-table">
                <thead>
                  <tr>
                    <th>EU Size</th>
                    <th>UK Size</th>
                    <th>US (Men)</th>
                    <th>US (Women)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>38</td><td>5</td><td>6</td><td>7.5</td></tr>
                  <tr><td>39</td><td>6</td><td>7</td><td>8.5</td></tr>
                  <tr><td>40</td><td>6.5</td><td>7.5</td><td>9</td></tr>
                  <tr><td>41</td><td>7.5</td><td>8.5</td><td>10</td></tr>
                  <tr><td>42</td><td>8</td><td>9</td><td>10.5</td></tr>
                  <tr><td>43</td><td>9</td><td>10</td><td>11.5</td></tr>
                  <tr><td>44</td><td>9.5</td><td>10.5</td><td>12</td></tr>
                  <tr><td>45</td><td>10.5</td><td>11.5</td><td>13</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
