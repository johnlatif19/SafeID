const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

function isEmail(v) { return typeof v === 'string' && EMAIL_RE.test(v); }
function isPhone(v) { return typeof v === 'string' && PHONE_RE.test(v); }
function isNonEmpty(v) { return typeof v === 'string' && v.trim().length > 0; }
function minLen(v, n) { return typeof v === 'string' && v.length >= n; }

module.exports = { isEmail, isPhone, isNonEmpty, minLen };