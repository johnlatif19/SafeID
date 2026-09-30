require('dotenv').config();
const app = require('./server/app');
const { initFirebase } = require('./server/config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    initFirebase();
    app.listen(PORT, () => {
      console.log(`✅ SafeID server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();
