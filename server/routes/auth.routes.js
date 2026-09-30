const AuthService = require('../services/auth.service');
const { uploadBuffer } = require('../config/cloudinary');
const { created, ok, badRequest } = require('../utils/response');

/* ---------- Patient Registration ---------- */
async function registerPatient(req, res, next) {
  try {
    /* Upload profile photo to Cloudinary if provided */
    let photoUrl = '';
    if (req.file) {
      try {
        const result = await uploadBuffer(req.file.buffer, 'safeid/profiles');
        photoUrl = result.secure_url;
      } catch (uploadErr) {
        console.warn('Cloudinary upload failed:', uploadErr.message);
        /* continue registration without photo — don't block the user */
      }
    }

    const result = await AuthService.registerPatient({
      ...req.body,
      photo: photoUrl
    });

    return created(res, result, 'Patient registered');
  } catch (err) {
    if (err.message.includes('Email already')) return badRequest(res, err.message);
    next(err);
  }
}

/* ---------- Parent Registration ---------- */
async function registerParent(req, res, next) {
  try {
    const result = await AuthService.registerParent(req.body);
    return created(res, result, 'Parent registered');
  } catch (err) {
    if (err.message.includes('Email already')) return badRequest(res, err.message);
    next(err);
  }
}

/* ---------- Patient Login ---------- */
async function loginPatient(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password, 'PATIENT');
    return ok(res, result, 'Logged in');
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (err.message === 'Account disabled') {
      return res.status(403).json({ success: false, message: 'Account disabled' });
    }
    next(err);
  }
}

/* ---------- Parent Login ---------- */
async function loginParent(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password, 'PARENT');
    return ok(res, result, 'Logged in');
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (err.message === 'Account disabled') {
      return res.status(403).json({ success: false, message: 'Account disabled' });
    }
    next(err);
  }
}

/* ---------- Admin Login ---------- */
async function loginAdmin(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return badRequest(res, 'Username and password required');
    }

    /* Derive internal email from username (matches seed.js) */
    const email = username.includes('@') ? username : `${username}@safeid.local`;

    const result = await AuthService.login(email, password, 'ADMIN');
    return ok(res, result, 'Logged in');
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    next(err);
  }
}

/* ---------- Current User ---------- */
async function me(req, res) {
  return ok(res, { user: req.user });
}

module.exports = {
  registerPatient,
  registerParent,
  loginPatient,
  loginParent,
  loginAdmin,
  me
};
