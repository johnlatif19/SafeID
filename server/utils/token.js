const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function signJWT(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function verifyJWT(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { signJWT, verifyJWT, randomToken };