const { validationResult } = require('express-validator');
const { badRequest } = require('../utils/response');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(res, errors.array()[0].msg || 'Invalid input');
  }
  next();
}

module.exports = { validate };