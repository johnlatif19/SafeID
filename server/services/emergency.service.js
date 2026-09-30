const QrToken = require('../models/QrToken');
const Patient = require('../models/Patient');
const EmergencyProfile = require('../models/EmergencyProfile');
const EmergencyScan = require('../models/EmergencyScan');
const Parent = require('../models/Parent');
const Notification = require('./notification.service');
const logger = require('../utils/logger');

/* ------------------------------------------------------------------ */
/*  GET PUBLIC EMERGENCY PROFILE                                       */
/*                                                                     */
/*  1. Validate the QR token                                           */
/*  2. Ensure the patient account is active                            */
/*  3. Log the scan (for audit + parent notifications)                 */
/*  4. Notify every linked parent                                      */
/*  5. Return ONLY the fields marked as emergency-visible              */
/* ------------------------------------------------------------------ */
async function getPublicProfile(token, req) {
  /* ---- 1. Validate token ---- */
  const qr = await QrToken.findByToken(token);
  if (!qr || !qr.active) {
    throw new Error('NOT_FOUND');
  }

  /* ---- 2. Fetch patient + verify status ---- */
  const patient = await Patient.findById(qr.patientId);
  if (!patient || patient.status !== 'active') {
    throw new Error('NOT_FOUND');
  }

  /* ---- 3. Fetch emergency profile ---- */
  const profile = await EmergencyProfile.findByPatientId(patient._id);

  /* ---- 4. Log the scan (non-blocking for the response) ---- */
  try {
    await EmergencyScan.logScan({
      patientId: patient._id,
      tokenId: qr._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
      status: 'pending'
    });
  } catch (err) {
    logger.warn('Failed to log emergency scan', { error: err.message });
  }

  /* ---- 5. Notify linked parents (non-blocking) ---- */
  try {
    const allParents = await Parent.listAll();
    const linkedParents = allParents.filter((p) =>
      (p.children || []).includes(patient._id)
    );

    await Promise.all(
      linkedParents.map((p) =>
        Notification.create({
          parentId: p._id,
          title: 'تم رصد عملية مسح لرمز الطوارئ',
          message: `تم مسح رمز SafeID الخاص بـ ${patient.fullName}.`,
          type: 'emergency'
        })
      )
    );
  } catch (err) {
    logger.warn('Failed to notify parents', { error: err.message });
  }

  /* ---- 6. Build public profile (only visible fields) ---- */
  const publicProfile = EmergencyProfile.buildPublicProfile({
    ...(profile || {}),
    patientId: patient._id,
    safeid: patient.safeid,
    /* Fallback to patient data if emergency profile is missing a field */
    fullName:    profile?.fullName    || patient.fullName,
    photo:       profile?.photo       || patient.photo,
    bloodType:   profile?.bloodType   || patient.bloodType,
    allergies:   profile?.allergies   || '',
    conditions:  profile?.conditions  || '',
    medications: profile?.medications || '',
    ecName:      profile?.ecName      || patient.ecName,
    ecPhone:     profile?.ecPhone     || patient.ecPhone,
    notes:       profile?.notes       || ''
  });

  return publicProfile;
}

/* ------------------------------------------------------------------ */
/*  GET EMERGENCY SCAN HISTORY (for admin)                             */
/* ------------------------------------------------------------------ */
async function getRecentScans(limit = 20) {
  return EmergencyScan.listRecent(limit);
}

async function getAllScans() {
  return EmergencyScan.listAll();
}

async function countScans() {
  return EmergencyScan.countAll();
}

/* ------------------------------------------------------------------ */
/*  EXPORTS                                                            */
/* ------------------------------------------------------------------ */
module.exports = {
  getPublicProfile,
  getRecentScans,
  getAllScans,
  countScans
};
