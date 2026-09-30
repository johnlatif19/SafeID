const { getDB } = require('../config/db');

const COLLECTION = 'parents';

async function createParent(data) {
  const db = getDB();
  const ref = db.collection(COLLECTION).doc(data.userId);
  const parent = {
    _id: ref.id,
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone || '',
    relationship: data.relationship || '',
    children: [], // Array of patient userIds
    status: 'active',
    createdAt: new Date().toISOString()
  };
  await ref.set(parent);
  return parent;
}

async function findById(id) {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();
  return doc.exists ? doc.data() : null;
}

async function update(id, patch) {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).update(patch);
  return findById(id);
}

async function linkChild(parentId, childUserId) {
  const db = getDB();
  const parent = await findById(parentId);
  if (!parent) throw new Error('Parent not found');
  const children = new Set(parent.children || []);
  children.add(childUserId);
  await db.collection(COLLECTION).doc(parentId).update({ children: [...children] });
  return findById(parentId);
}

async function unlinkChild(parentId, childUserId) {
  const db = getDB();
  const parent = await findById(parentId);
  if (!parent) throw new Error('Parent not found');
  const children = (parent.children || []).filter((c) => c !== childUserId);
  await db.collection(COLLECTION).doc(parentId).update({ children });
  return findById(parentId);
}

async function listAll() {
  const db = getDB();
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data());
}

module.exports = { createParent, findById, update, linkChild, unlinkChild, listAll, COLLECTION };