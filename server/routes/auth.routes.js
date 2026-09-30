const router = require('express').Router();
const multer = require('multer');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const AuthController = require('../controllers/auth.controller');

/* Multer — memory storage (we upload buffer directly to Cloudinary) */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/* ---------- Patient registration ---------- */
router.post(
  '/register/patient',
  upload.single('photo'),
  authLimiter,
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('bloodType').notEmpty().withMessage('Blood type is required'),
    body('ecName').notEmpty().withMessage('Emergency contact name is required'),
    body('ecPhone').notEmpty().withMessage('Emergency contact phone is required')
  ],
  validate,
  AuthController.registerPatient
);

/* ---------- Parent registration ---------- */
router.post(
  '/register/parent',
  authLimiter,
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').notEmpty().withMessage('Phone is required')
  ],
  validate,
  AuthController.registerParent
);

/* ---------- Patient login ---------- */
router.post(
  '/login/patient',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  AuthController.loginPatient
);

/* ---------- Parent login ---------- */
router.post(
  '/login/parent',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  AuthController.loginParent
);

/* ---------- Admin login ---------- */
router.post(
  '/login/admin',
  authLimiter,
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  AuthController.loginAdmin
);

/* ---------- Current user ---------- */
router.get('/me', requireAuth, AuthController.me);

module.exports = router;
