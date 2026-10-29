export type { ReceiptSettings, CompanyScopeId } from '../types';
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
  PlanOrder,
  PaymentStatus,
  OrderInstallationStatus,
  PlanOrderPaymentDetails,
  PlanSnapshot,
  AdminNotification,
  CartPlanItem,
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
  TeamMember,
  SolutionRequirement,
  CompanyScopeId,
  ReceiptSettings
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
  initialTeamMembers,
  initialSolutionRequirements
} from '../data/initialData';

// Storage Keys for resilient local state
const DATA_VERSION = 'v11_';
const STORAGE_KEYS = {
  BRANDS: DATA_VERSION + 'nexalus_store_brands',
  CATEGORIES: DATA_VERSION + 'nexalus_store_categories',
  PRODUCTS: DATA_VERSION + 'nexalus_store_products',
  PLANS: DATA_VERSION + 'nexalus_store_plans',
  BROADBAND_PROVIDERS: DATA_VERSION + 'nexalus_store_broadband_providers',
  BROADBAND_PLANS: DATA_VERSION + 'nexalus_store_broadband_plans',
  SERVICES: DATA_VERSION + 'nexalus_store_services',
  SOLUTION_REQUIREMENTS: DATA_VERSION + 'nexalus_store_solution_requirements',
  PROJECTS: DATA_VERSION + 'nexalus_store_projects',
  ENQUIRIES: DATA_VERSION + 'nexalus_store_enquiries',
  PLAN_ORDERS: DATA_VERSION + 'nexalus_store_plan_orders',
  ADMIN_NOTIFICATIONS: DATA_VERSION + 'nexalus_store_admin_notifications',
  SERVICE_AREAS: DATA_VERSION + 'nexalus_store_service_areas',
  FAQS: DATA_VERSION + 'nexalus_store_faqs',
  BANNERS: DATA_VERSION + 'nexalus_store_banners',
  USERS: DATA_VERSION + 'nexalus_store_users',
  AUDIT_LOGS: DATA_VERSION + 'nexalus_store_audit_logs',
  SEO: DATA_VERSION + 'nexalus_store_seo',
  TEAM: DATA_VERSION + 'nexalus_store_team',
  RECEIPT_SETTINGS: DATA_VERSION + 'nexalus_store_receipt_settings'
};


export function withTimeout<T>(promise: Promise<T>, ms = 1200): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms))
  ]);
}

// Cross-Tab & Cross-Window Real-Time Broadcast Synchronization
const tabSyncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('nexalus_tab_sync_channel')
  : null;

if (tabSyncChannel) {
  tabSyncChannel.onmessage = (event) => {
    if (event.data?.type === 'nexalus_data_update') {
      window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: event.data.key } }));
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('nexalus_')) {
      window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: event.key } }));
    }
  });
}

const lastNotifyTimes = new Map<string, number>();

function notifyDataUpdate(key: string): void {
  const now = Date.now();
  const lastTime = lastNotifyTimes.get(key) || 0;
  // Eliminate rapid feedback loops and broadcast storms
  if (now - lastTime < 400) {
    return;
  }
  lastNotifyTimes.set(key, now);

  try {
    // 1. Dispatch event to current tab
    window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key } }));
    // 2. Broadcast immediately across all open tabs/windows
    tabSyncChannel?.postMessage({ type: 'nexalus_data_update', key, timestamp: now });
  } catch (err) {
    console.error('Failed to notify data update:', err);
  }
}

function sanitizeStoredBanners(parsed: any): any {
  if (!Array.isArray(parsed)) return parsed;
  return parsed.map((b: any) => {
    if (!b) return b;
    let t = b.title;
    let s = b.subtitle;
    let c1 = b.ctaText;
    let c2 = b.secondaryCtaText;
    if (t && (t.includes('aaa') || t.includes('.aaa') || t.toLowerCase() === 'aaa')) {
      t = 'Connecting Businesses. Protecting What Matters.';
    }
    if (s && (s.includes('aaaa') || s.includes('aaa') || s.toLowerCase() === 'aaa')) {
      s = 'Nexalus Innovations LLP delivers connectivity, security and networking solutions designed for homes, businesses and modern enterprises.';
    }
    if (c1 && c1.includes('aaa')) c1 = 'Request a Quotation';
    if (c2 && c2.includes('aaa')) c2 = 'Explore Solutions';
    return { ...b, title: t, subtitle: s, ctaText: c1, secondaryCtaText: c2 };
  });
}

// Generic Local Storage Helpers
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    let saved = localStorage.getItem(key);
    if (!saved && key === STORAGE_KEYS.BANNERS) {
      saved = localStorage.getItem("nexalus_site_banners");
    }
    if (!saved) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      if (key === STORAGE_KEYS.BANNERS) {
        try { localStorage.setItem("nexalus_site_banners", JSON.stringify(defaultValue)); } catch {}
      }
      return defaultValue;
    }
    const parsed = JSON.parse(saved);
    if (key === STORAGE_KEYS.BANNERS || key === 'nexalus_site_banners') {
      return sanitizeStoredBanners(parsed);
    }
    return parsed;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T, notify = true): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (key === STORAGE_KEYS.BANNERS) {
      try { localStorage.setItem("nexalus_site_banners", JSON.stringify(value)); } catch {}
    }
    // Dispatch cross-tab update event ONLY if notify is true
    if (notify) {
      notifyDataUpdate(key);
      if (key === STORAGE_KEYS.BANNERS) {
        notifyDataUpdate("nexalus_site_banners");
      }
    }
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

// ----------------------------------------------------
// SYNCHRONOUS CACHE GETTERS (Instant 0ms Page Paint)
// ----------------------------------------------------
export function getCachedProducts(brandId?: BrandId | 'nexalus' | 'corporate' | 'all'): Product[] {
  let products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  let changed = false;
  products = products.map(p => {
    if (p.id === 'prod-nex-2' && p.categoryId !== 'cat-enterprise-networking') {
      changed = true;
      return { ...p, categoryId: 'cat-enterprise-networking', categoryName: 'Enterprise Networking' };
    }
    if (p.id === 'prod-nex-1' && p.categoryId !== 'cat-cctv-surveillance') {
      changed = true;
      return { ...p, categoryId: 'cat-cctv-surveillance', categoryName: 'CCTV Surveillance' };
    }
    return p;
  });
  if (changed || !products.some(p => p.categoryId === 'cat-cctv-surveillance')) {
    setLocalItem(STORAGE_KEYS.PRODUCTS, products, false);
  }
  if (brandId && brandId !== 'all') {
    if (brandId === 'am-distributors') {
      products = products.filter(p => p.brandId === 'am-distributors');
    } else {
      // Both corporate parent and Nexalus Innovations manage the commercial technology & hardware catalog (matching Landing Page)
      products = products.filter(p => p.brandId !== 'am-distributors');
    }
  }
  return products;
}

export function getCachedCategories(brandId?: BrandId | 'nexalus' | 'corporate' | 'all'): ProductCategory[] {
  let categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  if (!categories.some(c => c.id === 'cat-cctv-surveillance') || categories.length < initialCategories.length) {
    const existingIds = new Set(categories.map(c => c.id));
    const missing = initialCategories.filter(c => !existingIds.has(c.id));
    if (missing.length > 0) {
      categories = [...categories, ...missing];
      setLocalItem(STORAGE_KEYS.CATEGORIES, categories, false);
    }
  }
  if (brandId && brandId !== 'all') {
    if (brandId === 'am-distributors') {
      categories = categories.filter(c => c.brandId === 'am-distributors');
    } else {
      // Both corporate parent and Nexalus Innovations manage all commercial tech categories (matching Landing Page)
      categories = categories.filter(c => c.brandId !== 'am-distributors');
    }
  }
  return categories;
}

export function getCachedServices(brandId?: BrandId | 'nexalus' | 'corporate' | 'all'): Service[] {
  let services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  if (!services.some(s => s.id === 'srv-nex-2') || services.length < initialServices.length) {
    services = initialServices;
    setLocalItem(STORAGE_KEYS.SERVICES, initialServices, false);
  }
  if (brandId && brandId !== 'all') {
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
  return services;
}

export function getCachedEnquiries(brandScope?: BrandId | 'all' | 'general' | 'corporate', statusFilter?: EnquiryStatus | 'all'): Enquiry[] {
  let enquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  if (brandScope && brandScope !== 'all') {
    if (brandScope === 'nexalus-innovations') {
      enquiries = enquiries.filter(e =>
        e.brandId === 'nexalus-innovations' ||
        e.brandId === 'cp-plus' ||
        e.brandId === 'one-broadband' ||
        e.brandId === 'itti-networking'
      );
    } else if (brandScope === 'corporate' || (brandScope as any) === 'nexalus') {
      enquiries = enquiries.filter(e => e.websiteId === 'corporate' || e.brandId === 'nexalus' || !e.brandId || (e.brandId as any) === 'general');
    } else {
      enquiries = enquiries.filter(e => e.brandId === brandScope);
    }
  }
  if (statusFilter && statusFilter !== 'all') {
    enquiries = enquiries.filter(e => e.status === statusFilter);
  }
  return enquiries;
}

export function getCachedUsers(): AdminUser[] {
  const users = getLocalItem<AdminUser[]>(STORAGE_KEYS.USERS, initialUsers);
  return [...users].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.lastLogin || 0).getTime();
    const timeB = new Date(b.createdAt || b.lastLogin || 0).getTime();
    return timeB - timeA;
  });
}

export function getCachedTeamMembers(division?: string): TeamMember[] {
  const members = getLocalItem<TeamMember[]>(STORAGE_KEYS.TEAM, initialTeamMembers);
  if (!division || division === 'all') return members;
  return members.filter(m => m.division === division || m.division === 'all');
}

export function getCachedAuditLogs(): AuditLog[] {
  return getLocalItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
}

export function getCachedInternetPlans(): InternetPlan[] {
  return getLocalItem<InternetPlan[]>(STORAGE_KEYS.PLANS, initialInternetPlans);
}

export function getCachedBroadbandPlans(providerId?: string): BroadbandPlan[] {
  const plans = getLocalItem<BroadbandPlan[]>(STORAGE_KEYS.BROADBAND_PLANS, initialBroadbandPlans);
  if (providerId) return plans.filter(p => p.providerId === providerId);
  return plans;
}

export function getCachedBroadbandProviders(): BroadbandProvider[] {
  return getLocalItem<BroadbandProvider[]>(STORAGE_KEYS.BROADBAND_PROVIDERS, initialBroadbandProviders);
}

export function getCachedBanners(brandId?: BrandId | 'nexalus'): SiteBanner[] {
  const banners = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);
  if (brandId) {
    return banners.filter(b => {
      if (brandId === 'nexalus' || (brandId as any) === 'corporate') {
        return b.brandId === 'nexalus' || b.id === 'ban-parent';
      }
      if (brandId === 'nexalus-innovations') {
        return b.brandId === 'nexalus-innovations' || b.id === 'ban-innovations';
      }
      if (brandId === 'am-distributors') {
        return b.brandId === 'am-distributors' || b.id === 'ban-am';
      }
      return b.brandId === brandId;
    });
  }
  return banners;
}

export function getCachedFaqs(brandId?: BrandId | 'nexalus' | 'corporate' | 'all'): FAQ[] {
  const faqs = getLocalItem<FAQ[]>(STORAGE_KEYS.FAQS, initialFaqs);
  if (brandId && brandId !== 'all') {
    if (brandId === 'nexalus-innovations') {
      return faqs.filter(f =>
        f.brandId === 'nexalus-innovations' ||
        f.brandId === 'cp-plus' ||
        f.brandId === 'one-broadband' ||
        f.brandId === 'itti-networking'
      );
    } else if (brandId === 'corporate' || (brandId as any) === 'nexalus') {
      return faqs.filter(f => f.brandId === 'nexalus');
    }
    return faqs.filter(f => f.brandId === brandId);
  }
  return faqs;
}

export function mergeWithInitialServiceAreas(incomingAreas: ServiceArea[]): ServiceArea[] {
  const map = new Map<string, ServiceArea>();

  // 1. Populate all initial baseline cities (Chiplun, Ratnagiri, Sangli, Kolhapur, Pune, Mumbai, Khed, Satara, Karad, Jaysingpur)
  initialServiceAreas.forEach(a => {
    map.set(a.city.toLowerCase().trim(), a);
  });

  // 2. Overlay or add any items from Firestore / Admin additions
  (incomingAreas || []).forEach(a => {
    if (a && a.city) {
      const key = a.city.toLowerCase().trim();
      const existing = map.get(key);
      const mergedArea = { ...(existing || {}), ...a };
      // Sanitize Satara if cached local storage or database had obsolete Karad reference in locality
      if (mergedArea.city?.toLowerCase().trim() === 'satara' && mergedArea.locality?.toLowerCase().includes('karad')) {
        mergedArea.locality = 'Satara MIDC, Satara City Center & Highway Corridor';
      }
      map.set(key, mergedArea);
    }
  });

  return Array.from(map.values());
}

export function getCachedServiceAreas(): ServiceArea[] {
  const local = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  return mergeWithInitialServiceAreas(local);
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
      const snapshot = await withTimeout(getDocs(q), 1200);
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
      const snapshot = await withTimeout(getDocs(collection(db, 'brands')), 1200);
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
export async function getCategories(brandId?: BrandId | 'nexalus' | 'corporate' | 'all'): Promise<ProductCategory[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, 'categories');
      const snapshot = await withTimeout(getDocs(q), 1200);
      if (!snapshot.empty) {
        const fsCats = snapshot.docs.map(d => d.data() as ProductCategory);
        const existingIds = new Set(fsCats.map(c => c.id));
        const localCats = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
        const merged = [...fsCats, ...localCats.filter(c => !existingIds.has(c.id))];
        setLocalItem(STORAGE_KEYS.CATEGORIES, merged, false);

        // Auto-seed baseline categories to Firestore if missing
        const missingFromFs = initialCategories.filter(c => !existingIds.has(c.id));
        if (missingFromFs.length > 0) {
          for (const missingCat of missingFromFs) {
            setDoc(doc(db, 'categories', missingCat.id), missingCat).catch(() => {});
          }
        }
      } else {
        // If Firestore is empty, seed all initialCategories
        for (const cat of initialCategories) {
          setDoc(doc(db, 'categories', cat.id), cat).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Firestore getCategories error:', e);
    }
  }

  let categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  if (categories.length < initialCategories.length) {
    const existingIds = new Set(categories.map(c => c.id));
    const missing = initialCategories.filter(c => !existingIds.has(c.id));
    if (missing.length > 0) {
      categories = [...categories, ...missing];
      setLocalItem(STORAGE_KEYS.CATEGORIES, categories, false);
    }
  }
  if (brandId && brandId !== 'all') {
    if (brandId === 'am-distributors') {
      categories = categories.filter(c => c.brandId === 'am-distributors');
    } else {
      // Both corporate parent and Nexalus Innovations manage all commercial tech categories (matching Landing Page)
      categories = categories.filter(c => c.brandId !== 'am-distributors');
    }
  }
  return categories;
}

export async function createCategory(cat: Omit<ProductCategory, 'id'>, companyScope?: CompanyScopeId): Promise<ProductCategory> {
  const compId: CompanyScopeId = companyScope || cat.companyId || (
    cat.brandId === 'am-distributors'
      ? 'am-distributors'
      : (cat.brandId === 'nexalus' ? 'nexalus-llp' : 'nexalus-innovations')
  );

  const prefix = compId === 'am-distributors'
    ? 'cat-am-'
    : compId === 'nexalus-llp'
    ? 'cat-llp-'
    : 'cat-nex-';

  const slugified = (cat.slug || cat.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const cleanSlug = slugified.replace(/^cat-(nex|am|llp)-/, '');
  const id = `${prefix}${cleanSlug || Date.now()}`;

  const companyName = compId === 'am-distributors'
    ? 'A.M. Distributors Chiplun'
    : compId === 'nexalus-innovations'
    ? 'Nexalus Innovations'
    : 'Nexalus Innovations LLP';

  const newCat: ProductCategory = {
    ...cat,
    id,
    companyId: compId,
    companyName
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'categories', newCat.id), newCat);
    } catch (e) {
      console.warn('Firestore createCategory error:', e);
    }
  }

  const categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  const updated = [...categories, newCat];
  setLocalItem(STORAGE_KEYS.CATEGORIES, updated);
  await addAuditLog('CREATE_CATEGORY', `Created category: ${newCat.name}`, newCat.brandId);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<ProductCategory>): Promise<ProductCategory | null> {
  const categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  const prevName = categories[index].name;
  const updatedCat: ProductCategory = {
    ...categories[index],
    ...updates,
    id
  };
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'categories', id), updates);
    } catch (e) {
      console.warn('Firestore updateCategory error:', e);
    }
  }

  categories[index] = updatedCat;
  setLocalItem(STORAGE_KEYS.CATEGORIES, categories);

  // If category name was updated, synchronize all products carrying this categoryId
  if (updates.name && updates.name !== prevName) {
    const products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    let changed = false;
    const updatedProducts = products.map(p => {
      if (p.categoryId === id) {
        changed = true;
        return { ...p, categoryName: updates.name! };
      }
      return p;
    });
    if (changed) {
      setLocalItem(STORAGE_KEYS.PRODUCTS, updatedProducts);
    }
  }

  await addAuditLog('UPDATE_CATEGORY', `Updated category: ${updatedCat.name}`, updatedCat.brandId);
  return updatedCat;
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  const target = categories.find(c => c.id === id);
  const updated = categories.filter(c => c.id !== id);

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      console.warn('Firestore deleteCategory error:', e);
    }
  }

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
      const snapshot = await withTimeout(getDocs(q), 1200);
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
        currentImg.includes('photo-1582139329536-e7284fece509') // Vault door removal
      ) {
        hasStoreUpdates = true;
        return { ...p, images: initProd.images };
      }
    }
    return p;
  });

  // Ensure product categories are correctly mapped
  products = products.map(p => {
    if (p.id === 'prod-nex-2' && p.categoryId !== 'cat-enterprise-networking') {
      hasStoreUpdates = true;
      return { ...p, categoryId: 'cat-enterprise-networking', categoryName: 'Enterprise Networking' };
    }
    if (p.id === 'prod-nex-1' && p.categoryId !== 'cat-cctv-surveillance') {
      hasStoreUpdates = true;
      return { ...p, categoryId: 'cat-cctv-surveillance', categoryName: 'CCTV Surveillance' };
    }
    return p;
  });

  if (products.length < initialProducts.length || !products.some(p => p.categoryId === 'cat-cctv-surveillance')) {
    const existingIds = new Set(products.map(p => p.id));
    const missing = initialProducts.filter(p => !existingIds.has(p.id));
    if (missing.length > 0) {
      products = [...products, ...missing];
      hasStoreUpdates = true;
    }
    products = products.map(p => {
      const initP = initialMap.get(p.id);
      if (initP && initP.categoryId && p.categoryId !== initP.categoryId) {
        hasStoreUpdates = true;
        return { ...p, categoryId: initP.categoryId, categoryName: initP.categoryName, brandId: initP.brandId };
      }
      return p;
    });
  }

  if (hasStoreUpdates) {
    setLocalItem(STORAGE_KEYS.PRODUCTS, products, false);
  }
  if (brandId) {
    if (brandId === 'am-distributors') {
      products = products.filter(p => p.brandId === 'am-distributors');
    } else {
      // Both corporate parent and Nexalus Innovations manage the commercial technology & hardware catalog (matching Landing Page)
      products = products.filter(p => p.brandId !== 'am-distributors');
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

export async function createProduct(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  companyScope?: CompanyScopeId
): Promise<Product> {
  const compId: CompanyScopeId = companyScope || productData.companyId || (
    productData.brandId === 'am-distributors'
      ? 'am-distributors'
      : (productData.brandId === 'nexalus' ? 'nexalus-llp' : 'nexalus-innovations')
  );

  let prefix = 'prod-nex-';
  if (compId === 'am-distributors') {
    prefix = 'prod-am-';
  } else if (compId === 'nexalus-llp') {
    prefix = 'prod-llp-';
  } else if (productData.brandId === 'cp-plus') {
    prefix = 'prod-cp-';
  } else if (productData.brandId === 'one-broadband') {
    prefix = 'prod-ob-';
  } else if (productData.brandId === 'itti-networking') {
    prefix = 'prod-itti-';
  } else {
    prefix = 'prod-nex-';
  }

  // Determine next sequential product ID across local cache & initial products
  const products = getLocalItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  let maxSeq = 0;
  for (const p of products) {
    if (p.id && p.id.startsWith(prefix)) {
      const num = parseInt(p.id.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  // Also verify against Firestore to prevent duplicate sequence numbers
  if (isFirebaseConfigured && db) {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'products')), 1200);
      if (!snap.empty) {
        snap.forEach(docSnap => {
          const docId = docSnap.id;
          if (docId.startsWith(prefix)) {
            const num = parseInt(docId.slice(prefix.length), 10);
            if (!isNaN(num) && num > maxSeq) {
              maxSeq = num;
            }
          }
        });
      }
    } catch {}
  }

  const id = `${prefix}${maxSeq + 1}`;
  const now = new Date().toISOString();
  const companyName = compId === 'am-distributors'
    ? 'A.M. Distributors Chiplun'
    : compId === 'nexalus-innovations'
    ? 'Nexalus Innovations'
    : 'Nexalus Innovations LLP';

  const newProduct: Product = {
    ...productData,
    id,
    companyId: compId,
    companyName,
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
      const snapshot = await withTimeout(getDocs(q), 1200);
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

function sanitizeForFirestore(data: any): any {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data
      .map(item => sanitizeForFirestore(item))
      .filter(item => item !== undefined);
  }
  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      sanitized[key] = sanitizeForFirestore(val);
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
      const snapshot = await withTimeout(getDocs(q), 1200);
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
      const snapshot = await withTimeout(getDocs(q), 1200);
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
  if (!services.some(s => s.id === 'srv-nex-2') || services.length < initialServices.length) {
    services = initialServices;
    setLocalItem(STORAGE_KEYS.SERVICES, initialServices, false);
  }
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
// SOLUTION REQUIREMENTS (Quotation Modal Dropdown)
// ----------------------------------------------------
export function getCachedSolutionRequirements(brandId?: BrandId | 'general' | 'all'): SolutionRequirement[] {
  let solutions = getLocalItem<SolutionRequirement[]>(STORAGE_KEYS.SOLUTION_REQUIREMENTS, initialSolutionRequirements);
  if (!solutions || solutions.length === 0) {
    solutions = initialSolutionRequirements;
    setLocalItem(STORAGE_KEYS.SOLUTION_REQUIREMENTS, initialSolutionRequirements, false);
  }
  if (brandId && brandId !== 'all') {
    solutions = solutions.filter(s => s.brandId === brandId || s.brandId === 'general' || s.brandId === 'all');
  }
  return [...solutions].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getSolutionRequirements(brandId?: BrandId | 'general' | 'all', publishedOnly = false): Promise<SolutionRequirement[]> {
  let solutions = getLocalItem<SolutionRequirement[]>(STORAGE_KEYS.SOLUTION_REQUIREMENTS, initialSolutionRequirements);
  if (!solutions || solutions.length === 0) {
    solutions = initialSolutionRequirements;
    setLocalItem(STORAGE_KEYS.SOLUTION_REQUIREMENTS, initialSolutionRequirements, false);
  }
  if (brandId && brandId !== 'all') {
    solutions = solutions.filter(s => s.brandId === brandId || s.brandId === 'general' || s.brandId === 'all');
  }
  if (publishedOnly) {
    solutions = solutions.filter(s => s.published);
  }
  return [...solutions].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function createSolutionRequirement(
  solutionData: Omit<SolutionRequirement, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SolutionRequirement> {
  const id = 'sol-' + Date.now();
  const now = new Date().toISOString();
  const newSolution: SolutionRequirement = {
    ...solutionData,
    id,
    value: solutionData.value || id,
    createdAt: now,
    updatedAt: now
  };

  const current = getLocalItem<SolutionRequirement[]>(STORAGE_KEYS.SOLUTION_REQUIREMENTS, initialSolutionRequirements);
  const updated = [...current, newSolution];
  setLocalItem(STORAGE_KEYS.SOLUTION_REQUIREMENTS, updated);
  await addAuditLog('CREATE_SOLUTION_REQUIREMENT', `Created quote solution requirement: ${newSolution.label}`, (newSolution.brandId as any) || 'general');
  return newSolution;
}

export async function updateSolutionRequirement(
  id: string,
  updates: Partial<SolutionRequirement>
): Promise<SolutionRequirement | null> {
  const solutions = getLocalItem<SolutionRequirement[]>(STORAGE_KEYS.SOLUTION_REQUIREMENTS, initialSolutionRequirements);
  const index = solutions.findIndex(s => s.id === id);
  if (index === -1) return null;

  const updated: SolutionRequirement = {
    ...solutions[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  solutions[index] = updated;
  setLocalItem(STORAGE_KEYS.SOLUTION_REQUIREMENTS, solutions);
  await addAuditLog('UPDATE_SOLUTION_REQUIREMENT', `Updated quote solution requirement: ${updated.label}`, (updated.brandId as any) || 'general');
  return updated;
}

export async function deleteSolutionRequirement(id: string): Promise<boolean> {
  const solutions = getLocalItem<SolutionRequirement[]>(STORAGE_KEYS.SOLUTION_REQUIREMENTS, initialSolutionRequirements);
  const target = solutions.find(s => s.id === id);
  if (!target) return false;

  const updated = solutions.filter(s => s.id !== id);
  setLocalItem(STORAGE_KEYS.SOLUTION_REQUIREMENTS, updated);
  await addAuditLog('DELETE_SOLUTION_REQUIREMENT', `Deleted quote solution requirement: ${target.label}`, (target.brandId as any) || 'general');
  return true;
}

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
// PROJECT GALLERY & DYNAMIC CATEGORIES
// ----------------------------------------------------
export const DEFAULT_PROJECT_CATEGORIES = [
  '4K CCTV Surveillance',
  'Optical Fiber FTTH',
  'Enterprise Switching & IT',
  'Infrastructure & Server Racks',
  'Mineral Water Jars',
  'Refrigerated Ice Cream',
  'Morning Milk & Dairy',
  'Cold-Chain Logistics'
];

export function getProjectCategories(): string[] {
  const custom = getLocalItem<string[]>('nexalus_project_categories_list', DEFAULT_PROJECT_CATEGORIES);
  const combined = Array.from(new Set([...DEFAULT_PROJECT_CATEGORIES, ...custom]));
  return combined;
}

export async function addProjectCategory(categoryName: string): Promise<string[]> {
  const clean = categoryName.trim();
  if (!clean) return getProjectCategories();
  const current = getProjectCategories();
  if (!current.includes(clean)) {
    const updated = [...current, clean];
    setLocalItem('nexalus_project_categories_list', updated);
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(setDoc(doc(db, 'project_categories', 'all'), { categories: updated }), 4000);
      } catch {}
    }
    window.dispatchEvent(new CustomEvent('nexalus_project_categories_updated', { detail: updated }));
    return updated;
  }
  return current;
}

export async function deleteProjectCategory(categoryName: string): Promise<string[]> {
  const current = getProjectCategories();
  const updated = current.filter(c => c !== categoryName);
  setLocalItem('nexalus_project_categories_list', updated);
  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'project_categories', 'all'), { categories: updated }), 4000);
    } catch {}
  }
  window.dispatchEvent(new CustomEvent('nexalus_project_categories_updated', { detail: updated }));
  return updated;
}

export async function getProjects(brandId?: BrandId | 'nexalus', publishedOnly = false): Promise<Project[]> {
  let projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
  if (!projects || projects.length === 0) {
    projects = initialProjects;
    setLocalItem(STORAGE_KEYS.PROJECTS, initialProjects, false);
  }
  // Clean up any legacy random timestamp IDs in local cache
  if (projects.some(p => p.id === 'proj-1793190569157')) {
    projects = projects.map(p => p.id === 'proj-1793190569157' ? { ...p, id: 'proj-4' } : p);
    setLocalItem(STORAGE_KEYS.PROJECTS, projects);
  }
  if (brandId) {
    if (brandId === 'nexalus') {
      projects = projects.filter(p => p.brandId === 'nexalus');
    } else if (brandId === 'nexalus-innovations') {
      const techBrands = ['nexalus-innovations', 'cp-plus', 'one-broadband', 'itti-networking'];
      projects = projects.filter(p => techBrands.includes(p.brandId));
    } else {
      projects = projects.filter(p => p.brandId === brandId);
    }
  }
  if (publishedOnly) {
    projects = projects.filter(p => p.published);
  }
  return projects;
}

export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const brand = projectData.brandId;
  let prefix = 'proj-';
  if (brand === 'am-distributors') {
    prefix = 'proj-am-';
  } else if (brand === 'nexalus-innovations') {
    prefix = 'proj-nex-';
  } else if (brand === 'cp-plus') {
    prefix = 'proj-cp-';
  } else if (brand === 'one-broadband') {
    prefix = 'proj-ob-';
  } else if (brand === 'itti-networking') {
    prefix = 'proj-itti-';
  } else {
    prefix = 'proj-';
  }

  // Determine next sequential project ID across local cache & Firestore
  const projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  let maxSeq = 0;
  for (const p of projects) {
    if (p.id && p.id.startsWith(prefix)) {
      const rest = p.id.slice(prefix.length);
      const num = parseInt(rest, 10);
      if (!isNaN(num) && num > maxSeq && num < 1000000) {
        maxSeq = num;
      }
    }
  }

  // Check Firestore directly to prevent sequence collisions
  if (isFirebaseConfigured && db) {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'projects')), 3000);
      snap.forEach(d => {
        if (d.id.startsWith(prefix)) {
          const rest = d.id.slice(prefix.length);
          const num = parseInt(rest, 10);
          if (!isNaN(num) && num > maxSeq && num < 1000000) {
            maxSeq = num;
          }
        }
      });
    } catch {}
  }

  const id = `${prefix}${maxSeq + 1}`;
  const now = new Date().toISOString();
  const newProject: Project = {
    ...projectData,
    id,
    createdAt: now,
    updatedAt: now
  };

  const updated = [newProject, ...projects.filter(p => p.id !== id)];
  setLocalItem(STORAGE_KEYS.PROJECTS, updated);

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'projects', id), newProject), 4000);
    } catch (e) {
      console.warn('Firestore createProject error:', e);
    }
  }

  window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: STORAGE_KEYS.PROJECTS } }));
  await addAuditLog('CREATE_PROJECT', 'Created project: ' + newProject.title, newProject.brandId === 'nexalus' ? 'general' : newProject.brandId);
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

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'projects', id), updated, { merge: true }), 4000);
    } catch {}
  }

  window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: STORAGE_KEYS.PROJECTS } }));
  await addAuditLog('UPDATE_PROJECT', 'Updated project: ' + updated.title, updated.brandId === 'nexalus' ? 'general' : updated.brandId);
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  const target = projects.find(p => p.id === id);
  if (!target) return false;

  const updated = projects.filter(p => p.id !== id);
  setLocalItem(STORAGE_KEYS.PROJECTS, updated);

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(deleteDoc(doc(db, 'projects', id)), 4000);
    } catch {}
  }

  window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: STORAGE_KEYS.PROJECTS } }));
  await addAuditLog('DELETE_PROJECT', 'Deleted project: ' + target.title, target.brandId === 'nexalus' ? 'general' : target.brandId);
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
      const snapshot = await withTimeout(getDocs(q), 1200);
      if (!snapshot.empty) {
        return snapshot.docs
          .map(d => d.data() as Enquiry)
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
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

export async function createManualEnquiry(
  data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Enquiry> {
  const id = 'enq-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();
  const newEnquiry: Enquiry = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'enquiries', id), newEnquiry), 5000);
    } catch (e) {
      console.warn('Firestore createManualEnquiry error:', e);
    }
  }

  const enquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  const updatedList = [newEnquiry, ...enquiries.filter(e => e.id !== id)];
  setLocalItem(STORAGE_KEYS.ENQUIRIES, updatedList);

  await addAuditLog(
    'MANUAL_ENQUIRY_CREATED',
    `Admin created manual lead #${id} for ${newEnquiry.customerName} (${newEnquiry.phone})`,
    newEnquiry.brandId === 'general' ? undefined : newEnquiry.brandId
  );

  window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: STORAGE_KEYS.ENQUIRIES } }));
  return newEnquiry;
}

// ----------------------------------------------------
// BROADBAND PLAN ORDER SERVICES (BUY NOW & CART CHECKOUT)
// ----------------------------------------------------
export async function submitPlanOrder(
  orderData: Omit<PlanOrder, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'paymentStatus'> & {
    paymentStatus?: PaymentStatus;
    status?: OrderInstallationStatus;
  }
): Promise<{ success: boolean; id: string; order: PlanOrder }> {
  const id = 'ORD-PLN-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();

  const newOrder: PlanOrder = {
    ...orderData,
    id,
    paymentStatus: orderData.paymentStatus || 'pending',
    status: orderData.status || 'new',
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'plan_orders', id), newOrder), 8000);
    } catch (e) {
      console.warn('Firestore submitPlanOrder error:', e);
    }
  }

  // Admin In-App Notification
  const notifId = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const adminNotif: AdminNotification = {
    id: notifId,
    type: 'order_created',
    title: 'New Broadband Order',
    message: `Order #${id} placed by ${newOrder.customerName} for ${newOrder.planName} (${newOrder.speed}). Status: ${newOrder.paymentStatus.toUpperCase()}`,
    orderId: id,
    read: false,
    createdAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'admin_notifications', notifId), adminNotif), 4000);
    } catch (e) {
      console.warn('Firestore admin notification error:', e);
    }
  }

  const existingNotifs = getLocalItem<AdminNotification[]>(STORAGE_KEYS.ADMIN_NOTIFICATIONS, []);
  setLocalItem(STORAGE_KEYS.ADMIN_NOTIFICATIONS, [adminNotif, ...existingNotifs]);
  window.dispatchEvent(new CustomEvent('nexalus_admin_notifications_updated', { detail: [adminNotif, ...existingNotifs] }));

  try {
    await submitEnquiry({
      customerName: orderData.customerName,
      phone: orderData.phone,
      email: orderData.email,
      brandId: orderData.brandId === 'one-broadband' ? 'one-broadband' : 'nexalus',
      websiteId: 'corporate',
      websiteName: orderData.providerName + ' Broadband Portal',
      sourcePage: 'Plans & Pricing (Direct Plan Order)',
      enquiryType: 'order',
      productOrServiceId: orderData.planId,
      productOrServiceName: `${orderData.providerName} - ${orderData.planName} (${orderData.speed}) [₹${orderData.price}/${orderData.billingPeriod}]`,
      location: `${orderData.address}, ${orderData.city}`,
      pincode: orderData.pincode,
      message: `Plan Order #${id}. Slot: ${orderData.preferredSlot || 'Standard'}. Payment: ${orderData.paymentMethod.replace(/_/g, ' ').toUpperCase()}. Notes: ${orderData.notes || 'None'}`
    });
  } catch (enqErr) {
    console.warn('Could not mirror plan order to enquiries:', enqErr);
  }

  const orders = getLocalItem<PlanOrder[]>(STORAGE_KEYS.PLAN_ORDERS, []);
  setLocalItem(STORAGE_KEYS.PLAN_ORDERS, [newOrder, ...orders]);
  window.dispatchEvent(new CustomEvent('nexalus_plan_orders_updated', { detail: [newOrder, ...orders] }));

  try {
    await addAuditLog(
      'PLAN_ORDER_PLACED',
      `New broadband plan order #${id} placed by ${newOrder.customerName} for ${newOrder.planName} (${newOrder.speed})`,
      orderData.brandId === 'one-broadband' ? 'one-broadband' : undefined,
      newOrder.email
    );
  } catch (logErr) {
    console.warn('Could not write audit log:', logErr);
  }

  return { success: true, id, order: newOrder };
}

export function getCachedPlanOrders(): PlanOrder[] {
  return getLocalItem<PlanOrder[]>(STORAGE_KEYS.PLAN_ORDERS, []);
}

export async function getPlanOrders(): Promise<PlanOrder[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'plan_orders'), orderBy('createdAt', 'desc'));
      const snap = await withTimeout(getDocs(q), 3000);
      if (!snap.empty) {
        const list: PlanOrder[] = [];
        snap.forEach(d => list.push(d.data() as PlanOrder));
        setLocalItem(STORAGE_KEYS.PLAN_ORDERS, list);
        return list;
      }
    } catch (e) {
      console.warn('Firestore getPlanOrders error:', e);
    }
  }
  return getLocalItem<PlanOrder[]>(STORAGE_KEYS.PLAN_ORDERS, []);
}

export function subscribeToPlanOrders(callback: (orders: PlanOrder[]) => void): () => void {
  callback(getCachedPlanOrders());

  let unsubFirestore: (() => void) | null = null;

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'plan_orders'), orderBy('createdAt', 'desc'));
      unsubFirestore = onSnapshot(
        q,
        (snap) => {
          const list: PlanOrder[] = [];
          snap.forEach(d => list.push(d.data() as PlanOrder));
          setLocalItem(STORAGE_KEYS.PLAN_ORDERS, list);
          callback(list);
        },
        (err) => {
          console.warn('Firestore plan_orders subscription error:', err);
        }
      );
    } catch (err) {
      console.warn('Failed to attach plan_orders onSnapshot:', err);
    }
  }

  const handleCustomEvent = (e: any) => {
    if (e.detail) {
      callback(Array.isArray(e.detail) ? e.detail : getCachedPlanOrders());
    } else {
      callback(getCachedPlanOrders());
    }
  };
  window.addEventListener('nexalus_plan_orders_updated', handleCustomEvent);

  return () => {
    if (unsubFirestore) unsubFirestore();
    window.removeEventListener('nexalus_plan_orders_updated', handleCustomEvent);
  };
}

export function subscribeToCustomerPlanOrders(
  authUid: string,
  email?: string,
  callback?: (orders: PlanOrder[]) => void
): () => void {
  if (!callback) return () => {};

  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const filterCustomerOrders = (all: PlanOrder[]) => {
    return all.filter(o => {
      if (o.authUid && o.authUid === authUid) return true;
      if (cleanEmail && o.email && o.email.toLowerCase().trim() === cleanEmail) return true;
      return false;
    });
  };

  callback(filterCustomerOrders(getCachedPlanOrders()));

  let unsubFirestoreUid: (() => void) | null = null;
  let unsubFirestoreEmail: (() => void) | null = null;

  const updateFromSnapshots = (newOrders: PlanOrder[]) => {
    const currentAll = getCachedPlanOrders();
    const map = new Map<string, PlanOrder>();
    currentAll.forEach(o => map.set(o.id, o));
    newOrders.forEach(o => map.set(o.id, o));
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setLocalItem(STORAGE_KEYS.PLAN_ORDERS, merged);
    callback(filterCustomerOrders(merged));
  };

  if (isFirebaseConfigured && db && authUid) {
    try {
      const q = query(
        collection(db, 'plan_orders'),
        where('authUid', '==', authUid)
      );
      unsubFirestoreUid = onSnapshot(
        q,
        (snap) => {
          const list: PlanOrder[] = [];
          snap.forEach(d => list.push(d.data() as PlanOrder));
          updateFromSnapshots(list);
        },
        (err) => {
          console.warn('Firestore customer plan_orders authUid subscription error:', err);
        }
      );
    } catch (err) {
      console.warn('Failed to attach customer plan_orders onSnapshot:', err);
    }
  }

  if (isFirebaseConfigured && db && cleanEmail) {
    try {
      const emailQ = query(
        collection(db, 'plan_orders'),
        where('email', '==', cleanEmail)
      );
      unsubFirestoreEmail = onSnapshot(
        emailQ,
        (snap) => {
          const list: PlanOrder[] = [];
          snap.forEach(d => list.push(d.data() as PlanOrder));
          updateFromSnapshots(list);
        },
        (err) => {
          console.warn('Firestore customer plan_orders email subscription error:', err);
        }
      );
    } catch {}
  }

  const handleCustomEvent = (e: any) => {
    const all = Array.isArray(e.detail) ? e.detail : getCachedPlanOrders();
    callback(filterCustomerOrders(all));
  };
  window.addEventListener('nexalus_plan_orders_updated', handleCustomEvent);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.PLAN_ORDERS && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          callback(filterCustomerOrders(parsed));
        }
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    if (unsubFirestoreUid) unsubFirestoreUid();
    if (unsubFirestoreEmail) unsubFirestoreEmail();
    window.removeEventListener('nexalus_plan_orders_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
  };
}

export async function createPlanOrder(
  orderData: Omit<PlanOrder, 'id' | 'createdAt' | 'updatedAt' | 'paymentStatus'> & {
    paymentStatus?: PaymentStatus;
    status?: OrderInstallationStatus;
  }
): Promise<PlanOrder> {
  const id = 'ORD-PLN-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();

  const newOrder: PlanOrder = {
    ...orderData,
    id,
    paymentStatus: orderData.paymentStatus || 'pending',
    status: orderData.status || 'new',
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'plan_orders', id), newOrder), 5000);
    } catch (e) {
      console.warn('Firestore createPlanOrder error:', e);
    }
  }

  try {
    await submitEnquiry({
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      email: newOrder.email,
      brandId: newOrder.brandId === 'one-broadband' ? 'one-broadband' : 'nexalus',
      websiteId: 'corporate',
      websiteName: newOrder.providerName + ' Broadband Desk',
      sourcePage: 'Admin Direct Order Entry',
      enquiryType: 'order',
      productOrServiceId: newOrder.planId,
      productOrServiceName: `${newOrder.providerName} - ${newOrder.planName} (${newOrder.speed}) [₹${newOrder.price}/${newOrder.billingPeriod}]`,
      location: `${newOrder.address}, ${newOrder.city}`,
      pincode: newOrder.pincode,
      message: `Direct Order #${id}. Slot: ${newOrder.preferredSlot || 'Immediate'}. Payment: ${newOrder.paymentMethod.replace(/_/g, ' ').toUpperCase()}. Notes: ${newOrder.notes || 'Created by Admin'}`
    });
  } catch {}

  const orders = getCachedPlanOrders();
  const updatedOrders = [newOrder, ...orders.filter(o => o.id !== id)];
  setLocalItem(STORAGE_KEYS.PLAN_ORDERS, updatedOrders);
  window.dispatchEvent(new CustomEvent('nexalus_plan_orders_updated', { detail: updatedOrders }));

  await addAuditLog(
    'ADMIN_PLAN_ORDER_CREATED',
    `Admin created broadband order #${id} for ${newOrder.customerName} (${newOrder.planName})`,
    newOrder.brandId === 'one-broadband' ? 'one-broadband' : undefined
  );

  return newOrder;
}

export async function updatePlanOrder(
  orderId: string,
  updates: Partial<PlanOrder>
): Promise<PlanOrder | null> {
  const orders = getCachedPlanOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const updated: PlanOrder = {
    ...orders[idx],
    ...updates,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'plan_orders', orderId), updated, { merge: true }), 4000);
    } catch (e) {
      console.warn('Firestore updatePlanOrder error:', e);
    }
  }

  orders[idx] = updated;
  setLocalItem(STORAGE_KEYS.PLAN_ORDERS, orders);
  window.dispatchEvent(new CustomEvent('nexalus_plan_orders_updated', { detail: orders }));

  await addAuditLog(
    'PLAN_ORDER_UPDATED',
    `Updated broadband order #${orderId} (Status: ${updated.status}, Payment: ${updated.paymentStatus})`,
    updated.brandId === 'one-broadband' ? 'one-broadband' : undefined
  );

  return updated;
}

export async function recordPlanOrderPayment(
  orderId: string,
  paymentData: {
    amount: number;
    method: 'cash' | 'upi_technician' | 'card_pos' | 'bank_transfer' | 'online_gateway';
    reference?: string;
    notes?: string;
    collectionDate?: string;
  },
  adminUser: {
    uid: string;
    email: string;
    name?: string;
  }
): Promise<{ success: boolean; order: PlanOrder | null; receiptNumber: string }> {
  const orders = getCachedPlanOrders();
  const existing = orders.find(o => o.id === orderId);
  if (!existing) {
    return { success: false, order: null, receiptNumber: '' };
  }

  // Idempotency: Prevent duplicate payment recording and duplicate receipt creation
  if (existing.paymentStatus === 'paid' && existing.receiptNumber) {
    return { success: true, order: existing, receiptNumber: existing.receiptNumber };
  }

  // Sequential-style unique receipt number
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const cleanId = orderId.replace(/^ORD-(?:PLN-)?/, '').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '0001';
  const receiptNumber = existing.receiptNumber || `REC-${dateStr}-${cleanId}`;
  const now = new Date().toISOString();
  const collectedAtDate = paymentData.collectionDate
    ? (paymentData.collectionDate.includes('T') ? paymentData.collectionDate : `${paymentData.collectionDate}T${now.slice(11)}`)
    : now;

  const paymentDetails: PlanOrderPaymentDetails = {
    collectedAt: collectedAtDate,
    collectedBy: {
      uid: adminUser.uid,
      email: adminUser.email,
      name: adminUser.name || adminUser.email.split('@')[0]
    },
    method: paymentData.method,
    amount: paymentData.amount,
    reference: paymentData.reference?.trim() || undefined,
    receiptNumber,
    notes: paymentData.notes?.trim() || undefined
  };

  const updated = await updatePlanOrder(orderId, {
    paymentStatus: 'paid',
    status: existing.status === 'new' ? 'confirmed' : existing.status,
    paymentDetails,
    receiptNumber
  });

  // Admin In-App Notification (Scoped with companyId)
  const notifId = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const adminNotif: AdminNotification = {
    id: notifId,
    type: 'payment_collected',
    title: 'Payment Confirmed',
    message: `₹${paymentData.amount} received for Order #${orderId} by ${adminUser.name || adminUser.email} (${paymentData.method.toUpperCase()}). Receipt: ${receiptNumber}`,
    orderId,
    read: false,
    createdAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'admin_notifications', notifId), adminNotif), 4000);
    } catch {}
  }

  const existingNotifs = getLocalItem<AdminNotification[]>(STORAGE_KEYS.ADMIN_NOTIFICATIONS, []);
  setLocalItem(STORAGE_KEYS.ADMIN_NOTIFICATIONS, [adminNotif, ...existingNotifs]);
  window.dispatchEvent(new CustomEvent('nexalus_admin_notifications_updated', { detail: [adminNotif, ...existingNotifs] }));

  await addAuditLog(
    'PLAN_ORDER_PAYMENT_COLLECTED',
    `Payment of ₹${paymentData.amount} collected for order #${orderId}. Receipt: ${receiptNumber}. Collector: ${adminUser.email}`,
    existing.brandId === 'one-broadband' ? 'one-broadband' : undefined,
    adminUser.email
  );

  return { success: true, order: updated, receiptNumber };
}

export async function updatePlanOrderStatus(
  orderId: string,
  status: OrderInstallationStatus,
  notes?: string,
  assignedEngineer?: string
): Promise<PlanOrder | null> {
  return updatePlanOrder(orderId, {
    status,
    ...(notes !== undefined ? { notes } : {}),
    ...(assignedEngineer !== undefined ? { assignedEngineer } : {})
  });
}

export async function deletePlanOrder(orderId: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(deleteDoc(doc(db, 'plan_orders', orderId)), 4000);
    } catch (e) {
      console.warn('Firestore deletePlanOrder error:', e);
    }
  }

  const orders = getCachedPlanOrders();
  const filtered = orders.filter(o => o.id !== orderId);
  setLocalItem(STORAGE_KEYS.PLAN_ORDERS, filtered);
  window.dispatchEvent(new CustomEvent('nexalus_plan_orders_updated', { detail: filtered }));

  await addAuditLog('PLAN_ORDER_DELETED', `Deleted broadband plan order #${orderId}`);
  return true;
}

// ----------------------------------------------------
// ADMIN NOTIFICATION SERVICES
// ----------------------------------------------------
export function getCachedAdminNotifications(): AdminNotification[] {
  return getLocalItem<AdminNotification[]>(STORAGE_KEYS.ADMIN_NOTIFICATIONS, []);
}

export function subscribeToAdminNotifications(callback: (notifications: AdminNotification[]) => void): () => void {
  callback(getCachedAdminNotifications());

  let unsubFirestore: (() => void) | null = null;

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'admin_notifications'), orderBy('createdAt', 'desc'));
      unsubFirestore = onSnapshot(
        q,
        (snap) => {
          const list: AdminNotification[] = [];
          snap.forEach(d => list.push(d.data() as AdminNotification));
          setLocalItem(STORAGE_KEYS.ADMIN_NOTIFICATIONS, list);
          callback(list);
        },
        (err) => {
          console.warn('Firestore admin_notifications subscription error:', err);
        }
      );
    } catch (err) {
      console.warn('Failed to attach admin_notifications onSnapshot:', err);
    }
  }

  const handleCustomEvent = (e: any) => {
    callback(Array.isArray(e.detail) ? e.detail : getCachedAdminNotifications());
  };
  window.addEventListener('nexalus_admin_notifications_updated', handleCustomEvent);

  return () => {
    if (unsubFirestore) unsubFirestore();
    window.removeEventListener('nexalus_admin_notifications_updated', handleCustomEvent);
  };
}

export async function markAdminNotificationRead(notificationId: string): Promise<void> {
  const notifs = getCachedAdminNotifications();
  const updated = notifs.map(n => n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n);
  setLocalItem(STORAGE_KEYS.ADMIN_NOTIFICATIONS, updated);
  window.dispatchEvent(new CustomEvent('nexalus_admin_notifications_updated', { detail: updated }));

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(updateDoc(doc(db, 'admin_notifications', notificationId), { read: true, readAt: new Date().toISOString() }), 3000);
    } catch (e) {
      console.warn('Firestore markAdminNotificationRead error:', e);
    }
  }
}

export async function clearAllAdminNotifications(): Promise<void> {
  const notifs = getCachedAdminNotifications().map(n => ({ ...n, read: true }));
  setLocalItem(STORAGE_KEYS.ADMIN_NOTIFICATIONS, notifs);
  window.dispatchEvent(new CustomEvent('nexalus_admin_notifications_updated', { detail: notifs }));
}

// Helper to get active user ID for user-scoped shopping cart
export function getActiveCartUserId(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('nexalus_active_user_session_v3');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.uid) return parsed.uid;
      if (parsed?.email) return parsed.email.toLowerCase().trim();
    }
  } catch {}
  return null;
}

export function getPlanCart(explicitUserId?: string): CartPlanItem[] {
  // Purge obsolete un-scoped shared cart to prevent cross-account pollution
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('nexalus_plan_cart');
    }
  } catch {}

  const uid = explicitUserId || getActiveCartUserId();
  if (!uid) return [];
  return getLocalItem<CartPlanItem[]>(`nexalus_plan_cart_${uid}`, []);
}

export function addToPlanCart(item: Omit<CartPlanItem, 'id' | 'addedAt'>, explicitUserId?: string): CartPlanItem {
  const uid = explicitUserId || getActiveCartUserId();
  const cartKey = uid ? `nexalus_plan_cart_${uid}` : 'nexalus_plan_cart_guest';
  const current = uid ? getLocalItem<CartPlanItem[]>(cartKey, []) : [];
  const newItem: CartPlanItem = {
    ...item,
    id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    addedAt: new Date().toISOString()
  };
  const updated = [newItem, ...current];
  setLocalItem(cartKey, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexalus_plan_cart_updated', { detail: updated }));
  }
  return newItem;
}

export function removeFromPlanCart(cartItemId: string, explicitUserId?: string): CartPlanItem[] {
  const uid = explicitUserId || getActiveCartUserId();
  const cartKey = uid ? `nexalus_plan_cart_${uid}` : 'nexalus_plan_cart_guest';
  const current = uid ? getLocalItem<CartPlanItem[]>(cartKey, []) : [];
  const updated = current.filter(i => i.id !== cartItemId);
  setLocalItem(cartKey, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexalus_plan_cart_updated', { detail: updated }));
  }
  return updated;
}

export function clearPlanCart(explicitUserId?: string | any): void {
  const uid = typeof explicitUserId === 'string' ? explicitUserId : getActiveCartUserId();
  if (uid) {
    setLocalItem(`nexalus_plan_cart_${uid}`, []);
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('nexalus_plan_cart');
    }
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexalus_plan_cart_updated', { detail: [] }));
  }
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
  if (isFirebaseConfigured && db) {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'service_areas')), 1800);
      if (!snap.empty) {
        const firestoreList: ServiceArea[] = [];
        snap.forEach(d => firestoreList.push(d.data() as ServiceArea));
        const merged = mergeWithInitialServiceAreas(firestoreList);
        setLocalItem(STORAGE_KEYS.SERVICE_AREAS, merged);

        // Sync any baseline cities that are not yet in Firestore
        initialServiceAreas.forEach(baseArea => {
          const exists = firestoreList.some(f => f.city.toLowerCase().trim() === baseArea.city.toLowerCase().trim());
          if (!exists && db) {
            setDoc(doc(db, 'service_areas', baseArea.id), baseArea).catch(() => {});
          }
        });

        return merged;
      }
    } catch (e) {
      console.warn('Firestore getServiceAreas error, using local fallback:', e);
    }
  }
  const localList = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  return mergeWithInitialServiceAreas(localList);
}

export async function syncAllStandardServiceAreas(): Promise<ServiceArea[]> {
  const allMerged = mergeWithInitialServiceAreas(getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas));
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, allMerged);

  if (isFirebaseConfigured && db) {
    for (const area of allMerged) {
      try {
        await withTimeout(setDoc(doc(db, 'service_areas', area.id), area), 2000);
      } catch (e) {
        console.warn('Error syncing service area to Firestore:', area.city, e);
      }
    }
  }
  return allMerged;
}

export function subscribeToServiceAreas(callback: (areas: ServiceArea[]) => void): () => void {
  callback(getCachedServiceAreas());

  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, 'service_areas');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const firestoreList: ServiceArea[] = [];
          snapshot.forEach(doc => firestoreList.push(doc.data() as ServiceArea));
          const merged = mergeWithInitialServiceAreas(firestoreList);
          setLocalItem(STORAGE_KEYS.SERVICE_AREAS, merged);
          callback(merged);
        } else {
          callback(mergeWithInitialServiceAreas([]));
        }
      }, (err) => console.warn('Service areas subscription error:', err));
      return unsubscribe;
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot for service_areas:', e);
    }
  }

  const handleUpdate = (e: any) => {
    if (!e.detail?.key || e.detail.key.includes('service_areas')) {
      callback(getCachedServiceAreas());
    }
  };
  window.addEventListener('nexalus_data_update', handleUpdate);
  return () => window.removeEventListener('nexalus_data_update', handleUpdate);
}

export async function checkCoverage(queryStr: string, brandFilter?: string): Promise<{
  isServiceable: boolean;
  status?: 'fully_operational' | 'expanding_soon' | 'planned';
  matchedArea?: ServiceArea;
  matchedAreas?: ServiceArea[];
  services?: string[];
  message: string;
}> {
  const clean = queryStr.trim().toLowerCase();
  let areas = await getServiceAreas();
  if (brandFilter && brandFilter !== 'all') {
    areas = areas.filter(a => a.brandId === brandFilter || a.brandId === 'all');
  }

  const matching = areas.filter(a =>
    a.pincode === clean ||
    a.locality.toLowerCase().includes(clean) ||
    a.city.toLowerCase().includes(clean)
  );

  if (matching.length > 0) {
    const found = matching[0];
    const allServices = Array.from(new Set(matching.flatMap(a => a.services || [])));
    if (found.status === 'fully_operational') {
      return {
        isServiceable: true,
        status: 'fully_operational',
        matchedArea: found,
        matchedAreas: matching,
        services: allServices,
        message: `Service coverage is fully operational in ${found.city} (${found.locality}, ${found.pincode}). Direct operations and deployment active!`
      };
    } else if (found.status === 'expanding_soon') {
      return {
        isServiceable: true,
        status: 'expanding_soon',
        matchedArea: found,
        matchedAreas: matching,
        services: allServices,
        message: `Service operations are currently expanding in ${found.city} (${found.locality}). Accepting advance survey & booking requests!`
      };
    }
  }

  return {
    isServiceable: false,
    services: [],
    message: `We currently do not have confirmed presence at '${queryStr}'. Submit an inquiry and our regional operations team will check coverage availability!`
  };
}

export async function createServiceArea(area: Omit<ServiceArea, 'id' | 'updatedAt'>): Promise<ServiceArea> {
  const newArea: ServiceArea = {
    ...area,
    id: 'sa-' + Date.now(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'service_areas', newArea.id), newArea), 3000);
    } catch (e) {
      console.warn('Firestore createServiceArea error:', e);
    }
  }

  const areas = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, [...areas, newArea]);
  await addAuditLog('CREATE_SERVICE_AREA', `Added coverage zone: ${newArea.city} - ${newArea.locality} (${newArea.pincode})`, newArea.brandId === 'am-distributors' ? 'am-distributors' : 'general');
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

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(updateDoc(doc(db, 'service_areas', id), { ...updates, updatedAt: updated.updatedAt }), 3000);
    } catch (e) {
      console.warn('Firestore updateServiceArea error:', e);
    }
  }

  areas[index] = updated;
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, areas);
  await addAuditLog('UPDATE_SERVICE_AREA', `Updated coverage zone: ${updated.city} - ${updated.locality}`, updated.brandId === 'am-distributors' ? 'am-distributors' : 'general');
  return updated;
}

export async function deleteServiceArea(id: string): Promise<boolean> {
  const areas = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  const target = areas.find(a => a.id === id);
  if (!target) return false;

  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(deleteDoc(doc(db, 'service_areas', id)), 3000);
    } catch (e) {
      console.warn('Firestore deleteServiceArea error:', e);
    }
  }

  const updated = areas.filter(a => a.id !== id);
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, updated);
  await addAuditLog('DELETE_SERVICE_AREA', `Deleted coverage zone: ${target.city} - ${target.locality}`, target.brandId === 'am-distributors' ? 'am-distributors' : 'general');
  return true;
}

// ----------------------------------------------------
// FAQS
// ----------------------------------------------------
export async function getFaqs(brandId?: BrandId | 'nexalus' | 'corporate' | 'all', publishedOnly = false): Promise<FAQ[]> {
  let faqs = getLocalItem<FAQ[]>(STORAGE_KEYS.FAQS, initialFaqs);
  if (brandId && brandId !== 'all') {
    if (brandId === 'nexalus-innovations') {
      faqs = faqs.filter(f =>
        f.brandId === 'nexalus-innovations' ||
        f.brandId === 'cp-plus' ||
        f.brandId === 'one-broadband' ||
        f.brandId === 'itti-networking'
      );
    } else if (brandId === 'corporate' || (brandId as any) === 'nexalus') {
      faqs = faqs.filter(f => f.brandId === 'nexalus');
    } else {
      faqs = faqs.filter(f => f.brandId === brandId);
    }
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
  let localList = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);

  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await withTimeout(getDocs(collection(db, 'banners')), 1500);
      if (!snapshot.empty) {
        const firestoreMap = new Map<string, SiteBanner>();
        snapshot.docs.forEach(d => {
          firestoreMap.set(d.id, { id: d.id, ...d.data() } as SiteBanner);
        });

        // Merge initial, local, and firestore safely by ID so defaults/slides are never lost.
        // If local banner has a newer or equal updatedAt than Firestore, keep local banner!
        const bannerMap = new Map<string, SiteBanner>();
        initialBanners.forEach(b => bannerMap.set(b.id, b));
        localList.forEach(b => bannerMap.set(b.id, { ...(bannerMap.get(b.id) || {}), ...b }));
        
        firestoreMap.forEach((remoteBanner, id) => {
          const localBanner = bannerMap.get(id);
          if (!localBanner) {
            bannerMap.set(id, remoteBanner);
          } else {
            const localTime = localBanner.updatedAt ? new Date(localBanner.updatedAt).getTime() : 0;
            const remoteTime = remoteBanner.updatedAt ? new Date(remoteBanner.updatedAt).getTime() : 0;
            if (remoteTime > localTime) {
              bannerMap.set(id, { ...localBanner, ...remoteBanner });
            } else {
              // Local edit is newer or equal: preserve local!
              bannerMap.set(id, localBanner);
            }
          }
        });

        localList = Array.from(bannerMap.values());
        setLocalItem(STORAGE_KEYS.BANNERS, localList);
      }
    } catch (e) {
      console.warn('Firestore getBanners error:', e);
    }
  }

  if (brandId) {
    return localList.filter(b => {
      if (brandId === 'nexalus' || (brandId as any) === 'corporate') {
        return b.brandId === 'nexalus' || b.id === 'ban-parent';
      }
      if (brandId === 'nexalus-innovations') {
        return b.brandId === 'nexalus-innovations' || b.id === 'ban-innovations';
      }
      if (brandId === 'am-distributors') {
        return b.brandId === 'am-distributors' || b.id === 'ban-am';
      }
      return b.brandId === brandId;
    });
  }
  return localList;
}

export async function updateBanner(id: string, updates: Partial<SiteBanner>): Promise<SiteBanner | null> {
  const allBanners = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);
  const index = allBanners.findIndex(b => b.id === id);
  const now = new Date().toISOString();
  const updated: SiteBanner = index >= 0
    ? { ...allBanners[index], ...updates, id, updatedAt: now }
    : ({ id, active: true, title: '', subtitle: '', ctaText: '', ctaLink: '', brandId: 'nexalus', ...updates, updatedAt: now } as SiteBanner);

  // 1. Immediately persist to localStorage and broadcast cross-tab
  const nextList = index >= 0
    ? allBanners.map(b => b.id === id ? updated : b)
    : [...allBanners, updated];
  setLocalItem(STORAGE_KEYS.BANNERS, nextList);

  // 2. Persist to Firestore in background without blocking local sync
  if (isFirebaseConfigured && db) {
    try {
      await withTimeout(setDoc(doc(db, 'banners', id), sanitizeForFirestore(updated), { merge: true }), 3000);
    } catch (e) {
      console.warn('Firestore updateBanner sync warning:', e);
    }
  }

  await addAuditLog('UPDATE_BANNER', `Updated website content banner: ${updated.title}`, updated.brandId as any);
  return updated;
}

export function subscribeToBanners(
  callback: (banners: SiteBanner[]) => void,
  brandId?: BrandId | 'nexalus'
): () => void {
  let unsubFirestore: (() => void) | null = null;

  // Emit current cached banners immediately
  const emitCached = () => {
    try {
      let localBanners = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);
      if (brandId) {
        localBanners = localBanners.filter(b => {
          if (brandId === 'nexalus' || (brandId as any) === 'corporate') {
            return b.brandId === 'nexalus' || b.id === 'ban-parent';
          }
          if (brandId === 'nexalus-innovations') {
            return b.brandId === 'nexalus-innovations' || b.id === 'ban-innovations';
          }
          if (brandId === 'am-distributors') {
            return b.brandId === 'am-distributors' || b.id === 'ban-am';
          }
          return b.brandId === brandId;
        });
      }
      callback(localBanners);
    } catch (err) {
      console.warn('Initial banner emit warning:', err);
    }
  };

  emitCached();

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
      const colRef = collection(db, 'banners');
      unsubFirestore = onSnapshot(colRef, (snapshot) => {
        let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SiteBanner));
        
        // Merge with initial and local banners so nothing is lost
        const mergedMap = new Map<string, SiteBanner>();
        initialBanners.forEach(b => mergedMap.set(b.id, b));
        const local = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);
        local.forEach(b => mergedMap.set(b.id, { ...(mergedMap.get(b.id) || {}), ...b }));
        
        results.forEach(remoteBanner => {
          const localBanner = mergedMap.get(remoteBanner.id);
          if (!localBanner) {
            mergedMap.set(remoteBanner.id, remoteBanner);
          } else {
            const localTime = localBanner.updatedAt ? new Date(localBanner.updatedAt).getTime() : 0;
            const remoteTime = remoteBanner.updatedAt ? new Date(remoteBanner.updatedAt).getTime() : 0;
            if (remoteTime > localTime) {
              mergedMap.set(remoteBanner.id, { ...localBanner, ...remoteBanner });
            } else {
              // Local is newer or equal: preserve local!
              mergedMap.set(remoteBanner.id, localBanner);
            }
          }
        });
        const mergedList = Array.from(mergedMap.values());
        setLocalItem(STORAGE_KEYS.BANNERS, mergedList, false);
        
        let filtered = mergedList;
        if (brandId) {
          filtered = mergedList.filter(b => {
            if (brandId === 'nexalus' || (brandId as any) === 'corporate') {
              return b.brandId === 'nexalus' || b.id === 'ban-parent';
            }
            if (brandId === 'nexalus-innovations') {
              return b.brandId === 'nexalus-innovations' || b.id === 'ban-innovations';
            }
            if (brandId === 'am-distributors') {
              return b.brandId === 'am-distributors' || b.id === 'ban-am';
            }
            return b.brandId === brandId;
          });
        }
        callback(filtered);
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
    if (!e.detail || e.detail.key === STORAGE_KEYS.BANNERS || e.detail.key === 'nexalus_site_banners') {
      emitCached();
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (!e.key || e.key === STORAGE_KEYS.BANNERS || e.key === 'nexalus_site_banners') {
      emitCached();
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
      const snapshot = await withTimeout(getDocs(collection(db, 'users')), 4000);
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
              phone: sanitized.phone,
              deliveryAddress: sanitized.deliveryAddress,
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
        deduplicatedUsers.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.lastLogin || 0).getTime();
          const timeB = new Date(b.createdAt || b.lastLogin || 0).getTime();
          return timeB - timeA;
        });
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
  finalUsers.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.lastLogin || 0).getTime();
    const timeB = new Date(b.createdAt || b.lastLogin || 0).getTime();
    return timeB - timeA;
  });
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
  phone?: string;
  deliveryAddress?: { address: string; city: string; state: string; postcode: string; country?: string };
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
          const snap = await withTimeout(getDocs(q), 1200);
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
        createdAt: now,
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.deliveryAddress ? { deliveryAddress: { ...data.deliveryAddress, country: data.deliveryAddress.country || 'India' } } : {})
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
        if (!options?.city && !options?.providerId) {
          setLocalItem(STORAGE_KEYS.BROADBAND_PLANS, results);
        }
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
// IMAGE UPLOAD (Instant Client Data URI for Spark / Firebase Storage for Blaze)
// ----------------------------------------------------
export async function uploadImageFile(file: File, folder = 'products'): Promise<string> {
  // Only attempt Firebase Cloud Storage if explicitly enabled with Blaze plan.
  // On Spark (free tier) or local development, Firebase Storage throws CORS errors and hangs on preflight.
  const isStorageEnabled = import.meta.env.VITE_ENABLE_FIREBASE_STORAGE === 'true';

  if (isStorageEnabled && isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    } catch (e) {
      console.warn('Firebase Storage upload failed or blocked by CORS, falling back to instant client data URI:', e);
    }
  }

  // Instant client-side conversion (0 network requests, no CORS, no Blaze requirement)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // If image is over 300KB, downscale client-side to keep Firestore & localStorage fast and lightweight
      if (file.size > 300 * 1024 && file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
            return;
          }
          resolve(result);
        };
        img.onerror = () => resolve(result);
        img.src = result;
      } else {
        resolve(result);
      }
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
  const displayName = data.displayName.trim() || `${data.firstName || ''} ${data.lastName || ''}`.trim();
  const firstName = data.firstName?.trim() || displayName.split(' ')[0] || '';
  const lastName = data.lastName?.trim() || displayName.split(' ').slice(1).join(' ') || '';
  const dateOfBirth = data.dateOfBirth?.trim() || '';
  const phone = data.phone.trim();
  const now = new Date().toISOString();
  const subscriberId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);

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
      firstName,
      lastName,
      dateOfBirth,
      subscriberId,
      email: cleanEmail,
      role: 'customer',
      phone,
      deliveryAddress: {
        address: data.deliveryAddress.address.trim(),
        city: data.deliveryAddress.city.trim(),
        state: data.deliveryAddress.state.trim() || 'Maharashtra',
        postcode: data.deliveryAddress.postcode.trim(),
        country: data.deliveryAddress.country.trim() || 'India',
        additionalDeliveryInfo: data.deliveryAddress.additionalDeliveryInfo?.trim() || ''
      },
      planName: 'One Broadband Fiber Ultra 100Mbps',
      planFee: 470.82,
      subscriptionStatus: 'Active',
      associatedLco: 'Nexalus Innovations LLP_Sangli',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastRenewal: now.split('T')[0],
      termPlanValidity: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
      createdAt: now,
      lastLogin: now,
      updatedAt: now
    };

    await setDoc(doc(db, 'users', uid), customerUser, { merge: true });

    try {
      await addAuditLog('CUSTOMER_REGISTER', `New customer registered: ${displayName} (${cleanEmail})`, undefined, cleanEmail);
    } catch (logErr) {
      console.warn('Could not record customer registration audit log:', logErr);
    }

    // Sync to local state
    const currentUsers = await getUsers();
    const existingIdx = currentUsers.findIndex(u => u.uid === uid || u.email.toLowerCase() === cleanEmail);
    const updatedUsers = existingIdx >= 0
      ? currentUsers.map(u => (u.uid === uid ? customerUser : u))
      : [...currentUsers, customerUser];
    setLocalItem(STORAGE_KEYS.USERS, updatedUsers);
    try {
      window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: 'v10_nexalus_store_users' } }));
    } catch {}

    return { user: customerUser };
  }

  // Fallback for offline or local development
  uid = 'cust-' + Date.now();
  const fallbackCustomer: AdminUser = {
    uid,
    displayName,
    firstName,
    lastName,
    dateOfBirth,
    subscriberId,
    email: cleanEmail,
    role: 'customer',
    phone,
    deliveryAddress: {
      address: data.deliveryAddress.address.trim(),
      city: data.deliveryAddress.city.trim(),
      state: data.deliveryAddress.state.trim() || 'Maharashtra',
      postcode: data.deliveryAddress.postcode.trim(),
      country: data.deliveryAddress.country.trim() || 'India',
      additionalDeliveryInfo: data.deliveryAddress.additionalDeliveryInfo?.trim() || ''
    },
    planName: 'One Broadband Fiber Ultra 100Mbps',
    planFee: 470.82,
    subscriptionStatus: 'Active',
    associatedLco: 'Nexalus Innovations LLP_Sangli',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastRenewal: now.split('T')[0],
    termPlanValidity: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
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
          firstName: updates.firstName !== undefined ? updates.firstName.trim() : currentData.firstName,
          lastName: updates.lastName !== undefined ? updates.lastName.trim() : currentData.lastName,
          dateOfBirth: updates.dateOfBirth !== undefined ? updates.dateOfBirth.trim() : currentData.dateOfBirth,
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
          ...(updates.firstName !== undefined ? { firstName: updates.firstName.trim() } : {}),
          ...(updates.lastName !== undefined ? { lastName: updates.lastName.trim() } : {}),
          ...(updates.dateOfBirth !== undefined ? { dateOfBirth: updates.dateOfBirth.trim() } : {}),
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
      const snap = await withTimeout(getDocs(q), 1200);
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
      const snapshot = await withTimeout(getDocs(q), 1200);
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

export async function createTeamMember(
  memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>,
  companyScope?: CompanyScopeId
): Promise<TeamMember> {
  const compId: CompanyScopeId = companyScope || memberData.companyId || (
    memberData.division === 'am-distributors'
      ? 'am-distributors'
      : (memberData.division === 'nexalus-innovations' ? 'nexalus-innovations' : 'nexalus-llp')
  );

  const prefix = compId === 'am-distributors'
    ? 'team-am-'
    : compId === 'nexalus-llp'
    ? 'team-llp-'
    : 'team-nex-';

  const current = getLocalItem<TeamMember[]>(STORAGE_KEYS.TEAM, initialTeamMembers);
  let maxSeq = 0;
  for (const m of current) {
    if (m.id && m.id.startsWith(prefix)) {
      const num = parseInt(m.id.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  // Also query Firestore to avoid sequence collisions
  if (isFirebaseConfigured && db) {
    try {
      const snap = await withTimeout(getDocs(collection(db, 'team_members')), 1200);
      if (!snap.empty) {
        snap.forEach(d => {
          if (d.id.startsWith(prefix)) {
            const num = parseInt(d.id.slice(prefix.length), 10);
            if (!isNaN(num) && num > maxSeq) {
              maxSeq = num;
            }
          }
        });
      }
    } catch {}
  }

  const newId = `${prefix}${maxSeq + 1}`;
  const now = new Date().toISOString();
  const companyName = compId === 'am-distributors'
    ? 'A.M. Distributors Chiplun'
    : compId === 'nexalus-innovations'
    ? 'Nexalus Innovations'
    : 'Nexalus Innovations LLP';

  const newMember: TeamMember = {
    ...memberData,
    id: newId,
    companyId: compId,
    companyName,
    createdAt: now,
    updatedAt: now,
  };

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

export function subscribeToTeamMembers(
  callback: (members: TeamMember[]) => void,
  division?: string
): () => void {
  let unsubFirestore: (() => void) | null = null;

  const emitMembers = () => {
    try {
      const cached = getCachedTeamMembers(division);
      callback(cached);
    } catch (err) {
      console.warn('Error reading cached team members:', err);
    }
  };

  // 1. Immediately emit cached members synchronously for zero-lag UI
  emitMembers();

  // 2. Asynchronously fetch fresh members
  const syncFresh = async () => {
    try {
      const data = await getTeamMembers(division);
      callback(data);
    } catch (e) {
      console.warn('Error fetching fresh team members in subscriber:', e);
    }
  };
  syncFresh();

  // 3. Real-time Firestore onSnapshot listener
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'team_members');
      unsubFirestore = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const fresh = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
          setLocalItem(STORAGE_KEYS.TEAM, fresh);
          let filtered = fresh;
          if (division && division !== 'all') {
            filtered = fresh.filter(m => !m.division || m.division === 'all' || m.division === division);
          }
          callback(filtered);
        }
      }, (err) => {
        console.warn('Firestore onSnapshot error for team_members:', err);
      });
    } catch (e) {
      console.warn('Could not attach Firestore onSnapshot for team_members:', e);
    }
  }

  // 4. Same-tab live update listener
  const handleUpdate = (e: any) => {
    if (!e.detail || e.detail.key === 'team' || e.detail.key === STORAGE_KEYS.TEAM) {
      emitMembers();
      syncFresh();
    }
  };

  // 5. Cross-tab storage listener (Fires instantly when admin saves in another tab)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.TEAM || !e.key) {
      emitMembers();
      syncFresh();
    }
  };

  // 6. Window focus listener (Fires immediately when user switches to tab)
  const handleFocus = () => {
    emitMembers();
    syncFresh();
  };

  window.addEventListener('nexalus_data_update', handleUpdate);
  window.addEventListener('storage', handleStorage);
  window.addEventListener('focus', handleFocus);

  return () => {
    if (unsubFirestore) unsubFirestore();
    window.removeEventListener('nexalus_data_update', handleUpdate);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('focus', handleFocus);
  };
}

// ----------------------------------------------------
// RECEIPT & INVOICE TEMPLATE SETTINGS
// ----------------------------------------------------
export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  companyName: 'Nexalus Innovations LLP',
  tagline: '',
  showTagline: false, // Default hidden per design instruction
  address: 'Shop No.5, Sankalp Enclave Chowk, 100 Feet Rd, near Dhamani Road, opposite Kokitkar Garden, Vishrambag',
  city: 'Sangli-Miraj-Kupwad',
  state: 'Maharashtra',
  pincode: '416415',
  phone: '+91 9158886444',
  email: 'innovations@nexalusinnovations.com',
  website: 'https://nexalusinnovations.com',
  signatoryName: 'Authorized Signatory',
  signatoryTitle: 'Authorized Signatory',
  signatorySubtitle: 'Nexalus Innovations LLP Operations Desk',
  signatureImageUrl: '',
  showSignatory: false, // Default hidden per design instruction
  bookingSlipNotice: 'This document confirms broadband reservation and technician scheduling. Payment is due upon physical drop line testing and activation. An official PAID PAYMENT RECEIPT will be issued immediately upon payment confirmation.',
  paidReceiptNotice: 'Nexalus Innovations LLP confirms that payment has been received in full. Physical installation and account activation are proceeding on schedule. This receipt confirms active provisioning.',
  footerNote: 'Thank you for choosing Nexalus Innovations LLP.',
  showInstallationPremises: true,
  showPaymentInfo: true,
  showOfficialNotice: true,
  showGstRow: true,
  gstRate: 18,
  gstNumber: '',
  gstInclusive: true,
  customTerms: [
    'Line activation is subject to standard physical fiber path feasibility.',
    'Broadband speed is delivered on symmetrical FTTH optical ports.',
    'Customer care support available 24/7 at +91 9158886444.'
  ]
};

export function getCachedReceiptSettings(): ReceiptSettings {
  const cached = getLocalItem<ReceiptSettings>(STORAGE_KEYS.RECEIPT_SETTINGS, DEFAULT_RECEIPT_SETTINGS);
  if (cached.showSignatory === undefined) {
    cached.showSignatory = false;
  }
  if (cached.showTagline === undefined) {
    cached.showTagline = false;
  }
  if (!cached.signatoryName) {
    cached.signatoryName = 'Authorized Signatory';
  }
  if (!cached.signatoryTitle) {
    cached.signatoryTitle = 'Authorized Signatory';
  }
  if (!cached.signatorySubtitle) {
    cached.signatorySubtitle = 'Nexalus Innovations LLP Operations Desk';
  }
  return cached;
}

export async function getReceiptSettings(): Promise<ReceiptSettings> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'systemSettings', 'receiptSettings');
      const snap = await withTimeout(getDoc(docRef), 1200);
      if (snap.exists()) {
        const data = snap.data() as ReceiptSettings;
        setLocalItem(STORAGE_KEYS.RECEIPT_SETTINGS, data, false);
        return data;
      }
    } catch (e) {
      console.warn('Firestore getReceiptSettings error:', e);
    }
  }
  return getCachedReceiptSettings();
}

/**
 * Real-time subscription to receipt settings across all tabs and Firestore
 */
export function subscribeReceiptSettings(callback: (settings: ReceiptSettings) => void): () => void {
  // Fire callback immediately with current cached settings
  callback(getCachedReceiptSettings());

  const handleLocalUpdate = () => {
    callback(getCachedReceiptSettings());
  };
  window.addEventListener('nexalus_data_update', handleLocalUpdate);
  window.addEventListener('storage', handleLocalUpdate);

  let unsubFirestore: (() => void) | null = null;
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'systemSettings', 'receiptSettings');
      unsubFirestore = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as ReceiptSettings;
          setLocalItem(STORAGE_KEYS.RECEIPT_SETTINGS, data, false);
          callback(data);
        }
      }, (err) => {
        console.warn('subscribeReceiptSettings onSnapshot error:', err);
      });
    } catch (e) {
      console.warn('subscribeReceiptSettings error:', e);
    }
  }

  return () => {
    window.removeEventListener('nexalus_data_update', handleLocalUpdate);
    window.removeEventListener('storage', handleLocalUpdate);
    if (unsubFirestore) {
      unsubFirestore();
    }
  };
}

export async function updateReceiptSettings(updates: Partial<ReceiptSettings>): Promise<ReceiptSettings> {
  const current = getCachedReceiptSettings();
  const updated: ReceiptSettings = {
    ...current,
    ...updates
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'systemSettings', 'receiptSettings');
      await setDoc(docRef, { ...updated, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e: any) {
      console.warn('Firestore updateReceiptSettings warning:', e);
    }
  }

  setLocalItem(STORAGE_KEYS.RECEIPT_SETTINGS, updated);
  await addAuditLog('UPDATE_SETTINGS', 'Updated official receipt and booking slip template contents', 'nexalus-innovations');
  window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key: 'receipt_settings' } }));
  return updated;
}
