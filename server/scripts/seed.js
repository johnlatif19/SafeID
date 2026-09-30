require('dotenv').config();
const { initFirebase, getDB } = require('../config/db');
const User = require('../models/User');
const Admin = require('../models/Admin');

(async () => {
  try {
    initFirebase();

    const username = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!username || !passwordHash) {
      console.error('❌ Missing ADMIN_USERNAME or ADMIN_PASSWORD_HASH in .env');
      process.exit(1);
    }

    if (passwordHash.length !== 60) {
      console.error('❌ ADMIN_PASSWORD_HASH does not look like a bcrypt hash (must be 60 chars)');
      process.exit(1);
    }

    const email = `${username}@safeid.local`; // internal email derived from username

    const existing = await User.findByEmail(email);
    if (existing) {
      console.log('ℹ️  Admin already exists:', username);
      process.exit(0);
    }

    const db = getDB();
    const ref = db.collection('users').doc();
    const user = {
      _id: ref.id,
      email,
      username,
      passwordHash, // already hashed
      role: 'ADMIN',
      fullName: username,
      phone: '',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    await ref.set(user);

    await Admin.createAdmin({
      userId: user._id,
      fullName: username,
      email
    });

    console.log('✅ Admin created successfully');
    console.log('   Username:', username);
    console.log('   Email   :', email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
})();