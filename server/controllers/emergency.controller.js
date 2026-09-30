const EmergencyService = require('../services/emergency.service');
const { ok, notFound, serverError } = require('../utils/response');
const logger = require('../utils/logger');

/* ------------------------------------------------------------------ */
/*  GET PUBLIC EMERGENCY PROFILE                                       */
/*                                                                     */
/*  Public route — no authentication required.                        */
/*  Called when someone scans a SafeID QR code.                       */
/*                                                                     */
/*  Responses:                                                        */
/*   200 → emergency profile (only visible fields)                    */
/*   404 → token invalid / disabled / patient not found               */
/*   500 → unexpected server error                                    */
/* ------------------------------------------------------------------ */
async function getPublicProfile(req, res) {
  const { token } = req.params;

  /* Basic sanity check — avoid hitting the DB for obviously bad tokens */
  if (!token || token.length < 16 || token.length > 128) {
    return notFound(res, 'SafeID profile not found');
  }

  try {
    const profile = await EmergencyService.getPublicProfile(token, req);

    if (!profile) {
      return notFound(res, 'SafeID profile not found');
    }

    return ok(res, { data: profile });
  } catch (err) {
    /* Known "not found" case (invalid / disabled token, inactive patient) */
    if (err.message === 'NOT_FOUND') {
      return notFound(res, 'SafeID profile not found');
    }

    /* Unknown error — log it and return a generic message (no leak) */
    logger.error('Emergency profile fetch failed', {
      message: err.message,
      token: token.slice(0, 8) + '...'
    });

    return serverError(res, 'Unable to load emergency profile');
  }
}

/* ------------------------------------------------------------------ */
/*  GET RECENT SCANS (admin)                                           */
/* ------------------------------------------------------------------ */
async function getRecentScans(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const scans = await EmergencyService.getRecentScans(limit);
    return ok(res, { data: scans });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  GET ALL SCANS (admin)                                              */
/* ------------------------------------------------------------------ */
async function getAllScans(req, res, next) {
  try {
    const scans = await EmergencyService.getAllScans();
    return ok(res, { data: scans });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  COUNT SCANS (admin)                                                */
/* ------------------------------------------------------------------ */
async function countScans(req, res, next) {
  try {
    const count = await EmergencyService.countScans();
    return ok(res, { data: { count } });
  } catch (err) {
    next(err);
  }
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
