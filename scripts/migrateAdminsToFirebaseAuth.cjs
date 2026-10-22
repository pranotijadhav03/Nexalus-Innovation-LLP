/**
 * Admin Accounts Migration Utility (Protected Maintenance Tool)
 * Project: Nexalus Innovations LLP
 *
 * Safety Notice:
 * This script is a controlled administrative utility. It does NOT store hardcoded credentials.
 * Execution requires explicit environment confirmation to prevent accidental re-runs.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, updateDoc, deleteField, getDocs, collection } = require('firebase/firestore');

// Safety guard: Must be explicitly enabled
if (process.env.CONFIRM_MIGRATION !== 'true') {
  console.log('----------------------------------------------------------------------');
  console.log('SAFETY LOCK: Admin migration script is currently locked.');
  console.log('To run this migration, you must supply the confirmation flag:');
  console.log('  CONFIRM_MIGRATION=true INITIAL_ADMIN_PASSWORD="<secure-pass>" node scripts/migrateAdminsToFirebaseAuth.cjs');
  console.log('----------------------------------------------------------------------');
  process.exit(0);
}

const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;
if (!initialPassword || initialPassword.length < 8) {
  console.error('ERROR: You must provide a valid INITIAL_ADMIN_PASSWORD (min 8 characters) via environment variable.');
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDe8T7drOKb6Mu7XvAXhx_M-IlU-FysvkM',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'nexalus-innovations-llp.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'nexalus-innovations-llp',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'nexalus-innovations-llp.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '894384495280',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:894384495280:web:67dd37f90189b14ebdb975'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_REGISTRY = [
  {
    email: 'admin@nexalusinnovations.com',
    role: 'super_admin',
    displayName: 'Nexalus Corporate Master Admin',
    assignedBrandId: 'all'
  },
  {
    email: 'admin@nexalus.com',
    role: 'super_admin',
    displayName: 'Nexalus Corporate Master Admin',
    assignedBrandId: 'all'
  },
  {
    email: 'innovations.admin@nexalusinnovations.com',
    role: 'innovations_admin',
    displayName: 'Nexalus Innovations Tech Manager',
    assignedBrandId: 'nexalus-innovations'
  },
  {
    email: 'innovations@nexalus.com',
    role: 'innovations_admin',
    displayName: 'Nexalus Innovations Tech Manager',
    assignedBrandId: 'nexalus-innovations'
  },
  {
    email: 'am.admin@nexalusinnovations.com',
    role: 'am_admin',
    displayName: 'A.M. Distributors Chiplun Depot Manager',
    assignedBrandId: 'am-distributors'
  },
  {
    email: 'am@nexalus.com',
    role: 'am_admin',
    displayName: 'A.M. Distributors Chiplun Depot Manager',
    assignedBrandId: 'am-distributors'
  }
];

async function runMigration() {
  console.log('===============================================================');
  console.log('   NEXALUS INNOVATIONS LLP — ADMIN ACCOUNTS MIGRATION');
  console.log('===============================================================');

  for (const adm of ADMIN_REGISTRY) {
    let uid = null;
    try {
      const cred = await createUserWithEmailAndPassword(auth, adm.email, initialPassword);
      uid = cred.user.uid;
      console.log(`[AUTH: CREATED] ${adm.email} => UID: ${uid}`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`[AUTH: EXISTS] ${adm.email} already exists in Firebase Auth. (Skipping creation)`);
      } else {
        console.error(`[AUTH: ERROR] ${adm.email}:`, err.code, err.message);
      }
    }

    if (uid) {
      const adminRecord = {
        uid,
        email: adm.email.toLowerCase(),
        displayName: adm.displayName,
        role: adm.role,
        assignedBrandId: adm.assignedBrandId,
        active: true,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', uid), adminRecord, { merge: true });
      console.log(`[FIRESTORE: SYNCED] users/${uid} (role: ${adm.role})`);
    }
  }

  // Purge any legacy plaintext passwords stored in Firestore documents
  console.log('\nScanning Firestore users collection for legacy plaintext password fields...');
  const userDocs = await getDocs(collection(db, 'users'));
  let purgedCount = 0;
  for (const d of userDocs.docs) {
    if (d.data().password) {
      await updateDoc(doc(db, 'users', d.id), {
        password: deleteField()
      });
      purgedCount++;
      console.log(`[PURGED PASSWORD] Document: users/${d.id}`);
    }
  }
  console.log(`Password purge complete. ${purgedCount} legacy password fields removed.`);
  console.log('\nMigration complete.');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
