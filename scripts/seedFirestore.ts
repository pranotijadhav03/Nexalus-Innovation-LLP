import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import {
  initialBrands,
  initialCategories,
  initialProducts,
  initialInternetPlans,
  initialServices,
  initialProjects,
  initialServiceAreas,
  initialFaqs,
  initialBanners,
  initialUsers,
  initialEnquiries,
  initialSeoSettings
} from '../src/data/initialData';

const firebaseConfig = {
  apiKey: 'AIzaSyDe8T7drOKb6Mu7XvAXhx_M-IlU-FysvkM',
  authDomain: 'nexalus-innovations-llp.firebaseapp.com',
  projectId: 'nexalus-innovations-llp',
  storageBucket: 'nexalus-innovations-llp.firebasestorage.app',
  messagingSenderId: '894384495280',
  appId: '1:894384495280:web:67dd37f90189b14ebdb975'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log('--- Starting Firestore Seeding for Nexalus Innovations LLP ---');

  // 1. Brands
  console.log(`Seeding ${initialBrands.length} brands...`);
  for (const b of initialBrands) {
    await setDoc(doc(db, 'brands', b.id), b);
  }

  // 2. Categories
  console.log(`Seeding ${initialCategories.length} categories...`);
  for (const c of initialCategories) {
    await setDoc(doc(db, 'categories', c.id), c);
  }

  // 3. Products
  console.log(`Seeding ${initialProducts.length} products...`);
  for (const p of initialProducts) {
    await setDoc(doc(db, 'products', p.id), p);
  }

  // 4. Plans
  console.log(`Seeding ${initialInternetPlans.length} plans...`);
  for (const plan of initialInternetPlans) {
    await setDoc(doc(db, 'plans', plan.id), plan);
  }

  // 5. Services
  console.log(`Seeding ${initialServices.length} services...`);
  for (const s of initialServices) {
    await setDoc(doc(db, 'services', s.id), s);
  }

  // 6. Projects
  console.log(`Seeding ${initialProjects.length} projects...`);
  for (const pr of initialProjects) {
    await setDoc(doc(db, 'projects', pr.id), pr);
  }

  // 7. Service Areas
  console.log(`Seeding ${initialServiceAreas.length} service areas...`);
  for (const sa of initialServiceAreas) {
    await setDoc(doc(db, 'serviceAreas', sa.id), sa);
  }

  // 8. FAQs
  console.log(`Seeding ${initialFaqs.length} FAQs...`);
  for (const f of initialFaqs) {
    await setDoc(doc(db, 'faqs', f.id), f);
  }

  // 9. Banners
  console.log(`Seeding ${initialBanners.length} banners...`);
  for (const ban of initialBanners) {
    await setDoc(doc(db, 'banners', ban.id), ban);
  }

  // 10. Enquiries
  console.log(`Seeding ${initialEnquiries.length} enquiries...`);
  for (const enq of initialEnquiries) {
    await setDoc(doc(db, 'enquiries', enq.id), enq);
  }

  // 11. SEO Settings
  console.log('Seeding SEO settings...');
  await setDoc(doc(db, 'seoSettings', 'default'), initialSeoSettings);

  // 12. Users
  console.log(`Seeding ${initialUsers.length} users...`);
  for (const u of initialUsers) {
    await setDoc(doc(db, 'users', u.uid), u);
  }

  // 13. Audit Log entry
  const initLog = {
    id: 'log-init-seed-' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: 'admin-action',
    userEmail: 'admin@nexalusinnovations.com',
    action: 'SEED_FIREBASE_COLLECTIONS',
    details: 'Initialized and synced all corporate data collections to Firestore database.',
    brandId: 'general'
  };
  await setDoc(doc(db, 'auditLogs', initLog.id), initLog);

  console.log('=== ALL FIRESTORE COLLECTIONS SEEDED SUCCESSFULLY! ===');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
