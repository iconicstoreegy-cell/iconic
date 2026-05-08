require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const existing = await User.findOne({ email: 'admin@alshaer.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  await User.create({
    name: 'Admin',
    email: 'iconic.store.egy@gmail.com',
    password: 'Iconic@2026@1234',
    role: 'admin'
  });

  console.log('✅ Admin created: admin@alshaer.com / Admin@1234');
  process.exit(0);
}

createAdmin().catch(console.error);
