const twilio = require('twilio');

const sendWhatsAppNotification = async (order) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const itemsList = order.orderItems
      .map(
        (item) =>
          `• ${item.name?.en || 'Product'} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}`
      )
      .join('\n');

    const message = `
🛍️ *New Order Received - AL-SHAER*

👤 *Customer:* ${order.customerInfo.name}
📞 *Phone:* ${order.customerInfo.phone}
📍 *Address:* ${order.customerInfo.address}, ${order.customerInfo.city}

📦 *Products:*
${itemsList}

💰 *Total Price:* ${order.totalPrice} EGP
💳 *Payment:* ${order.paymentMethod.toUpperCase()}
📋 *Order ID:* ${order._id}
    `.trim();

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.WHATSAPP_TO,
      body: message
    });

    return true;
  } catch (error) {
    console.error('WhatsApp notification error:', error.message);
    return false;
  }
};

module.exports = { sendWhatsAppNotification };
