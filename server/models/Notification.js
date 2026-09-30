const { getDB } = require('../config/db');

const COLLECTION = 'notifications';

async function create({ parentId, title, message, type = 'info' }) {
  const db = getDB();
  const ref = db.collection(COLLECTION).doc();
  const doc = {
    _id: ref.id,
    parentId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  await ref.set(doc);
  return doc;
}

async function listByParent(parentId) {
  const db = getDB();
  const snap = await db.collection(COLLECTION)
    .where('parentId', '==', parentId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => d.data());
}

async function countByParent(parentId) {
  const db = getDB();
  const snap = await db.collection(COLLECTION).where('parentId', '==', parentId).count().get();
  return snap.data().count;
}

module.exports = { create, listByParent, countByParent, COLLECTION };