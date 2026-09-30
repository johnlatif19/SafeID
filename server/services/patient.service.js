const Patient = require('../models/Patient');
const EmergencyProfile = require('../models/EmergencyProfile');
const QrService = require('./qr.service');

async function getProfile(userId) {
  const patient = await Patient.findById(userId);
  if (!patient) throw new Error('Patient not found');

  const { image, url } = await QrService.getOrCreateForPatient(patient);
  return { ...patient, qrImage: image, emergencyUrl: url };
}

async function updateProfile(userId, patch) {
  const allowed = ['fullName', 'dob', 'gender', 'phone', 'bloodType',
    'ecName', 'ecPhone', 'allergies', 'conditions', 'medications', 'address', 'photo'];
  const clean = {};
  allowed.forEach((k) => { if (patch[k] !== undefined) clean[k] = patch[k]; });

  const updated = await Patient.update(userId, clean);

  await EmergencyProfile.createOrUpdate(userId, {
    fullName: updated.fullName,
    photo: updated.photo,
    bloodType: updated.bloodType,
    allergies: updated.allergies,
    conditions: updated.conditions,
    medications: updated.medications,
    ecName: updated.ecName,
    ecPhone: updated.ecPhone
  });

  return getProfile(userId);
}

module.exports = { getProfile, updateProfile };