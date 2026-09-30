const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const C = require('../controllers/admin.controller');

router.use(requireAuth, requireRole('ADMIN'));

router.get('/stats', C.stats);

router.get('/patients',              C.listPatients);
router.get('/patients/:id',          C.getPatient);
router.patch('/patients/:id/toggle', C.togglePatient);

router.get('/parents',              C.listParents);
router.patch('/parents/:id/toggle', C.toggleParent);

router.get('/emergencies',        C.listEmergencies);
router.get('/emergencies/recent', C.recentEmergencies);

router.get('/qr',                C.listQr);
router.post('/qr/:id/regenerate', C.regenerateQr);
router.patch('/qr/:id/toggle',    C.toggleQr);

module.exports = router;