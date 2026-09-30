const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const Controller = require('../controllers/patient.controller');

router.use(requireAuth, requireRole('PATIENT'));

router.get('/profile', Controller.getProfile);
router.put('/profile', Controller.updateProfile);

module.exports = router;