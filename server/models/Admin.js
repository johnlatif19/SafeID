const { getDB } = require('../config/db');

const COLLECTION = 'admins';

async function createAdmin(data) {
  const db = getDB();
  const ref = db.collection(COLLECTION).doc(data.userId);
  const admin = {
    _id: ref.id,
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    role: 'ADMIN',
    status: 'active',
    createdAt: new Date().toISOString()
  };
  await ref.set(admin);
  return admin;
}

async function findById(id) {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();
  return doc.exists ? doc.data() : null;
}

module.exports = { createAdmin, findById, COLLECTION };