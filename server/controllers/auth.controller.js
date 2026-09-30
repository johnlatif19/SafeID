const AuthService = require('../services/auth.service');
const { created, ok, badRequest } = require('../utils/response');

async function registerPatient(req, res, next) {
  try {
    const result = await AuthService.registerPatient(req.body);
    return created(res, result, 'Patient registered');
  } catch (err) {
    if (err.message.includes('Email already')) return badRequest(res, err.message);
    next(err);
  }
}

async function registerParent(req, res, next) {
  try {
    const result = await AuthService.registerParent(req.body);
    return created(res, result, 'Parent registered');
  } catch (err) {
    if (err.message.includes('Email already')) return badRequest(res, err.message);
    next(err);
  }
}

async function loginPatient(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password, 'PATIENT');
    return ok(res, result, 'Logged in');
  } catch (err) {
    if (err.message === 'Invalid credentials') return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (err.message === 'Account disabled') return res.status(403).json({ success: false, message: 'Account disabled' });
    next(err);
  }
}

async function loginParent(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password, 'PARENT');
    return ok(res, result, 'Logged in');
  } catch (err) {
    if (err.message === 'Invalid credentials') return res.status(401).json({ success: false, message: 'Invalid email or password' });
    next(err);
  }
}

async function loginAdmin(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

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

async function me(req, res) {
  return ok(res, { user: req.user });
}

module.exports = { registerPatient, registerParent, loginPatient, loginParent, loginAdmin, me };