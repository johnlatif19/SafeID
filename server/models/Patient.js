const { getDB } = require('../config/db');

const COLLECTION = 'patients';

async function createPatient(data) {
  const db = getDB();
  const ref = db.collection(COLLECTION).doc(data.userId);
  const patient = {
    _id: ref.id,
    userId: data.userId,
    safeid: data.safeid,
    fullName: data.fullName,
    dob: data.dob || '',
    gender: data.gender || '',
    email: data.email,
    phone: data.phone || '',
    bloodType: data.bloodType || '',
    ecName: data.ecName || '',
    ecPhone: data.ecPhone || '',
    allergies: data.allergies || '',
    conditions: data.conditions || '',
    medications: data.medications || '',
    address: data.address || '',
    photo: data.photo || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };
  await ref.set(patient);
  return patient;
}

async function findById(id) {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();
  return doc.exists ? doc.data() : null;
}

async function findBySafeid(safeid) {
  const db = getDB();
  const snap = await db.collection(COLLECTION).where('safeid', '==', safeid).limit(1).get();
  return snap.empty ? null : snap.docs[0].data();
}

async function update(id, patch) {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).update(patch);
  return findById(id);
}

async function listAll() {
  const db = getDB();
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => d.data());
}

async function searchByNameOrSafeid(q) {
  const all = await listAll();
  const s = q.toLowerCase();
  return all.filter((p) =>
    (p.fullName || '').toLowerCase().includes(s) ||
    (p.safeid || '').toLowerCase().includes(s) ||
    (p.email || '').toLowerCase().includes(s)
  );
}

module.exports = { createPatient, findById, findBySafeid, update, listAll, searchByNameOrSafeid, COLLECTION };