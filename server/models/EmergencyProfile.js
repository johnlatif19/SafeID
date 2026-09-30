const { getDB } = require('../config/db');

const COLLECTION = 'emergency_profiles';

/* ------------------------------------------------------------------ */
/*  DEFAULT VISIBILITY                                                 */
/*  Only fields marked as `true` will appear on the public emergency  */
/*  page. Sensitive data (like credentials) must NEVER be here.       */
/* ------------------------------------------------------------------ */
const DEFAULT_VISIBLE_FIELDS = {
  fullName:    true,
  photo:       true,
  bloodType:   true,
  allergies:   true,
  conditions:  true,
  medications: true,
  ecName:      true,
  ecPhone:     true,
  notes:       true
};

/* ------------------------------------------------------------------ */
/*  CREATE OR UPDATE                                                   */
/* ------------------------------------------------------------------ */
async function createOrUpdate(patientId, data) {
  const db = getDB();
  const ref = db.collection(COLLECTION).doc(patientId);

  const existing = await ref.get();
  const existingData = existing.exists ? existing.data() : {};

  /* Merge visibility flags — keep existing ones if not provided */
  const visibleFields = {
    ...DEFAULT_VISIBLE_FIELDS,
    ...(existingData.visibleFields || {}),
    ...(data.visibleFields || {})
  };

  const profile = {
    _id: patientId,
    patientId,

    /* Public display data */
    fullName:    data.fullName    ?? existingData.fullName    ?? '',
    photo:       data.photo       ?? existingData.photo       ?? '',
    bloodType:   data.bloodType   ?? existingData.bloodType   ?? '',
    allergies:   data.allergies   ?? existingData.allergies   ?? '',
    conditions:  data.conditions  ?? existingData.conditions  ?? '',
    medications: data.medications ?? existingData.medications ?? '',

    /* Emergency contact */
    ecName:  data.ecName  ?? existingData.ecName  ?? '',
    ecPhone: data.ecPhone ?? existingData.ecPhone ?? '',

    /* Critical notes shown to the rescuer */
    notes: data.notes ?? existingData.notes ?? '',

    /* Visibility flags */
    visibleFields,

    /* Timestamps */
    createdAt: existingData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await ref.set(profile, { merge: true });
  return profile;
}

/* ------------------------------------------------------------------ */
/*  READ                                                               */
/* ------------------------------------------------------------------ */
async function findByPatientId(patientId) {
  const db = getDB();
  const doc = await db.collection(COLLECTION).doc(patientId).get();
  return doc.exists ? doc.data() : null;
}

/* ------------------------------------------------------------------ */
/*  UPDATE VISIBILITY ONLY                                             */
/*  Lets the patient (or parent) toggle which fields appear publicly.  */
/* ------------------------------------------------------------------ */
async function updateVisibility(patientId, visibleFields) {
  const db = getDB();
  const ref = db.collection(COLLECTION).doc(patientId);
  const existing = await ref.get();
  if (!existing.exists) throw new Error('Emergency profile not found');

  const current = existing.data().visibleFields || DEFAULT_VISIBLE_FIELDS;
  const merged = { ...current, ...visibleFields };

  await ref.update({
    visibleFields: merged,
    updatedAt: new Date().toISOString()
  });

  return findByPatientId(patientId);
}

/* ------------------------------------------------------------------ */
/*  PUBLIC PROFILE                                                     */
/*  Returns ONLY the fields whose visibility flag is true.             */
/*  This is what the emergency page shows to a rescuer.                */
/* ------------------------------------------------------------------ */
function buildPublicProfile(profile) {
  if (!profile) return null;

  const v = { ...DEFAULT_VISIBLE_FIELDS, ...(profile.visibleFields || {}) };

  const publicProfile = {
    patientId: profile.patientId,
    safeid: profile.safeid || ''
  };

  if (v.fullName)    publicProfile.fullName    = profile.fullName    || '';
  if (v.photo)       publicProfile.photo       = profile.photo       || '';
  if (v.bloodType)   publicProfile.bloodType   = profile.bloodType   || '';
  if (v.allergies)   publicProfile.allergies   = profile.allergies   || '';
  if (v.conditions)  publicProfile.conditions  = profile.conditions  || '';
  if (v.medications) publicProfile.medications = profile.medications || '';
  if (v.ecName)      publicProfile.ecName      = profile.ecName      || '';
  if (v.ecPhone)     publicProfile.ecPhone     = profile.ecPhone     || '';
  if (v.notes)       publicProfile.notes       = profile.notes       || '';

  return publicProfile;
}

/* ------------------------------------------------------------------ */
/*  DELETE                                                             */
/* ------------------------------------------------------------------ */
async function remove(patientId) {
  const db = getDB();
  await db.collection(COLLECTION).doc(patientId).delete();
  return true;
}

/* ------------------------------------------------------------------ */
/*  EXPORTS                                                            */
/* ------------------------------------------------------------------ */
module.exports = {
  createOrUpdate,
  findByPatientId,
  updateVisibility,
  buildPublicProfile,
  remove,
  DEFAULT_VISIBLE_FIELDS,
  COLLECTION
};
