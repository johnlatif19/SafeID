const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const Controller = require('../controllers/qr.controller');

/* Public QR image generator (used by client) */
router.get('/image', Controller.image);

/* Get QR for current patient */
router.get('/me', requireAuth, requireRole('PATIENT'), Controller.getForPatient);

module.exports = router;