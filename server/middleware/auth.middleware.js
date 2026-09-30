const { verifyJWT } = require('../utils/token');
const { unauthorized } = require('../utils/response');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return unauthorized(res, 'Missing token');

    const decoded = verifyJWT(token);
    const user = await User.findById(decoded.id);
    if (!user) return unauthorized(res, 'User not found');
    if (user.status === 'disabled') return unauthorized(res, 'Account disabled');

    req.user = User.sanitize(user);
    next();
  } catch (err) {
    return unauthorized(res, 'Invalid or expired token');
  }
}

module.exports = { requireAuth };