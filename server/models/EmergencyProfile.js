const { getDB } = require('../config/db');

const COLLECTION = 'emergency_profiles';

async function createOrUpdate(patientId, data) {
  const db = getDB();
  const ref = db.collection(COLLECTION).doc(patientId);
  const profile = {
    _id: patientId,
    patientId,
    fullName: data.fullName || '',
    photo: data.photo || '',
    bloodType: data.bloodType || '',
    allergies: data.allergies || '',
    conditions: data.conditions || '',
    medications: data.medications || '',
    ecName: data.ecName || '',
    ecPhone: data.ecPhone || '',
    notes: data.notes || '',
    visibleFields: data.visibleFields || {
      bloodType: true, allergies: true, conditions: true,
      medications: true, ecName: true, ecPhone: true, notes: true
    },
    updatedAt: new Date().toISOString()
  };
  await ref.set(profile, { merge: true });
  return profile;
}

async function findByPatientId(patientId) {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(patientId).get();
  return doc.exists ? doc.data() : null;
}

module.exports = { createOrUpdate, findByPatientId, COLLECTION };