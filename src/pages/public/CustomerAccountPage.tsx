import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  updateCustomerProfile,
  getCustomerEnquiries,
  subscribeToCustomerPlanOrders,
  getPlanCart,
  removeFromPlanCart,
  clearPlanCart,
  updateCartItemQuantity,
  isCartItemBelongingToCompany
} from '../../firebase/services';
import { CartPlanItem } from '../../types';
import { PlanOrderModal } from '../../components/common/PlanOrderModal';
import { PlanOrder } from '../../types';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal';
import { formatIndianCurrency, formatDateIndian } from '../../utils/documentGenerator';
import { Enquiry, CustomerDeliveryAddress, CompanyScopeId } from '../../types';
import {
  User,
  UserCheck,
  UserPlus,
  LogIn,
  Lock,
  MapPin,
  FileText,
  Shield,
  ShieldCheck,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  LogOut,
  Save,
  Send,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Wifi,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowRight,
  Bell,
  Calendar,
  CreditCard,
  Receipt,
  Plus,
  Minus,
  ShoppingCart,
  Activity,
  History,
  Tv,
  Film,
  Scale,
  Menu,
  X,
  Printer,
  Download,
  Check,
  HelpCircle,
  Headphones,
  Upload,
  AlertTriangle,
  PlayCircle,
  ChevronDown,
  ShoppingBag,
  Package,
  Trash2,
  Zap
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { triggerSystemPushNotification, getEmailProviderUrl, getEmailProviderName } from '../../utils/notificationHelpers';

const MAHARASHTRA_CITIES = [
  'Chiplun',
  'Ratnagiri',
  'Sangli',
  'Kolhapur',
  'Pune',
  'Mumbai',
  'Khed',
  'Satara',
  'Solapur',
  'Other'
];

const INDIAN_STATES = [
  'Maharashtra',
  'Goa',
  'Gujarat',
  'Karnataka',
  'Madhya Pradesh',
  'Delhi',
  'Other'
];

// A.M. Distributors Chiplun - FMCG & Cold-Chain Logistics Inquiries
const AM_DISTRIBUTORS_TICKET_SUBJECTS = [
  'Morning route delivery schedule inquiry',
  'Commercial 20L water jar refill request',
  'Bulk dairy / milk crate order inquiry',
  'Ice cream refrigeration / deep freezer issue',
  'Damaged goods / Breakage report on route',
  'Depot delivery challan copy required',
  'Wholesale pricing quotation for FMCG retail',
  'Route reschedule / Address change for supply',
  'Billing & trade invoice inquiry',
  'Other distribution inquiry'
];

// Nexalus Innovations - Commercial CCTV & Enterprise Hardware Service Tickets
const NEXALUS_INNOVATIONS_TICKET_SUBJECTS = [
  'CCTV camera offline / Video loss',
  'NVR storage / Hard drive full or error',
  'AI motion alert & PTZ tracking configuration',
  'Night vision / IR cut filter malfunctioning',
  'Optical PoE switch port down',
  'Optical fiber patch cord or SFP transceiver issue',
  'Remote mobile app surveillance access problem',
  'On-site technician visit / AMC routine inspection',
  'New camera point installation / Site expansion',
  'Hardware warranty replacement request',
  'AMC contract renewal / Invoicing query',
  'Other CCTV & hardware technical grievance'
];

const AM_SAMPLE_TICKETS = [
  {
    id: 'DEPOT-48102',
    subject: 'Morning route delivery schedule inquiry',
    priority: 'medium',
    status: 'Resolved',
    date: '20 Oct 2024',
    description: 'Confirmed daily dispatch at 05:30 AM for Chiplun market route.'
  },
  {
    id: 'DEPOT-49214',
    subject: 'Commercial 20L water jar refill request',
    priority: 'low',
    status: 'Open',
    date: '28 Oct 2024',
    description: 'Routine weekly replenishment of 50 mineral water jars scheduled.'
  }
];

const NEXALUS_INNOVATIONS_SAMPLE_TICKETS = [
  {
    id: 'CCTV-71029',
    subject: 'AI motion alert & PTZ tracking configuration',
    priority: 'medium',
    status: 'Resolved',
    date: '19 Oct 2024',
    description: 'Configured perimeter boundary tripwire on 4K outdoor bullet cameras.'
  },
  {
    id: 'CCTV-72810',
    subject: 'On-site technician visit / AMC routine inspection',
    priority: 'high',
    status: 'Open',
    date: '27 Oct 2024',
    description: 'Quarterly camera lens cleaning and PoE switch health audit booked.'
  }
];

// 22 Exact Support Ticket Subjects from RailWire / Nexalus Broadband login.mp4 video
const TICKET_SUBJECTS = [
  'Slow browsing speed',
  'Frequent disconnection',
  'No internet access / Red light on ONT/ONU',
  'Optical fiber cable cut / loss of signal',
  'Wi-Fi router / ONT configuration issue',
  'Wi-Fi signal weak / range problem',
  'Error 691: Authentication failure / Username password wrong',
  'Error 678 / 651: Remote computer did not respond',
  'Plan change request',
  'Relocation / Shifting of connection',
  'Billing discrepancy / Payment not updated',
  'Invoice copy required',
  'Static IP configuration request',
  'Reset CPE / Internet password',
  'OTT add-on activation issue',
  'IPTV Set-Top Box not working',
  'Latency / High ping in gaming',
  'Website / Server unreachable',
  'Temporary suspension / Safe custody',
  'Renewal query',
  'Upgrade to Gigabit Fiber',
  'Other technical grievance'
];

// Sample Receipts matching video structure
const SAMPLE_RECEIPTS = [
  {
    id: 'RCP-2024-9182',
    invoiceNo: 'INV/MH/2024/217435-01',
    date: '12-10-2024',
    period: '12-10-2024 to 11-11-2024',
    plan: 'FUP40Mbps-2Mbps 2500GB x10',
    taxable: '₹ 399.00',
    cgst: '₹ 35.91',
    sgst: '₹ 35.91',
    amount: '₹ 470.82',
    mode: 'Online (NTT DATA)',
    status: 'Paid',
    sac: '998422'
  },
  {
    id: 'RCP-2024-8104',
    invoiceNo: 'INV/MH/2024/217435-00',
    date: '12-09-2024',
    period: '12-09-2024 to 11-10-2024',
    plan: 'FUP40Mbps-2Mbps 2500GB x10',
    taxable: '₹ 399.00',
    cgst: '₹ 35.91',
    sgst: '₹ 35.91',
    amount: '₹ 470.82',
    mode: 'Online (NTT DATA)',
    status: 'Paid',
    sac: '998422'
  }
];

// Sample Transactions matching video structure
const SAMPLE_TRANSACTIONS = [
  {
    txnId: 'TXN202410129841',
    gatewayRef: 'NTT-PG-892182741',
    date: '12 Oct 2024, 02:45 PM',
    pack: 'FUP40Mbps-2Mbps 2500GB x10',
    amount: '₹ 470.82',
    mode: 'NTT DATA Payment Services',
    status: 'Success'
  },
  {
    txnId: 'TXN202409127632',
    gatewayRef: 'NTT-PG-781920472',
    date: '12 Sep 2024, 11:18 AM',
    pack: 'FUP40Mbps-2Mbps 2500GB x10',
    amount: '₹ 470.82',
    mode: 'NTT DATA Payment Services',
    status: 'Success'
  }
];

// Sample Usage Sessions matching video structure
const SAMPLE_USAGE_SESSIONS = [
  { date: '26 Oct 2024', ip: '103.241.134.82', downloadMb: 4210.5, uploadMb: 820.2, totalGb: '4.91 GB', duration: '08h 12m' },
  { date: '25 Oct 2024', ip: '103.241.134.82', downloadMb: 8940.1, uploadMb: 1120.4, totalGb: '9.82 GB', duration: '14h 45m' },
  { date: '24 Oct 2024', ip: '103.241.134.90', downloadMb: 6150.8, uploadMb: 940.0, totalGb: '6.92 GB', duration: '11h 20m' },
  { date: '23 Oct 2024', ip: '103.241.134.90', downloadMb: 5200.3, uploadMb: 780.6, totalGb: '5.84 GB', duration: '09h 55m' },
  { date: '22 Oct 2024', ip: '103.241.134.11', downloadMb: 7420.0, uploadMb: 1305.1, totalGb: '8.52 GB', duration: '13h 10m' }
];

// 12 Sidebar Navigation Sections from login.mp4 video
type PortalSection =
  | 'account_summary'       // 1. Account Summary
  | 'broadband_orders'      // 2. Broadband Orders & Booking Slips
  | 'my_profile'            // 2. My Profile
  | 'portal_password'       // 3. Portal Password Change
  | 'internet_password'     // 4. Internet Password Change
  | 'payments'              // 5. Payments (Recharge)
  | 'my_cart'               // 6. My Cart
  | 'data_usage'            // 7. My Data Usage
  | 'support_tickets'       // 8. My Support Tickets
  | 'old_transactions'      // 9. Old Transactions
  | 'iptv_pack'             // 10. IPTV PACK
  | 'ott_recharge'          // 11. OTT Recharge
  | 'offline_appeal';       // 12. Offline Appeal

export interface CustomerAccountPageProps {
  brandScope?: CompanyScopeId;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({ brandScope }) => {
  const {
    currentUser,
    isAuthenticated,
    isCustomer,
    loginCustomer,
    registerCustomerAccount,
    logout,
    refreshUserProfile
  } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Multi-Company Scope Resolution
  const effectiveScope: CompanyScopeId = (
    brandScope ||
    (location.pathname.includes('/am-distributors') ? 'am-distributors' :
     location.pathname.includes('/nexalus-innovations') ? 'nexalus-innovations' :
     'nexalus-llp')
  );

  const isChildCompany = effectiveScope !== 'nexalus-llp';

  const companyMeta = {
    'am-distributors': {
      name: 'A.M. Distributors Chiplun',
      shortName: 'A.M. Distributors',
      tagline: 'Wholesale FMCG & Cold-Chain Logistics Hub',
      badge: 'Wholesale Depot Partner',
      themeColor: 'emerald',
      avatarBg: 'from-emerald-600 to-teal-500',
      logo: '/images/am-distributors-logo.png',
      homeUrl: '/brands/am-distributors',
      productsUrl: '/brands/am-distributors/products',
      contactUrl: '/brands/am-distributors/contact',
      portalTitle: 'Wholesale Depot Partner Portal',
      portalSub: 'Manage wholesale supply, route dispatches, delivery challans, and depot inquiries.'
    },
    'nexalus-innovations': {
      name: 'Nexalus Innovations',
      shortName: 'Nexalus Innovations',
      tagline: 'Commercial 4K AI CCTV & Enterprise Hardware',
      badge: 'CCTV & Hardware Client',
      themeColor: 'indigo',
      avatarBg: 'from-indigo-600 to-blue-600',
      logo: '/images/nexalus-innovations-logo.png',
      homeUrl: '/brands/nexalus-innovations',
      productsUrl: '/brands/nexalus-innovations/products',
      contactUrl: '/brands/nexalus-innovations/contact',
      portalTitle: 'Client Tech & Surveillance Portal',
      portalSub: 'Manage CCTV installations, optical switches, hardware orders, and AMC maintenance tickets.'
    },
    'nexalus-llp': {
      name: 'Nexalus Innovations LLP',
      shortName: 'Nexalus Broadband',
      tagline: 'High-Speed Commercial Fiber & Telecom Infrastructure',
      badge: 'Active Broadband Subscriber',
      themeColor: 'blue',
      avatarBg: 'from-blue-600 to-cyan-500',
      logo: '/images/parent-company-logo.jpg',
      homeUrl: '/',
      productsUrl: '/plans-pricing',
      contactUrl: '/contact',
      portalTitle: 'Subscriber Account Access',
      portalSub: 'Sign in to manage your high-speed broadband, OTT subscriptions, invoices, and service requests.'
    }
  }[effectiveScope === 'am-distributors' ? 'am-distributors' : effectiveScope === 'nexalus-innovations' ? 'nexalus-innovations' : 'nexalus-llp'];

  const currentTicketSubjects = effectiveScope === 'am-distributors'
    ? AM_DISTRIBUTORS_TICKET_SUBJECTS
    : effectiveScope === 'nexalus-innovations'
    ? NEXALUS_INNOVATIONS_TICKET_SUBJECTS
    : TICKET_SUBJECTS;

  // Auth View State for Unauthenticated Visitors: 'login' | 'register' | 'forgot_password'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>(() => {
    if (location.pathname === '/register') return 'register';
    return 'login';
  });

  // Sync auth mode with route if path changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthMode('register');
    } else if (location.pathname === '/login') {
      setAuthMode('login');
    }
  }, [location.pathname]);

  // Redirect authenticated Admins to Admin Console; Keep authenticated customers on this page
  useEffect(() => {
    if (isAuthenticated) {
      if (!isCustomer) {
        navigate('/admin', { replace: true });
      }
      // If customer is on /account, let them stay to access their Subscriber Portal
    }
  }, [isAuthenticated, isCustomer, navigate]);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration Form State (with First Name, Last Name, DOB from login.mp4)
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('Maharashtra');
  const [regPostcode, setRegPostcode] = useState('');
  const [regCountry] = useState('India');
  const [regAdditionalInfo, setRegAdditionalInfo] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Password Reset State
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // ==========================================
  // PORTAL STATE (FOR LOGGED-IN CUSTOMER)
  // ==========================================
  const [activeSection, setActiveSection] = useState<PortalSection>('account_summary');
  const [cartItems, setCartItems] = useState<CartPlanItem[]>(() => {
    try {
      return getPlanCart();
    } catch {
      return [];
    }
  });
  const [orderPlanModalItem, setOrderPlanModalItem] = useState<any>(null);

  useEffect(() => {
    const handleCartUpdate = (e: any) => {
      const items = e?.detail || getPlanCart();
      setCartItems(Array.isArray(items) ? items : []);
    };
    window.addEventListener('nexalus_plan_cart_updated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);
    return () => {
      window.removeEventListener('nexalus_plan_cart_updated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Profile Form State
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileState, setProfileState] = useState('Maharashtra');
  const [profilePostcode, setProfilePostcode] = useState('');
  const [profileCountry, setProfileCountry] = useState('India');
  const [profileAdditionalInfo, setProfileAdditionalInfo] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<Enquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [showInquiriesModal, setShowInquiriesModal] = useState(false);

  // OTT Subscription Confirmation Modal State
  const [ottModalPack, setOttModalPack] = useState<{ name: string; price: number; services: string[] } | null>(null);
  const [isSubscribingOtt, setIsSubscribingOtt] = useState(false);

  // Real Broadband Orders State
  const [customerOrders, setCustomerOrders] = useState<PlanOrder[]>([]);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docModalOrder, setDocModalOrder] = useState<PlanOrder | null>(null);
  const [docModalType, setDocModalType] = useState<'booking_slip' | 'paid_receipt'>('booking_slip');

  // Real-time listener for customer's broadband orders
  useEffect(() => {
    if (currentUser?.uid) {
      const unsub = subscribeToCustomerPlanOrders(currentUser.uid, currentUser.email, (orders) => {
        setCustomerOrders(orders);
      });
      return () => unsub();
    }
  }, [currentUser?.uid, currentUser?.email]);

  const openDocModal = (order: PlanOrder, type: 'booking_slip' | 'paid_receipt') => {
    setDocModalOrder(order);
    setDocModalType(type);
    setDocModalOpen(true);
  };

  // Scoped Customer Orders strictly for this company
  const scopedCustomerOrders = useMemo(() => {
    return customerOrders.filter((order: PlanOrder) => {
      const orderComp = (order.companyId || '').trim();
      const orderBrand = (order.brandId || '').trim();
      const planNameLower = (order.planName || '').toLowerCase();
      const providerLower = (order.providerName || '').toLowerCase();
      const isBroadband = Boolean(
        order.providerName ||
        planNameLower.includes('airtel') ||
        planNameLower.includes('bsnl') ||
        planNameLower.includes('railwire') ||
        planNameLower.includes('broadband') ||
        planNameLower.includes('mbps') ||
        providerLower.includes('airtel') ||
        providerLower.includes('bsnl') ||
        providerLower.includes('railwire') ||
        providerLower.includes('one')
      );

      if (effectiveScope === 'am-distributors') {
        if (isBroadband) return false;
        return orderComp === 'am-distributors' || orderComp === 'am' || orderBrand === 'am-distributors';
      }
      if (effectiveScope === 'nexalus-innovations') {
        if (isBroadband || orderComp === 'nexalus-llp' || orderComp === 'corporate') return false;
        return orderComp === 'nexalus-innovations' || orderBrand === 'nexalus-innovations';
      }
      if (isBroadband) return true;
      return orderComp === 'nexalus-llp' || orderComp === 'corporate' || !orderComp;
    });
  }, [customerOrders, effectiveScope]);

  const scopedTotalSpend = useMemo(() => {
    return scopedCustomerOrders.reduce((sum: number, o: PlanOrder) => sum + (Number(o.price) || 0), 0);
  }, [scopedCustomerOrders]);

  const scopedInquiries = useMemo(() => {
    return inquiries.filter((inq: Enquiry) => {
      const bId = (inq.brandId || inq.websiteId || '').trim();
      const inqSource = ((inq as any).source || '').trim();
      if (effectiveScope === 'am-distributors') {
        return bId === 'am-distributors' || inqSource === 'am-distributors';
      }
      if (effectiveScope === 'nexalus-innovations') {
        return bId === 'nexalus-innovations' || inqSource === 'nexalus-innovations';
      }
      return bId === 'nexalus-llp' || bId === 'corporate' || !bId;
    });
  }, [inquiries, effectiveScope]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sec = params.get('section') as PortalSection;
    if (sec) {
      setActiveSection(sec);
    }
  }, [location.search]);

  // Scoped Cart Items strictly for the current company
  const scopedCartItems = useMemo(() => {
    return cartItems.filter((item: CartPlanItem) => isCartItemBelongingToCompany(item, effectiveScope));
  }, [cartItems, effectiveScope]);

  const activeOrder = scopedCustomerOrders.find((o: PlanOrder) => o.status === 'activated' || o.paymentStatus === 'paid') || scopedCustomerOrders[0];
  const activePlanName = activeOrder ? `${activeOrder.providerName || ''} ${activeOrder.planName}`.trim() : 'No Active Subscription';
  const activePlanSpeed = activeOrder ? (activeOrder.speed || 'Standard') : 'Unprovisioned';
  const activePlanFee = activeOrder ? formatIndianCurrency(activeOrder.price) : '₹0.00';
  const activePlanStatus = activeOrder
    ? (activeOrder.status === 'activated' ? 'Active Connection' : activeOrder.paymentStatus === 'paid' ? 'Paid / Scheduled' : 'Pending Installation')
    : 'No Active Connection';


  // Tax Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<typeof SAMPLE_RECEIPTS[0] | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Support Tickets State & Modal - strictly user-logged tickets
  const [ticketsList, setTicketsList] = useState<any[]>(() => {
    try {
      const key = `nexa_tickets_${currentUser?.uid || 'guest'}_${effectiveScope}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState(currentTicketSubjects[0] || TICKET_SUBJECTS[0]);

  useEffect(() => {
    try {
      const key = `nexa_tickets_${currentUser?.uid || 'guest'}_${effectiveScope}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setTicketsList(JSON.parse(stored));
      } else {
        setTicketsList([]);
      }
    } catch {
      setTicketsList([]);
    }
    setTicketSubject(
      effectiveScope === 'am-distributors'
        ? AM_DISTRIBUTORS_TICKET_SUBJECTS[0]
        : effectiveScope === 'nexalus-innovations'
        ? NEXALUS_INNOVATIONS_TICKET_SUBJECTS[0]
        : TICKET_SUBJECTS[0]
    );
  }, [effectiveScope, currentUser?.uid]);
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Internet Password Change State
  const [newInternetPassword, setNewInternetPassword] = useState('');
  const [confirmInternetPassword, setConfirmInternetPassword] = useState('');
  const [showInternetPassword, setShowInternetPassword] = useState(false);
  const [isUpdatingInternetPass, setIsUpdatingInternetPass] = useState(false);

  // Portal Password Change State
  const [portalOldPass, setPortalOldPass] = useState('');
  const [portalNewPass, setPortalNewPass] = useState('');
  const [portalConfirmPass, setPortalConfirmPass] = useState('');
  const [showPortalPass, setShowPortalPass] = useState(false);
  const [isUpdatingPortalPass, setIsUpdatingPortalPass] = useState(false);

  // Payment Recharge State
  const [selectedGateway, setSelectedGateway] = useState<'ntt_data' | 'billdesk' | 'razorpay_upi'>('ntt_data');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Initialize form fields: credentials (name, phone, dob) linked, but delivery address STRICTLY scoped to company
  useEffect(() => {
    if (currentUser) {
      const parts = (currentUser.displayName || '').split(' ');
      setProfileFirstName(currentUser.firstName || parts[0] || '');
      setProfileLastName(currentUser.lastName || parts.slice(1).join(' ') || '');
      setProfileDob(currentUser.dateOfBirth || '');
      setProfilePhone(currentUser.phone || '');

      if (isChildCompany) {
        // Child company has its own independent address - DO NOT pull parent broadband address
        const scopedAddr = currentUser.companyProfiles?.[effectiveScope]?.deliveryAddress;
        if (scopedAddr && scopedAddr.address) {
          setProfileAddress(scopedAddr.address);
          setProfileCity(scopedAddr.city || (effectiveScope === 'am-distributors' ? 'Chiplun' : 'Sangli'));
          setProfileState(scopedAddr.state || 'Maharashtra');
          setProfilePostcode(scopedAddr.postcode || (effectiveScope === 'am-distributors' ? '415605' : '416416'));
          setProfileCountry(scopedAddr.country || 'India');
          setProfileAdditionalInfo(scopedAddr.additionalDeliveryInfo || '');
        } else {
          // Fresh empty address for child company
          setProfileAddress('');
          setProfileCity(effectiveScope === 'am-distributors' ? 'Chiplun' : 'Sangli');
          setProfileState('Maharashtra');
          setProfilePostcode(effectiveScope === 'am-distributors' ? '415605' : '416416');
          setProfileCountry('India');
          setProfileAdditionalInfo('');
        }
      } else {
        // Parent company broadband address
        if (currentUser.deliveryAddress) {
          setProfileAddress(currentUser.deliveryAddress.address || '');
          setProfileCity(currentUser.deliveryAddress.city || '');
          setProfileState(currentUser.deliveryAddress.state || 'Maharashtra');
          setProfilePostcode(currentUser.deliveryAddress.postcode || '');
          setProfileCountry(currentUser.deliveryAddress.country || 'India');
          setProfileAdditionalInfo(currentUser.deliveryAddress.additionalDeliveryInfo || '');
        }
      }
    }
  }, [currentUser, effectiveScope, isChildCompany]);

  // Guard active section: child companies must NOT show broadband, payments, iptv, ott, data usage
  useEffect(() => {
    if (isChildCompany) {
      const allowed: PortalSection[] = ['account_summary', 'my_cart', 'broadband_orders', 'my_profile', 'support_tickets', 'portal_password'];
      if (!allowed.includes(activeSection)) {
        setActiveSection('account_summary');
      }
    }
  }, [isChildCompany, activeSection]);

  // Load Customer Inquiries
  useEffect(() => {
    if (currentUser?.email) {
      setIsLoadingInquiries(true);
      getCustomerEnquiries(currentUser.email)
        .then(res => setInquiries(res))
        .catch(err => console.warn('Failed to load enquiries:', err))
        .finally(() => setIsLoadingInquiries(false));
    }
  }, [currentUser?.email]);

  // ==========================================
  // HANDLERS: LOGIN & REGISTRATION
  // ==========================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailClean = loginEmail.trim().toLowerCase();
    if (!emailClean) {
      setLoginError('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your account password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await loginCustomer(emailClean, loginPassword);
      if (res.success) {
        success('Welcome to Nexalus Portal!', 'You are now signed in to your subscriber portal.');

        let pendingPlan: any = null;
        try {
          const raw = sessionStorage.getItem('nexalus_pending_order_plan');
          if (raw) {
            pendingPlan = JSON.parse(raw);
            sessionStorage.removeItem('nexalus_pending_order_plan');
          }
        } catch {}

        if (pendingPlan) {
          navigate('/', { replace: true });
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('open_plan_order_direct', { detail: pendingPlan })
            );
          }, 350);
        } else {
          // Stay on /account to see the Subscriber Portal
          navigate('/account', { replace: true });
        }
      } else {
        setLoginError(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const fullNameCombined = `${regFirstName.trim()} ${regLastName.trim()}`.trim() || regFullName.trim();
    if (!fullNameCombined) {
      setRegError('Please enter your first and last name.');
      return;
    }
    const emailClean = regEmail.trim().toLowerCase();
    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      setRegError('Please enter a valid email address.');
      return;
    }
    const phoneClean = regPhone.trim();
    if (!phoneClean || phoneClean.length < 10) {
      setRegError('Please enter a valid 10-digit mobile / WhatsApp number.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please verify both fields.');
      return;
    }
    if (!regAddress.trim() || !regCity.trim() || !regPostcode.trim()) {
      setRegError('Please complete your street address, city, and 6-digit PIN code.');
      return;
    }

    setIsRegistering(true);
    try {
      const result = await registerCustomerAccount({
        displayName: fullNameCombined,
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        dateOfBirth: regDob.trim(),
        email: emailClean,
        phone: phoneClean,
        password: regPassword,
        deliveryAddress: {
          address: regAddress.trim(),
          city: regCity.trim(),
          state: regState.trim(),
          postcode: regPostcode.trim(),
          country: regCountry,
          additionalDeliveryInfo: regAdditionalInfo.trim()
        }
      });

      if (result.success) {
        success(
          'Registration Successful!',
          'Your subscriber account has been created. Please sign in with your email and password.'
        );
        setLoginEmail(emailClean);
        setLoginPassword('');
        setRegError(null);
        setAuthMode('login');
      } else {
        setRegError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setRegError(err.message || 'An error occurred during customer registration.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    const emailClean = resetEmail.trim().toLowerCase();
    if (!emailClean) {
      setResetError('Please enter your registered email address.');
      return;
    }

    if (!auth) {
      setResetError('Authentication service is offline. Please try again later.');
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, emailClean);
      setResetSent(true);

      triggerSystemPushNotification('Nexalus Innovations - Password Reset', {
        body: `Password reset instructions sent to ${emailClean}. Click to open your email inbox or check spam.`,
        icon: '/favicon.ico'
      });

      const mailUrl = getEmailProviderUrl(emailClean);
      const mailLabel = getEmailProviderName(emailClean);

      success(
        'Password Reset Notification Dispatched',
        `Instructions sent to ${emailClean}. Check your inbox and spam folder to reset immediately.`,
        {
          duration: 10000,
          action: {
            label: mailLabel,
            url: mailUrl
          }
        }
      );
    } catch (err: any) {
      console.error('Password reset dispatch error:', err);
      let msg = 'Could not dispatch password reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No customer account found with this email address. Please check your spelling or register a new account.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address format is invalid. Please check and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many requests sent. Please wait a few moments before requesting another reset email.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network connection failed. Please check your internet connection.';
      } else if (err.message) {
        msg = err.message;
      }
      setResetError(msg);
    } finally {
      setIsSendingReset(false);
    }
  };

  // ==========================================
  // HANDLERS: LOGGED-IN CUSTOMER PORTAL
  // ==========================================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!profileAddress.trim() || !profileCity.trim() || !profilePostcode.trim()) {
      error('Validation Error', 'Please specify your street address, city, and pincode.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const fullNameCombined = `${profileFirstName.trim()} ${profileLastName.trim()}`.trim();
      const updatedDelivery: CustomerDeliveryAddress = {
        address: profileAddress.trim(),
        city: profileCity.trim(),
        state: profileState.trim(),
        postcode: profilePostcode.trim(),
        country: profileCountry.trim() || 'India',
        additionalDeliveryInfo: profileAdditionalInfo.trim()
      };

      const res = await updateCustomerProfile(currentUser.uid, {
        displayName: fullNameCombined || currentUser.displayName,
        firstName: profileFirstName.trim(),
        lastName: profileLastName.trim(),
        dateOfBirth: profileDob.trim(),
        phone: profilePhone.trim(),
        deliveryAddress: updatedDelivery,
        companyScope: effectiveScope
      });

      if (res) {
        await refreshUserProfile();
        success('Profile Saved', `Your details and address for ${companyMeta.name} have been updated.`);
      } else {
        error('Save Failed', 'Could not update your profile. Please try again.');
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdateInternetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInternetPassword.length < 6) {
      error('Validation Error', 'New Internet password must be at least 6 characters long.');
      return;
    }
    if (newInternetPassword !== confirmInternetPassword) {
      error('Validation Error', 'Passwords do not match. Please verify.');
      return;
    }

    setIsUpdatingInternetPass(true);
    setTimeout(() => {
      setIsUpdatingInternetPass(false);
      setNewInternetPassword('');
      setConfirmInternetPassword('');
      success(
        'Internet Password Updated',
        'Your CPE / Wi-Fi credentials have been updated. Remember to update your ONT WiFi router settings to reconnect.'
      );
    }, 900);
  };

  const handleUpdatePortalPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (portalNewPass.length < 6) {
      error('Validation Error', 'New Portal password must be at least 6 characters.');
      return;
    }
    if (portalNewPass !== portalConfirmPass) {
      error('Validation Error', 'New passwords do not match.');
      return;
    }

    setIsUpdatingPortalPass(true);
    setTimeout(() => {
      setIsUpdatingPortalPass(false);
      setPortalOldPass('');
      setPortalNewPass('');
      setPortalConfirmPass('');
      success('Portal Password Updated', 'Your customer portal login password has been changed.');
    }, 850);
  };

  const handleSendPortalPasswordReset = async () => {
    if (!currentUser?.email) return;
    if (!auth) {
      error('Error', 'Authentication service is offline. Please try again later.');
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email.trim().toLowerCase());
      success('Password Reset Dispatched', 'Instructions sent to ' + currentUser.email + '. Please check your inbox or spam folder.');
    } catch (err: any) {
      error('Reset Failed', err.message || 'Could not send password reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) {
      error('Validation Error', 'Please describe the technical grievance or requirement.');
      return;
    }

    setIsSubmittingTicket(true);
    setTimeout(() => {
      const prefix = effectiveScope === 'am-distributors' ? 'DEPOT' : effectiveScope === 'nexalus-innovations' ? 'CCTV' : 'TKT';
      const newTicketId = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
      const newTicket = {
        id: newTicketId,
        subject: ticketSubject,
        priority: ticketPriority,
        status: 'Open',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        description: ticketDescription.trim()
      };

      setTicketsList(prev => {
        const updated = [newTicket, ...prev];
        try {
          const key = `nexa_tickets_${currentUser?.uid || 'guest'}_${effectiveScope}`;
          localStorage.setItem(key, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setIsSubmittingTicket(false);
      setIsNewTicketModalOpen(false);
      setTicketDescription('');
      success('Ticket Raised Successfully', `Your support ticket #${newTicketId} has been assigned to ${companyMeta.shortName} team.`);
    }, 900);
  };

  const handleRechargeSubmit = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      success('Payment Gateway Redirect', 'Connecting to NTT DATA Secure Payment Gateway for ₹ 470.82...');
    }, 1200);
  };

  const handleLogout = async () => {
    await logout();
    success('Signed Out', 'You have been signed out of your customer account.');
    navigate('/');
  };

  // Open Tax Invoice
  const handleViewInvoice = (receipt: typeof SAMPLE_RECEIPTS[0]) => {
    setSelectedInvoice(receipt);
    setIsInvoiceModalOpen(true);
  };

  // =========================================================================
  // VIEW: UNAUTHENTICATED VISITOR (CUSTOMER PORTAL: LOGIN & REGISTER)
  // =========================================================================
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950/90 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative isolate">
        {/* Subtle Background Architectural Motif */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
          style={{
            backgroundImage: "url('/images/parent-company-hero-banner.jpg')"
          }}
          aria-hidden="true"
        />

        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto animate-in fade-in duration-200 relative z-10">
          {/* Header Banner - Premium Corporate Nexalus Identity */}
          <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50/50 p-6 sm:p-8 pb-4 text-center border-b border-slate-100 relative">
            {/* Company Logo Seal */}
            <div className="flex justify-center mb-3">
              <img
                src={companyMeta.logo}
                alt={companyMeta.name}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover shadow-md border-2 border-slate-200 ring-4 ring-slate-100 bg-white"
              />
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 ${
              effectiveScope === 'am-distributors'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : effectiveScope === 'nexalus-innovations'
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                : 'bg-blue-50 text-[#0b2545] border border-blue-200'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{companyMeta.badge} &bull; ACCOUNT PORTAL</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {authMode === 'login'
                ? (effectiveScope === 'am-distributors' ? 'Wholesale Partner Sign In' : effectiveScope === 'nexalus-innovations' ? 'Client Tech Sign In' : 'Welcome back')
                : (effectiveScope === 'am-distributors' ? 'Wholesale Partner Registration' : effectiveScope === 'nexalus-innovations' ? 'Client Tech Registration' : 'Customer Registration')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed font-medium">
              {authMode === 'login'
                ? companyMeta.portalSub
                : (effectiveScope === 'am-distributors'
                    ? 'Register your retail store or commercial depot for daily milk, water and FMCG supply.'
                    : effectiveScope === 'nexalus-innovations'
                    ? 'Register for commercial 4K AI CCTV surveillance, optical hardware, and AMC service agreements.'
                    : 'Create your account to request broadband, CCTV consultations, and track service requests.')}
            </p>

            {/* Sub Tabs */}
            <div className="flex gap-2 mt-5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#0b2545] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Existing Customer Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setRegError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#0b2545] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Registration</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* VIEW 1: LOGIN */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="customer_login_email"
                      autoComplete="username"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Account Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginEmail);
                        setAuthMode('forgot_password');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-[#0b2545] hover:underline transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      name="customer_login_password"
                      autoComplete="current-password"
                      placeholder="Enter account password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#0b2545] hover:bg-[#071930] active:bg-[#051322] shadow-md shadow-[#0b2545]/20 hover:shadow-lg hover:shadow-[#0b2545]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Footer Security Note */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
                  <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Your information is secure and will only be used to process your service requests.</span>
                </div>
              </form>
            )}

            {/* VIEW 2: REGISTRATION (Matching login.mp4 fields: First Name, Last Name, DOB, etc.) */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      New Customer Registration
                    </h3>
                    <p className="text-xs text-slate-500">
                      Register your fiber broadband account with installation address.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    ← Sign In
                  </button>
                </div>

                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="customer_reg_firstname"
                          autoComplete="given-name"
                          placeholder="e.g. Pranoday"
                          value={regFirstName}
                          onChange={e => {
                            setRegFirstName(e.target.value);
                            setRegFullName(`${e.target.value} ${regLastName}`.trim());
                          }}
                          required
                          className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          name="customer_reg_lastname"
                          autoComplete="family-name"
                          placeholder="e.g. Jadhav"
                          value={regLastName}
                          onChange={e => {
                            setRegLastName(e.target.value);
                            setRegFullName(`${regFirstName} ${e.target.value}`.trim());
                          }}
                          required
                          className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Date of Birth <span className="text-slate-400 font-normal">(DOB)</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          name="customer_reg_dob"
                          value={regDob}
                          onChange={e => setRegDob(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          name="customer_reg_phone"
                          autoComplete="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          value={regPhone}
                          onChange={e => {
                            let digits = e.target.value.replace(/\D/g, '');
                            if (digits.length === 12 && digits.startsWith('91')) {
                              digits = digits.slice(2);
                            } else if (digits.length === 11 && digits.startsWith('0')) {
                              digits = digits.slice(1);
                            }
                            setRegPhone(digits.slice(0, 10));
                          }}
                          required
                          className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="customer_reg_email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        required
                        className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          name="customer_reg_password"
                          autoComplete="new-password"
                          placeholder="At least 6 chars"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          name="customer_reg_confirm_password"
                          autoComplete="new-password"
                          placeholder="Repeat password"
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Installation & Delivery Address */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Installation &amp; Service Address</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Street Address / Flat / Building <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_reg_street"
                      autoComplete="street-address"
                      placeholder="e.g. Flat 302, Sai Residency, Shivaji Nagar"
                      value={regAddress}
                      onChange={e => setRegAddress(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer_reg_city"
                        autoComplete="address-level2"
                        list="maharashtra-city-options"
                        value={regCity}
                        onChange={e => setRegCity(e.target.value)}
                        placeholder="e.g. Chiplun, Sangli"
                        required
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                      <datalist id="maharashtra-city-options">
                        {MAHARASHTRA_CITIES.map(c => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="customer_reg_state"
                        value={regState}
                        onChange={e => setRegState(e.target.value)}
                        className="w-full px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      >
                        {INDIAN_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        6-Digit PIN <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer_reg_pincode"
                        autoComplete="postal-code"
                        placeholder="415605"
                        value={regPostcode}
                        onChange={e => setRegPostcode(e.target.value)}
                        required
                        maxLength={6}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Landmark / Fiber ONT Placement Notes <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="customer_reg_notes"
                      placeholder="e.g. Near Old Bus Stand, 2nd Floor"
                      value={regAdditionalInfo}
                      onChange={e => setRegAdditionalInfo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isRegistering}
                    icon={<UserPlus className="w-4 h-4" />}
                    className="w-full font-bold shadow-md shadow-blue-600/20"
                  >
                    Complete Customer Registration
                  </Button>
                </div>
              </form>
            )}

            {/* VIEW 3: FORGOT PASSWORD */}
            {authMode === 'forgot_password' && (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Reset Account Password
                    </h3>
                    <p className="text-xs text-slate-500">
                      We will send an official Firebase password reset link to your email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </div>

                {resetError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{resetError}</span>
                  </div>
                )}

                {resetSent ? (
                  <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        Password Reset Email Dispatched
                      </h4>
                      <p className="text-xs text-slate-600 max-w-md mx-auto">
                        A secure password reset link has been dispatched to <strong className="text-slate-900 font-bold">{resetEmail}</strong>.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={() => {
                          setLoginEmail(resetEmail);
                          setLoginPassword('');
                          setResetSent(false);
                          setAuthMode('login');
                        }}
                        className="w-full sm:w-auto font-bold shadow-md shadow-blue-600/20"
                      >
                        Return to Sign In
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Registered Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={resetEmail}
                          onChange={e => setResetEmail(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => setAuthMode('login')}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isSendingReset}
                        icon={<Send className="w-4 h-4" />}
                      >
                        Send Reset Link
                      </Button>
                    </div>
                  </>
                )}
              </form>
            )}

            <div className="pt-6 border-t border-slate-100 text-center">
              <Link to="/" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                ← Return to Nexalus Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED ADMIN / STAFF (REDIRECT TO ADMIN CONSOLE)
  // =========================================================================
  if (isAuthenticated && !isCustomer) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/95 rounded-3xl p-8 border border-slate-700 text-center space-y-4 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Nexalus Administrative Console</h2>
            <p className="text-xs text-slate-300 mt-1">
              Logged in as <strong className="text-white">{currentUser?.displayName || currentUser?.email}</strong> (Staff / Admin).
            </p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Staff and Corporate Admins manage operations via the Admin Panel.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/admin"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Go to Admin Panel Console →</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED SUBSCRIBER PORTAL (12 SIDEBAR SECTIONS FROM login.mp4)
  // =========================================================================
  const subscriberName = currentUser.displayName || `${profileFirstName} ${profileLastName}`.trim() || 'Customer Account';
  const scopedProfile = currentUser.companyProfiles?.[effectiveScope];
  const rawScopedId = scopedProfile?.subscriberId;
  const isInvalidChildSub = effectiveScope !== 'nexalus-llp' && (!rawScopedId || rawScopedId.startsWith('SUB-'));
  const scopedCompanyPrefix = effectiveScope === 'am-distributors' ? 'AM-' : effectiveScope === 'nexalus-innovations' ? 'TECH-' : 'SUB-';
  const subscriberId = isInvalidChildSub
    ? (scopedCompanyPrefix + (currentUser.uid ? currentUser.uid.slice(0, 6).toUpperCase() : Math.floor(100000 + Math.random() * 900000)))
    : (rawScopedId || (currentUser.uid ? (scopedCompanyPrefix + currentUser.uid.slice(0, 6).toUpperCase()) : 'CUST-PORTAL'));
  const associatedLco = effectiveScope === 'am-distributors'
    ? 'A.M. Distributors Chiplun'
    : effectiveScope === 'nexalus-innovations'
    ? 'Nexalus Innovations Technical Support Desk'
    : (currentUser.associatedLco || 'Nexalus Innovations LLP_Sangli');
  const planName = currentUser.planName || 'FUP40Mbps-2Mbps 2500GB x10';
  const planFee = currentUser.planFee || '₹ 470.82';
  const subscriptionStatus = currentUser.subscriptionStatus || 'Active';

  const scopedAddressDisplay = (scopedProfile?.deliveryAddress?.address
    ? `${scopedProfile.deliveryAddress.address}, ${scopedProfile.deliveryAddress.city || ''} ${scopedProfile.deliveryAddress.postcode || ''}`
    : (isChildCompany ? '' : (profileAddress ? `${profileAddress}, ${profileCity} ${profilePostcode}` : ''))
  ).trim();

  // Strictly scoped sidebar sections: My Profile is fixed across all three companies
  const sidebarItems: { id: PortalSection; label: string; badge?: number; icon: React.ReactNode }[] = (
    effectiveScope === 'am-distributors'
      ? [
          { id: 'account_summary', label: 'Account Summary', icon: <Package className="w-4 h-4" /> },
          { id: 'my_cart', label: 'My Cart', badge: scopedCartItems.length > 0 ? scopedCartItems.length : undefined, icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'broadband_orders', label: 'My Orders & Challans', badge: scopedCustomerOrders.length > 0 ? scopedCustomerOrders.length : undefined, icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'my_profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
          { id: 'support_tickets', label: 'Support & Inquiries', badge: (scopedInquiries.length + ticketsList.length) > 0 ? (scopedInquiries.length + ticketsList.length) : undefined, icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'portal_password', label: 'Security & Password', icon: <Lock className="w-4 h-4" /> }
        ]
      : effectiveScope === 'nexalus-innovations'
      ? [
          { id: 'account_summary', label: 'Account Summary', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'my_cart', label: 'My Cart', badge: scopedCartItems.length > 0 ? scopedCartItems.length : undefined, icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'broadband_orders', label: 'Hardware Orders', badge: scopedCustomerOrders.length > 0 ? scopedCustomerOrders.length : undefined, icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'my_profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
          { id: 'support_tickets', label: 'Support Tickets', badge: (scopedInquiries.length + ticketsList.length) > 0 ? (scopedInquiries.length + ticketsList.length) : undefined, icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'portal_password', label: 'Security & Password', icon: <Lock className="w-4 h-4" /> }
        ]
      : [
          { id: 'account_summary', label: 'Account Summary', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'broadband_orders', label: 'Broadband Orders & Slips', badge: scopedCustomerOrders.length > 0 ? scopedCustomerOrders.length : undefined, icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'my_cart', label: 'My Cart', badge: scopedCartItems.length > 0 ? scopedCartItems.length : undefined, icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'my_profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
          { id: 'portal_password', label: 'Portal Password Change', icon: <Lock className="w-4 h-4" /> },
          { id: 'payments', label: 'Payments (Recharge)', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'support_tickets', label: 'My Support Tickets', badge: ticketsList.length > 0 ? ticketsList.length : undefined, icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'old_transactions', label: 'Old Transactions', icon: <History className="w-4 h-4" /> },
          { id: 'iptv_pack', label: 'IPTV PACK', icon: <Tv className="w-4 h-4" /> },
          { id: 'ott_recharge', label: 'OTT Recharge', icon: <Film className="w-4 h-4" /> },
          { id: 'offline_appeal', label: 'Offline Appeal', icon: <Scale className="w-4 h-4" /> }
        ]
  );

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16 font-sans">
      {/* Multi-Company Portal Switcher */}
      <div className="bg-white/95 backdrop-blur-xs border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-600 font-bold">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Active Portal:</span>
            <span className="text-slate-900 font-extrabold">{companyMeta.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              to="/account"
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                effectiveScope === 'nexalus-llp'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Nexalus Broadband</span>
            </Link>
            <Link
              to="/brands/nexalus-innovations/account"
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                effectiveScope === 'nexalus-innovations'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Nexalus Innovations</span>
            </Link>
            <Link
              to="/brands/am-distributors/account"
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                effectiveScope === 'am-distributors'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>A.M. Distributors</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Layout: 12-Section Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* SIDEBAR NAVIGATION (Desktop Sticky & Mobile Drawer) */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:shadow-xs lg:sticky lg:top-20 lg:z-10 lg:self-start lg:w-64 lg:rounded-2xl border border-slate-200/90 lg:block transition-transform duration-200 max-h-[calc(100vh-6rem)] overflow-y-auto ${
              isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            {/* Mobile Sidebar Header */}
            <div className="p-4 border-b border-slate-100 flex lg:hidden items-center justify-between bg-slate-900 text-white">
              <span className="font-bold text-xs uppercase tracking-wider text-cyan-400">
                {companyMeta.shortName} Portal Menu
              </span>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subscriber Info Pill */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {effectiveScope === 'am-distributors'
                  ? 'Distributor Partner'
                  : effectiveScope === 'nexalus-innovations'
                  ? 'Enterprise Tech Client'
                  : 'Subscriber Account'}
              </div>
              <div className="font-extrabold text-sm text-slate-900 truncate mt-0.5">
                {subscriberName}
              </div>
              <div className={`text-[11px] font-mono font-bold mt-0.5 ${
                effectiveScope === 'am-distributors'
                  ? 'text-emerald-700'
                  : effectiveScope === 'nexalus-innovations'
                  ? 'text-indigo-700'
                  : 'text-blue-700'
              }`}>
                {effectiveScope === 'nexalus-llp' ? `SUB: ${subscriberId}` : `ID: ${subscriberId}`}
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-1">
                {effectiveScope === 'am-distributors'
                  ? 'A.M. Distributors Chiplun'
                  : effectiveScope === 'nexalus-innovations'
                  ? 'Nexalus Innovations Desk'
                  : associatedLco}
              </div>
            </div>

            {/* 12 Navigation Links */}
            <nav className="p-2 space-y-0.5">
              {sidebarItems.map(item => {
                const isActive = activeSection === item.id;
                const activeColor = effectiveScope === 'am-distributors'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : effectiveScope === 'nexalus-innovations'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-blue-600 text-white shadow-sm';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? activeColor
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Inquiries Pill */}
            {inquiries.length > 0 && (
              <div className="p-3 mx-2 my-2 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span>Past Inquiries</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 text-[10px]">
                    {inquiries.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInquiriesModal(true)}
                  className="mt-2 w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                >
                  View Inquiries →
                </button>
              </div>
            )}
          </aside>

          {/* Backdrop for mobile sidebar */}
          {isMobileSidebarOpen && (
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
            />
          )}

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 w-full space-y-6">
            {/* ------------------------------------------------------------- */}
            {/* 1. ACCOUNT SUMMARY (Scoped by Company) */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'account_summary' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* HERO CARD SCOPED BY COMPANY */}
                {effectiveScope === 'am-distributors' ? (
                  /* A.M. Distributors Chiplun - Real FMCG & Logistics Customer Summary */
                  <div className="bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/50 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/30 border-2 border-white/20">
                          {subscriberName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                              {subscriberName}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                              {scopedCustomerOrders.length > 0 ? 'Verified Partner' : 'Registered Partner'}
                            </span>
                          </div>
                          <p className="text-xs text-teal-300 font-mono mt-0.5">
                            Account ID: <strong className="text-white">{subscriberId}</strong>
                          </p>
                          <p className="text-xs text-slate-200 mt-0.5">
                            Registered Email: <strong className="text-white">{currentUser.email}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to="/brands/am-distributors/products"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/30 transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Wholesale Catalog</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setActiveSection('broadband_orders')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>My Orders &amp; Challans</span>
                        </button>
                      </div>
                    </div>

                    {/* Real Dynamic User Activity Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Total Purchases</span>
                        </div>
                        <div className="text-lg font-extrabold text-white mt-1">
                          {scopedCustomerOrders.length} {scopedCustomerOrders.length === 1 ? 'Order' : 'Orders'}
                        </div>
                        <div className="text-xs text-teal-300 font-medium mt-1">
                          {scopedCustomerOrders.length > 0
                            ? `Latest: ${new Date(scopedCustomerOrders[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                            : 'No purchases made yet'}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Total Purchases Value</span>
                        </div>
                        <div className="text-xl font-black text-emerald-300 mt-1">
                          {formatIndianCurrency(scopedTotalSpend)}
                        </div>
                        <div className="text-[11px] text-slate-200 mt-1">
                          {scopedCustomerOrders.length > 0 ? 'Verified B2B Billing' : '0 B2B Delivery Challans'}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Inquiries &amp; Requests</span>
                        </div>
                        <div className="text-lg font-extrabold text-white mt-1">
                          {scopedInquiries.length + ticketsList.length} Active
                        </div>
                        <div className="text-[11px] text-teal-300 font-semibold mt-1">
                          {scopedInquiries.length + ticketsList.length > 0 ? 'Logged queries on record' : 'No pending queries'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : effectiveScope === 'nexalus-innovations' ? (
                  /* Nexalus Innovations - Real Hardware & Surveillance Customer Summary */
                  <div className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/50 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/30 border-2 border-white/20">
                          {subscriberName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                              {subscriberName}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                              {scopedCustomerOrders.length > 0 ? 'Enterprise Client' : 'Registered Client'}
                            </span>
                          </div>
                          <p className="text-xs text-cyan-300 font-mono mt-0.5">
                            Client ID: <strong className="text-white">{subscriberId}</strong>
                          </p>
                          <p className="text-xs text-slate-200 mt-0.5">
                            Registered Email: <strong className="text-white">{currentUser.email}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to="/brands/nexalus-innovations/products"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs shadow-md shadow-indigo-500/30 transition-all"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Hardware Catalog</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setActiveSection('support_tickets')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Raise Support Ticket</span>
                        </button>
                      </div>
                    </div>

                    {/* Real Dynamic Hardware Activity Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5 text-indigo-300" />
                          <span>Hardware Orders</span>
                        </div>
                        <div className="text-lg font-extrabold text-white mt-1">
                          {scopedCustomerOrders.length} {scopedCustomerOrders.length === 1 ? 'Order' : 'Orders'}
                        </div>
                        <div className="text-xs text-cyan-300 font-medium mt-1">
                          {scopedCustomerOrders.length > 0
                            ? `Latest: ${new Date(scopedCustomerOrders[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                            : 'No hardware orders yet'}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-indigo-300" />
                          <span>Procurement Spend</span>
                        </div>
                        <div className="text-xl font-black text-indigo-300 mt-1">
                          {formatIndianCurrency(scopedTotalSpend)}
                        </div>
                        <div className="text-[11px] text-slate-200 mt-1">
                          {scopedCustomerOrders.length > 0 ? 'GST Invoiced Hardware' : '₹0.00 Total Spent'}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-300" />
                          <span>Service &amp; AMC Tickets</span>
                        </div>
                        <div className="text-lg font-extrabold text-white mt-1">
                          {scopedInquiries.length + ticketsList.length} Active
                        </div>
                        <div className="text-[11px] text-cyan-300 font-semibold mt-1">
                          {scopedInquiries.length + ticketsList.length > 0 ? 'Logged tickets on record' : 'No open tickets'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Nexalus Innovations LLP - Corporate Telecom / Broadband Hero */
                  <div className="bg-gradient-to-br from-[#0c1a3d] via-[#102454] to-[#0a1633] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/50 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/30 border-2 border-white/20">
                          {subscriberName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                              {subscriberName}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                              {subscriptionStatus}
                            </span>
                          </div>
                          <p className="text-xs text-cyan-300 font-mono mt-0.5">
                            Customer ID: <strong className="text-white">{subscriberId}</strong>
                          </p>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Associated LCO: <strong className="text-white">{associatedLco}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setActiveSection('payments')}
                          icon={<CreditCard className="w-3.5 h-3.5" />}
                          className="shadow-md shadow-blue-600/30 font-bold"
                        >
                          Recharge Now
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveSection('broadband_orders')}
                          icon={<Receipt className="w-3.5 h-3.5" />}
                        >
                          View Receipts
                        </Button>
                      </div>
                    </div>

                    {/* 3 Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Current Plan
                        </div>
                        <div className="text-sm font-extrabold text-white mt-1 truncate">
                          {activePlanName}
                        </div>
                        <div className="text-xs text-cyan-300 font-bold mt-1">
                          Tariff: {activePlanFee}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Data Allowance
                        </div>
                        <div className="text-xl font-black text-emerald-400 mt-1">
                          {activeOrder ? 'Truly Unlimited' : 'Unprovisioned'}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          {activeOrder ? `${activeOrder.speed} Commercial Fiber` : 'Book a plan to activate'}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          Billing &amp; Installation
                        </div>
                        <div className="text-base font-extrabold text-white mt-1">
                          {activeOrder ? activeOrder.billingPeriod : 'Not Subscribed'}
                        </div>
                        <div className="text-[11px] text-cyan-300 font-semibold mt-1">
                          {activeOrder ? (activeOrder.paymentStatus === 'paid' ? 'Payment Verified' : 'Pay on Installation (COD)') : 'Self-Serve Portal'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Details Table (Scoped by Company) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        {effectiveScope === 'am-distributors'
                          ? 'Wholesale Partner Profile & Logistics Parameters'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'Commercial Client Infrastructure & Site Profile'
                          : 'Subscriber Profile & Connection Metadata'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {effectiveScope === 'am-distributors'
                          ? 'A.M. Distributors Chiplun authenticated partner credentials & delivery address.'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'Nexalus Innovations enterprise hardware client profile & installation premises.'
                          : 'RailWire / Nexalus Broadband authenticated network parameters.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('my_profile')}
                      className={`text-xs font-bold ${
                        effectiveScope === 'am-distributors'
                          ? 'text-emerald-700 hover:text-emerald-900'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'text-indigo-700 hover:text-indigo-900'
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      Edit Profile →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">{effectiveScope === 'am-distributors' ? 'Partner / Business Name:' : effectiveScope === 'nexalus-innovations' ? 'Client / Business Name:' : 'Subscriber Name:'}</span>
                      <strong className="text-slate-900 font-bold">{subscriberName}</strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Account ID:</span>
                      <strong className="text-blue-700 font-mono font-bold">{subscriberId}</strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Registered Email:</span>
                      <strong className="text-slate-900 font-bold truncate max-w-[200px]">{currentUser.email}</strong>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Contact Mobile:</span>
                      <strong className="text-slate-900 font-bold">{currentUser.phone || profilePhone || '+91 9158886444'}</strong>
                    </div>

                    {effectiveScope === 'am-distributors' ? (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Depot Delivery Address:</span>
                          <strong className="text-slate-900 font-bold truncate max-w-[200px]" title={scopedAddressDisplay}>
                            {scopedAddressDisplay || 'Not set (Click Edit Profile)'}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Delivery City &amp; PIN:</span>
                          <strong className="text-slate-900 font-bold">
                            {scopedProfile?.deliveryAddress?.city ? `${scopedProfile.deliveryAddress.city} - ${scopedProfile.deliveryAddress.postcode || '415605'}` : (profileCity ? `${profileCity} - ${profilePostcode}` : 'Chiplun - 415605')}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Account Status:</span>
                          <strong className="text-emerald-700 font-bold">
                            {scopedCustomerOrders.length > 0 ? 'Active Commercial Buyer' : 'Registered Partner'}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Purchases On Record:</span>
                          <strong className="text-slate-900 font-bold">
                            {scopedCustomerOrders.length > 0 ? `${scopedCustomerOrders.length} wholesale order(s)` : '0 orders placed'}
                          </strong>
                        </div>
                      </>
                    ) : effectiveScope === 'nexalus-innovations' ? (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Installation Site Address:</span>
                          <strong className="text-slate-900 font-bold truncate max-w-[200px]" title={scopedAddressDisplay}>
                            {scopedAddressDisplay || 'Not set (Click Edit Profile)'}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Site City &amp; PIN:</span>
                          <strong className="text-slate-900 font-bold">
                            {scopedProfile?.deliveryAddress?.city ? `${scopedProfile.deliveryAddress.city} - ${scopedProfile.deliveryAddress.postcode || '416416'}` : (profileCity ? `${profileCity} - ${profilePostcode}` : 'Sangli - 416416')}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Client Account Status:</span>
                          <strong className="text-indigo-700 font-bold">
                            {scopedCustomerOrders.length > 0 ? 'Enterprise Client' : 'Registered Tech Account'}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Hardware Procured:</span>
                          <strong className="text-slate-900 font-bold">
                            {scopedCustomerOrders.length > 0 ? `${scopedCustomerOrders.length} order(s) on record` : '0 hardware orders'}
                          </strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Installation Address:</span>
                          <strong className="text-slate-900 font-bold truncate max-w-[200px]">
                            {profileAddress ? `${profileAddress}, ${profileCity}` : 'Sangli, Maharashtra'}
                          </strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Broadband Status:</span>
                          <strong className="text-slate-900 font-bold">{activePlanStatus}</strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Term Plan Validity:</span>
                          <strong className="text-slate-900 font-bold">1 Month (30 Days)</strong>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Fiber Speed Tier:</span>
                          <strong className="text-slate-900 font-bold">{activePlanSpeed}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Quick Action Grid Scoped by Company */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveSection('broadband_orders')}
                      className={`p-3.5 rounded-2xl border text-left transition-colors cursor-pointer ${
                        effectiveScope === 'am-distributors'
                          ? 'bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'bg-indigo-50/80 hover:bg-indigo-100 border-indigo-200'
                          : 'bg-blue-50/80 hover:bg-blue-100 border-blue-200'
                      }`}
                    >
                      {effectiveScope === 'am-distributors' ? (
                        <>
                          <ShoppingBag className="w-5 h-5 text-emerald-600 mb-1.5" />
                          <div className="font-bold text-xs text-emerald-950">Wholesale Orders</div>
                          <div className="text-[10px] text-emerald-700 mt-0.5">Depot Challans</div>
                        </>
                      ) : effectiveScope === 'nexalus-innovations' ? (
                        <>
                          <ShoppingCart className="w-5 h-5 text-indigo-600 mb-1.5" />
                          <div className="font-bold text-xs text-indigo-950">Hardware Orders</div>
                          <div className="text-[10px] text-indigo-700 mt-0.5">CCTV Equipment</div>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 text-blue-600 mb-1.5" />
                          <div className="font-bold text-xs text-blue-950">Broadband Orders</div>
                          <div className="text-[10px] text-blue-700 mt-0.5">Booking Slips</div>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('my_profile')}
                      className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
                    >
                      <MapPin className="w-5 h-5 text-slate-600 mb-1.5" />
                      <div className="font-bold text-xs text-slate-900">
                        {effectiveScope === 'am-distributors' ? 'Depot Address' : effectiveScope === 'nexalus-innovations' ? 'Site Location' : 'Service Address'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Delivery Details</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('portal_password')}
                      className="p-3.5 rounded-2xl bg-cyan-50/80 hover:bg-cyan-100 border border-cyan-200 text-left transition-colors cursor-pointer"
                    >
                      <Lock className="w-5 h-5 text-indigo-600 mb-1.5" />
                      <div className="font-bold text-xs text-indigo-950">Security &amp; Pass</div>
                      <div className="text-[10px] text-indigo-700 mt-0.5">Reset Password</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('support_tickets')}
                      className="p-3.5 rounded-2xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-left transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-5 h-5 text-purple-600 mb-1.5" />
                      <div className="font-bold text-xs text-purple-950">
                        {effectiveScope === 'am-distributors' ? 'Route Inquiries' : effectiveScope === 'nexalus-innovations' ? 'AMC Support Desk' : 'Support Desk'}
                      </div>
                      <div className="text-[10px] text-purple-700 mt-0.5">Raise Ticket</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ORDERS & CHALLANS (Scoped by Company) */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'broadband_orders' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      {effectiveScope === 'am-distributors'
                        ? 'Wholesale Supply Orders & Delivery Challans'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'Hardware & CCTV Equipment Orders'
                        : 'My Broadband Plan Orders'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {effectiveScope === 'am-distributors'
                        ? 'Official B2B delivery challans and wholesale supply bookings with A.M. Distributors Chiplun.'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'Hardware procurement, optical networking switches, and surveillance invoices.'
                        : 'Track broadband reservations, technician scheduling, and download official Booking Slips.'}
                    </p>
                  </div>
                  <Link
                    to={companyMeta.productsUrl}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto ${
                      effectiveScope === 'am-distributors'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{effectiveScope === 'am-distributors' ? 'Browse Catalog' : effectiveScope === 'nexalus-innovations' ? 'Browse Hardware' : 'Browse Plans'}</span>
                  </Link>
                </div>

                {scopedCustomerOrders.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                      effectiveScope === 'am-distributors'
                        ? 'bg-emerald-100 text-emerald-600'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {effectiveScope === 'am-distributors' ? (
                        <Package className="w-6 h-6" />
                      ) : effectiveScope === 'nexalus-innovations' ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : (
                        <ShoppingCart className="w-6 h-6" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {effectiveScope === 'am-distributors'
                          ? 'No Wholesale Orders on Record'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'No Hardware Orders on Record'
                          : 'No Broadband Orders Yet'}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {effectiveScope === 'am-distributors'
                          ? 'You have not placed any wholesale depot bookings yet. Book daily milk crates, mineral water jars, or ice creams.'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'You have not placed any equipment orders yet. Browse our commercial CCTV cameras, optical switches, and NVRs.'
                          : 'You have not placed any broadband plan bookings yet. Choose high-speed optical fiber from Airtel, BSNL, or RailWire.'}
                      </p>
                    </div>
                    <Link
                      to={companyMeta.productsUrl}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-colors ${
                        effectiveScope === 'am-distributors'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <span>
                        {effectiveScope === 'am-distributors'
                          ? 'Explore Wholesale Catalog →'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'Explore Hardware Catalog →'
                          : 'Explore Broadband Plans →'}
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-3 px-4">
                            {effectiveScope === 'am-distributors' ? 'Challan ID & Date' : 'Order ID & Date'}
                          </th>
                          <th className="py-3 px-4">
                            {effectiveScope === 'am-distributors' ? 'Product / Supplies' : effectiveScope === 'nexalus-innovations' ? 'Hardware Item' : 'Package & Speed'}
                          </th>
                          <th className="py-3 px-4">
                            {effectiveScope === 'am-distributors' ? 'Amount' : 'Tariff'}
                          </th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Official Documents</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {scopedCustomerOrders.map((order: PlanOrder) => (
                          <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="text-xs font-bold text-slate-800 block">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {order.id.slice(0, 14)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">
                                {order.providerName ? `${order.providerName} - ${order.planName}` : order.planName}
                              </div>
                              <div className="text-[10px] text-blue-600 font-semibold">
                                {order.speed ? `${order.speed} Symmetrical • ` : ''}{(order.billingPeriod || 'Standard Delivery').replace(/_/g, ' ')}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                              {formatIndianCurrency(order.price)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {order.paymentStatus === 'paid' ? 'Paid & Verified' : 'Payment Pending'}
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5 uppercase font-medium">
                                {(order.paymentMethod || 'Online').replace(/_/g, ' ')}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                                {(order.status || 'pending').replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                              {order.paymentStatus === 'paid' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openDocModal(order, 'paid_receipt')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                                    title="View & Download Official Paid Receipt"
                                  >
                                    <Receipt className="w-3.5 h-3.5 text-white" />
                                    <span>Paid Receipt</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openDocModal(order, 'booking_slip')}
                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-300 transition-colors cursor-pointer"
                                    title="View Booking Slip"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Slip</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openDocModal(order, 'booking_slip')}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                                  title="Download Official Booking Confirmation Slip"
                                >
                                  <FileText className="w-3.5 h-3.5 text-white" />
                                  <span>Booking Slip</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 2. MY PROFILE */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'my_profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {effectiveScope === 'am-distributors'
                      ? 'Wholesale Partner Profile & Depot Delivery Address'
                      : effectiveScope === 'nexalus-innovations'
                      ? 'Client Tech Profile & Installation Site Address'
                      : 'Subscriber Profile & KYC Address'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {effectiveScope === 'am-distributors'
                      ? 'Update your wholesale trade contact details, authorized representative, and Chiplun depot delivery address.'
                      : effectiveScope === 'nexalus-innovations'
                      ? 'Update your enterprise contact details, site manager, and CCTV / hardware installation premises.'
                      : 'Update your personal registration fields, contact numbers, and installation address.'}
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileFirstName}
                        onChange={e => setProfileFirstName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileLastName}
                        onChange={e => setProfileLastName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Date of Birth <span className="text-slate-400 font-normal">(DOB)</span>
                      </label>
                      <input
                        type="date"
                        value={profileDob}
                        onChange={e => setProfileDob(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Primary Mobile / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={profilePhone}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setProfilePhone(digits.slice(0, 10));
                        }}
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Email address is linked to your Firebase security authentication.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                      <MapPin className={`w-4 h-4 ${
                        effectiveScope === 'am-distributors'
                          ? 'text-emerald-600'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'text-indigo-600'
                          : 'text-blue-600'
                      }`} />
                      <span>
                        {effectiveScope === 'am-distributors'
                          ? 'Depot / Retail Delivery Location (Chiplun & Konkan Belt)'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'Surveillance Installation & Hardware Site Address'
                          : 'Service & Installation Address'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Street Address / Premise / Building <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={e => setProfileAddress(e.target.value)}
                        placeholder="e.g. Flat 302, Sai Residency, Ring Road"
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          City / Town <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileCity}
                          onChange={e => setProfileCity(e.target.value)}
                          list="profile-city-list"
                          required
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                        <datalist id="profile-city-list">
                          {MAHARASHTRA_CITIES.map(c => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          State
                        </label>
                        <select
                          value={profileState}
                          onChange={e => setProfileState(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        >
                          {INDIAN_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          PIN Code <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profilePostcode}
                          onChange={e => setProfilePostcode(e.target.value)}
                          maxLength={6}
                          required
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Landmark / ONT Notes
                      </label>
                      <input
                        type="text"
                        value={profileAdditionalInfo}
                        onChange={e => setProfileAdditionalInfo(e.target.value)}
                        placeholder="e.g. Near Government Hospital, 2nd Floor"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSavingProfile}
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save Profile &amp; Address Details
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 3. PORTAL PASSWORD CHANGE */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'portal_password' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-2xl space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Portal Account Security
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your credentials for signing in to the Nexalus Subscriber Portal.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center gap-2.5 text-blue-950 font-bold text-xs">
                    <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Firebase Authentication Security Flow</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your portal account is securely managed by Firebase Authentication. To change or reset your password, an encrypted password reset link will be sent to your verified registered email address:
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-blue-200 font-mono text-xs font-bold text-blue-800">
                    {currentUser.email}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[11px] text-slate-400">
                    Click below to dispatch an official password-reset instructions email.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    isLoading={isSendingReset}
                    onClick={handleSendPortalPasswordReset}
                    icon={<Send className="w-4 h-4" />}
                    className="font-bold shadow-md shadow-blue-600/20 shrink-0 w-full sm:w-auto"
                  >
                    Send Password Reset Email
                  </Button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 4. INTERNET PASSWORD CHANGE (With exact Warning from login.mp4) */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'internet_password' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-2xl space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Internet Password Change (CPE / ONT WiFi)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Change your optical broadband PPPoE connection credentials.
                  </p>
                </div>

                {/* EXACT WARNING NOTICE FROM VIDEO */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed space-y-1">
                    <strong className="font-extrabold text-amber-950 block">
                      Important Disconnection Notice:
                    </strong>
                    <p>
                      If password is changed, your internet connection will be disconnected. Make necessary changes in your CPE (With WiFi router-ONT/ONU) by updating new password for reconnection.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateInternetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      PPPoE Broadband Username
                    </label>
                    <input
                      type="text"
                      value={currentUser.email}
                      disabled
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        New Internet Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type={showInternetPassword ? 'text' : 'password'}
                        value={newInternetPassword}
                        onChange={e => setNewInternetPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm New Internet Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type={showInternetPassword ? 'text' : 'password'}
                        value={confirmInternetPassword}
                        onChange={e => setConfirmInternetPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Re-type new password"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-cpe-pass"
                      checked={showInternetPassword}
                      onChange={e => setShowInternetPassword(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <label htmlFor="show-cpe-pass" className="text-xs text-slate-600 cursor-pointer">
                      Show password characters
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isUpdatingInternetPass}
                      icon={<Wifi className="w-4 h-4" />}
                      className="shadow-md shadow-blue-600/20 font-bold"
                    >
                      Update CPE Internet Password
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 5. PAYMENTS (RECHARGE) */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'payments' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-2xl space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Payments (Recharge Active Subscription)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Instantly renew your optical fiber broadband connection via secure online payment gateways.
                  </p>
                </div>

                {/* Plan Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-300">
                        Renewal Plan
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-0.5">
                        {planName}
                      </h3>
                    </div>
                    <span className="text-xl font-black text-cyan-300">
                      ₹ 470.82
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-400 block">Base Value:</span>
                      <strong className="text-white">₹ 399.00</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">CGST + SGST (18%):</span>
                      <strong className="text-white">₹ 71.82</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Validity:</span>
                      <strong className="text-white">30 Days</strong>
                    </div>
                  </div>
                </div>

                {/* Secure Payment Gateway Checkout */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Direct Online Payment Gateway (Razorpay Verified Flow)</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Online digital payment gateway processing is undergoing authorized serverless verification. For instant activation and renewals, Cash on Delivery / Pay to Field Technician is fully active.
                  </p>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Online card/UPI gateway checkout is in scheduled maintenance mode. No charges will be processed online.</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Total Payable: <strong className="text-slate-900 text-sm">₹ 470.82</strong>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled
                    icon={<CreditCard className="w-4 h-4" />}
                    className="font-bold opacity-60 cursor-not-allowed"
                  >
                    Online Gateway (Maintenance Mode)
                  </Button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 6. MY CART (Company-Scoped Supplies, Hardware & Plans Cart) */}
            {activeSection === 'my_cart' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <ShoppingCart className={`w-5 h-5 ${
                        effectiveScope === 'am-distributors'
                          ? 'text-teal-600'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'text-indigo-600'
                          : 'text-blue-600'
                      }`} />
                      <span>
                        {effectiveScope === 'am-distributors'
                          ? 'A.M. Distributors Procurement Cart'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'Nexalus Innovations Hardware Cart'
                          : 'My Broadband & Products Cart'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {effectiveScope === 'am-distributors'
                        ? 'Wholesale dairy, beverage, and confectionery stock saved in your cart ready for dispatch.'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'Commercial hardware, CCTV surveillance systems, and networking equipment saved in your cart.'
                        : 'Broadband subscriptions or equipment saved in your cart ready for reservation and physical installation.'}
                    </p>
                  </div>

                  {scopedCartItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        scopedCartItems.forEach(i => removeFromPlanCart(i.id));
                        success('Cart Cleared', 'All items have been removed from your cart.');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      Clear All Items
                    </button>
                  )}
                </div>

                {scopedCartItems.length === 0 ? (
                  <div className="p-12 text-center space-y-4 max-w-md mx-auto">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-inner ${
                      effectiveScope === 'am-distributors'
                        ? 'bg-teal-50 text-teal-600'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800">
                        {effectiveScope === 'am-distributors'
                          ? 'Your Wholesale Cart is Currently Empty'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'Your Hardware Cart is Currently Empty'
                          : 'Your Cart is Currently Empty'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {effectiveScope === 'am-distributors'
                          ? 'Explore our wholesale supply catalog and add dairy, beverages, or grocery products to your order.'
                          : effectiveScope === 'nexalus-innovations'
                          ? 'Explore our commercial hardware catalog and add technical infrastructure products to your cart.'
                          : 'Explore our high-speed optical fiber broadband packages or commercial hardware catalog and add plans to your cart.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      {effectiveScope === 'am-distributors' ? (
                        <>
                          <Link to="/brands/am-distributors/products">
                            <Button variant="primary" size="sm" icon={<Package className="w-4 h-4" />}>
                              Browse Wholesale Catalog
                            </Button>
                          </Link>
                          <Link to="/brands/am-distributors">
                            <Button variant="outline" size="sm" icon={<Building className="w-4 h-4" />}>
                              Depot Overview
                            </Button>
                          </Link>
                        </>
                      ) : effectiveScope === 'nexalus-innovations' ? (
                        <>
                          <Link to="/brands/nexalus-innovations/products">
                            <Button variant="primary" size="sm" icon={<Package className="w-4 h-4" />}>
                              Hardware Catalog
                            </Button>
                          </Link>
                          <Link to="/brands/nexalus-innovations">
                            <Button variant="outline" size="sm" icon={<ShieldCheck className="w-4 h-4" />}>
                              Innovations Home
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/plans">
                            <Button variant="primary" size="sm" icon={<Wifi className="w-4 h-4" />}>
                              Browse Plans &amp; Pricing
                            </Button>
                          </Link>
                          <Link to="/products">
                            <Button variant="outline" size="sm" icon={<Package className="w-4 h-4" />}>
                              Hardware Catalog
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items List */}
                    <div className="space-y-3">
                      {scopedCartItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-5 rounded-2xl bg-slate-50 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs ${
                            effectiveScope === 'am-distributors'
                              ? 'border-teal-200/80 hover:border-teal-400'
                              : effectiveScope === 'nexalus-innovations'
                              ? 'border-indigo-200/80 hover:border-indigo-400'
                              : 'border-slate-200/90 hover:border-blue-300'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                effectiveScope === 'am-distributors'
                                  ? 'bg-teal-100 text-teal-800 border-teal-200'
                                  : effectiveScope === 'nexalus-innovations'
                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                  : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}>
                                {item.providerName || (
                                  effectiveScope === 'am-distributors'
                                    ? 'A.M. Distributors Chiplun'
                                    : effectiveScope === 'nexalus-innovations'
                                    ? 'Nexalus Innovations'
                                    : 'High-Speed Broadband'
                                )}
                              </span>
                              <span className="text-xs font-black text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                {item.speed}
                              </span>
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-900">{item.planName}</h4>
                            <p className="text-xs text-slate-500 capitalize">
                              {effectiveScope === 'am-distributors'
                                ? `Order Type: Standard Wholesale Supply • Cold-Chain Verified`
                                : effectiveScope === 'nexalus-innovations'
                                ? `Category: Commercial Hardware & Systems • Warranty Included`
                                : `Billing Cycle: ${(item.billingPeriod || 'monthly').replace(/_/g, ' ')} • Line Feasibility: Verified`}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 sm:self-center w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                            {/* Quantity Stepper */}
                            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  const q = (item.quantity || 1) - 1;
                                  if (q <= 0) {
                                    removeFromPlanCart(item.id);
                                    success('Item Removed', `${item.planName} removed from cart.`);
                                  } else {
                                    updateCartItemQuantity(item.id, q);
                                  }
                                }}
                                title="Decrease Quantity"
                                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-black text-xs text-slate-800">
                                {item.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  updateCartItemQuantity(item.id, (item.quantity || 1) + 1);
                                }}
                                title="Increase Quantity"
                                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">
                                {item.quantity && item.quantity > 1 ? `Total (${item.quantity} units)` : (effectiveScope === 'am-distributors' ? 'Procurement Price' : 'Price / Rate')}
                              </span>
                              <span className="text-lg font-black text-slate-900 font-mono">
                                {formatIndianCurrency(item.price)}
                              </span>
                              {item.quantity && item.quantity > 1 && item.unitPrice ? (
                                <span className="text-[10px] text-slate-400 block font-semibold">
                                  {formatIndianCurrency(item.unitPrice)} each
                                </span>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => setOrderPlanModalItem(item)}
                                className={`font-bold text-xs shadow-md ${
                                  effectiveScope === 'am-distributors'
                                    ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20'
                                    : effectiveScope === 'nexalus-innovations'
                                    ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-700/20'
                                    : 'shadow-blue-600/20'
                                }`}
                              >
                                {effectiveScope === 'am-distributors' ? 'Order Supply' : effectiveScope === 'nexalus-innovations' ? 'Procure Item' : 'Subscribe Now'}
                              </Button>

                              <button
                                type="button"
                                onClick={() => {
                                  removeFromPlanCart(item.id);
                                  success('Item Removed', `${item.planName} removed from cart.`);
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Remove from Cart"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Card */}
                    <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      effectiveScope === 'am-distributors'
                        ? 'bg-teal-50/60 border-teal-200/80'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'bg-indigo-50/60 border-indigo-200/80'
                        : 'bg-blue-50/60 border-blue-200/80'
                    }`}>
                      <div className="text-xs text-slate-600 space-y-0.5 text-center sm:text-left">
                        <div>
                          {effectiveScope === 'am-distributors'
                            ? <>Depot Dispatch &amp; Cold-Chain Warehousing: <strong className="text-emerald-700">Verified Ready</strong></>
                            : effectiveScope === 'nexalus-innovations'
                            ? <>Hardware Inspection &amp; Installation: <strong className="text-emerald-700">Enterprise Support Included</strong></>
                            : <>Standard Optical Drop Line &amp; ONU Setup: <strong className="text-emerald-700">Free / Included</strong></>}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {effectiveScope === 'am-distributors'
                            ? `Total ${scopedCartItems.length} product(s) in cart. Wholesale Delivery Challan issued on dispatch.`
                            : effectiveScope === 'nexalus-innovations'
                            ? `Total ${scopedCartItems.length} item(s) in cart. Official tax invoice generated with order confirmation.`
                            : `Total ${scopedCartItems.length} plan(s) in cart. COD payment collected on physical installation.`}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link to={
                          effectiveScope === 'am-distributors'
                            ? '/brands/am-distributors/products'
                            : effectiveScope === 'nexalus-innovations'
                            ? '/brands/nexalus-innovations/products'
                            : '/plans'
                        }>
                          <Button variant="outline" size="sm">
                            {effectiveScope === 'am-distributors' ? 'Add More Supplies' : effectiveScope === 'nexalus-innovations' ? 'Add More Hardware' : 'Add Another Plan'}
                          </Button>
                        </Link>
                        {scopedCartItems.length > 0 && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setOrderPlanModalItem(scopedCartItems[0])}
                            icon={<Zap className="w-4 h-4" />}
                            className={`font-bold shadow-md ${
                              effectiveScope === 'am-distributors'
                                ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/30'
                                : effectiveScope === 'nexalus-innovations'
                                ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-700/30'
                                : 'shadow-blue-600/30'
                            }`}
                          >
                            Proceed with Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. MY DATA USAGE */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'data_usage' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    My Data Usage (FUP &amp; Session Logs)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track broadband data consumed across daily PPPoE sessions.
                  </p>
                </div>

                {/* Broadband Telemetry Notice */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Optical Fiber Telemetry &amp; Session Synchronisation</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
                    Nexalus Innovations broadband connections deliver <strong>Truly Unlimited</strong> optical fiber bandwidth. Live session metering and RADIUS authentication logs synchronize automatically with our physical OLT and LCO junction upon active line installation.
                  </p>
                </div>


                {/* Progress bar visual */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Package Data: 2,500 GB</span>
                    <span className="text-blue-700">Remaining: 2,359.8 GB (94.4%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full w-[5.6%]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Consumed This Month: <strong>140.2 GB</strong></span>
                    <span>Profile: <strong>FU40960_2048</strong></span>
                  </div>
                </div>

                {/* Session Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Recent Session Usage Logs:
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Assigned IP</th>
                          <th className="py-2.5 px-3">Download (MB)</th>
                          <th className="py-2.5 px-3">Upload (MB)</th>
                          <th className="py-2.5 px-3">Total Consumed</th>
                          <th className="py-2.5 px-3">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {SAMPLE_USAGE_SESSIONS.map((sess, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{sess.date}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{sess.ip}</td>
                            <td className="py-2.5 px-3 text-slate-700">{sess.downloadMb.toLocaleString()} MB</td>
                            <td className="py-2.5 px-3 text-slate-700">{sess.uploadMb.toLocaleString()} MB</td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">{sess.totalGb}</td>
                            <td className="py-2.5 px-3 text-slate-500">{sess.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 8. MY SUPPORT TICKETS (22 Categories Modal from login.mp4) */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'support_tickets' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      {effectiveScope === 'am-distributors'
                        ? 'Wholesale & Route Inquiries'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'AMC Maintenance & Technical Service Tickets'
                        : 'My Support Tickets & Grievances'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {effectiveScope === 'am-distributors'
                        ? 'Log delivery schedule inquiries, cold-chain freezer issues, and daily distribution requests.'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'Request on-site technician visits, report CCTV camera faults, and manage your AMC SLA.'
                        : 'Raise technical assistance tickets directly with your Nexalus LCO.'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setIsNewTicketModalOpen(true)}
                    icon={<HelpCircle className="w-4 h-4" />}
                    className={`font-bold shadow-md ${
                      effectiveScope === 'am-distributors'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        : effectiveScope === 'nexalus-innovations'
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                        : 'shadow-blue-600/20'
                    }`}
                  >
                    {effectiveScope === 'am-distributors'
                      ? 'Raise Route Inquiry'
                      : effectiveScope === 'nexalus-innovations'
                      ? 'Raise AMC Ticket'
                      : 'Create New Ticket'}
                  </Button>
                </div>

                {/* Tickets List */}
                <div className="space-y-3">
                  {ticketsList.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 text-sm">
                          No Support Tickets On Record
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          You do not have any open or resolved tickets. Need technical support or have a query? Click the button above to log a ticket.
                        </p>
                      </div>
                    </div>
                  ) : (
                    ticketsList.map(tkt => (
                    <div
                      key={tkt.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-lg">
                            {tkt.id}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{tkt.subject}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            tkt.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tkt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{tkt.description}</p>
                      <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                        <span>Logged: {tkt.date}</span>
                        <span className="uppercase font-bold text-slate-500">Priority: {tkt.priority}</span>
                      </div>
                    </div>
                  )))}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 9. OLD TRANSACTIONS */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'old_transactions' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Old Transactions &amp; Billing Ledger
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Complete historical log of payment transactions processed through the portal.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Date &amp; Time</th>
                        <th className="py-3 px-4">Gateway Reference</th>
                        <th className="py-3 px-4">Pack Name</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {SAMPLE_TRANSACTIONS.map(txn => (
                        <tr key={txn.txnId} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{txn.txnId}</td>
                          <td className="py-3 px-4 text-slate-600">{txn.date}</td>
                          <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{txn.gatewayRef}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">{txn.pack}</td>
                          <td className="py-3 px-4 font-black text-slate-900">{txn.amount}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 10. IPTV PACK */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'iptv_pack' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    IPTV PACK (Fiber Set-Top Box Entertainment)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live HD television channels delivered over high-speed optical broadband.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-300">
                        Active Connection
                      </span>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        Nexalus HD IPTV Entertainment Plus
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    Enjoy 350+ Full HD live channels including Star, Sony, Zee, Colors, Sports, News, and Marathi Regional broadcasts without satellite dish antenna.
                  </p>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => success('IPTV Channel Refresh', 'Signal re-sync dispatched to your STB router.')}
                    >
                      Re-Sync STB Signal
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => success('2nd STB Request', 'A technician survey has been requested for additional TV set.')}
                    >
                      Request 2nd STB Box
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 11. OTT RECHARGE */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'ott_recharge' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    OTT Recharge &amp; Streaming Bundles
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Premium OTT subscriptions bundled directly with your optical broadband account.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Umang Pack */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50 to-white border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-slate-900">Umang OTT Pack</h3>
                      <span className="text-base font-black text-amber-700">₹ 149 / mo</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Popular family entertainment pack with 4 premium OTT subscriptions.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-blue-900 text-white font-bold text-[10px]">Hotstar</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-900 text-white font-bold text-[10px]">SonyLIV</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-900 text-white font-bold text-[10px]">Zee5</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-900 text-white font-bold text-[10px]">Voot</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setOttModalPack({ name: 'Umang OTT Pack', price: 149, services: ['Hotstar', 'SonyLIV', 'Zee5', 'Voot'] })}
                      className="w-full font-bold"
                    >
                      Subscribe Umang Pack
                    </Button>
                  </div>

                  {/* Tarang Pack */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-cyan-50 to-white border border-cyan-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-slate-900">Tarang OTT Pack</h3>
                      <span className="text-base font-black text-cyan-700">₹ 249 / mo</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Complete blockbuster bundle including Amazon Prime Video and sports streaming.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-sky-900 text-white font-bold text-[10px]">Prime Video</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-900 text-white font-bold text-[10px]">Hotstar</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-900 text-white font-bold text-[10px]">SonyLIV</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-900 text-white font-bold text-[10px]">Zee5</span>
                      <span className="px-2 py-0.5 rounded-md bg-teal-900 text-white font-bold text-[10px]">SunNXT</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setOttModalPack({ name: 'Tarang OTT Pack', price: 249, services: ['Prime Video', 'Hotstar', 'SonyLIV', 'Zee5', 'SunNXT'] })}
                      className="w-full font-bold"
                    >
                      Subscribe Tarang Pack
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 12. OFFLINE APPEAL (Grievance Redressal as per video) */}
            {/* ------------------------------------------------------------- */}
            {activeSection === 'offline_appeal' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Offline Appeal &amp; Appellate Grievance Redressal
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Appellate Authority escalation process as mandated by telecom regulations.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs text-slate-700 leading-relaxed">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Telecom Appellate Authority Details — Maharashtra Circle
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Appellate Authority:</span>
                      <strong className="text-slate-900 font-bold">Nexalus Appellate Redressal Cell</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Associated LCO Circle:</span>
                      <strong className="text-slate-900 font-bold">{associatedLco}</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Email:</span>
                      <strong className="text-blue-700 font-bold">appellate@nexalusinnovations.com</strong>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Helpline &amp; Office Hours:</span>
                      <strong className="text-slate-900 font-bold">+91 9158886444 (10 AM - 6 PM)</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <strong className="font-bold text-slate-900 block mb-1">
                      Filing Procedure:
                    </strong>
                    <p>
                      Subscribers who are dissatisfied with the resolution provided by our Level-1 Customer Support Ticket desk or whose complaint has not been addressed within 3 to 7 working days may file a written appeal before the Appellate Authority within 30 days of ticket closure.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: PAYMENT RECEIPT (Exact view from login.mp4) */}
      {/* ===================================================================== */}
      {isInvoiceModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            {/* Invoice Top Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black">
                  <Wifi className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    TAX INVOICE-CUM-RECEIPT
                  </h3>
                  <span className="text-xs font-mono text-blue-700 font-bold">
                    {selectedInvoice.invoiceNo}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Provider & Customer Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Service Provider (LCO)
                </span>
                <strong className="text-slate-900 block font-extrabold">{associatedLco}</strong>
                <p className="text-slate-500">CIN/LLPIN: <strong className="text-slate-800">Registered Enterprise</strong></p>
                <p className="text-slate-500">State: Maharashtra (Code: 27)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Subscriber Details
                </span>
                <strong className="text-slate-900 block font-extrabold">{subscriberName}</strong>
                <p className="text-slate-500 font-mono">Subscriber ID: {subscriberId}</p>
                <p className="text-slate-500">Address: {currentUser.deliveryAddress?.address || profileAddress || 'Chiplun, Maharashtra'}</p>
              </div>
            </div>

            {/* Tax Breakdown Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">SAC</th>
                    <th className="p-3">Description of Service</th>
                    <th className="p-3 text-right">Taxable</th>
                    <th className="p-3 text-right">CGST (9%)</th>
                    <th className="p-3 text-right">SGST (9%)</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-mono text-slate-600">{selectedInvoice.sac}</td>
                    <td className="p-3 font-medium text-slate-900">
                      Broadband Internet Access Service ({selectedInvoice.plan})
                    </td>
                    <td className="p-3 text-right font-medium">{selectedInvoice.taxable}</td>
                    <td className="p-3 text-right text-slate-600">{selectedInvoice.cgst}</td>
                    <td className="p-3 text-right text-slate-600">{selectedInvoice.sgst}</td>
                    <td className="p-3 text-right font-black text-slate-900">{selectedInvoice.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total in words & payment method */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
              <div className="flex justify-between items-center font-bold text-blue-950">
                <span>Amount Paid:</span>
                <span className="text-base font-black text-blue-900">{selectedInvoice.amount}</span>
              </div>
              <p className="text-[11px] text-blue-800">
                Amount in Words: <em>Rupees Four Hundred Seventy and Eighty Two Paise Only</em>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Payment Channel: {selectedInvoice.mode} • Status: <span className="font-bold text-emerald-700">PAID</span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Print Receipt
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  success('Download Initiated', `Saving ${selectedInvoice.invoiceNo}.pdf`);
                  setIsInvoiceModalOpen(false);
                }}
                icon={<Download className="w-4 h-4" />}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CREATE SUPPORT TICKET (Scoped by Company) */}
      {/* ===================================================================== */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {effectiveScope === 'am-distributors'
                    ? 'Create Wholesale / Route Inquiry'
                    : effectiveScope === 'nexalus-innovations'
                    ? 'Raise AMC / Hardware Support Ticket'
                    : 'Create Support Ticket'}
                </h3>
                <p className="text-xs text-slate-500">
                  {effectiveScope === 'am-distributors'
                    ? 'Select your distribution or cold-chain logistics inquiry category.'
                    : effectiveScope === 'nexalus-innovations'
                    ? 'Select your CCTV surveillance or hardware maintenance grievance.'
                    : 'Select your grievance subject from the standardized support categories.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Grievance Category / Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                >
                  {currentTicketSubjects.map((subj, idx) => (
                    <option key={idx} value={subj}>
                      {idx + 1}. {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priority Level
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTicketPriority(p)}
                      className={`py-2 rounded-xl font-bold uppercase text-[10px] border transition-all cursor-pointer ${
                        ticketPriority === p
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={ticketDescription}
                  onChange={e => setTicketDescription(e.target.value)}
                  required
                  placeholder="Provide details about the issue (e.g. speed test results, red LED on ONT, router restarts)..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsNewTicketModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingTicket}
                  icon={<Send className="w-4 h-4" />}
                  className="font-bold shadow-md shadow-blue-600/20"
                >
                  Submit Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: PAST QUOTES & INQUIRIES */}
      {/* ===================================================================== */}
      {showInquiriesModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Your Service Inquiries ({inquiries.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowInquiriesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {inquiries.map(item => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">{item.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                      {item.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">
                    {item.productOrServiceName || 'Broadband / CCTV Inquiry'}
                  </h4>
                  <p className="text-slate-500">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* MODAL: OTT PACK CHECKOUT & CONFIRMATION */}
      {ottModalPack && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{ottModalPack.name}</h3>
                  <p className="text-xs text-slate-500">Broadband Add-On Bundle</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOttModalPack(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
              <div className="flex justify-between font-extrabold text-slate-900">
                <span>Monthly Pack Subscription:</span>
                <span className="text-purple-700 text-sm font-black">₹{ottModalPack.price} / month</span>
              </div>
              <div className="text-slate-600 text-[11px] pt-1 border-t border-purple-200/60">
                <span>Included OTT Streaming Apps: </span>
                <strong className="text-slate-900">{ottModalPack.services.join(', ')}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Payment &amp; Activation Policy:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Your OTT pack request will be recorded with status <strong>Pending Billing</strong> and added to your next verified broadband billing invoice. OTT login credentials will be delivered via SMS/WhatsApp once payment is confirmed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setOttModalPack(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSubscribingOtt}
                onClick={() => {
                  setIsSubscribingOtt(true);
                  setTimeout(() => {
                    setIsSubscribingOtt(false);
                    success('OTT Order Recorded', (ottModalPack ? ottModalPack.name : 'Pack') + ' booked with Pending status. Activation will occur upon payment confirmation.');
                    setOttModalPack(null);
                  }, 700);
                }}
              >
                Confirm &amp; Subscribe
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PLAN ORDER & INSTANT CHECKOUT MODAL */}
      <PlanOrderModal
        isOpen={Boolean(orderPlanModalItem)}
        onClose={() => setOrderPlanModalItem(null)}
        plan={orderPlanModalItem}
        onOrderSuccess={(orderId) => {
          if (orderPlanModalItem?.id) {
            removeFromPlanCart(orderPlanModalItem.id);
          }
          setOrderPlanModalItem(null);
        }}
      />

      {/* DOCUMENT VIEWER MODAL FOR BOOKING SLIP & OFFICIAL PAID RECEIPT */}
      <DocumentViewerModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        order={docModalOrder}
        documentType={docModalType}
      />
    </div>
  );
};
