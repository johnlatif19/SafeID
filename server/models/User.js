const { getDB } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');

const COLLECTION = 'users';

async function createUser({ email, password, role, fullName, phone, status = 'active' }) {
  const db = getDB();
  const existing = await findByEmail(email);
  if (existing) throw new Error('Email already registered');

  const passwordHash = await hashPassword(password);
  const ref = db.collection(COLLECTION).doc();
  const user = {
    _id: ref.id,
    email: email.toLowerCase().trim(),
    passwordHash,
    role, // PATIENT | PARENT | ADMIN
    fullName,
    phone: phone || '',
    status,
    createdAt: new Date().toISOString()
  };
  await ref.set(user);
  return user;
}

async function findByEmail(email) {
  const db = getDB();
  const snap = await db.collection(COLLECTION)
    .where('email', '==', email.toLowerCase().trim())
    .limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data();
}

async function findById(id) {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();
  return doc.exists ? doc.data() : null;
}

async function updateUser(id, patch) {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).update(patch);
  return findById(id);
}

async function verifyPassword(user, password) {
  return comparePassword(password, user.passwordHash);
}

function sanitize(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = { createUser, findByEmail, findById, updateUser, verifyPassword, sanitize, COLLECTION };