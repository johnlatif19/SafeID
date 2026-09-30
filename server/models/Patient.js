const { getDB } = require('../config/db');

const COLLECTION = 'patients';

/* ------------------------------------------------------------------ */
/*  CREATE                                                             */
/* ------------------------------------------------------------------ */
async function createPatient(data) {
  const db = getDB();
  const ref = db.collection(COLLECTION).doc(data.userId);

  const patient = {
    _id: ref.id,
    userId: data.userId,
    safeid: data.safeid,

    /* Basic info */
    fullName: data.fullName || '',
    dob: data.dob || '',
    gender: data.gender || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',

    /* Medical */
    bloodType: data.bloodType || '',
    allergies: data.allergies || '',
    conditions: data.conditions || '',
    medications: data.medications || '',

    /* Emergency contact */
    ecName: data.ecName || '',
    ecPhone: data.ecPhone || '',

    /* Profile photo — Cloudinary secure_url */
    photo: data.photo || '',
    photoPublicId: data.photoPublicId || '',   // ← Cloudinary public_id (for deletion)

    /* Status */
    status: 'active',

    /* Timestamps */
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await ref.set(patient);
  return patient;
}

/* ------------------------------------------------------------------ */
/*  READ                                                               */
/* ------------------------------------------------------------------ */
async function findById(id) {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(id).get();
  return doc.exists ? doc.data() : null;
}

async function findBySafeid(safeid) {
  const db = getDB();
  const snap = await db.collection(COLLECTION)
    .where('safeid', '==', safeid)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0].data();
}

async function findByEmail(email) {
  const db = getDB();
  const snap = await db.collection(COLLECTION)
    .where('email', '==', email.toLowerCase().trim())
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0].data();
}

async function listAll() {
  const db = getDB();
  const snap = await db.collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => d.data());
}

async function searchByNameOrSafeid(q) {
  const all = await listAll();
  const s = (q || '').toLowerCase();
  return all.filter((p) =>
    (p.fullName || '').toLowerCase().includes(s) ||
    (p.safeid   || '').toLowerCase().includes(s) ||
    (p.email    || '').toLowerCase().includes(s) ||
    (p.phone    || '').toLowerCase().includes(s)
  );
}

/* ------------------------------------------------------------------ */
/*  UPDATE                                                             */
/* ------------------------------------------------------------------ */
async function update(id, patch) {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).update({
    ...patch,
    updatedAt: new Date().toISOString()
  });
  return findById(id);
}

/* ------------------------------------------------------------------ */
/*  DELETE (admin only)                                                */
/* ------------------------------------------------------------------ */
async function remove(id) {
  const db = getDB();
  await db.collection(COLLECTION).doc(id).delete();
  return true;
}

/* ------------------------------------------------------------------ */
/*  EXPORTS                                                            */
/* ------------------------------------------------------------------ */
module.exports = {
  createPatient,
  findById,
  findBySafeid,
  findByEmail,
  listAll,
  searchByNameOrSafeid,
  update,
  remove,
  COLLECTION
};
