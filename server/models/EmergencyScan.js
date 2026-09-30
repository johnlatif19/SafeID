const { getDB } = require('../config/db');

const COLLECTION = 'emergency_scans';

async function logScan({ patientId, tokenId, ip, userAgent, status = 'pending' }) {
  const db = getDB();
  const ref = db.collection(COLLECTION).doc();
  const scan = {
    _id: ref.id,
    patientId,
    tokenId,
    ip: ip || '',
    userAgent: userAgent || '',
    status,
    createdAt: new Date().toISOString()
  };
  await ref.set(scan);
  return scan;
}

async function listRecent(limit = 20) {
  const db = getDB();
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map((d) => d.data());
}

async function listAll() {
  const db = getDB();
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data());
}

async function countAll() {
  const db = getDB();
  const snap = await db.collection(COLLECTION).count().get();
  return snap.data().count;
}

module.exports = { logScan, listRecent, listAll, countAll, COLLECTION };