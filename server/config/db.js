const admin = require('firebase-admin');

let db = null;

function initFirebase() {
  if (admin.apps.length) return admin.firestore();

  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  });

  db = admin.firestore();
  console.log('🔥 Firebase Firestore connected');
  return db;
}

function getDB() {
  if (!db) {
    if (admin.apps.length) db = admin.firestore();
    else initFirebase();
  }
  return db;
}

module.exports = { initFirebase, getDB, admin };