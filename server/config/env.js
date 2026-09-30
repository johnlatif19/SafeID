/* Loads and validates required environment variables */
const required = ['JWT_SECRET', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];

function validateEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error('❌ Missing env vars:', missing.join(', '));
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
}

module.exports = { validateEnv };