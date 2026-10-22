import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured, auth, firebaseConfig } from './config';
import { initializeApp as initSecondaryApp, deleteApp as deleteSecondaryApp } from 'firebase/app';
import { getAuth as getSecondaryAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import {
  Brand,
  CustomerDeliveryAddress,
  CustomerRegistrationData,
  BrandId,
  ProductCategory,
  Product,
  InternetPlan,
  BroadbandProvider,
  BroadbandPlan,
  validateBroadbandPlan,
  validateBroadbandProvider,
  Service,
  Project,
  Enquiry,
  EnquiryStatus,
  ServiceArea,
  FAQ,
  AdminUser,
  UserRole,
  AuditLog,
  SiteBanner,
  SeoSettings,
  TeamMember
} from '../types';
import {
  initialBrands,
  initialCategories,
  initialProducts,
  initialInternetPlans,
  initialBroadbandProviders,
  initialBroadbandPlans,
  initialServices,
  initialProjects,
  initialServiceAreas,
  initialFaqs,
  initialBanners,
  initialUsers,
  initialEnquiries,
  initialSeoSettings,
  initialTeamMembers
} from '../data/initialData';

// Storage Keys for resilient local state
const DATA_VERSION = 'v8_';
const STORAGE_KEYS = {
  BRANDS: DATA_VERSION + 'nexalus_store_brands',
  CATEGORIES: DATA_VERSION + 'nexalus_store_categories',
  PRODUCTS: DATA_VERSION + 'nexalus_store_products',
  PLANS: DATA_VERSION + 'nexalus_store_plans',
  BROADBAND_PROVIDERS: DATA_VERSION + 'nexalus_store_broadband_providers',
  BROADBAND_PLANS: DATA_VERSION + 'nexalus_store_broadband_plans',
  SERVICES: DATA_VERSION + 'nexalus_store_services',
  PROJECTS: DATA_VERSION + 'nexalus_store_projects',
  ENQUIRIES: DATA_VERSION + 'nexalus_store_enquiries',
  SERVICE_AREAS: DATA_VERSION + 'nexalus_store_service_areas',
  FAQS: DATA_VERSION + 'nexalus_store_faqs',
  BANNERS: DATA_VERSION + 'nexalus_store_banners',
  USERS: DATA_VERSION + 'nexalus_store_users',
  AUDIT_LOGS: DATA_VERSION + 'nexalus_store_audit_logs',
  SEO: DATA_VERSION + 'nexalus_store_seo',
  TEAM: DATA_VERSION + 'nexalus_store_team'
};


export function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms))
  ]);
}

// Generic Local Storage Helpers
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(saved);
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch local update event for reactivity
    window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key } }));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// ----------------------------------------------------
// AUDIT LOGGING
// ----------------------------------------------------
export async function addAuditLog(
  action: string,
  details: string,
  brandId?: BrandId | 'general',
  userEmail: string = 'system'
): Promise<void> {
  const newLog: AuditLog = {
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: 'admin-action',
    userEmail,
    action,
    details,
    brandId: brandId || 'general'
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      return;
    } catch (e) {
      console.warn('Firestore addAuditLog error:', e);
    }
  }

  const logs = getLocalItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  setLocalItem(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs].slice(0, 200));
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => d.data() as AuditLog);
      }
    } catch (e) {
      console.warn('Firestore getAuditLogs error:', e);
    }
  }
  return getLocalItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
}

// ----------------------------------------------------
// BRANDS
// ----------------------------------------------------
export async function getBrands(): Promise<Brand[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'brands'));
      if (!snapshot.empty) {
        return snapshot.docs.map(d => d.data() as Brand);
      }
    } catch (e) {
      console.warn('Firestore getBrands error:', e);
    }
  }
  return getLocalItem<Brand[]>(STORAGE_KEYS.BRANDS, initialBrands);
}

export async function getBrandById(id: BrandId): Promise<Brand | undefined> {
  const brands = await getBrands();
  return brands.find(b => b.id === id);
}

// ----------------------------------------------------
// PRODUCT CATEGORIES
// ----------------------------------------------------
export async function getCategories(brandId?: BrandId | 'nexalus' | 'corporate'): Promise<ProductCategory[]> {
  let categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  if (brandId) {
    if (brandId === 'nexalus-innovations') {
      categories = categories.filter(c =>
        c.brandId === 'nexalus-innovations' ||
        c.brandId === 'cp-plus' ||
        c.brandId === 'one-broadband' ||
        c.brandId === 'itti-networking'
      );
    } else if (brandId === 'corporate' || (brandId as any) === 'nexalus') {
      categories = categories.filter(c => c.brandId === 'nexalus');
    } else {
      categories = categories.filter(c => c.brandId === brandId);
    }
  }
  return categories;
}

export async function createCategory(cat: Omit<ProductCategory, 'id'>): Promise<ProductCategory> {
  const newCat: ProductCategory = {
    ...cat,
    id: 'cat-' + Date.now()
  };
  const categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  const updated = [...categories, newCat];
  setLocalItem(STORAGE_KEYS.CATEGORIES, updated);
  await addAuditLog('CREATE_CATEGORY', `Created category: ${newCat.name}`, newCat.brandId);
  return newCat;
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  const target = categories.find(c => c.id === id);
  const updated = categories.filter(c => c.id !== id);
  setLocalItem(STORAGE_KEYS.CATEGORIES, updated);
  if (target) {
    await addAuditLog('DELETE_CATEGORY', `Deleted category: ${target.name}`, target.brandId);
  }
}

// ----------------------------------------------------
// PRODUCTS
// ----------------------------------------------------
export async function getProducts(brandId?: BrandId | 'nexalus' | 'corporate', publishedOnly = false): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    try {
      const constraints: any[] = [];
      if (brandId) {
        if (brandId === 'nexalus-innovations') {
          constraints.push(where('brandId', 'in', ['nexalus-innovations', 'cp-plus', 'one-broadband', 'itti-networking']));
        } else if (brandId === 'corporate' || (brandId as any) === 'nexalus') {
          constraints.push(where('brandId', '==', 'nexalus'));
        } else {
          constraints.push(where('brandId', '==', brandId));
        }
      }
      if (publishedOnly) constraints.push(where('published', '==', true));
      const q = constraints.length > 0
        ? query(collection(db, 'products'), ...constraints)
        : collection(db, 'products');
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => d.data() as Product);
      }
    } catch (e) {
      console.warn('Firestore getProducts error:', e);
    }
  }

  let products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  let hasStoreUpdates = false;

  // Auto-migrate legacy/book image URLs stored in localStorage
  const initialMap = new Map(initialProducts.map(ip => [ip.id, ip]));
  products = products.map(p => {
    const initProd = initialMap.get(p.id);
    if (initProd) {
      const currentImg = p.images?.[0] || '';
      if (
        !currentImg ||
        currentImg.includes('photo-1544716278-ca5e3f4abd8c') || // Book image removal
        currentImg.includes('photo-1589793463308-658ed42e524e') || // 404 URL removal
        currentImg.includes('photo-1582139329536-e7284fece509') || // Vault door removal
        (initProd.images?.[0]?.startsWith('/images/products/') && currentImg !== initProd.images[0])
      ) {
        hasStoreUpdates = true;
        return { ...p, images: initProd.images };
      }
    }
    return p;
  });

  if (products.length < initialProducts.length) {
    const existingIds = new Set(products.map(p => p.id));
    const missing = initialProducts.filter(p => !existingIds.has(p.id));
    if (missing.length > 0) {
      products = [...products, ...missing];
      hasStoreUpdates = true;
    }
  }

  if (hasStoreUpdates) {
    setLocalItem(STORAGE_KEYS.PRODUCTS, products);
  }
  if (brandId) {
    if (brandId === 'nexalus-innovations') {
      products = products.filter(p =>
        p.brandId === 'nexalus-innovations' ||
        p.brandId === 'cp-plus' ||
        p.brandId === 'one-broadband' ||
        p.brandId === 'itti-networking'
      );
    } else if (brandId === 'corporate' || (brandId as any) === 'nexalus') {
      products = products.filter(p => p.brandId === 'nexalus');
    } else {
      products = products.filter(p => p.brandId === brandId);
    }
  }
  if (publishedOnly) {
    products = products.filter(p => p.published);
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find(p => p.slug === slug);
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const id = 'prod-' + Date.now();
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...productData,
    id,
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'products', id), newProduct);
    } catch (e) {
      console.warn('Firestore createProduct error:', e);
    }
  }

  const products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  setLocalItem(STORAGE_KEYS.PRODUCTS, [newProduct, ...products]);
  await addAuditLog('CREATE_PRODUCT', `Added product: ${newProduct.name} (${newProduct.modelNumber})`, newProduct.brandId);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const now = new Date().toISOString();
  const products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated: Product = {
    ...products[index],
    ...updates,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'products', id), { ...updates, updatedAt: now });
    } catch (e) {
      console.warn('Firestore updateProduct error:', e);
    }
  }

  products[index] = updated;
  setLocalItem(STORAGE_KEYS.PRODUCTS, products);
  await addAuditLog('UPDATE_PRODUCT', `Updated product: ${updated.name}`, updated.brandId);
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  const target = products.find(p => p.id === id);
  if (!target) return false;

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.warn('Firestore deleteProduct error:', e);
    }
  }

  const updated = products.filter(p => p.id !== id);
  setLocalItem(STORAGE_KEYS.PRODUCTS, updated);
  await addAuditLog('DELETE_PRODUCT', `Deleted product: ${target.name}`, target.brandId);
  return true;
}

// ----------------------------------------------------
// INTERNET PLANS (One Broadband)
// ----------------------------------------------------
export async function getInternetPlans(publishedOnly = false): Promise<InternetPlan[]> {
  if (isFirebaseConfigured && db) {
    try {
      const constraints: any[] = [];
      if (publishedOnly) constraints.push(where('published', '==', true));
      const q = constraints.length > 0
        ? query(collection(db, 'plans'), ...constraints)
        : collection(db, 'plans');
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => d.data() as InternetPlan);
      }
    } catch (e) {
      console.warn('Firestore getPlans error:', e);
    }
  }

  let plans = getLocalItem<InternetPlan[]>(STORAGE_KEYS.PLANS, initialInternetPlans);
  // Auto-heal: Ensure plans match latest tariffs from user specifications
  const needsSync = !plans.some(p => p.id === 'plan-60') || plans.some(p => !p.originalPrice);
  if (needsSync) {
    plans = initialInternetPlans;
    setLocalItem(STORAGE_KEYS.PLANS, initialInternetPlans);
  }
  if (publishedOnly) {
    plans = plans.filter(p => p.published);
  }
  return plans.sort((a, b) => a.speedNumeric - b.speedNumeric);
}

export async function createInternetPlan(planData: Omit<InternetPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<InternetPlan> {
  const id = 'plan-' + Date.now();
  const now = new Date().toISOString();
  const newPlan: InternetPlan = {
    ...planData,
    id,
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'plans', id), newPlan);
    } catch (e) {
      console.warn('Firestore createPlan error:', e);
    }
  }

  const plans = getLocalItem<InternetPlan[]>(STORAGE_KEYS.PLANS, initialInternetPlans);
  setLocalItem(STORAGE_KEYS.PLANS, [...plans, newPlan]);
  await addAuditLog('CREATE_PLAN', `Created internet plan: ${newPlan.name} (${newPlan.speed})`, 'one-broadband');
  return newPlan;
}

export async function updateInternetPlan(id: string, updates: Partial<InternetPlan>): Promise<InternetPlan | null> {
  const now = new Date().toISOString();
  const plans = getLocalItem<InternetPlan[]>(STORAGE_KEYS.PLANS, initialInternetPlans);
  const index = plans.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated: InternetPlan = {
    ...plans[index],
    ...updates,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'plans', id), { ...updates, updatedAt: now });
    } catch (e) {
      console.warn('Firestore updatePlan error:', e);
    }
  }

  plans[index] = updated;
  setLocalItem(STORAGE_KEYS.PLANS, plans);
  await addAuditLog('UPDATE_PLAN', `Updated internet plan: ${updated.name}`, 'one-broadband');
  return updated;
}

export async function deleteInternetPlan(id: string): Promise<boolean> {
  const plans = getLocalItem<InternetPlan[]>(STORAGE_KEYS.PLANS, initialInternetPlans);
  const target = plans.find(p => p.id === id);
  if (!target) return false;

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (e) {
      console.warn('Firestore deletePlan error:', e);
    }
  }

  const updated = plans.filter(p => p.id !== id);
  setLocalItem(STORAGE_KEYS.PLANS, updated);
  await addAuditLog('DELETE_PLAN', `Deleted internet plan: ${target.name}`, 'one-broadband');
  return true;
}
// ----------------------------------------------------
// MULTI-PROVIDER BROADBAND PLANS & PROVIDERS (Phase 2 Data Model)
// ----------------------------------------------------

function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export function formatBroadbandPrice(amount: number, currency = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

// 1. PROVIDERS
export async function getBroadbandProviders(enabledOnly = false): Promise<BroadbandProvider[]> {
  if (isFirebaseConfigured && db) {
    try {
      const constraints: any[] = [];
      if (enabledOnly) constraints.push(where('enabled', '==', true));
      const q = constraints.length > 0
        ? query(collection(db, 'broadbandProviders'), ...constraints)
        : collection(db, 'broadbandProviders');
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const providers = snapshot.docs.map(d => d.data() as BroadbandProvider);
        return providers.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
    } catch (e) {
      console.warn('Firestore getBroadbandProviders error:', e);
    }
  }

  let providers = getLocalItem<BroadbandProvider[]>(STORAGE_KEYS.BROADBAND_PROVIDERS, initialBroadbandProviders);
  if (enabledOnly) {
    providers = providers.filter(p => p.enabled);
  }
  return providers.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export async function getBroadbandProviderById(providerId: string): Promise<BroadbandProvider | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, 'broadbandProviders', providerId));
      if (docSnap.exists()) {
        return docSnap.data() as BroadbandProvider;
      }
    } catch (e) {
      console.warn('Firestore getBroadbandProviderById error:', e);
    }
  }

  const providers = getLocalItem<BroadbandProvider[]>(STORAGE_KEYS.BROADBAND_PROVIDERS, initialBroadbandProviders);
  return providers.find(p => p.id === providerId) || null;
}

export async function createBroadbandProvider(
  providerData: Omit<BroadbandProvider, 'createdAt' | 'updatedAt'>
): Promise<BroadbandProvider> {
  const validation = validateBroadbandProvider(providerData);
  if (!validation.isValid) {
    throw new Error(`Invalid provider data: ${validation.errors.map(e => e.message).join(' ')}`);
  }

  const now = new Date().toISOString();
  const newProvider: BroadbandProvider = {
    ...providerData,
    displayOrder: typeof providerData.displayOrder === 'number' ? providerData.displayOrder : 0,
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'broadbandProviders', newProvider.id), sanitizeForFirestore(newProvider));
    } catch (e) {
      console.warn('Firestore createBroadbandProvider error:', e);
    }
  }

  const providers = getLocalItem<BroadbandProvider[]>(STORAGE_KEYS.BROADBAND_PROVIDERS, initialBroadbandProviders);
  const existingIndex = providers.findIndex(p => p.id === newProvider.id);
  const updatedProviders = existingIndex >= 0
    ? providers.map(p => (p.id === newProvider.id ? newProvider : p))
    : [...providers, newProvider];
  setLocalItem(STORAGE_KEYS.BROADBAND_PROVIDERS, updatedProviders);

  await addAuditLog(
    'CREATE_BROADBAND_PROVIDER',
    `Created broadband provider: ${newProvider.name} (${newProvider.id})`,
    'general'
  );

  return newProvider;
}

export async function updateBroadbandProvider(
  id: string,
  updates: Partial<BroadbandProvider>
): Promise<BroadbandProvider | null> {
  const providers = getLocalItem<BroadbandProvider[]>(STORAGE_KEYS.BROADBAND_PROVIDERS, initialBroadbandProviders);
  const index = providers.findIndex(p => p.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updated: BroadbandProvider = {
    ...providers[index],
    ...updates,
    id,
    updatedAt: now
  };

  const validation = validateBroadbandProvider(updated);
  if (!validation.isValid) {
    throw new Error(`Invalid provider update: ${validation.errors.map(e => e.message).join(' ')}`);
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'broadbandProviders', id), sanitizeForFirestore({ ...updates, updatedAt: now }));
    } catch (e) {
      console.warn('Firestore updateBroadbandProvider error:', e);
    }
  }

  providers[index] = updated;
  setLocalItem(STORAGE_KEYS.BROADBAND_PROVIDERS, providers);

  await addAuditLog(
    'UPDATE_BROADBAND_PROVIDER',
    `Updated broadband provider: ${updated.name}`,
    'general'
  );

  return updated;
}

// 2. PLANS
export async function getBroadbandPlans(
  options?: { providerId?: string; publishedOnly?: boolean; city?: string }
): Promise<BroadbandPlan[]> {
  if (isFirebaseConfigured && db) {
    try {
      const constraints: any[] = [];
      if (options?.providerId) {
        constraints.push(where('providerId', '==', options.providerId));
      }
      if (options?.publishedOnly) {
        constraints.push(where('published', '==', true));
      }
      const q = constraints.length > 0
        ? query(collection(db, 'broadbandPlans'), ...constraints)
        : collection(db, 'broadbandPlans');
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        let results = snapshot.docs.map(d => d.data() as BroadbandPlan);
        if (options?.city) {
          const cityQuery = options.city.toLowerCase();
          results = results.filter(p =>
            !p.city ||
            p.city.toLowerCase() === 'all' ||
            p.city.toLowerCase().includes(cityQuery) ||
            (p.cities && p.cities.some(c => c.toLowerCase().includes(cityQuery)))
          );
        }
        return results.sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return (a.displayOrder || 0) - (b.displayOrder || 0);
          }
          return (a.speedNumeric || 0) - (b.speedNumeric || 0);
        });
      }
    } catch (e) {
      console.warn('Firestore getBroadbandPlans error:', e);
    }
  }

  let plans = getLocalItem<BroadbandPlan[]>(STORAGE_KEYS.BROADBAND_PLANS, initialBroadbandPlans);
  if (options?.providerId) {
    plans = plans.filter(p => p.providerId === options.providerId);
  }
  if (options?.publishedOnly) {
    plans = plans.filter(p => p.published);
  }
  if (options?.city) {
    const cityQuery = options.city.toLowerCase();
    plans = plans.filter(p =>
      !p.city ||
      p.city.toLowerCase() === 'all' ||
      p.city.toLowerCase().includes(cityQuery) ||
      (p.cities && p.cities.some(c => c.toLowerCase().includes(cityQuery)))
    );
  }
  return plans.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    }
    return (a.speedNumeric || 0) - (b.speedNumeric || 0);
  });
}

export async function getPublishedBroadbandPlans(providerId?: string): Promise<BroadbandPlan[]> {
  return getBroadbandPlans({ providerId, publishedOnly: true });
}

export async function getBroadbandPlansByProvider(
  providerId: string,
  publishedOnly = false
): Promise<BroadbandPlan[]> {
  return getBroadbandPlans({ providerId, publishedOnly });
}

export async function getBroadbandPlanById(id: string): Promise<BroadbandPlan | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, 'broadbandPlans', id));
      if (docSnap.exists()) {
        return docSnap.data() as BroadbandPlan;
      }
    } catch (e) {
      console.warn('Firestore getBroadbandPlanById error:', e);
    }
  }

  const plans = getLocalItem<BroadbandPlan[]>(STORAGE_KEYS.BROADBAND_PLANS, initialBroadbandPlans);
  return plans.find(p => p.id === id) || null;
}

export async function createBroadbandPlan(
  planData: Omit<BroadbandPlan, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<BroadbandPlan> {
  const generatedSlug = planData.slug || planData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = planData.id || `plan-${planData.providerId}-${generatedSlug}-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const newPlan: BroadbandPlan = {
    ...planData,
    id,
    slug: generatedSlug,
    price: Number(planData.price),
    originalPrice: planData.originalPrice !== undefined ? Number(planData.originalPrice) : undefined,
    currency: planData.currency || 'INR',
    displayOrder: typeof planData.displayOrder === 'number' ? planData.displayOrder : 0,
    speedNumeric: typeof planData.speedNumeric === 'number' ? planData.speedNumeric : 0,
    features: Array.isArray(planData.features) ? planData.features : [],
    availability: planData.availability || 'active',
    published: typeof planData.published === 'boolean' ? planData.published : true,
    createdAt: now,
    updatedAt: now
  };

  const validation = validateBroadbandPlan(newPlan);
  if (!validation.isValid) {
    throw new Error(`Invalid plan data: ${validation.errors.map(e => e.message).join(' ')}`);
  }

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'broadbandPlans', id), sanitizeForFirestore(newPlan));
    } catch (e) {
      console.warn('Firestore createBroadbandPlan error:', e);
    }
  }

  const plans = getLocalItem<BroadbandPlan[]>(STORAGE_KEYS.BROADBAND_PLANS, initialBroadbandPlans);
  setLocalItem(STORAGE_KEYS.BROADBAND_PLANS, [...plans, newPlan]);

  await addAuditLog(
    'CREATE_BROADBAND_PLAN',
    `Created broadband plan: ${newPlan.name} (${newPlan.speed}, ₹${newPlan.price}) for ${newPlan.providerId}`,
    'general'
  );

  return newPlan;
}

export async function updateBroadbandPlan(
  id: string,
  updates: Partial<BroadbandPlan>
): Promise<BroadbandPlan | null> {
  const plans = getLocalItem<BroadbandPlan[]>(STORAGE_KEYS.BROADBAND_PLANS, initialBroadbandPlans);
  const index = plans.findIndex(p => p.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updated: BroadbandPlan = {
    ...plans[index],
    ...updates,
    id,
    updatedAt: now
  };

  if (updates.price !== undefined) {
    updated.price = Number(updates.price);
  }
  if (updates.originalPrice !== undefined) {
    updated.originalPrice = Number(updates.originalPrice);
  }

  const validation = validateBroadbandPlan(updated);
  if (!validation.isValid) {
    throw new Error(`Invalid plan update: ${validation.errors.map(e => e.message).join(' ')}`);
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'broadbandPlans', id), sanitizeForFirestore({ ...updates, updatedAt: now }));
    } catch (e) {
      console.warn('Firestore updateBroadbandPlan error:', e);
    }
  }

  plans[index] = updated;
  setLocalItem(STORAGE_KEYS.BROADBAND_PLANS, plans);

  await addAuditLog(
    'UPDATE_BROADBAND_PLAN',
    `Updated broadband plan: ${updated.name}`,
    'general'
  );

  return updated;
}

export async function setBroadbandPlanPublished(
  id: string,
  published: boolean
): Promise<BroadbandPlan | null> {
  const updated = await updateBroadbandPlan(id, { published });
  if (updated) {
    await addAuditLog(
      published ? 'PUBLISH_BROADBAND_PLAN' : 'UNPUBLISH_BROADBAND_PLAN',
      `${published ? 'Published' : 'Unpublished'} plan: ${updated.name}`,
      'general'
    );
  }
  return updated;
}

export async function updateBroadbandPlanDisplayOrder(
  id: string,
  displayOrder: number
): Promise<BroadbandPlan | null> {
  if (typeof displayOrder !== 'number' || isNaN(displayOrder)) {
    throw new Error('displayOrder must be a valid number.');
  }
  return updateBroadbandPlan(id, { displayOrder });
}

export async function updateBroadbandPlansOrder(
  orderedIds: string[]
): Promise<boolean> {
  const plans = getLocalItem<BroadbandPlan[]>(STORAGE_KEYS.BROADBAND_PLANS, initialBroadbandPlans);
  const planMap = new Map(plans.map(p => [p.id, p]));
  const now = new Date().toISOString();

  orderedIds.forEach((id, index) => {
    const plan = planMap.get(id);
    if (plan) {
      plan.displayOrder = index + 1;
      plan.updatedAt = now;
      if (isFirebaseConfigured && db) {
        updateDoc(doc(db, 'broadbandPlans', id), { displayOrder: index + 1, updatedAt: now }).catch(e =>
          console.warn('Firestore updateBroadbandPlansOrder error for id ' + id, e)
        );
      }
    }
  });

  setLocalItem(STORAGE_KEYS.BROADBAND_PLANS, Array.from(planMap.values()));
  await addAuditLog(
    'REORDER_BROADBAND_PLANS',
    `Reordered ${orderedIds.length} broadband plans`,
    'general'
  );
  return true;
}

export async function deleteBroadbandPlan(id: string): Promise<boolean> {
  const plans = getLocalItem<BroadbandPlan[]>(STORAGE_KEYS.BROADBAND_PLANS, initialBroadbandPlans);
  const target = plans.find(p => p.id === id);
  if (!target) return false;

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'broadbandPlans', id));
    } catch (e) {
      console.warn('Firestore deleteBroadbandPlan error:', e);
    }
  }

  const updated = plans.filter(p => p.id !== id);
  setLocalItem(STORAGE_KEYS.BROADBAND_PLANS, updated);
  await addAuditLog('DELETE_BROADBAND_PLAN', `Deleted plan: ${target.name}`, 'general');
  return true;
}


// ----------------------------------------------------
// SERVICES
// ----------------------------------------------------
export async function getServices(brandId?: BrandId | 'nexalus' | 'corporate', publishedOnly = false): Promise<Service[]> {
  let services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  if (brandId) {
    if (brandId === 'nexalus-innovations') {
      services = services.filter(s =>
        s.brandId === 'nexalus-innovations' ||
        s.brandId === 'cp-plus' ||
        s.brandId === 'one-broadband' ||
        s.brandId === 'itti-networking'
      );
    } else if (brandId === 'corporate' || (brandId as any) === 'nexalus') {
      services = services.filter(s => s.brandId === 'nexalus');
    } else {
      services = services.filter(s => s.brandId === brandId);
    }
  }
  if (publishedOnly) {
    services = services.filter(s => s.published);
  }
  return services;
}

export async function createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  const id = 'srv-' + Date.now();
  const now = new Date().toISOString();
  const newService: Service = {
    ...serviceData,
    id,
    createdAt: now,
    updatedAt: now
  };

  const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  setLocalItem(STORAGE_KEYS.SERVICES, [newService, ...services]);
  await addAuditLog('CREATE_SERVICE', `Created service: ${newService.title}`, newService.brandId === 'nexalus' ? 'general' : newService.brandId);
  return newService;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
  const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return null;

  const updated = {
    ...services[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  services[index] = updated;
  setLocalItem(STORAGE_KEYS.SERVICES, services);
  await addAuditLog('UPDATE_SERVICE', `Updated service: ${updated.title}`, updated.brandId === 'nexalus' ? 'general' : updated.brandId);
  return updated;
}

export async function deleteService(id: string): Promise<boolean> {
  const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  const target = services.find(s => s.id === id);
  if (!target) return false;

  const updated = services.filter(s => s.id !== id);
  setLocalItem(STORAGE_KEYS.SERVICES, updated);
  await addAuditLog('DELETE_SERVICE', `Deleted service: ${target.title}`, target.brandId === 'nexalus' ? 'general' : target.brandId);
  return true;
}

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export async function getProjects(brandId?: BrandId | 'nexalus', publishedOnly = false): Promise<Project[]> {
  let projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  const needsSync = projects.some(p => p.images?.[0]?.includes('unsplash.com'));
  if (needsSync) {
    projects = initialProjects;
    setLocalItem(STORAGE_KEYS.PROJECTS, initialProjects);
  }
  if (brandId) {
    projects = projects.filter(p => p.brandId === brandId);
  }
  if (publishedOnly) {
    projects = projects.filter(p => p.published);
  }
  return projects;
}

export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const id = 'proj-' + Date.now();
  const now = new Date().toISOString();
  const newProject: Project = {
    ...projectData,
    id,
    createdAt: now,
    updatedAt: now
  };

  const projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  setLocalItem(STORAGE_KEYS.PROJECTS, [newProject, ...projects]);
  await addAuditLog('CREATE_PROJECT', `Created project: ${newProject.title}`, newProject.brandId === 'nexalus' ? 'general' : newProject.brandId);
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  projects[index] = updated;
  setLocalItem(STORAGE_KEYS.PROJECTS, projects);
  await addAuditLog('UPDATE_PROJECT', `Updated project: ${updated.title}`, updated.brandId === 'nexalus' ? 'general' : updated.brandId);
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  const target = projects.find(p => p.id === id);
  if (!target) return false;

  const updated = projects.filter(p => p.id !== id);
  setLocalItem(STORAGE_KEYS.PROJECTS, updated);
  await addAuditLog('DELETE_PROJECT', `Deleted project: ${target.title}`, target.brandId === 'nexalus' ? 'general' : target.brandId);
  return true;
}

// ----------------------------------------------------
// ENQUIRIES & LEADS
// ----------------------------------------------------
export async function getEnquiries(brandScope?: BrandId | 'all', statusFilter?: string): Promise<Enquiry[]> {
  if (isFirebaseConfigured && db) {
    try {
      const constraints: any[] = [];
      if (brandScope && brandScope !== 'all') {
        constraints.push(where('brandId', '==', brandScope));
      }
      if (statusFilter && statusFilter !== 'all') {
        constraints.push(where('status', '==', statusFilter));
      }
      const q = constraints.length > 0
        ? query(collection(db, 'enquiries'), ...constraints)
        : collection(db, 'enquiries');
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => d.data() as Enquiry);
      }
    } catch (e) {
      console.warn('Firestore getEnquiries error:', e);
    }
  }

  let enquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  if (brandScope && brandScope !== 'all') {
    if (brandScope === 'nexalus-innovations') {
      enquiries = enquiries.filter(e =>
        e.brandId === 'nexalus-innovations' ||
        e.brandId === 'cp-plus' ||
        e.brandId === 'one-broadband' ||
        e.brandId === 'itti-networking'
      );
    } else {
      enquiries = enquiries.filter(e => e.brandId === brandScope);
    }
  }
  if (statusFilter && statusFilter !== 'all') {
    enquiries = enquiries.filter(e => e.status === statusFilter);
  }
  return enquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function submitEnquiry(
  data: Omit<Enquiry, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; id: string; message: string }> {
  // Normalize & validate
  if (!data.customerName.trim() || !data.phone.trim() || !data.email.trim()) {
    throw new Error('Please provide name, phone and valid email.');
  }

  const id = 'enq-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();
  const newEnquiry: Enquiry = {
    ...data,
    id,
    status: 'new',
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'enquiries', id), newEnquiry);
    } catch (e) {
      console.warn('Firestore submitEnquiry error:', e);
    }
  }

  const enquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  setLocalItem(STORAGE_KEYS.ENQUIRIES, [newEnquiry, ...enquiries]);
  await addAuditLog(
    'NEW_ENQUIRY_RECEIVED',
    `Received enquiry #${id} from ${newEnquiry.customerName} (${newEnquiry.phone})`,
    newEnquiry.brandId === 'general' ? undefined : newEnquiry.brandId
  );

  return {
    success: true,
    id,
    message: 'Your enquiry has been successfully registered. Our technical advisor will contact you shortly.'
  };
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
  internalNotes?: string,
  assignedTo?: string
): Promise<Enquiry | null> {
  const enquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  const index = enquiries.findIndex(e => e.id === id);
  if (index === -1) return null;

  const current = enquiries[index];
  const updated: Enquiry = {
    ...current,
    status,
    internalNotes: internalNotes !== undefined ? internalNotes : current.internalNotes,
    assignedTo: assignedTo !== undefined ? assignedTo : current.assignedTo,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'enquiries', id), {
        status,
        internalNotes: updated.internalNotes,
        assignedTo: updated.assignedTo,
        updatedAt: updated.updatedAt
      });
    } catch (e) {
      console.warn('Firestore updateEnquiryStatus error:', e);
    }
  }

  enquiries[index] = updated;
  setLocalItem(STORAGE_KEYS.ENQUIRIES, enquiries);
  await addAuditLog(
    'UPDATE_ENQUIRY',
    `Updated enquiry #${id} status to '${status}'`,
    updated.brandId === 'general' ? undefined : updated.brandId
  );
  return updated;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  const enquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  const target = enquiries.find(e => e.id === id);
  if (!target) return false;

  const updated = enquiries.filter(e => e.id !== id);
  setLocalItem(STORAGE_KEYS.ENQUIRIES, updated);
  await addAuditLog('DELETE_ENQUIRY', `Removed enquiry record #${id}`, target.brandId === 'general' ? undefined : target.brandId);
  return true;
}

// ----------------------------------------------------
// SERVICE AREAS (One Broadband Coverage Check)
// ----------------------------------------------------
export async function getServiceAreas(): Promise<ServiceArea[]> {
  return getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
}

export async function checkCoverage(queryStr: string): Promise<{
  isServiceable: boolean;
  status?: 'fully_operational' | 'expanding_soon' | 'planned';
  matchedArea?: ServiceArea;
  message: string;
}> {
  const clean = queryStr.trim().toLowerCase();
  const areas = await getServiceAreas();

  const found = areas.find(a =>
    a.pincode === clean ||
    a.locality.toLowerCase().includes(clean) ||
    a.city.toLowerCase().includes(clean)
  );

  if (found) {
    if (found.status === 'fully_operational') {
      return {
        isServiceable: true,
        status: 'fully_operational',
        matchedArea: found,
        message: `High-Speed Fiber is fully operational in ${found.locality} (${found.pincode}). Connections can be activated within 24–48 hours!`
      };
    } else if (found.status === 'expanding_soon') {
      return {
        isServiceable: true,
        status: 'expanding_soon',
        matchedArea: found,
        message: `Network rollout is currently expanding in ${found.locality}. Book your connection early for priority installation.`
      };
    }
  }

  return {
    isServiceable: false,
    message: `We currently do not have confirmed fiber presence at '${queryStr}'. Submit an enquiry below and our network team will check nearest feeder availability!`
  };
}

export async function createServiceArea(area: Omit<ServiceArea, 'id' | 'updatedAt'>): Promise<ServiceArea> {
  const newArea: ServiceArea = {
    ...area,
    id: 'sa-' + Date.now(),
    updatedAt: new Date().toISOString()
  };
  const areas = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, [...areas, newArea]);
  await addAuditLog('CREATE_SERVICE_AREA', `Added coverage zone: ${newArea.locality} (${newArea.pincode})`, 'one-broadband');
  return newArea;
}

export async function updateServiceArea(id: string, updates: Partial<ServiceArea>): Promise<ServiceArea | null> {
  const areas = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  const index = areas.findIndex(a => a.id === id);
  if (index === -1) return null;

  const updated: ServiceArea = {
    ...areas[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  areas[index] = updated;
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, areas);
  await addAuditLog('UPDATE_SERVICE_AREA', `Updated coverage zone: ${updated.locality}`, 'one-broadband');
  return updated;
}

export async function deleteServiceArea(id: string): Promise<boolean> {
  const areas = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  const target = areas.find(a => a.id === id);
  if (!target) return false;

  const updated = areas.filter(a => a.id !== id);
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, updated);
  await addAuditLog('DELETE_SERVICE_AREA', `Deleted coverage zone: ${target.locality}`, 'one-broadband');
  return true;
}

// ----------------------------------------------------
// FAQS
// ----------------------------------------------------
export async function getFaqs(brandId?: BrandId | 'nexalus', publishedOnly = false): Promise<FAQ[]> {
  let faqs = getLocalItem<FAQ[]>(STORAGE_KEYS.FAQS, initialFaqs);
  if (brandId) {
    faqs = faqs.filter(f => f.brandId === brandId);
  }
  if (publishedOnly) {
    faqs = faqs.filter(f => f.published);
  }
  return faqs.sort((a, b) => a.order - b.order);
}

export async function createFaq(faq: Omit<FAQ, 'id'>): Promise<FAQ> {
  const newFaq: FAQ = {
    ...faq,
    id: 'faq-' + Date.now()
  };
  const faqs = getLocalItem<FAQ[]>(STORAGE_KEYS.FAQS, initialFaqs);
  setLocalItem(STORAGE_KEYS.FAQS, [...faqs, newFaq]);
  await addAuditLog('CREATE_FAQ', `Added FAQ: ${newFaq.question.substring(0, 40)}...`, newFaq.brandId === 'nexalus' ? 'general' : newFaq.brandId);
  return newFaq;
}

export async function updateFaq(id: string, updates: Partial<FAQ>): Promise<FAQ | null> {
  const faqs = getLocalItem<FAQ[]>(STORAGE_KEYS.FAQS, initialFaqs);
  const index = faqs.findIndex(f => f.id === id);
  if (index === -1) return null;

  const updated = { ...faqs[index], ...updates };
  faqs[index] = updated;
  setLocalItem(STORAGE_KEYS.FAQS, faqs);
  return updated;
}

export async function deleteFaq(id: string): Promise<boolean> {
  const faqs = getLocalItem<FAQ[]>(STORAGE_KEYS.FAQS, initialFaqs);
  const updated = faqs.filter(f => f.id !== id);
  setLocalItem(STORAGE_KEYS.FAQS, updated);
  return true;
}

// ----------------------------------------------------
// BANNERS
// ----------------------------------------------------
export async function getBanners(brandId?: BrandId | 'nexalus'): Promise<SiteBanner[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'banners'));
      if (!snapshot.empty) {
        const fullList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SiteBanner));
        setLocalItem(STORAGE_KEYS.BANNERS, fullList);
        return brandId ? fullList.filter(b => b.brandId === brandId) : fullList;
      }
    } catch (e) {
      console.warn('Firestore getBanners error:', e);
    }
  }
  let banners = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);
  if (brandId) {
    banners = banners.filter(b => b.brandId === brandId);
  }
  return banners;
}

export async function updateBanner(id: string, updates: Partial<SiteBanner>): Promise<SiteBanner | null> {
  const allBanners = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);
  const index = allBanners.findIndex(b => b.id === id);
  const updated: SiteBanner = index >= 0
    ? { ...allBanners[index], ...updates, id }
    : ({ id, active: true, title: '', subtitle: '', ctaText: '', ctaLink: '', brandId: 'nexalus', ...updates } as SiteBanner);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'banners', id), sanitizeForFirestore(updated), { merge: true });
    } catch (e) {
      console.warn('Firestore updateBanner error:', e);
      throw e;
    }
  }

  const nextList = index >= 0
    ? allBanners.map(b => b.id === id ? updated : b)
    : [...allBanners, updated];
  setLocalItem(STORAGE_KEYS.BANNERS, nextList);

  await addAuditLog('UPDATE_BANNER', `Updated website content banner: ${updated.title}`, updated.brandId as any);
  return updated;
}

export function subscribeToBanners(
  callback: (banners: SiteBanner[]) => void,
  brandId?: BrandId | 'nexalus'
): () => void {
  let unsubFirestore: (() => void) | null = null;

  // Immediate synchronous emit from local storage so UI renders instantly
  try {
    let localBanners = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);
    if (brandId) {
      localBanners = localBanners.filter(b => b.brandId === brandId);
    }
    callback(localBanners);
  } catch (err) {
    console.warn('Initial banner emit warning:', err);
  }

  const emitBanners = async () => {
    try {
      const data = await getBanners(brandId);
      callback(data);
    } catch (e) {
      console.warn('Error fetching banners in subscriber:', e);
    }
  };

  if (isFirebaseConfigured && db) {
    try {
      const q = brandId
        ? query(collection(db, 'banners'), where('brandId', '==', brandId))
        : collection(db, 'banners');

      unsubFirestore = onSnapshot(q, (snapshot) => {
        let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SiteBanner));
        if (brandId) {
          results = results.filter(b => b.brandId === brandId);
        }
        if (results.length > 0) {
          callback(results);
        } else {
          emitBanners();
        }
      }, (err) => {
        console.warn('Firestore onSnapshot error for banners, falling back to local updates:', err);
        emitBanners();
      });
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot for banners:', e);
      emitBanners();
    }
  } else {
    emitBanners();
  }

  const handleUpdate = (e: any) => {
    if (!e.detail || e.detail.key === STORAGE_KEYS.BANNERS) {
      emitBanners();
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.BANNERS) {
      emitBanners();
    }
  };

  window.addEventListener('nexalus_data_update', handleUpdate);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (unsubFirestore) unsubFirestore();
    window.removeEventListener('nexalus_data_update', handleUpdate);
    window.removeEventListener('storage', handleStorage);
  };
}

// ----------------------------------------------------
// USERS & ROLES
// ----------------------------------------------------
export async function getUsers(): Promise<AdminUser[]> {
  // If Firestore is available, fetch the verified administrative user list
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      if (!snapshot.empty) {
        const firestoreUsers: AdminUser[] = [];
        snapshot.forEach(d => {
          const data = d.data() as any;
          if (data && data.email && data.role) {
            // Strip any legacy plaintext password field
            const { password: _purged, ...sanitized } = data;
            firestoreUsers.push({
              uid: data.uid || d.id,
              displayName: sanitized.displayName || sanitized.email,
              email: sanitized.email,
              role: sanitized.role,
              assignedBrandId: sanitized.assignedBrandId,
              active: sanitized.active !== false,
              createdAt: sanitized.createdAt || new Date().toISOString(),
              lastLogin: sanitized.lastLogin
            });
          }
        });

        // Deduplicate strictly by email address so multiple docs for the same admin never duplicate
        const uniqueByEmail = new Map<string, AdminUser>();
        firestoreUsers.forEach(u => {
          const key = u.email.toLowerCase();
          if (!uniqueByEmail.has(key)) {
            uniqueByEmail.set(key, u);
          } else {
            const existing = uniqueByEmail.get(key)!;
            // Prefer genuine Firebase Auth UIDs (standard length > 20) over legacy placeholder strings
            if (u.uid.length > 20 && existing.uid.length <= 20) {
              uniqueByEmail.set(key, u);
            }
          }
        });

        const deduplicatedUsers = Array.from(uniqueByEmail.values());
        if (deduplicatedUsers.length > 0) {
          setLocalItem(STORAGE_KEYS.USERS, deduplicatedUsers);
          return deduplicatedUsers;
        }
      }
    } catch (e) {
      console.warn('Firestore getUsers error; falling back to local store:', e);
    }
  }

  // Resilient fallback with legacy password purging and email deduplication
  let users = getLocalItem<AdminUser[]>(STORAGE_KEYS.USERS, initialUsers);
  let hasUpdates = false;

  // Purge any legacy passwords that might have been saved in localStorage
  users = users.map(u => {
    const raw = u as any;
    if (raw.password) {
      hasUpdates = true;
      const { password: _purged, ...sanitized } = raw;
      return sanitized as AdminUser;
    }
    return u;
  });

  // Ensure initial seed users exist if store is clean
  const existingEmails = new Set(users.map(u => u.email.toLowerCase()));
  for (const init of initialUsers) {
    if (!existingEmails.has(init.email.toLowerCase())) {
      users.push(init);
      hasUpdates = true;
    }
  }

  // Remove legacy cpplus placeholder if present in storage
  if (users.some(u => u.email === 'cpplus.admin@nexalusinnovations.com')) {
    users = users.filter(u => u.email !== 'cpplus.admin@nexalusinnovations.com');
    hasUpdates = true;
  }

  // Strict email deduplication for fallback store
  const uniqueFallback = new Map<string, AdminUser>();
  users.forEach(u => {
    const key = u.email.toLowerCase();
    if (!uniqueFallback.has(key)) {
      uniqueFallback.set(key, u);
    } else {
      const existing = uniqueFallback.get(key)!;
      if (u.uid.length > 20 && existing.uid.length <= 20) {
        uniqueFallback.set(key, u);
      }
    }
  });

  const finalUsers = Array.from(uniqueFallback.values());
  if (hasUpdates || finalUsers.length !== users.length) {
    setLocalItem(STORAGE_KEYS.USERS, finalUsers);
  }
  return finalUsers;
}

export async function updateUser(uid: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
  const users = await getUsers();
  const index = users.findIndex(u => u.uid === uid);
  if (index === -1) return null;

  const updated: AdminUser = {
    ...users[index],
    ...updates
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore updateUser error:', e);
    }
  }

  users[index] = updated;
  setLocalItem(STORAGE_KEYS.USERS, users);
  await addAuditLog('UPDATE_USER', `Updated user role/status for: ${updated.email}`);
  return updated;
}

export async function createUser(user: Omit<AdminUser, 'uid' | 'createdAt'>): Promise<AdminUser> {
  const uid = 'usr-' + Date.now();
  const newUser: AdminUser = {
    ...user,
    uid,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...newUser,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore createUser error:', e);
    }
  }

  const users = await getUsers();
  setLocalItem(STORAGE_KEYS.USERS, [...users, newUser]);
  await addAuditLog('CREATE_USER', `Created admin account: ${newUser.email} (${newUser.role})`);
  return newUser;
}
export async function deleteUser(uid: string): Promise<boolean> {
  const users = await getUsers();
  const target = users.find(u => u.uid === uid);
  if (!target) return false;

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e: any) {
      console.error('Firestore deleteUser error:', e);
      throw new Error(`Failed to delete user in Cloud Firestore: ${e.message || e}`);
    }
  }

  const updated = users.filter(u => u.uid !== uid);
  setLocalItem(STORAGE_KEYS.USERS, updated);
  await addAuditLog('DELETE_USER', `Deleted admin account: ${target.email}`);
  return true;
}

export async function provisionAdminAccount(data: {
  displayName: string;
  email: string;
  role: UserRole;
  password?: string;
  assignedBrandId?: BrandId | 'all';
  active?: boolean;
  sendResetEmail?: boolean;
}): Promise<{ user: AdminUser; resetEmailSent: boolean }> {
  const cleanEmail = data.email.trim().toLowerCase();
  const displayName = data.displayName.trim();
  const role = data.role;
  const assignedBrandId = data.assignedBrandId || (role === 'am_admin' ? 'am-distributors' : role === 'super_admin' ? 'all' : 'nexalus-innovations');
  const active = data.active !== false;
  const now = new Date().toISOString();

  let authUid = '';
  let resetEmailSent = false;

  if (isFirebaseConfigured && auth && db) {
    const secondaryAppName = `ProvisionApp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const secondaryApp = initSecondaryApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getSecondaryAuth(secondaryApp);

    try {
      // 1. Use the password provided by the super-admin (or generate secure temporary password)
      const initialPassword = data.password && data.password.trim().length >= 6
        ? data.password.trim()
        : 'Nx!' + Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2) + '@' + Date.now();

      try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, initialPassword);
        authUid = cred.user.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          console.info(`Email ${cleanEmail} already registered in Firebase Auth. Linking profile to existing Auth record.`);
          const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
          const snap = await getDocs(q);
          if (!snap.empty) {
            authUid = snap.docs[0].id;
          } else {
            authUid = 'auth-' + cleanEmail.replace(/[^a-z0-9]/g, '-');
          }
        } else {
          throw authErr;
        }
      }

      // 2. Save administrative document in Firestore under exact Auth UID
      const adminDoc: AdminUser = {
        uid: authUid,
        displayName,
        email: cleanEmail,
        role,
        assignedBrandId,
        active,
        createdAt: now
      };

      await setDoc(doc(db, 'users', authUid), {
        ...adminDoc,
        updatedAt: now
      }, { merge: true });

      // 3. Dispatch official Firebase password reset/setup link if requested or if no password provided
      if (data.sendResetEmail === true || !data.password) {
        try {
          await sendPasswordResetEmail(auth, cleanEmail);
          resetEmailSent = true;
        } catch (mailErr) {
          console.warn('Password reset email notification warning:', mailErr);
        }
      }

      await addAuditLog(
        'CREATE_USER',
        `Provisioned admin account via Firebase Auth: ${cleanEmail} (${role})`,
        undefined
      );

      const currentUsers = await getUsers();
      const existingIdx = currentUsers.findIndex(u => u.uid === authUid || u.email.toLowerCase() === cleanEmail);
      const updatedUsers = existingIdx >= 0
        ? currentUsers.map(u => (u.uid === authUid ? adminDoc : u))
        : [...currentUsers, adminDoc];
      setLocalItem(STORAGE_KEYS.USERS, updatedUsers);

      return { user: adminDoc, resetEmailSent };
    } finally {
      try {
        await deleteSecondaryApp(secondaryApp);
      } catch {}
    }
  }

  // Fallback for offline or unconfigured environment
  const fallbackUid = 'usr-' + Date.now();
  const fallbackUser: AdminUser = {
    uid: fallbackUid,
    displayName,
    email: cleanEmail,
    role,
    assignedBrandId,
    active,
    createdAt: now
  };
  const users = await getUsers();
  setLocalItem(STORAGE_KEYS.USERS, [...users, fallbackUser]);
  await addAuditLog('CREATE_USER', `Created offline admin record: ${fallbackUser.email} (${fallbackUser.role})`);
  return { user: fallbackUser, resetEmailSent: false };
}

// ----------------------------------------------------
// REAL-TIME BROADBAND PLANS REACTIVITY
// ----------------------------------------------------
export function subscribeToBroadbandPlans(
  callback: (plans: BroadbandPlan[]) => void,
  options?: { providerId?: string; publishedOnly?: boolean; city?: string }
): () => void {
  let unsubFirestore: (() => void) | null = null;

  const emitPlans = async () => {
    try {
      const plans = await getBroadbandPlans(options);
      callback(plans);
    } catch (e) {
      console.warn('Error fetching broadband plans in subscriber:', e);
    }
  };

  if (isFirebaseConfigured && db) {
    try {
      const constraints: any[] = [];
      if (options?.providerId) {
        constraints.push(where('providerId', '==', options.providerId));
      }
      if (options?.publishedOnly) {
        constraints.push(where('published', '==', true));
      }
      const q = constraints.length > 0
        ? query(collection(db, 'broadbandPlans'), ...constraints)
        : collection(db, 'broadbandPlans');

      unsubFirestore = onSnapshot(q, (snapshot) => {
        let results = snapshot.docs.map(d => d.data() as BroadbandPlan);
        if (options?.city) {
          const cityQuery = options.city.toLowerCase();
          results = results.filter(p =>
            !p.city ||
            p.city.toLowerCase() === 'all' ||
            p.city.toLowerCase().includes(cityQuery) ||
            (p.cities && p.cities.some(c => c.toLowerCase().includes(cityQuery)))
          );
        }
        results.sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
          }
          return (a.speedNumeric ?? 0) - (b.speedNumeric ?? 0);
        });
        callback(results);
      }, (err) => {
        console.warn('Firestore onSnapshot error, falling back to local updates:', err);
        emitPlans();
      });
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot for broadbandPlans:', e);
      emitPlans();
    }
  } else {
    emitPlans();
  }

  const handleUpdate = (e: any) => {
    if (!e.detail || e.detail.key === STORAGE_KEYS.BROADBAND_PLANS) {
      emitPlans();
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.BROADBAND_PLANS) {
      emitPlans();
    }
  };

  window.addEventListener('nexalus_data_update', handleUpdate);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (unsubFirestore) unsubFirestore();
    window.removeEventListener('nexalus_data_update', handleUpdate);
    window.removeEventListener('storage', handleStorage);
  };
}

export function subscribeToInternetPlans(
  callback: (plans: InternetPlan[]) => void,
  publishedOnly = false
): () => void {
  let unsubFirestore: (() => void) | null = null;

  const emitPlans = async () => {
    try {
      const plans = await getInternetPlans(publishedOnly);
      callback(plans);
    } catch (e) {
      console.warn('Error fetching legacy plans in subscriber:', e);
    }
  };

  if (isFirebaseConfigured && db) {
    try {
      const q = publishedOnly
        ? query(collection(db, 'plans'), where('published', '==', true))
        : collection(db, 'plans');

      unsubFirestore = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(d => d.data() as InternetPlan);
        results.sort((a, b) => (a.speedNumeric ?? 0) - (b.speedNumeric ?? 0));
        callback(results);
      }, (err) => {
        console.warn('Firestore onSnapshot error for plans, falling back to local updates:', err);
        emitPlans();
      });
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot for plans:', e);
      emitPlans();
    }
  } else {
    emitPlans();
  }

  const handleUpdate = (e: any) => {
    if (!e.detail || e.detail.key === STORAGE_KEYS.PLANS) {
      emitPlans();
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.PLANS) {
      emitPlans();
    }
  };

  window.addEventListener('nexalus_data_update', handleUpdate);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (unsubFirestore) unsubFirestore();
    window.removeEventListener('nexalus_data_update', handleUpdate);
    window.removeEventListener('storage', handleStorage);
  };
}




// ----------------------------------------------------
// SEO SETTINGS
// ----------------------------------------------------
export async function getSeoSettings(): Promise<SeoSettings> {
  return getLocalItem<SeoSettings>(STORAGE_KEYS.SEO, initialSeoSettings);
}

export async function updateSeoSettings(updates: Partial<SeoSettings>): Promise<SeoSettings> {
  const current = getLocalItem<SeoSettings>(STORAGE_KEYS.SEO, initialSeoSettings);
  const updated = { ...current, ...updates };
  setLocalItem(STORAGE_KEYS.SEO, updated);
  await addAuditLog('UPDATE_SEO', 'Updated website SEO configuration & metadata');
  return updated;
}

// ----------------------------------------------------
// IMAGE UPLOAD (Storage or Local Data URI fallback)
// ----------------------------------------------------
export async function uploadImageFile(file: File, folder = 'products'): Promise<string> {
  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    } catch (e) {
      console.warn('Firebase Storage upload failed, converting to object URI:', e);
    }
  }

  // Resilient fallback: convert to base64 Data URL so preview & persistence works offline
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------
// CUSTOMER IDENTITY & ACCOUNT SERVICES
// ----------------------------------------------------
export async function registerCustomer(data: CustomerRegistrationData): Promise<{ user: AdminUser }> {
  const cleanEmail = data.email.trim().toLowerCase();
  const displayName = data.displayName.trim();
  const phone = data.phone.trim();
  const now = new Date().toISOString();

  let uid = '';

  if (isFirebaseConfigured && auth && db) {
    // 1. Create authenticated credentials in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
    uid = userCredential.user.uid;

    try {
      await updateProfile(userCredential.user, { displayName });
    } catch (profileErr) {
      console.warn('Could not update Firebase Auth user profile displayName:', profileErr);
    }

    // 2. Persist comprehensive customer profile to Firestore
    const customerUser: AdminUser = {
      uid,
      displayName,
      email: cleanEmail,
      role: 'customer',
      phone,
      deliveryAddress: {
        address: data.deliveryAddress.address.trim(),
        city: data.deliveryAddress.city.trim(),
        state: data.deliveryAddress.state.trim(),
        postcode: data.deliveryAddress.postcode.trim(),
        country: data.deliveryAddress.country.trim() || 'India',
        additionalDeliveryInfo: data.deliveryAddress.additionalDeliveryInfo?.trim() || ''
      },
      active: true,
      createdAt: now,
      lastLogin: now,
      updatedAt: now
    };

    await setDoc(doc(db, 'users', uid), customerUser, { merge: true });

    // Sync to local state
    const currentUsers = await getUsers();
    const existingIdx = currentUsers.findIndex(u => u.uid === uid || u.email.toLowerCase() === cleanEmail);
    const updatedUsers = existingIdx >= 0
      ? currentUsers.map(u => (u.uid === uid ? customerUser : u))
      : [...currentUsers, customerUser];
    setLocalItem(STORAGE_KEYS.USERS, updatedUsers);

    return { user: customerUser };
  }

  // Fallback for offline or local development
  uid = 'cust-' + Date.now();
  const fallbackCustomer: AdminUser = {
    uid,
    displayName,
    email: cleanEmail,
    role: 'customer',
    phone,
    deliveryAddress: {
      address: data.deliveryAddress.address.trim(),
      city: data.deliveryAddress.city.trim(),
      state: data.deliveryAddress.state.trim(),
      postcode: data.deliveryAddress.postcode.trim(),
      country: data.deliveryAddress.country.trim() || 'India',
      additionalDeliveryInfo: data.deliveryAddress.additionalDeliveryInfo?.trim() || ''
    },
    active: true,
    createdAt: now,
    lastLogin: now,
    updatedAt: now
  };
  const users = await getUsers();
  setLocalItem(STORAGE_KEYS.USERS, [...users, fallbackCustomer]);
  return { user: fallbackCustomer };
}

export async function updateCustomerProfile(
  uid: string,
  updates: {
    displayName?: string;
    phone?: string;
    deliveryAddress?: CustomerDeliveryAddress;
  }
): Promise<AdminUser | null> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const currentData = snap.data() as AdminUser;
        const merged: AdminUser = {
          ...currentData,
          displayName: updates.displayName?.trim() || currentData.displayName,
          phone: updates.phone !== undefined ? updates.phone.trim() : currentData.phone,
          deliveryAddress: updates.deliveryAddress ? {
            address: updates.deliveryAddress.address.trim(),
            city: updates.deliveryAddress.city.trim(),
            state: updates.deliveryAddress.state.trim(),
            postcode: updates.deliveryAddress.postcode.trim(),
            country: updates.deliveryAddress.country.trim() || 'India',
            additionalDeliveryInfo: updates.deliveryAddress.additionalDeliveryInfo?.trim() || ''
          } : currentData.deliveryAddress,
          updatedAt: now
        };

        await updateDoc(userDocRef, {
          ...(updates.displayName ? { displayName: updates.displayName.trim() } : {}),
          ...(updates.phone !== undefined ? { phone: updates.phone.trim() } : {}),
          ...(updates.deliveryAddress ? { deliveryAddress: merged.deliveryAddress } : {}),
          updatedAt: now
        });

        const users = await getUsers();
        setLocalItem(STORAGE_KEYS.USERS, users.map(u => (u.uid === uid ? merged : u)));
        return merged;
      }
    } catch (err) {
      console.warn('Failed to update customer profile in Firestore:', err);
    }
  }

  // Offline / fallback
  const users = await getUsers();
  const index = users.findIndex(u => u.uid === uid);
  if (index !== -1) {
    const updatedUser: AdminUser = {
      ...users[index],
      displayName: updates.displayName?.trim() || users[index].displayName,
      phone: updates.phone !== undefined ? updates.phone.trim() : users[index].phone,
      deliveryAddress: updates.deliveryAddress ? { ...updates.deliveryAddress } : users[index].deliveryAddress,
      updatedAt: now
    };
    users[index] = updatedUser;
    setLocalItem(STORAGE_KEYS.USERS, users);
    return updatedUser;
  }
  return null;
}

export async function getCustomerEnquiries(email: string): Promise<Enquiry[]> {
  const cleanEmail = email.trim().toLowerCase();
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'enquiries'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Enquiry));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return items;
    } catch (e) {
      console.warn('Error fetching customer enquiries from Firestore:', e);
    }
  }
  const all = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  return all
    .filter(e => e.email.toLowerCase() === cleanEmail)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ----------------------------------------------------
// TEAM MEMBERS (Firestore / Resilient Local Storage)
// ----------------------------------------------------
export async function getTeamMembers(division?: string): Promise<TeamMember[]> {
  let members = getLocalItem<TeamMember[]>(STORAGE_KEYS.TEAM, initialTeamMembers);

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'team_members'), orderBy('createdAt', 'desc'));
      const snapshot = await withTimeout(getDocs(q), 2000);
      if (!snapshot.empty) {
        members = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
        setLocalItem(STORAGE_KEYS.TEAM, members);
      }
    } catch (e) {
      console.warn('Firestore getTeamMembers error, using local fallback:', e);
    }
  }

  if (division && division !== 'all') {
    return members.filter(m => !m.division || m.division === 'all' || m.division === division);
  }
  return members;
}

export async function createTeamMember(memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
  const newId = `team-${Date.now()}`;
  const now = new Date().toISOString();
  const newMember: TeamMember = {
    ...memberData,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };

  const current = getLocalItem<TeamMember[]>(STORAGE_KEYS.TEAM, initialTeamMembers);
  const updated = [newMember, ...current];
  setLocalItem(STORAGE_KEYS.TEAM, updated);

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'team_members', newId), newMember), 2500);
    } catch (e) {
      console.warn('Firestore createTeamMember error:', e);
    }
  }

  await addAuditLog('CREATE_TEAM_MEMBER', `Added new team member: ${newMember.name} (${newMember.role})`);
  window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: 'team' } }));
  return newMember;
}

export async function updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
  const current = getLocalItem<TeamMember[]>(STORAGE_KEYS.TEAM, initialTeamMembers);
  const idx = current.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Team member not found');

  const updatedMember: TeamMember = {
    ...current[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  current[idx] = updatedMember;
  setLocalItem(STORAGE_KEYS.TEAM, current);

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(updateDoc(doc(db, 'team_members', id), updates), 2500);
    } catch (e) {
      console.warn('Firestore updateTeamMember error:', e);
    }
  }

  await addAuditLog('UPDATE_TEAM_MEMBER', `Updated team member: ${updatedMember.name}`);
  window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: 'team' } }));
  return updatedMember;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const current = getLocalItem<TeamMember[]>(STORAGE_KEYS.TEAM, initialTeamMembers);
  const member = current.find(m => m.id === id);
  const updated = current.filter(m => m.id !== id);
  setLocalItem(STORAGE_KEYS.TEAM, updated);

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(deleteDoc(doc(db, 'team_members', id)), 2500);
    } catch (e) {
      console.warn('Firestore deleteTeamMember error:', e);
    }
  }

  await addAuditLog('DELETE_TEAM_MEMBER', `Deleted team member: ${member?.name || id}`);
  window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: 'team' } }));
  return true;
}
