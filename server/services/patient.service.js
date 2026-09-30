const Patient = require('../models/Patient');
const EmergencyProfile = require('../models/EmergencyProfile');
const QrService = require('./qr.service');

async function getProfile(userId) {
  const patient = await Patient.findById(userId);
  if (!patient) throw new Error('Patient not found');

  /* ★★ أضف صورة QR والرابط ★★ */
  const { image, url } = await QrService.getOrCreateForPatient(patient);

  return {
    ...patient,
    qrImage: image,          // ← data URL لصورة QR
    emergencyUrl: url         // ← رابط الطوارئ
  };
}

async function updateProfile(userId, patch) {
  /* ... الكود زي ما هو ... */
  return getProfile(userId);   // ← ★ لازم يرجّع بيانات QR كذلك
}

module.exports = { getProfile, updateProfile };
