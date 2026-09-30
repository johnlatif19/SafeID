const EmergencyService = require('../services/emergency.service');
const { ok, notFound } = require('../utils/response');

async function getPublicProfile(req, res, next) {
  try {
    const data = await EmergencyService.getPublicProfile(req.params.token, req);
    return ok(res, { data });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return notFound(res, 'SafeID profile not found');
    next(err);
  }
}

module.exports = { getPublicProfile };