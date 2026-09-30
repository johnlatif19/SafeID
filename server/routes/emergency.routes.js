const router = require('express').Router();
const { emergencyLimiter } = require('../middleware/rateLimit.middleware');
const Controller = require('../controllers/emergency.controller');

/* Public emergency profile by token */
router.get('/:token', emergencyLimiter, Controller.getPublicProfile);

module.exports = router;