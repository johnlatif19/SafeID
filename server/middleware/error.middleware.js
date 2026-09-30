const logger = require('../utils/logger');
const { serverError, notFound } = require('../utils/response');

function notFoundHandler(req, res) {
  return notFound(res, 'Endpoint not found');
}

function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack });
  const msg = process.env.NODE_ENV === 'production' ? 'Server error' : err.message;
  return serverError(res, msg);
}

module.exports = { notFoundHandler, errorHandler };