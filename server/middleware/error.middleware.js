const logger = require('../utils/logger');
const { serverError, notFound, badRequest } = require('../utils/response');

function notFoundHandler(req, res) {
  return notFound(res, 'Endpoint not found');
}

function errorHandler(err, req, res, next) {
  /* ---------- Multer-specific errors ---------- */
  if (err.code === 'LIMIT_FILE_SIZE') {
    return badRequest(res, 'File too large. Max size is 5MB.');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return badRequest(res, 'Unexpected file field.');
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return badRequest(res, 'Too many files.');
  }

  /* ---------- Cloudinary errors ---------- */
  if (err.http_code && err.message) {
    logger.warn('Cloudinary error', { message: err.message });
    return badRequest(res, 'Image upload failed. Please try again.');
  }

  /* ---------- JWT errors ---------- */
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  /* ---------- Default ---------- */
  logger.error(err.message, { stack: err.stack });
  const msg = process.env.NODE_ENV === 'production' ? 'Server error' : err.message;
  return serverError(res, msg);
}

module.exports = { notFoundHandler, errorHandler };
