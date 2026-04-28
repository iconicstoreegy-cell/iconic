const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // use App Password for Gmail
  }
});

// Send OTP email
const sendOTPEmail = async (email, name, otp) => {
  try {
    await transporter.sendMail({
      from: `"TreVero" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email — TreVero',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5;">
          <div style="background: #0a0a0a; padding: 32px; text-align: center;">
            <h1 style="color: #fff; font-size: 22px; letter-spacing: 6px; margin: 0;">TreVero</h1>
            <p style="color: #737373; font-size: 11px; letter-spacing: 3px; margin: 6px 0 0;">نريفيرو</p>
          </div>
          <div style="padding: 40px 32px;">
            <p style="color: #171717; font-size: 16px; margin: 0 0 8px;">Hello, ${name}</p>
            <p style="color: #525252; font-size: 14px; margin: 0 0 32px;">Use the code below to verify your email address.</p>
            <div style="background: #f5f5f5; border: 1px solid #e5e5e5; padding: 24px; text-align: center; margin-bottom: 32px;">
              <p style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #0a0a0a; margin: 0;">${otp}</p>
            </div>
            <p style="color: #737373; font-size: 12px; margin: 0;">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
          </div>
          <div style="background: #f5f5f5; padding: 16px 32px; text-align: center;">
            <p style="color: #a3a3a3; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} TreVero. All rights reserved.</p>
          </div>
        </div>
      `
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

// Send order confirmation email to admin
const sendOrderEmail = async (order) => {
  try {
    const itemsHtml = order.orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f5f5f5;">
          <strong>${item.name?.en || 'Product'}</strong><br/>
          <span style="color: #737373; font-size: 12px;">Size: ${item.size || '—'} | Color: ${item.color || '—'}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #f5f5f5; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f5f5f5; text-align: right;">${item.price * item.quantity} EGP</td>
      </tr>
    `).join('');

    const paymentMethodLabel = {
      cash: '💵 Cash on Delivery',
      instapay: '📱 InstaPay',
      vodafone_cash: '📲 Vodafone Cash'
    }[order.paymentMethod] || order.paymentMethod;

    const transferNote = order.transferReceiptUrl
      ? `<p style="margin: 8px 0;"><a href="${order.transferReceiptUrl}" style="color: #0a0a0a; font-weight: bold;">📎 View Transfer Receipt</a></p>`
      : '';

    await transporter.sendMail({
      from: `"TreVero" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🛍️ New Order #${order._id.toString().slice(-8).toUpperCase()} — TreVero`,
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5;">
          <div style="background: #0a0a0a; padding: 32px; text-align: center;">
            <h1 style="color: #fff; font-size: 22px; letter-spacing: 6px; margin: 0;">NEW ORDER</h1>
            <p style="color: #737373; font-size: 12px; margin: 6px 0 0;">TreVero</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 13px; color: #737373; margin: 0 0 4px;">Order ID</p>
            <p style="font-size: 18px; font-weight: 700; font-family: monospace; margin: 0 0 24px;">#${order._id.toString().slice(-8).toUpperCase()}</p>

            <h3 style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #737373; margin: 0 0 12px;">Customer</h3>
            <table style="width: 100%; margin-bottom: 24px;">
              <tr><td style="padding: 4px 0; color: #525252; font-size: 14px;"><strong>Name:</strong> ${order.customerInfo.name}</td></tr>
              <tr><td style="padding: 4px 0; color: #525252; font-size: 14px;"><strong>Phone:</strong> ${order.customerInfo.phone}</td></tr>
              <tr><td style="padding: 4px 0; color: #525252; font-size: 14px;"><strong>Address:</strong> ${order.customerInfo.address}, ${order.customerInfo.city}</td></tr>
              ${order.customerInfo.notes ? `<tr><td style="padding: 4px 0; color: #525252; font-size: 14px;"><strong>Notes:</strong> ${order.customerInfo.notes}</td></tr>` : ''}
            </table>

            <h3 style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #737373; margin: 0 0 12px;">Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Product</th>
                  <th style="padding: 10px; text-align: center; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Qty</th>
                  <th style="padding: 10px; text-align: right; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <div style="background: #f5f5f5; padding: 16px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #525252; font-size: 14px;">Payment Method</span>
                <span style="font-weight: 600; font-size: 14px;">${paymentMethodLabel}</span>
              </div>
              ${transferNote}
              <div style="display: flex; justify-content: space-between; border-top: 1px solid #e5e5e5; padding-top: 12px; margin-top: 8px;">
                <span style="font-weight: 700; font-size: 16px;">Total</span>
                <span style="font-weight: 700; font-size: 16px;">${order.totalPrice} EGP</span>
              </div>
            </div>

            <a href="${process.env.CLIENT_URL}/admin/orders/${order._id}" style="display: inline-block; background: #0a0a0a; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">
              View Order in Dashboard →
            </a>
          </div>
        </div>
      `
    });
    return true;
  } catch (err) {
    console.error('Order email error:', err.message);
    return false;
  }
};

module.exports = { sendOTPEmail, sendOrderEmail };
