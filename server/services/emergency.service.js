const QrToken = require('../models/QrToken');
const Patient = require('../models/Patient');
const EmergencyProfile = require('../models/EmergencyProfile');
const EmergencyScan = require('../models/EmergencyScan');
const Parent = require('../models/Parent');
const Notification = require('../services/notification.service');

async function getPublicProfile(token, req) {
  const qr = await QrToken.findByToken(token);
  if (!qr || !qr.active) throw new Error('NOT_FOUND');

  const patient = await Patient.findById(qr.patientId);
  if (!patient || patient.status !== 'active') throw new Error('NOT_FOUND');

  const profile = await EmergencyProfile.findByPatientId(patient._id);

  await EmergencyScan.logScan({
    patientId: patient._id,
    tokenId: qr._id,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Notify linked parents
  try {
    const parents = await Parent.listAll();
    const linked = parents.filter((p) => (p.children || []).includes(patient._id));
    for (const p of linked) {
      await Notification.create({
        parentId: p._id,
        title: 'Emergency scan detected',
        message: `${patient.fullName}'s SafeID QR was scanned.`
      });
    }
  } catch (_) {}

  const v = profile?.visibleFields || {};
  return {
    fullName: profile?.fullName || patient.fullName,
    photo: profile?.photo || patient.photo,
    safeid: patient.safeid,
    bloodType: v.bloodType !== false ? (profile?.bloodType || patient.bloodType) : '',
    allergies: v.allergies !== false ? (profile?.allergies || '') : '',
    conditions: v.conditions !== false ? (profile?.conditions || '') : '',
    medications: v.medications !== false ? (profile?.medications || '') : '',
    ecName: v.ecName !== false ? (profile?.ecName || patient.ecName) : '',
    ecPhone: v.ecPhone !== false ? (profile?.ecPhone || patient.ecPhone) : '',
    notes: v.notes !== false ? (profile?.notes || '') : ''
  };
}

module.exports = { getPublicProfile };