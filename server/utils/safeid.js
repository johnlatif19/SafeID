const crypto = require('crypto');

/** Generates a unique SafeID like SID-2025-AB12CD */
function generateSafeID() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SID-${year}-${rand}`;
}

module.exports = { generateSafeID };