import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  User,
  UserCheck,
  UserPlus,
  LogIn,
  Lock,
  Mail,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles
} from 'lucide-react';

export type CustomerModalView = 'choice' | 'register' | 'login' | 'forgot_password';

export interface CustomerChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: CustomerModalView;
  promptMessage?: string | null;
  authContext?: string | null;
}

const INDIAN_STATES = [
  'Maharashtra',
  'Goa',
  'Gujarat',
  'Karnataka',
  'Madhya Pradesh',
  'Delhi',
  'Other'
];

export const CustomerChoiceModal: React.FC<CustomerChoiceModalProps> = ({
  isOpen,
  onClose,
  initialView = 'choice',
  promptMessage,
  authContext
}) => {
  const [view, setView] = useState<CustomerModalView>(initialView);
  const { loginCustomer, registerCustomerAccount } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setFormError(null);
    }
  }, [isOpen, initialView]);

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Chiplun');
  const [regState, setRegState] = useState('Maharashtra');
  const [regPostcode, setRegPostcode] = useState('');
  const [regCountry] = useState('India');
  const [regAdditionalInfo, setRegAdditionalInfo] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password Reset State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // UI / Password Visibility States
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('nexalus_customer_choice_dismissed', 'true');
    } catch {}
    setFormError(null);
    onClose();
    // If visitor is currently on account/login/register screen, redirect to homepage so they can continue browsing
    if (
      window.location.pathname.startsWith('/account') ||
      window.location.pathname.startsWith('/login') ||
      window.location.pathname.startsWith('/register')
    ) {
      navigate('/');
    }
  };

  const handleAuthSuccess = (userData: any) => {
    handleDismiss();

    // Check if there was a pending plan order
    let pendingPlan: any = null;
    try {
      const raw = sessionStorage.getItem('nexalus_pending_order_plan');
      if (raw) {
        pendingPlan = JSON.parse(raw);
        sessionStorage.removeItem('nexalus_pending_order_plan');
      }
    } catch {}

    if (pendingPlan) {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('open_plan_order_direct', { detail: pendingPlan })
        );
      }, 150);
      return;
    }

    if (authContext === 'cart_checkout') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open_plan_cart'));
      }, 150);
      return;
    }

    if (userData?.role && userData.role !== 'customer') {
      navigate('/admin');
    } else {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/plans' || currentPath.startsWith('/brand')) {
        // Stay on current page so user can continue shopping
      } else {
        navigate('/account');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!regFullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    const emailClean = regEmail.trim().toLowerCase();
    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    const phoneClean = regPhone.trim();
    if (!phoneClean || phoneClean.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (regPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setFormError('Passwords do not match. Please verify both fields.');
      return;
    }
    if (!regAddress.trim() || !regCity.trim() || !regPostcode.trim()) {
      setFormError('Please complete your street address, city, and pincode for service delivery.');
      return;
    }

    setIsSubmitting(true);
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
        success('Account Created', 'Welcome to Nexalus Innovations! Your customer profile has been saved.');
        handleAuthSuccess((result as any)?.user);
      } else {
        setFormError(result.error || 'Failed to complete registration. Please try again.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred during account registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailClean = loginEmail.trim().toLowerCase();
    if (!emailClean) {
      setFormError('Please enter your registered email address.');
      return;
    }
    if (!loginPassword) {
      setFormError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginCustomer(emailClean, loginPassword);
      if (result.success) {
        success('Welcome Back', 'You are now signed in to the customer portal.');
        handleAuthSuccess((result as any)?.user);
      } else {
        setFormError(result.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailClean = resetEmail.trim().toLowerCase();
    if (!emailClean) {
      setFormError('Please provide your registered email address.');
      return;
    }

    if (!auth) {
      setFormError('Authentication service is offline. Please try again later.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, emailClean);
      setResetSent(true);
      success('Email Dispatched', `Password reset instructions sent to ${emailClean}`);
    } catch (err: any) {
      let msg = 'Could not dispatch password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address is invalid.';
      }
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Decorative Header */}
        <div className="bg-gradient-to-r from-[#070e20] via-[#0b1739] to-[#0d1d49] px-6 py-5 text-white flex items-center justify-between border-b border-slate-800 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src="/images/parent-company-logo.jpg"
                alt="Nexalus Innovations LLP Logo"
                className="w-11 h-11 rounded-xl object-cover border border-cyan-400/40 shadow-inner bg-slate-900"
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
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                Nexalus Innovations LLP
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/60 hover:scale-105"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto">
          {formError && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">{formError}</div>
            </div>
          )}

          {/* VIEW 1: CHOICE STATE (Are you a new or existing customer?) */}
          {view === 'choice' && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                {/* Official Corporate Seal */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 opacity-25 blur-md group-hover:opacity-40 transition duration-300" />
                    <img
                      src="/images/parent-company-logo.jpg"
                      alt="Nexalus Innovations LLP Official Seal"
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-2xl border-4 border-white ring-2 ring-slate-200/80 bg-white"
                    />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Client Onboarding &amp; Account Portal</span>
                </div>

                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Welcome to Nexalus Innovations LLP
                  </h4>
                  <p className="text-sm font-bold text-slate-700 mt-1">
                    Are you a new customer or an existing customer?
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  Select your onboarding option below to request fiber internet, book commercial CCTV consultations, and track service requests.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {/* Choice 1: New Customer */}
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('register');
                  }}
                  className="group relative p-6 bg-gradient-to-b from-white to-sky-50/50 hover:to-sky-50 rounded-3xl border-2 border-slate-200 hover:border-blue-600 text-left transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-blue-600/10 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-blue-600/25">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        First Time
                      </span>
                    </div>

                    <div>
                      <h5 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        New Customer
                      </h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Create your verified profile to apply for broadband and security installations.
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1 text-[11px] text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Instant connection inquiries</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Rapid on-site surveys</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Transparent tariff pricing</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs font-black text-blue-700 group-hover:text-blue-800">
                    <span>Register New Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </button>

                {/* Choice 2: Existing Customer */}
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('login');
                  }}
                  className="group relative p-6 bg-gradient-to-b from-white to-slate-50/70 hover:to-slate-100/70 rounded-3xl border-2 border-slate-200 hover:border-slate-800 text-left transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-slate-900/25">
                        <LogIn className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                        Returning
                      </span>
                    </div>

                    <div>
                      <h5 className="text-lg font-black text-slate-900 group-hover:text-slate-900 transition-colors">
                        Existing Customer
                      </h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Sign in to access your active inquiries, service quotes, and account dashboard.
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1 text-[11px] text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Track quotation progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Dedicated customer desk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Saved service addresses</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs font-black text-slate-900">
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </button>
              </div>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Continue browsing website without logging in →
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: REGISTRATION FORM */}
          {view === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    New Customer Registration
                  </h4>
                  <p className="text-xs text-slate-500">
                    Create your account with your service address for fast broadband provisioning.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('choice');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
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
                      maxLength={10}
                      required
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery / Installation Address */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
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
                      placeholder="e.g. Chiplun"
                      value={regCity}
                      onChange={e => setRegCity(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Pincode <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 415605"
                      value={regPostcode}
                      onChange={e => setRegPostcode(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      State
                    </label>
                    <select
                      value={regState}
                      onChange={e => setRegState(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-700"
                    >
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Landmark / Additional Delivery Information
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Old Bus Stand, Opposite SBI"
                    value={regAdditionalInfo}
                    onChange={e => setRegAdditionalInfo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Password Setup */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password (Min 6 Chars) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
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
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
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

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('login');
                  }}
                  className="text-xs text-slate-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Already have an account? <span className="font-bold underline">Login here</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account &amp; Register</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: LOGIN FORM */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Customer Portal Login
                  </h4>
                  <p className="text-xs text-slate-500">
                    Sign in with your registered email and password to access your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('choice');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  ← Back
                </button>
              </div>

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
                      setFormError(null);
                      setResetEmail(loginEmail);
                      setView('forgot_password');
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

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('register');
                  }}
                  className="text-xs text-slate-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  New customer? <span className="font-bold underline">Create an account</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 4: FORGOT PASSWORD */}
          {view === 'forgot_password' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Reset Account Password
                  </h4>
                  <p className="text-xs text-slate-500">
                    We will send an official Firebase password reset link to your email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('login');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>

              {resetSent ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-emerald-900">Reset Email Dispatched</h5>
                    <p className="text-xs text-emerald-700 mt-1">
                      Check your inbox at <strong>{resetEmail}</strong> for instructions to reset your password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      setView('login');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-emerald-800 border border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    Proceed to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Registered Email Address <span className="text-rose-500">*</span>
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

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      <span>Send Reset Link</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
