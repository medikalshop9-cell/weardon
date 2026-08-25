import html2pdf from 'html2pdf.js';
import { formatPrice } from '../data/products';

export const downloadOrderReceipt = (order) => {
  const element = document.createElement('div');
  
  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 0; text-align: left;">
        <span style="font-weight: 600; display: block;">${item.name}</span>
        <span style="color: #666; font-size: 12px;">Size: EU ${item.size}</span>
      </td>
      <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  element.innerHTML = `
    <div style="padding: 40px; font-family: 'Inter', sans-serif; color: #333; max-width: 800px; margin: 0 auto; background: white;">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #e0a96d; padding-bottom: 20px;">
        <div>
          <h1 style="margin: 0; font-size: 28px; color: #121212;">Weardon</h1>
          <p style="margin: 5px 0 0; color: #666;">Premium Footwear</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 24px; color: #121212;">RECEIPT</h2>
          <p style="margin: 5px 0 0; color: #666; font-weight: 600;">Ref: ${order.orderRef}</p>
        </div>
      </div>

      <!-- Order Info & Delivery -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <div>
          <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #888;">Order Info</h3>
          <p style="margin: 0 0 5px;"><strong>Date:</strong> ${order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
          <p style="margin: 0 0 5px;"><strong>Status:</strong> <span style="text-transform: uppercase;">${order.status}</span></p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #888;">Delivery Details</h3>
          <p style="margin: 0 0 5px;"><strong>${order.deliveryInfo?.name || order.userEmail}</strong></p>
          <p style="margin: 0 0 5px;">${order.deliveryInfo?.address}</p>
          <p style="margin: 0 0 5px;">${order.deliveryInfo?.city}</p>
          <p style="margin: 0 0 5px;">${order.deliveryInfo?.phone}</p>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead>
          <tr style="border-bottom: 2px solid #121212;">
            <th style="padding: 12px 0; text-align: left; color: #121212;">Item</th>
            <th style="padding: 12px 0; text-align: center; color: #121212;">Qty</th>
            <th style="padding: 12px 0; text-align: right; color: #121212;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Summary -->
      <div style="width: 300px; margin-left: auto;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">Subtotal</span>
          <span>${formatPrice(order.subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <span style="color: #666;">Delivery</span>
          <span>${order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #121212;">
          <strong style="font-size: 18px;">Total</strong>
          <strong style="font-size: 18px; color: #e0a96d;">${formatPrice(order.total)}</strong>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="margin-top: 60px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="margin: 0;">Thank you for shopping with Weardon.</p>
        <p style="margin: 5px 0 0;">WhatsApp: +233 556 008 189</p>
      </div>
    </div>
  `;

  const opt = {
    margin:       [0.5, 0.5, 0.5, 0.5],
    filename:     `Weardon_Receipt_${order.orderRef}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};
