const User = require('../models/User');
const Patient = require('../models/Patient');
const Parent = require('../models/Parent');
const Admin = require('../models/Admin');
const EmergencyProfile = require('../models/EmergencyProfile');
const QrToken = require('../models/QrToken');
const { generateSafeID } = require('../utils/safeid');
const { signJWT } = require('../utils/token');

/* ------------------------------------------------------------------ */
/*  PATIENT REGISTRATION                                              */
/* ------------------------------------------------------------------ */
async function registerPatient(data) {
  /* 1. Create base user account (auth) */
  const user = await User.createUser({
    email: data.email,
    password: data.password,
    role: 'PATIENT',
    fullName: data.fullName,
    phone: data.phone
  });

  /* 2. Generate unique SafeID number */
  const safeid = generateSafeID();

  /* 3. Create patient profile — photo URL comes from Cloudinary */
  const patient = await Patient.createPatient({
    userId: user._id,
    safeid,
    fullName: data.fullName,
    dob: data.dob,
    gender: data.gender,
    email: user.email,
    phone: data.phone,
    bloodType: data.bloodType,
    ecName: data.ecName,
    ecPhone: data.ecPhone,
    allergies: data.allergies,
    conditions: data.conditions,
    medications: data.medications,
    address: data.address,
    photo: data.photo || ''   /* ← Cloudinary secure_url */
  });

  /* 4. Create emergency profile (public emergency data)
        Only the fields marked as visible will be shown on the emergency page. */
  await EmergencyProfile.createOrUpdate(patient._id, {
    fullName: data.fullName,
    photo: data.photo || '',
    bloodType: data.bloodType,
    allergies: data.allergies,
    conditions: data.conditions,
    medications: data.medications,
    ecName: data.ecName,
    ecPhone: data.ecPhone,
    notes: data.notes || '',
    visibleFields: {
      bloodType: true,
      allergies: true,
      conditions: true,
      medications: true,
      ecName: true,
      ecPhone: true,
      notes: true
    }
  });

  /* 5. Generate QR token linked to this patient */
  const qr = await QrToken.createToken({
    patientId: patient._id,
    safeid
  });

  /* 6. Issue JWT so the client can log the user in immediately */
  const token = signJWT({ id: user._id, role: 'PATIENT' });

  return {
    token,
    user: User.sanitize(user),
    patient,
    qr
  };
}

/* ------------------------------------------------------------------ */
/*  PARENT REGISTRATION                                               */
/* ------------------------------------------------------------------ */
async function registerParent(data) {
  /* 1. Create base user account (auth) */
  const user = await User.createUser({
    email: data.email,
    password: data.password,
    role: 'PARENT',
    fullName: data.fullName,
    phone: data.phone
  });

  /* 2. Create parent profile */
  const parent = await Parent.createParent({
    userId: user._id,
    fullName: data.fullName,
    email: user.email,
    phone: data.phone,
    relationship: data.relationship
  });

  /* 3. Issue JWT */
  const token = signJWT({ id: user._id, role: 'PARENT' });

  return {
    token,
    user: User.sanitize(user),
    parent
  };
}

/* ------------------------------------------------------------------ */
/*  LOGIN (shared for all roles)                                      */
/* ------------------------------------------------------------------ */
async function login(email, password, expectedRole) {
  /* 1. Find user by email */
  const user = await User.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  /* 2. Check role matches the login endpoint */
  if (user.role !== expectedRole) throw new Error('Invalid credentials');

  /* 3. Reject disabled accounts */
  if (user.status === 'disabled') throw new Error('Account disabled');

  /* 4. Verify password with bcrypt */
  const ok = await User.verifyPassword(user, password);
  if (!ok) throw new Error('Invalid credentials');

  /* 5. Issue JWT */
  const token = signJWT({ id: user._id, role: user.role });

  return {
    token,
    user: User.sanitize(user)
  };
}

module.exports = {
  registerPatient,
  registerParent,
  login
};
