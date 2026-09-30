const { forbidden } = require('../utils/response');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return forbidden(res, 'Not authenticated');
    if (!roles.includes(req.user.role)) return forbidden(res, 'Access denied');
    next();
  };
}

module.exports = { requireRole };