export type BrandId = 'nexalus-innovations' | 'am-distributors' | 'cp-plus' | 'one-broadband' | 'itti-networking';

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

export interface InternetPlan {
  id: string;
  brandId: 'one-broadband';
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
  clientType: 'Enterprise' | 'Commercial' | 'Residential' | 'Government' | 'Retail';
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
  enquiryType: 'product' | 'service' | 'plan' | 'quote' | 'coverage' | 'general';
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
  brandId: 'one-broadband';
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
  | 'networking_admin';

export interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  password?: string;
  role: UserRole;
  assignedBrandId?: BrandId | 'all';
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string; // e.g. 'CREATE_PRODUCT', 'UPDATE_ENQUIRY', 'DELETE_PLAN'
  details: string;
  brandId?: BrandId | 'general';
}

export interface SiteBanner {
  id: string;
  brandId: BrandId | 'nexalus';
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
  imageUrl?: string;
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
  };
}
