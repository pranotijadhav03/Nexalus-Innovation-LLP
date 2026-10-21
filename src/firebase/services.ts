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
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './config';
import {
  Brand,
  BrandId,
  ProductCategory,
  Product,
  InternetPlan,
  Service,
  Project,
  Enquiry,
  EnquiryStatus,
  ServiceArea,
  FAQ,
  AdminUser,
  AuditLog,
  SiteBanner,
  SeoSettings,
  TeamMember,
  CustomerOrder
} from '../types';
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
  initialSeoSettings,
  initialTeamMembers
} from '../data/initialData';

// Storage Keys for resilient local state
const DATA_VERSION = 'v9_';
const STORAGE_KEYS = {
  BRANDS: DATA_VERSION + 'nexalus_store_brands',
  CATEGORIES: DATA_VERSION + 'nexalus_store_categories',
  PRODUCTS: DATA_VERSION + 'nexalus_store_products',
  PLANS: DATA_VERSION + 'nexalus_store_plans',
  SERVICES: DATA_VERSION + 'nexalus_store_services',
  PROJECTS: DATA_VERSION + 'nexalus_store_projects',
  ENQUIRIES: DATA_VERSION + 'nexalus_store_enquiries',
  SERVICE_AREAS: DATA_VERSION + 'nexalus_store_service_areas',
  FAQS: DATA_VERSION + 'nexalus_store_faqs',
  BANNERS: DATA_VERSION + 'nexalus_store_banners',
  USERS: DATA_VERSION + 'nexalus_store_users',
  AUDIT_LOGS: DATA_VERSION + 'nexalus_store_audit_logs',
  SEO: DATA_VERSION + 'nexalus_store_seo',
  TEAM: DATA_VERSION + 'nexalus_store_team',
  ORDERS: DATA_VERSION + 'nexalus_store_orders'
};

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
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function notifyDataUpdate(key?: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexalus_data_update', { detail: { key } }));
  }
}

export function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms))
  ]);
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
        const logs = snapshot.docs.map(d => d.data() as AuditLog);
        setLocalItem(STORAGE_KEYS.AUDIT_LOGS, logs);
        return logs;
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
        const brands = snapshot.docs.map(d => d.data() as Brand);
        setLocalItem(STORAGE_KEYS.BRANDS, brands);
        return brands;
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
export async function getCategories(brandId?: BrandId): Promise<ProductCategory[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      if (!snapshot.empty) {
        let categories = snapshot.docs.map(d => d.data() as ProductCategory);
        setLocalItem(STORAGE_KEYS.CATEGORIES, categories);
        if (brandId) {
          if (brandId === 'nexalus-innovations') {
            categories = categories.filter(c =>
              c.brandId === 'nexalus-innovations' ||
              c.brandId === 'cp-plus' ||
              c.brandId === 'one-broadband' ||
              c.brandId === 'itti-networking'
            );
          } else {
            categories = categories.filter(c => c.brandId === brandId);
          }
        }
        return categories;
      }
    } catch (e) {
      console.warn('Firestore getCategories error:', e);
    }
  }

  let categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  if (brandId) {
    if (brandId === 'nexalus-innovations') {
      categories = categories.filter(c =>
        c.brandId === 'nexalus-innovations' ||
        c.brandId === 'cp-plus' ||
        c.brandId === 'one-broadband' ||
        c.brandId === 'itti-networking'
      );
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

export async function deleteCategory(id: string): Promise<void> {
  const categories = getLocalItem<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  const target = categories.find(c => c.id === id);

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      console.warn('Firestore deleteCategory error:', e);
    }
  }

  const updated = categories.filter(c => c.id !== id);
  setLocalItem(STORAGE_KEYS.CATEGORIES, updated);
  if (target) {
    await addAuditLog('DELETE_CATEGORY', `Deleted category: ${target.name}`, target.brandId);
  }
}

// ----------------------------------------------------
// PRODUCTS
// ----------------------------------------------------
export async function getProducts(brandId?: BrandId, publishedOnly = false): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      if (!snapshot.empty) {
        let products = snapshot.docs.map(d => d.data() as Product);
        setLocalItem(STORAGE_KEYS.PRODUCTS, products);
        if (brandId) {
          if (brandId === 'nexalus-innovations') {
            products = products.filter(p =>
              p.brandId === 'nexalus-innovations' ||
              p.brandId === 'cp-plus' ||
              p.brandId === 'one-broadband' ||
              p.brandId === 'itti-networking'
            );
          } else {
            products = products.filter(p => p.brandId === brandId);
          }
        }
        if (publishedOnly) {
          products = products.filter(p => p.published);
        }
        return products;
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
      const snapshot = await getDocs(collection(db, 'plans'));
      if (!snapshot.empty) {
        let plans = snapshot.docs.map(d => d.data() as InternetPlan);
        setLocalItem(STORAGE_KEYS.PLANS, plans);
        if (publishedOnly) {
          plans = plans.filter(p => p.published);
        }
        return plans.sort((a, b) => a.speedNumeric - b.speedNumeric);
      }
    } catch (e) {
      console.warn('Firestore getPlans error:', e);
    }
  }

  let plans = getLocalItem<InternetPlan[]>(STORAGE_KEYS.PLANS, initialInternetPlans);
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
// SERVICES
// ----------------------------------------------------
export async function getServices(brandId?: BrandId | 'nexalus', publishedOnly = false): Promise<Service[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'services'));
      if (!snapshot.empty) {
        let services = snapshot.docs.map(d => d.data() as Service);
        setLocalItem(STORAGE_KEYS.SERVICES, services);
        if (brandId) {
          services = services.filter(s => s.brandId === brandId);
        }
        if (publishedOnly) {
          services = services.filter(s => s.published);
        }
        return services;
      }
    } catch (e) {
      console.warn('Firestore getServices error:', e);
    }
  }

  let services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  if (brandId) {
    services = services.filter(s => s.brandId === brandId);
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

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'services', id), newService);
    } catch (e) {
      console.warn('Firestore createService error:', e);
    }
  }

  const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  setLocalItem(STORAGE_KEYS.SERVICES, [newService, ...services]);
  await addAuditLog('CREATE_SERVICE', `Created service: ${newService.title}`, newService.brandId === 'nexalus' ? 'general' : newService.brandId);
  return newService;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
  const now = new Date().toISOString();
  const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return null;

  const updated: Service = {
    ...services[index],
    ...updates,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'services', id), { ...updates, updatedAt: now });
    } catch (e) {
      console.warn('Firestore updateService error:', e);
    }
  }

  services[index] = updated;
  setLocalItem(STORAGE_KEYS.SERVICES, services);
  await addAuditLog('UPDATE_SERVICE', `Updated service: ${updated.title}`, updated.brandId === 'nexalus' ? 'general' : updated.brandId);
  return updated;
}

export async function deleteService(id: string): Promise<boolean> {
  const services = getLocalItem<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  const target = services.find(s => s.id === id);
  if (!target) return false;

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      console.warn('Firestore deleteService error:', e);
    }
  }

  const updated = services.filter(s => s.id !== id);
  setLocalItem(STORAGE_KEYS.SERVICES, updated);
  await addAuditLog('DELETE_SERVICE', `Deleted service: ${target.title}`, target.brandId === 'nexalus' ? 'general' : target.brandId);
  return true;
}

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export async function getProjects(brandId?: BrandId | 'nexalus', publishedOnly = false): Promise<Project[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'projects'));
      if (!snapshot.empty) {
        let projects = snapshot.docs.map(d => d.data() as Project);
        setLocalItem(STORAGE_KEYS.PROJECTS, projects);
        if (brandId) {
          projects = projects.filter(p => p.brandId === brandId);
        }
        if (publishedOnly) {
          projects = projects.filter(p => p.published);
        }
        return projects;
      }
    } catch (e) {
      console.warn('Firestore getProjects error:', e);
    }
  }

  let projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
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

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'projects', id), newProject);
    } catch (e) {
      console.warn('Firestore createProject error:', e);
    }
  }

  const projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  setLocalItem(STORAGE_KEYS.PROJECTS, [newProject, ...projects]);
  await addAuditLog('CREATE_PROJECT', `Created project: ${newProject.title}`, newProject.brandId === 'nexalus' ? 'general' : newProject.brandId);
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const now = new Date().toISOString();
  const projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated: Project = {
    ...projects[index],
    ...updates,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'projects', id), { ...updates, updatedAt: now });
    } catch (e) {
      console.warn('Firestore updateProject error:', e);
    }
  }

  projects[index] = updated;
  setLocalItem(STORAGE_KEYS.PROJECTS, projects);
  await addAuditLog('UPDATE_PROJECT', `Updated project: ${updated.title}`, updated.brandId === 'nexalus' ? 'general' : updated.brandId);
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = getLocalItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  const target = projects.find(p => p.id === id);
  if (!target) return false;

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      console.warn('Firestore deleteProject error:', e);
    }
  }

  const updated = projects.filter(p => p.id !== id);
  setLocalItem(STORAGE_KEYS.PROJECTS, updated);
  await addAuditLog('DELETE_PROJECT', `Deleted project: ${target.title}`, target.brandId === 'nexalus' ? 'general' : target.brandId);
  return true;
}

// ----------------------------------------------------
// ENQUIRIES & LEADS
// ----------------------------------------------------
export async function getEnquiries(scope?: string, statusFilter?: string): Promise<Enquiry[]> {
  let allEnquiries: Enquiry[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'enquiries'));
      if (!snapshot.empty) {
        allEnquiries = snapshot.docs.map(d => d.data() as Enquiry);
      }
    } catch (e) {
      console.warn('Firestore getEnquiries error:', e);
    }
  }

  if (allEnquiries.length === 0) {
    allEnquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  } else {
    // Merge local items with Firestore to prevent losing offline submissions, deduping by id
    const local = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, []);
    const seen = new Set(allEnquiries.map(e => e.id));
    for (const item of local) {
      if (!seen.has(item.id)) {
        allEnquiries.push(item);
        seen.add(item.id);
      }
    }
    setLocalItem(STORAGE_KEYS.ENQUIRIES, allEnquiries);
  }

  // Deduplicate completely by id
  const uniqueMap = new Map<string, Enquiry>();
  for (const item of allEnquiries) {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  }
  let enquiries = Array.from(uniqueMap.values());

  // Scope filter: support websiteId ('corporate', 'nexalus-innovations', 'am-distributors') OR brandId
  if (scope && scope !== 'all') {
    if (scope === 'corporate' || scope === 'general') {
      enquiries = enquiries.filter(e => e.websiteId === 'corporate' || e.brandId === 'general');
    } else if (scope === 'nexalus-innovations') {
      enquiries = enquiries.filter(e =>
        e.websiteId === 'nexalus-innovations' ||
        e.brandId === 'nexalus-innovations' ||
        e.brandId === 'cp-plus' ||
        e.brandId === 'one-broadband' ||
        e.brandId === 'itti-networking'
      );
    } else if (scope === 'am-distributors') {
      enquiries = enquiries.filter(e => e.websiteId === 'am-distributors' || e.brandId === 'am-distributors');
    } else {
      enquiries = enquiries.filter(e => e.brandId === (scope as any) || e.websiteId === scope);
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
  if (!data.customerName.trim() || !data.phone.trim() || !data.email.trim()) {
    throw new Error('Please provide name, phone and valid email.');
  }

  // Derive websiteId and websiteName cleanly
  let websiteId = data.websiteId;
  let websiteName = data.websiteName;

  if (!websiteId) {
    if (data.brandId === 'am-distributors') {
      websiteId = 'am-distributors';
      websiteName = 'A.M. Distributors Chiplun';
    } else if (
      data.brandId === 'nexalus-innovations' ||
      data.brandId === 'cp-plus' ||
      data.brandId === 'one-broadband' ||
      data.brandId === 'itti-networking'
    ) {
      websiteId = 'nexalus-innovations';
      websiteName = 'Nexalus Innovations';
    } else {
      websiteId = 'corporate';
      websiteName = 'Nexalus Innovations LLP';
    }
  }

  const sourcePage = data.sourcePage || (data.enquiryType === 'quote' ? 'Quick Quote Modal' : 'Website Form');

  const id = 'enq-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();
  const newEnquiry: Enquiry = {
    ...data,
    websiteId,
    websiteName,
    sourcePage,
    id,
    status: 'new',
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      // 1. Primary enquiries collection
      await setDoc(doc(db, 'enquiries', id), newEnquiry);
      // 2. Mirror into websites collection: websites/{websiteId}/enquiries/{id}
      await setDoc(doc(db, 'websites', websiteId, 'enquiries', id), newEnquiry);
    } catch (e) {
      console.warn('Firestore submitEnquiry error:', e);
    }
  }

  const enquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  // Ensure no duplicate IDs in local storage
  const deduped = [newEnquiry, ...enquiries.filter(e => e.id !== id)];
  setLocalItem(STORAGE_KEYS.ENQUIRIES, deduped);
  notifyDataUpdate(STORAGE_KEYS.ENQUIRIES);

  await addAuditLog(
    'NEW_ENQUIRY_RECEIVED',
    `[${websiteName}] Received enquiry #${id} from ${newEnquiry.customerName} (${newEnquiry.phone}) on ${sourcePage}`,
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
  const now = new Date().toISOString();
  const enquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, initialEnquiries);
  const index = enquiries.findIndex(e => e.id === id);
  if (index === -1) return null;

  const current = enquiries[index];
  const updated: Enquiry = {
    ...current,
    status,
    internalNotes: internalNotes !== undefined ? internalNotes : current.internalNotes,
    assignedTo: assignedTo !== undefined ? assignedTo : current.assignedTo,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'enquiries', id), {
        status,
        internalNotes: updated.internalNotes,
        assignedTo: updated.assignedTo,
        updatedAt: now
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
  const enquiries = getLocalItem<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, []);
  const target = enquiries.find(e => e.id === id);

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'enquiries', id));
      if (target?.websiteId) {
        await deleteDoc(doc(db, 'websites', target.websiteId, 'enquiries', id));
      }
    } catch (e) {
      console.warn('Firestore deleteEnquiry error:', e);
    }
  }

  const updated = enquiries.filter(e => e.id !== id);
  setLocalItem(STORAGE_KEYS.ENQUIRIES, updated);
  notifyDataUpdate(STORAGE_KEYS.ENQUIRIES);

  await addAuditLog('DELETE_ENQUIRY', `Removed enquiry record #${id}`, target?.brandId === 'general' ? undefined : target?.brandId);
  return true;
}

// ----------------------------------------------------
// SERVICE AREAS (One Broadband Coverage Check)
// ----------------------------------------------------
export async function getServiceAreas(): Promise<ServiceArea[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'serviceAreas'));
      if (!snapshot.empty) {
        const areas = snapshot.docs.map(d => d.data() as ServiceArea);
        setLocalItem(STORAGE_KEYS.SERVICE_AREAS, areas);
        return areas;
      }
    } catch (e) {
      console.warn('Firestore getServiceAreas error:', e);
    }
  }
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

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'serviceAreas', newArea.id), newArea);
    } catch (e) {
      console.warn('Firestore createServiceArea error:', e);
    }
  }

  const areas = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, [...areas, newArea]);
  await addAuditLog('CREATE_SERVICE_AREA', `Added coverage zone: ${newArea.locality} (${newArea.pincode})`, 'one-broadband');
  return newArea;
}

export async function updateServiceArea(id: string, updates: Partial<ServiceArea>): Promise<ServiceArea | null> {
  const now = new Date().toISOString();
  const areas = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  const index = areas.findIndex(a => a.id === id);
  if (index === -1) return null;

  const updated: ServiceArea = {
    ...areas[index],
    ...updates,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'serviceAreas', id), { ...updates, updatedAt: now });
    } catch (e) {
      console.warn('Firestore updateServiceArea error:', e);
    }
  }

  areas[index] = updated;
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, areas);
  await addAuditLog('UPDATE_SERVICE_AREA', `Updated coverage zone: ${updated.locality}`, 'one-broadband');
  return updated;
}

export async function deleteServiceArea(id: string): Promise<boolean> {
  const areas = getLocalItem<ServiceArea[]>(STORAGE_KEYS.SERVICE_AREAS, initialServiceAreas);
  const target = areas.find(a => a.id === id);
  if (!target) return false;

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'serviceAreas', id));
    } catch (e) {
      console.warn('Firestore deleteServiceArea error:', e);
    }
  }

  const updated = areas.filter(a => a.id !== id);
  setLocalItem(STORAGE_KEYS.SERVICE_AREAS, updated);
  await addAuditLog('DELETE_SERVICE_AREA', `Deleted coverage zone: ${target.locality}`, 'one-broadband');
  return true;
}

// ----------------------------------------------------
// FAQS
// ----------------------------------------------------
export async function getFaqs(brandId?: BrandId | 'nexalus', publishedOnly = false): Promise<FAQ[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'faqs'));
      if (!snapshot.empty) {
        let faqs = snapshot.docs.map(d => d.data() as FAQ);
        setLocalItem(STORAGE_KEYS.FAQS, faqs);
        if (brandId) {
          faqs = faqs.filter(f => f.brandId === brandId);
        }
        if (publishedOnly) {
          faqs = faqs.filter(f => f.published);
        }
        return faqs.sort((a, b) => a.order - b.order);
      }
    } catch (e) {
      console.warn('Firestore getFaqs error:', e);
    }
  }

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

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'faqs', newFaq.id), newFaq);
    } catch (e) {
      console.warn('Firestore createFaq error:', e);
    }
  }

  const faqs = getLocalItem<FAQ[]>(STORAGE_KEYS.FAQS, initialFaqs);
  setLocalItem(STORAGE_KEYS.FAQS, [...faqs, newFaq]);
  await addAuditLog('CREATE_FAQ', `Added FAQ: ${newFaq.question.substring(0, 40)}...`, newFaq.brandId === 'nexalus' ? 'general' : newFaq.brandId);
  return newFaq;
}

export async function updateFaq(id: string, updates: Partial<FAQ>): Promise<FAQ | null> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'faqs', id), updates);
    } catch (e) {
      console.warn('Firestore updateFaq error:', e);
    }
  }

  const faqs = getLocalItem<FAQ[]>(STORAGE_KEYS.FAQS, initialFaqs);
  const index = faqs.findIndex(f => f.id === id);
  if (index === -1) return null;

  const updated = { ...faqs[index], ...updates };
  faqs[index] = updated;
  setLocalItem(STORAGE_KEYS.FAQS, faqs);
  return updated;
}

export async function deleteFaq(id: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'faqs', id));
    } catch (e) {
      console.warn('Firestore deleteFaq error:', e);
    }
  }

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
        let banners = snapshot.docs.map(d => d.data() as SiteBanner);
        setLocalItem(STORAGE_KEYS.BANNERS, banners);
        if (brandId) {
          banners = banners.filter(b => b.brandId === brandId);
        }
        return banners;
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
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'banners', id), updates);
    } catch (e) {
      console.warn('Firestore updateBanner error:', e);
    }
  }

  const banners = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);
  const index = banners.findIndex(b => b.id === id);
  if (index === -1) return null;

  const updated = { ...banners[index], ...updates };
  banners[index] = updated;
  setLocalItem(STORAGE_KEYS.BANNERS, banners);
  await addAuditLog('UPDATE_BANNER', `Updated banner: ${updated.title}`);
  return updated;
}

// ----------------------------------------------------
// USERS & ROLES
// ----------------------------------------------------
export async function getUsers(): Promise<AdminUser[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await withTimeout(getDocs(collection(db, 'users')), 2500);
      if (!snapshot.empty) {
        const users = snapshot.docs.map(d => d.data() as AdminUser);
        setLocalItem(STORAGE_KEYS.USERS, users);
        return users;
      }
    } catch (e) {
      console.warn('Firestore getUsers error (falling back to local cache):', e);
    }
  }

  let users = getLocalItem<AdminUser[]>(STORAGE_KEYS.USERS, initialUsers);
  const initialMap = new Map(initialUsers.map(u => [u.email.toLowerCase(), u]));
  let hasUpdates = false;

  users = users.map(u => {
    const init = initialMap.get(u.email.toLowerCase());
    if (init && (!u.password || u.password !== init.password)) {
      hasUpdates = true;
      return { ...u, password: init.password, role: init.role, displayName: init.displayName };
    }
    return u;
  });

  const existingEmails = new Set(users.map(u => u.email.toLowerCase()));
  for (const init of initialUsers) {
    if (!existingEmails.has(init.email.toLowerCase())) {
      users.push(init);
      hasUpdates = true;
    }
  }

  if (users.some(u => u.email === 'cpplus.admin@nexalusinnovations.com')) {
    users = users.filter(u => u.email !== 'cpplus.admin@nexalusinnovations.com');
    hasUpdates = true;
  }

  if (hasUpdates) {
    setLocalItem(STORAGE_KEYS.USERS, users);
  }
  return users;
}

export async function updateUser(uid: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
    } catch (e) {
      console.warn('Firestore updateUser error:', e);
    }
  }

  const users = getLocalItem<AdminUser[]>(STORAGE_KEYS.USERS, initialUsers);
  const index = users.findIndex(u => u.uid === uid);
  if (index === -1) return null;

  const updated = { ...users[index], ...updates };
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
      await setDoc(doc(db, 'users', uid), newUser);
    } catch (e) {
      console.warn('Firestore createUser error:', e);
    }
  }

  const users = getLocalItem<AdminUser[]>(STORAGE_KEYS.USERS, initialUsers);
  setLocalItem(STORAGE_KEYS.USERS, [...users, newUser]);
  await addAuditLog('CREATE_USER', `Created admin account: ${newUser.email} (${newUser.role})`);
  return newUser;
}

// ----------------------------------------------------
// SEO SETTINGS
// ----------------------------------------------------
export async function getSeoSettings(): Promise<SeoSettings> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'seoSettings', 'default'));
      if (snap.exists()) {
        const data = snap.data() as SeoSettings;
        setLocalItem(STORAGE_KEYS.SEO, data);
        return data;
      }
    } catch (e) {
      console.warn('Firestore getSeoSettings error:', e);
    }
  }
  return getLocalItem<SeoSettings>(STORAGE_KEYS.SEO, initialSeoSettings);
}

export async function updateSeoSettings(updates: Partial<SeoSettings>): Promise<SeoSettings> {
  const current = getLocalItem<SeoSettings>(STORAGE_KEYS.SEO, initialSeoSettings);
  const updated = { ...current, ...updates };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'seoSettings', 'default'), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore updateSeoSettings error:', e);
    }
  }

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
  notifyDataUpdate('team');
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
  notifyDataUpdate('team');
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
  notifyDataUpdate('team');
  return true;
}

// ----------------------------------------------------
// CUSTOMER E-COMMERCE ORDERS
// ----------------------------------------------------
export async function createOrder(
  orderData: Omit<CustomerOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; orderId: string; order: CustomerOrder }> {
  const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();

  const newOrder: CustomerOrder = {
    ...orderData,
    id: orderId,
    status: 'confirmed',
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (e) {
      console.warn('Firestore createOrder error:', e);
    }
  }

  const currentOrders = getLocalItem<CustomerOrder[]>(STORAGE_KEYS.ORDERS, []);
  const updatedOrders = [newOrder, ...currentOrders.filter(o => o.id !== orderId)];
  setLocalItem(STORAGE_KEYS.ORDERS, updatedOrders);
  notifyDataUpdate(STORAGE_KEYS.ORDERS);

  // Automatically register in CRM Enquiries table so admin sees the customer order immediately!
  const firstItem = newOrder.items[0];
  const itemsSummary = newOrder.items.map(i => `${i.productName} (Qty: ${i.quantity})`).join(', ');

  await submitEnquiry({
    brandId: 'nexalus-innovations',
    websiteId: 'nexalus-innovations',
    websiteName: 'Nexalus Online Store',
    customerName: newOrder.customerName,
    phone: newOrder.phone,
    email: newOrder.email || 'customer@store.nexalus',
    enquiryType: 'quote',
    productOrServiceName: `ONLINE ORDER [${orderId}]: ${firstItem?.productName || 'Equipment'} • Total: ₹${newOrder.totalAmount.toLocaleString('en-IN')}`,
    location: `${newOrder.city}, PIN ${newOrder.pincode}`,
    pincode: newOrder.pincode,
    sourcePage: 'Online Store Checkout',
    message: `Payment: ${newOrder.paymentMethod.toUpperCase()} | Address: ${newOrder.address}, ${newOrder.city} - ${newOrder.pincode} | Items: ${itemsSummary} | Notes: ${newOrder.orderNotes || 'None'}`
  }).catch(() => null);

  await addAuditLog(
    'NEW_ORDER_PLACED',
    `Online purchase order #${orderId} placed by ${newOrder.customerName} (${newOrder.phone}) for ₹${newOrder.totalAmount.toLocaleString('en-IN')}`,
    'nexalus-innovations'
  );

  return {
    success: true,
    orderId,
    order: newOrder
  };
}

export async function getOrders(): Promise<CustomerOrder[]> {
  let allOrders: CustomerOrder[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      if (!snapshot.empty) {
        allOrders = snapshot.docs.map(d => d.data() as CustomerOrder);
      }
    } catch (e) {
      console.warn('Firestore getOrders error:', e);
    }
  }

  if (allOrders.length === 0) {
    allOrders = getLocalItem<CustomerOrder[]>(STORAGE_KEYS.ORDERS, []);
  } else {
    setLocalItem(STORAGE_KEYS.ORDERS, allOrders);
  }

  return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}


