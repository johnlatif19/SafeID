const router = require('express').Router();
const { emergencyLimiter } = require('../middleware/rateLimit.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const EmergencyController = require('../controllers/emergency.controller');

/* ================================================================== */
/*  PUBLIC ROUTES                                                     */
/*  No authentication — accessed via QR scan                          */
/* ================================================================== */

/* GET /emergency/:token → public emergency profile */
router.get(
  '/:token',
  emergencyLimiter,
  EmergencyController.getPublicProfile
);

/* ================================================================== */
/*  ADMIN ROUTES                                                      */
/*  Requires ADMIN role — mounted under /emergency/admin/*            */
/*  (called from admin dashboard)                                     */
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

module.exports = router;
