import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateCustomerProfile, getCustomerEnquiries } from '../../firebase/services';
import { Enquiry, CustomerDeliveryAddress } from '../../types';
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
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';

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

export const CustomerAccountPage: React.FC = () => {
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

  // Redirect Admin / Staff Users to the Admin Panel Console immediately
  useEffect(() => {
    if (isAuthenticated && !isCustomer) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isCustomer, navigate]);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Chiplun');
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

  // Authenticated Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'address' | 'inquiries' | 'security'>('address');

  // Address & Contact Form State (for logged-in customer profile)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('India');
  const [additionalDeliveryInfo, setAdditionalDeliveryInfo] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<Enquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

  // Initialize form fields when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.displayName || '');
      setPhone(currentUser.phone || '');
      if (currentUser.deliveryAddress) {
        setAddress(currentUser.deliveryAddress.address || '');
        setCity(currentUser.deliveryAddress.city || '');
        setState(currentUser.deliveryAddress.state || 'Maharashtra');
        setPostcode(currentUser.deliveryAddress.postcode || '');
        setCountry(currentUser.deliveryAddress.country || 'India');
        setAdditionalDeliveryInfo(currentUser.deliveryAddress.additionalDeliveryInfo || '');
      }
    }
  }, [currentUser]);

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
        success('Welcome Back!', 'You are now signed in.');
        if ((res as any)?.user?.role && (res as any).user.role !== 'customer') {
          navigate('/admin', { replace: true });
        } else {
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

    // Form Validations
    if (!regFullName.trim()) {
      setRegError('Please enter your full name.');
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
        displayName: regFullName.trim(),
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
          'Your account has been created. Please log in with your email and password.'
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
      success('Email Dispatched', `Password reset instructions sent to ${emailClean}`);
    } catch (err: any) {
      let msg = 'Could not dispatch password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No customer account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address is invalid.';
      }
      setResetError(msg);
    } finally {
      setIsSendingReset(false);
    }
  };

  // ==========================================
  // HANDLERS: LOGGED-IN CUSTOMER DASHBOARD
  // ==========================================
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!address.trim() || !city.trim() || !postcode.trim()) {
      error('Validation Error', 'Please specify your street address, city, and pincode.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedDelivery: CustomerDeliveryAddress = {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postcode: postcode.trim(),
        country: country.trim() || 'India',
        additionalDeliveryInfo: additionalDeliveryInfo.trim()
      };

      const res = await updateCustomerProfile(currentUser.uid, {
        displayName: fullName.trim(),
        phone: phone.trim(),
        deliveryAddress: updatedDelivery
      });

      if (res) {
        await refreshUserProfile();
        success('Profile Saved', 'Your delivery location and contact details have been updated.');
      } else {
        error('Save Failed', 'Could not update your profile. Please try again.');
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to save address.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!currentUser?.email || !auth) return;
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      success('Email Dispatched', `Password reset instructions sent to ${currentUser.email}`);
    } catch (err: any) {
      error('Reset Failed', err.message || 'Could not send password reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    success('Signed Out', 'You have been signed out of your customer account.');
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">New Request</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Contacted</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">In Progress</span>;
      case 'quotation_sent':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Quotation Sent</span>;
      case 'converted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Connected / Installed</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // =========================================================================
  // VIEW: UNAUTHENTICATED VISITOR (CUSTOMER PORTAL: LOGIN & REGISTER)
  // =========================================================================
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#070e20] via-[#0b1739] to-[#0d1d49] px-6 py-6 text-white border-b border-slate-800 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img
                  src="/images/parent-company-logo.jpg"
                  alt="Nexalus Innovations LLP Logo"
                  className="w-12 h-12 rounded-2xl object-cover border border-cyan-400/40 shadow-inner bg-slate-900"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-black text-cyan-300">
                    Official Client Portal
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                  Nexalus Innovations LLP &amp; A.M. Distributors
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Sign in or register as a new customer to track services &amp; orders
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
                setRegError(null);
              }}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'login' || authMode === 'forgot_password'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-blue-600" />
              <span>Sign In to Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setLoginError(null);
                setRegError(null);
              }}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>New Customer Registration</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* ======================================================== */}
            {/* VIEW 1: SIGN IN FORM */}
            {/* ======================================================== */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Customer Portal Login
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter your registered email and password to access your account dashboard.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
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
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginEmail);
                        setAuthMode('forgot_password');
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your account password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Prominent New Customer Registration Callout */}
                <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/70 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                      <span>New Customer?</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Register your delivery address &amp; profile in 1 minute
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegError(null);
                      setAuthMode('register');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Register Now →
                  </button>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoggingIn}
                    className="w-full justify-center bg-blue-600 hover:bg-blue-700 font-bold"
                    icon={<LogIn className="w-4 h-4" />}
                  >
                    Sign In to Account
                  </Button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: NEW CUSTOMER REGISTRATION FORM */}
            {/* ======================================================== */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      New Customer Registration
                    </h3>
                    <p className="text-xs text-slate-500">
                      Create an account with your service address for fast broadband provisioning &amp; deliveries.
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
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Patil"
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          required
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
                          onKeyDown={e => {
                            if (
                              !/[0-9]/.test(e.key) &&
                              !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) &&
                              !e.ctrlKey &&
                              !e.metaKey
                            ) {
                              e.preventDefault();
                            }
                          }}
                          required
                          className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Password (Min 6 Chars) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          tabIndex={-1}
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
                    <span>Installation &amp; Delivery Address</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Street Address / Flat / Building <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
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
                        list="maharashtra-city-options"
                        value={regCity}
                        onChange={e => setRegCity(e.target.value)}
                        placeholder="Chiplun"
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
                      Landmark / Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Old Bus Stand, Ring Road"
                      value={regAdditionalInfo}
                      onChange={e => setRegAdditionalInfo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-slate-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Already have an account? <span className="font-bold underline">Login here</span>
                  </button>

                  <Button
                    type="submit"
                    variant="teal"
                    size="md"
                    isLoading={isRegistering}
                    className="w-full sm:w-auto font-bold shadow-md shadow-teal-700/20"
                    icon={<UserPlus className="w-4 h-4" />}
                  >
                    Create Account &amp; Save
                  </Button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* VIEW 3: FORGOT PASSWORD */}
            {/* ======================================================== */}
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
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-2">
                    <div className="font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Password Reset Email Sent!</span>
                    </div>
                    <p>
                      Check your inbox at <strong>{resetEmail}</strong> and follow the link to set a new password.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-xs font-black text-emerald-700 hover:underline pt-2 block"
                    >
                      Return to Sign In →
                    </button>
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
            Staff and Corporate Admins manage operations via the Admin Panel. Redirecting to your console dashboard...
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
  // VIEW: AUTHENTICATED CUSTOMER ACCOUNT DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20 border-2 border-white/20">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {currentUser.displayName || 'Customer'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isCustomer ? 'Verified Customer' : 'Staff / Member'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {currentUser.email}
                </span>
                {currentUser.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    {currentUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 mb-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'address'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery &amp; Installation Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Service Inquiries</span>
            {inquiries.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
                {inquiries.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security &amp; Support</span>
          </button>
        </div>

        {/* TAB 1: DELIVERY & INSTALLATION ADDRESS */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-3xl">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Installation &amp; Delivery Location
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep your service address updated for on-site fiber feasibility checks, hardware deliveries, and technician visits.
              </p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={e => {
                      let digits = e.target.value.replace(/\D/g, '');
                      if (digits.length === 12 && digits.startsWith('91')) {
                        digits = digits.slice(2);
                      } else if (digits.length === 11 && digits.startsWith('0')) {
                        digits = digits.slice(1);
                      }
                      setPhone(digits.slice(0, 10));
                    }}
                    onKeyDown={e => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) &&
                        !e.ctrlKey &&
                        !e.metaKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Street Address / Premise / Apartment *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot 45, Near Old Bus Stand, Ring Road"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    list="saved-cities"
                    placeholder="Chiplun"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                  <datalist id="saved-cities">
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
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    placeholder="415605"
                    value={postcode}
                    onChange={e => setPostcode(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Delivery Notes / Landmarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Government Hospital, 2nd Floor, Left Wing"
                  value={additionalDeliveryInfo}
                  onChange={e => setAdditionalDeliveryInfo(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSavingProfile}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Address &amp; Details
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: MY SERVICE INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Your Submitted Service Inquiries &amp; Orders
                </h2>
                <p className="text-xs text-slate-500">
                  Track progress of your site surveys, broadband setups, and wholesale delivery requests.
                </p>
              </div>
              <Link to="/quote">
                <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                  New Inquiry
                </Button>
              </Link>
            </div>

            {isLoadingInquiries ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Retrieving your inquiries from Firestore...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Active Service Inquiries Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't requested any optical fiber surveys, CCTV quotations, or wholesale supply deliveries yet.
                </p>
                <div className="pt-2">
                  <Link to="/quote">
                    <Button variant="primary" size="sm">
                      Submit Your First Service Request
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map(item => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {item.id}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {item.brandId}
                        </span>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {item.productOrServiceName || (item.enquiryType ? `Inquiry (${item.enquiryType.toUpperCase()})` : 'General Service Inquiry')}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.message}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      {item.assignedTo && (
                        <span className="text-slate-600 font-medium">Assigned: {item.assignedTo}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SECURITY & SUPPORT */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Account Security &amp; Credentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your authenticated Firebase account password and security options.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Change / Reset Password</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click below to dispatch official Firebase password reset instructions directly to <strong>{currentUser.email}</strong>.
              </p>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendPasswordReset}
                  isLoading={isSendingReset}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Send Password Reset Email
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
              <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                Need Assistance With Your Account?
              </h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                Contact our customer support desk directly via WhatsApp at <strong>+91 9158886444</strong> or email <strong>support@nexalusinnovations.com</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
