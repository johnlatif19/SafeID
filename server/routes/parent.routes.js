const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const Controller = require('../controllers/parent.controller');

router.use(requireAuth, requireRole('PARENT'));

router.get('/children',      Controller.getChildren);
router.post('/children/link', Controller.linkChild);
router.get('/stats',         Controller.getStats);
router.get('/notifications', Controller.notifications);

module.exports = router;