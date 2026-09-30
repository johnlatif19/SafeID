const User = require('../models/User');
const Patient = require('../models/Patient');
const Parent = require('../models/Parent');
const Admin = require('../models/Admin');
const EmergencyProfile = require('../models/EmergencyProfile');
const QrToken = require('../models/QrToken');
const { generateSafeID } = require('../utils/safeid');
const { signJWT } = require('../utils/token');
const { getDB } = require('../config/db');

async function registerPatient(data) {
  const user = await User.createUser({
    email: data.email,
    password: data.password,
    role: 'PATIENT',
    fullName: data.fullName,
    phone: data.phone
  });

  const safeid = generateSafeID();
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
    photo: data.photo
  });

  await EmergencyProfile.createOrUpdate(patient._id, {
    fullName: data.fullName,
    photo: data.photo,
    bloodType: data.bloodType,
    allergies: data.allergies,
    conditions: data.conditions,
    medications: data.medications,
    ecName: data.ecName,
    ecPhone: data.ecPhone
  });

  const qr = await QrToken.createToken({ patientId: patient._id, safeid });

  const token = signJWT({ id: user._id, role: 'PATIENT' });
  return { token, user: User.sanitize(user), patient, qr };
}

async function registerParent(data) {
  const user = await User.createUser({
    email: data.email,
    password: data.password,
    role: 'PARENT',
    fullName: data.fullName,
    phone: data.phone
  });

  const parent = await Parent.createParent({
    userId: user._id,
    fullName: data.fullName,
    email: user.email,
    phone: data.phone,
    relationship: data.relationship
  });

  const token = signJWT({ id: user._id, role: 'PARENT' });
  return { token, user: User.sanitize(user), parent };
}

async function login(email, password, expectedRole) {
  const user = await User.findByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  if (user.role !== expectedRole) throw new Error('Invalid credentials');
  if (user.status === 'disabled') throw new Error('Account disabled');

  const ok = await User.verifyPassword(user, password);
  if (!ok) throw new Error('Invalid credentials');

  const token = signJWT({ id: user._id, role: user.role });
  return { token, user: User.sanitize(user) };
}

module.exports = { registerPatient, registerParent, login };