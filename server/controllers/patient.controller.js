const PatientService = require('../services/patient.service');
const { ok } = require('../utils/response');

async function getProfile(req, res, next) {
  try {
    const data = await PatientService.getProfile(req.user._id);
    return ok(res, { data });
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const data = await PatientService.updateProfile(req.user._id, req.body);
    return ok(res, { data }, 'Profile updated');
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile };