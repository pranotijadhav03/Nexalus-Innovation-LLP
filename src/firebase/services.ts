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
  SeoSettings
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
  initialSeoSettings
} from '../data/initialData';

// Storage Keys for resilient local state
const DATA_VERSION = 'v8_';
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
  SEO: DATA_VERSION + 'nexalus_store_seo'
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
export async function getCategories(brandId?: BrandId): Promise<ProductCategory[]> {
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
export async function getProducts(brandId?: BrandId, publishedOnly = false): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    try {
      const constraints: any[] = [];
      if (brandId) constraints.push(where('brandId', '==', brandId));
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
// SERVICES
// ----------------------------------------------------
export async function getServices(brandId?: BrandId | 'nexalus', publishedOnly = false): Promise<Service[]> {
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
  let banners = getLocalItem<SiteBanner[]>(STORAGE_KEYS.BANNERS, initialBanners);
  if (brandId) {
    banners = banners.filter(b => b.brandId === brandId);
  }
  return banners;
}

export async function updateBanner(id: string, updates: Partial<SiteBanner>): Promise<SiteBanner | null> {
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
  let users = getLocalItem<AdminUser[]>(STORAGE_KEYS.USERS, initialUsers);
  const initialMap = new Map(initialUsers.map(u => [u.email.toLowerCase(), u]));
  let hasUpdates = false;

  // Sync initial users passwords and roles
  users = users.map(u => {
    const init = initialMap.get(u.email.toLowerCase());
    if (init && (!u.password || u.password !== init.password)) {
      hasUpdates = true;
      return { ...u, password: init.password, role: init.role, displayName: init.displayName };
    }
    return u;
  });

  // Ensure all initial users exist
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

  if (hasUpdates) {
    setLocalItem(STORAGE_KEYS.USERS, users);
  }
  return users;
}

export async function updateUser(uid: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
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
  const users = getLocalItem<AdminUser[]>(STORAGE_KEYS.USERS, initialUsers);
  setLocalItem(STORAGE_KEYS.USERS, [...users, newUser]);
  await addAuditLog('CREATE_USER', `Created admin account: ${newUser.email} (${newUser.role})`);
  return newUser;
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
