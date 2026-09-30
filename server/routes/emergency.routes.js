const router = require('express').Router();
const { emergencyLimiter } = require('../middleware/rateLimit.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const EmergencyController = require('../controllers/emergency.controller');

/* ================================================================== */
/*  ADMIN ROUTES (must come BEFORE /:token)                           */
/* ================================================================== */

router.get(
  '/admin/recent',
  requireAuth,
  requireRole('ADMIN'),
  EmergencyController.getRecentScans
);

router.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN'),
  EmergencyController.getAllScans
);

router.get(
  '/admin/count',
  requireAuth,
  requireRole('ADMIN'),
  EmergencyController.countScans
);

/* ================================================================== */
/*  PUBLIC ROUTE (LAST — catches everything else)                     */
/* ================================================================== */

router.get(
  '/:token',
  emergencyLimiter,
  EmergencyController.getPublicProfile
);

module.exports = router;
