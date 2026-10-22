export type BrandId = 'nexalus' | 'nexalus-innovations' | 'am-distributors' | 'cp-plus' | 'one-broadband' | 'itti-networking';

export interface Brand {
  id: BrandId;
  name: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string; // e.g. '#0284c7' or '#dc2626'
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  websitePath: string;
  published: boolean;
  features: string[];
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  brandId: BrandId;
  name: string;
  slug: string;
  description?: string;
  itemCount?: number;
}

export interface Product {
  id: string;
  brandId: BrandId;
  name: string;
  slug: string;
  modelNumber: string;
  categoryId: string;
  categoryName: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  price?: number;
  currency?: string;
  availability: 'in_stock' | 'out_of_stock' | 'pre_order' | 'contact_for_price';
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanOrder {
  id: string;
  planId?: string;
  planName: string;
  providerName: string;
  speed: string;
  price: number | string;
  billingPeriod: string;
  brandId?: BrandId | 'one-broadband' | 'nexalus-innovations';
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  preferredSlot?: string;
  paymentMethod: 'pay_on_installation' | 'online_upi' | 'corporate_invoice';
  status: 'new' | 'confirmed' | 'installation_scheduled' | 'converted' | 'cancelled';
  notes?: string;
  assignedEngineer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartPlanItem {
  id: string;
  planId?: string;
  planName: string;
  providerName: string;
  speed: string;
  price: number | string;
  billingPeriod: string;
  brandId?: BrandId | 'one-broadband' | 'nexalus-innovations';
  addedAt: string;
}

export interface InternetPlan {
  id: string;
  brandId: BrandId | 'nexalus' | 'one-broadband' | 'am-distributors' | 'all';
  services?: string[];
  name: string;
  slug: string;
  speed: string; // e.g. "100 Mbps", "300 Mbps", "1 Gbps"
  speedNumeric: number; // for sorting
  price: number;
  originalPrice?: number; // e.g. 850, 1200, 1700
  image?: string; // card header image e.g. /images/internet-plan-cable.jpg
  billingPeriod: 'monthly' | 'quarterly' | 'annually';
  dataAllowance: string; // e.g. "Truly Unlimited"
  includedFeatures: string[];
  availability: 'active' | 'inactive';
  popular?: boolean;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// MULTI-PROVIDER BROADBAND PLANS (Phase 2 Data Model)
// ----------------------------------------------------
export type BroadbandProviderId = 'airtel' | 'bsnl' | 'railwire' | (string & {});

export interface BroadbandProvider {
  id: string; // Stable provider identifier: 'airtel' | 'bsnl' | 'railwire'
  name: string; // Display name: 'Airtel', 'BSNL', 'RailWire'
  slug: string;
  description?: string;
  logoUrl?: string;
  enabled: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type BroadbandBillingPeriod =
  | 'monthly'
  | 'quarterly'
  | 'semi-annually'
  | 'annually'
  | 'custom';

export type BroadbandPlanAvailability = 'active' | 'inactive' | 'coming_soon';

export interface BroadbandPlan {
  id: string; // Stable plan identifier e.g. 'airtel-basic-40mbps'
  providerId: string; // References BroadbandProvider.id ('airtel' | 'bsnl' | 'railwire')
  name: string; // Plan display name
  slug: string;
  speed: string; // e.g. '40 Mbps', '100 Mbps'
  speedNumeric: number; // Numeric Mbps for sorting/filtering
  price: number; // Numeric tariff price with explicit currency handling
  currency: string; // e.g. 'INR'
  originalPrice?: number; // Numeric original/strikethrough price
  billingPeriod: BroadbandBillingPeriod; // Validity or billing period
  validityDays?: number; // Explicit validity in days (e.g. 30, 90, 365)
  dataAllowance?: string; // e.g. 'Truly Unlimited'
  description?: string;
  features: string[]; // Plan features and perks
  city?: string; // City or regional availability constraint (e.g. 'Chiplun' or 'All')
  cities?: string[]; // Optional specific list of supported cities
  availability: BroadbandPlanAvailability;
  published: boolean; // Published/enabled status
  displayOrder: number; // For ordering within provider or public listings
  popular?: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanValidationError {
  field: string;
  message: string;
}

export function validateBroadbandPlan(plan: Partial<BroadbandPlan>): {
  isValid: boolean;
  errors: PlanValidationError[];
} {
  const errors: PlanValidationError[] = [];

  if (!plan.name || plan.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Plan name is required.' });
  }

  if (!plan.providerId || plan.providerId.trim().length === 0) {
    errors.push({ field: 'providerId', message: 'Provider identifier is required.' });
  }

  if (!plan.speed || plan.speed.trim().length === 0) {
    errors.push({ field: 'speed', message: 'Plan speed is required (e.g. 100 Mbps).' });
  }

  if (typeof plan.price !== 'number' || isNaN(plan.price) || plan.price < 0) {
    errors.push({ field: 'price', message: 'Price must be a valid non-negative number.' });
  }

  if (
    plan.originalPrice !== undefined &&
    (typeof plan.originalPrice !== 'number' || isNaN(plan.originalPrice) || plan.originalPrice < 0)
  ) {
    errors.push({ field: 'originalPrice', message: 'Original price must be a valid non-negative number if provided.' });
  }

  if (!plan.currency || plan.currency.trim().length === 0) {
    errors.push({ field: 'currency', message: 'Currency code is required (e.g. INR).' });
  }

  if (
    plan.displayOrder !== undefined &&
    (typeof plan.displayOrder !== 'number' || isNaN(plan.displayOrder))
  ) {
    errors.push({ field: 'displayOrder', message: 'Display order must be a valid number.' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateBroadbandProvider(provider: Partial<BroadbandProvider>): {
  isValid: boolean;
  errors: PlanValidationError[];
} {
  const errors: PlanValidationError[] = [];

  if (!provider.id || provider.id.trim().length === 0) {
    errors.push({ field: 'id', message: 'Provider ID is required.' });
  }

  if (!provider.name || provider.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Provider name is required.' });
  }

  if (
    provider.displayOrder !== undefined &&
    (typeof provider.displayOrder !== 'number' || isNaN(provider.displayOrder))
  ) {
    errors.push({ field: 'displayOrder', message: 'Display order must be a valid number.' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export interface Service {
  id: string;
  brandId: BrandId | 'nexalus';
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  features: string[];
  targetAudience: string[]; // e.g. ['Residential', 'Commercial', 'Enterprise']
  featured: boolean;
  published: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  brandId: BrandId | 'nexalus';
  title: string;
  slug: string;
  clientType: 'Enterprise' | 'Commercial' | 'Residential' | 'Government' | 'Retail' | 'Logistics' | 'Industrial' | 'Wholesale';
  location: string;
  description: string;
  solutionProvided: string;
  scope: string[];
  images: string[];
  featured: boolean;
  published: boolean;
  completionDate: string;
  createdAt: string;
  updatedAt: string;
}

export type EnquiryStatus = 'new' | 'contacted' | 'in_progress' | 'quotation_sent' | 'converted' | 'closed';

export interface Enquiry {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  brandId: BrandId | 'general';
  websiteId?: 'corporate' | 'nexalus-innovations' | 'am-distributors' | string;
  websiteName?: string;
  sourcePage?: string;
  enquiryType: 'product' | 'service' | 'plan' | 'quote' | 'coverage' | 'general' | 'order';
  productOrServiceId?: string;
  productOrServiceName?: string;
  location: string;
  pincode?: string;
  message: string;
  status: EnquiryStatus;
  assignedTo?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceArea {
  id: string;
  brandId: BrandId | 'nexalus' | 'one-broadband' | 'am-distributors' | 'all';
  services?: string[];
  locality: string;
  city: string;
  state: string;
  pincode: string;
  status: 'fully_operational' | 'expanding_soon' | 'planned';
  notes?: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  brandId: BrandId | 'nexalus';
  category: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

export type UserRole =
  | 'super_admin'
  | 'innovations_admin'
  | 'am_admin'
  | 'cp_plus_admin'
  | 'one_broadband_admin'
  | 'networking_admin'
  | 'customer';

export interface CustomerDeliveryAddress {
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  additionalDeliveryInfo?: string;
}

export interface CustomerRegistrationData {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  deliveryAddress: CustomerDeliveryAddress;
}

export interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  assignedBrandId?: BrandId | 'all';
  phone?: string;
  deliveryAddress?: CustomerDeliveryAddress;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  updatedAt?: string;
}

export type UserProfile = AdminUser;

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string; // e.g. 'CREATE_PRODUCT', 'UPDATE_ENQUIRY', 'DELETE_PLAN'
  details: string;
  brandId?: BrandId | 'general';
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  badge?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  order?: number;
}

export interface SiteBanner {
  id: string;
  brandId: BrandId | 'nexalus';
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  badge?: string;
  active: boolean;
  imageUrl?: string;
  supportPhone?: string;
  supportEmail?: string;
  officeAddress?: string;
  workingHours?: string;
  showHero?: boolean;
  showTeam?: boolean;
  showFaqs?: boolean;
  showContact?: boolean;
  slides?: HeroSlide[];
}

export interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}


export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  deptType: 'tech' | 'logistics' | 'leadership' | 'operations';
  division?: 'all' | 'corporate' | 'nexalus-innovations' | 'am-distributors';
  image: string;
  specialty: string;
  tag: string;
  circleBorder: string;
  circleShadow: string;
  circleHoverShadow: string;
  badgeBg: string;
  createdAt?: string;
  updatedAt?: string;
}
