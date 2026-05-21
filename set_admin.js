// Set admin:true on your Firestore user — run this ONCE
// Usage: node set_admin.js YOUR_FIREBASE_USER_UID
// Find your UID: Firebase Console → Authentication → Users → copy your UID

require('dotenv').config({ path: '.env.local' });
var admin = require('firebase-admin');
var path  = require('path');

// Try env first, then serviceAccountKey
if (!admin.apps.length) {
  var pk    = process.env.FIREBASE_PRIVATE_KEY;
  var email = process.env.FIREBASE_CLIENT_EMAIL;
  var pid   = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (pk && email && pid) {
    admin.initializeApp({ credential: admin.credential.cert({ projectId: pid, clientEmail: email, privateKey: pk.replace(/\\n/g, '\n') }) });
  } else {
    try { admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccountKey.json')) }); }
    catch(e) { console.error('No Firebase credentials found'); process.exit(1); }
  }
}

var uid = process.argv[2];
if (!uid) { console.log('Usage: node set_admin.js <YOUR_FIREBASE_UID>'); process.exit(1); }

admin.firestore().collection('users').doc(uid).set({ admin: true }, { merge: true })
  .then(function() {
    console.log('✅ Admin set for user:', uid);
    console.log('Now go to /admin in TapCash — you have access.');
    process.exit(0);
  })
  .catch(function(e) { console.error('Error:', e.message); process.exit(1); });
