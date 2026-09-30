const { getDB } = require('../config/db');
const { randomToken } = require('../utils/token');

const COLLECTION = 'qr_tokens';

async function createToken({ patientId, safeid }) {
  const db = getDB();
  const token = randomToken(32);
  const ref = db.collection(COLLECTION).doc();
  const doc = {
    _id: ref.id,
    patientId,
    safeid,
    token,
    active: true,
    createdAt: new Date().toISOString(),
    disabledAt: null
  };
  await ref.set(doc);
  return doc;
}

async function findByToken(token) {
  const db = getDB();
  const snap = await db.collection(COLLECTION).where('token', '==', token).limit(1).get();
  return snap.empty ? null : snap.docs[0].data();
}

async function findActiveByPatientId(patientId) {
  const db = getDB();
  const snap = await db.collection(COLLECTION)
    .where('patientId', '==', patientId)
    .where('active', '==', true)
    .limit(1).get();
  return snap.empty ? null : snap.docs[0].data();
}

async function disableById(id) {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).update({ active: false, disabledAt: new Date().toISOString() });
}

async function toggle(id) {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) throw new Error('Token not found');
  const data = doc.data();
  await db.collection(COLLECTION).doc(id).update({ active: !data.active });
  return { ...data, active: !data.active };
}

async function regenerate(patientId, safeid) {
  const old = await findActiveByPatientId(patientId);
  if (old) await disableById(old._id);
  return createToken({ patientId, safeid });
}

async function listAll() {
  const db = getDB();
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data());
}

module.exports = { createToken, findByToken, findActiveByPatientId, disableById, toggle, regenerate, listAll, COLLECTION };