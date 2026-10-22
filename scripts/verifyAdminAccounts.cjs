/**
 * Read-Only Administrator Accounts Verification Utility
 * Project: Nexalus Innovations LLP
 *
 * Purpose:
 * Safely inspects Cloud Firestore and verifies the status, roles,
 * and security hygiene of all administrator accounts without modifying any data.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDe8T7drOKb6Mu7XvAXhx_M-IlU-FysvkM',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'nexalus-innovations-llp.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'nexalus-innovations-llp'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EXPECTED_ADMINS = [
  { email: 'admin@nexalusinnovations.com', expectedRole: 'super_admin' },
  { email: 'admin@nexalus.com', expectedRole: 'super_admin' },
  { email: 'innovations.admin@nexalusinnovations.com', expectedRole: 'innovations_admin' },
  { email: 'innovations@nexalus.com', expectedRole: 'innovations_admin' },
  { email: 'am.admin@nexalusinnovations.com', expectedRole: 'am_admin' },
  { email: 'am@nexalus.com', expectedRole: 'am_admin' }
];

async function verify() {
  console.log('===============================================================');
  console.log('   NEXALUS INNOVATIONS LLP — ADMIN ACCOUNTS READ-ONLY AUDIT');
  console.log('===============================================================');

  const snapshot = await getDocs(collection(db, 'users'));
  console.log(`Found ${snapshot.size} total documents in 'users' collection.\n`);

  let allClean = true;
  let plaintextPasswordDetected = false;

  // Build lookup maps by email and by UID
  const docsByEmail = new Map();
  const docsById = new Map();

  snapshot.forEach(d => {
    const data = d.data();
    docsById.set(d.id, data);
    if (data.email) {
      docsByEmail.set(data.email.toLowerCase(), { docId: d.id, ...data });
    }
    if (data.password) {
      plaintextPasswordDetected = true;
      console.warn(`[VULNERABILITY] Document ${d.id} contains plaintext password field!`);
    }
  });

  console.log('Verifying Expected Administrator Accounts:\n');
  for (const exp of EXPECTED_ADMINS) {
    const record = docsByEmail.get(exp.email.toLowerCase());
    if (!record) {
      console.error(`[MISSING] ${exp.email} has no document in Firestore!`);
      allClean = false;
      continue;
    }

    const roleMatch = record.role === exp.expectedRole;
    const isActive = record.active === true;
    const isUidKeyed = docsById.has(record.uid);

    console.log(`Email: ${exp.email}`);
    console.log(`  - Role: ${record.role} (${roleMatch ? 'VERIFIED' : 'MISMATCH'})`);
    console.log(`  - Status: ${isActive ? 'Active' : 'INACTIVE'}`);
    console.log(`  - UID Keyed: ${isUidKeyed ? 'Yes (' + record.uid + ')' : 'No'}`);
    console.log(`  - Password Field: ${record.password ? 'DETECTED (INSECURE)' : 'Clean (No plaintext password)'}`);
    console.log('-----------------------------------------------------------');

    if (!roleMatch || !isActive) {
      allClean = false;
    }
  }

  console.log('\nSecurity Summary:');
  console.log(`  - Plaintext passwords in Firestore: ${plaintextPasswordDetected ? 'FAILED' : 'CLEAN (None found)'}`);
  console.log(`  - Administrator account verification: ${allClean ? 'ALL PASS' : 'ISSUES DETECTED'}`);
  process.exit(allClean && !plaintextPasswordDetected ? 0 : 1);
}

verify().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
