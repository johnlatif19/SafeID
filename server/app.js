const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const { validateEnv } = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

/* ---------- Routes ---------- */
const authRoutes      = require('./routes/auth.routes');
const patientRoutes   = require('./routes/patient.routes');
const parentRoutes    = require('./routes/parent.routes');
const adminRoutes     = require('./routes/admin.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const qrRoutes        = require('./routes/qr.routes');

validateEnv();

/* ---------- Create Express app ---------- */
const app = express();

/* ---------- Security + parsers ---------- */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

/* ---------- Static files ---------- */
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/* ---------- Clean URL pages (with aliases) ---------- */
const pages = {
  '/':                     'index.html',
  '/index':                'index.html',
  '/sign-up':              'sign-up.html',
  '/signup':               'sign-up.html',
  '/login':                'login-site.html',
  '/login-site':           'login-site.html',
  '/sign-up-parent':       'sign-up-parent.html',
  '/login-parent':         'login-parent.html',
  '/dashboard-parent':     'dashboard-parent.html',
  '/login-admin':          'login-admin.html',
  '/dashboard-admin':      'dashboard-admin.html',
  '/emergency':            'emergency.html',
  '/offline':              'offline.html',
  '/404':                  '404.html'
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', file));
  });
});

/* ---------- Redirect *.html → clean URL ---------- */
const htmlToClean = {
  'index.html':            '/',
  'sign-up.html':          '/sign-up',
  'login-site.html':       '/login',
  'sign-up-parent.html':   '/sign-up-parent',
  'login-parent.html':     '/login-parent',
  'dashboard-parent.html': '/dashboard-parent',
  'login-admin.html':      '/login-admin',
  'dashboard-admin.html':  '/dashboard-admin',
  'emergency.html':        '/emergency',
  'offline.html':          '/offline',
  '404.html':              '/404'
};

app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    const filename = req.path.replace(/^\//, '');
    const clean = htmlToClean[filename];
    if (clean && clean !== req.path) {
      return res.redirect(301, clean);
    }
  }
  next();
});

/* ---------- Service worker + manifest ---------- */
app.get('/service-worker.js', (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'service-worker.js')));
app.get('/manifest.json', (req, res) =>
  res.sendFile(path.join(__dirname, '..', 'public', 'manifest.json')));

/* ---------- API ---------- */
app.use('/api/auth',    authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/parent',  parentRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/qr',      qrRoutes);

/* ---------- Emergency public route ---------- */
app.use('/emergency', emergencyRoutes);

/* ---------- Fallbacks ---------- */
app.use('/api', notFoundHandler);

app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

app.use(errorHandler);

module.exports = app;
