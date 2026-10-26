import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
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
  Sparkles,
  Bell,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { triggerSystemPushNotification, getEmailProviderUrl, getEmailProviderName } from '../../utils/notificationHelpers';

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
      setRegPassword('');
      setRegConfirmPassword('');
    }
  }, [isOpen, initialView]);

  // Registration Form State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
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
      }, 250);
      return;
    }

    if (authContext === 'cart_checkout') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open_plan_cart'));
      }, 250);
      return;
    }

    const currentPath = window.location.pathname;
    if (
      currentPath.startsWith('/login') ||
      currentPath.startsWith('/register') ||
      currentPath.startsWith('/account')
    ) {
      navigate('/');
    }
    // Otherwise stay on current page so customer can continue browsing seamlessly
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!regFirstName.trim() || !regLastName.trim()) {
      setFormError('Please enter your First Name and Last Name.');
      return;
    }
    if (!regDob) {
      setFormError('Please select your Date of Birth.');
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
      const fullName = `${regFirstName.trim()} ${regLastName.trim()}`;
      const result = await registerCustomerAccount({
        displayName: fullName,
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        dateOfBirth: regDob,
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
          'Your customer profile has been created. Please log in with your password to complete your plan order.'
        );
        setLoginEmail(emailClean);
        setLoginPassword('');
        setFormError(null);
        setView('login');
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
      // Dispatch password reset link via Firebase Authentication
      await sendPasswordResetEmail(auth, emailClean);
      setResetSent(true);

      // Trigger native browser notification
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
      } else if (err.code === 'auth/quota-exceeded') {
        msg = 'Daily email limit reached. Please contact Nexalus customer support directly.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network connection failed. Please check your internet connection.';
      } else if (err.message) {
        msg = err.message;
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
          {resetSent && (
            <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-emerald-50 border-2 border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-800 shadow-md shadow-blue-900/5 animate-in slide-in-from-top-2">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <h5 className="font-black text-slate-900 text-xs sm:text-sm">
                      Password Reset Notification Sent
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Sent to <strong className="text-slate-900 font-bold">{resetEmail}</strong>. Check your inbox &amp; spam folder to set your new password.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href={getEmailProviderUrl(resetEmail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{getEmailProviderName(resetEmail)}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

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
            <form onSubmit={handleRegisterSubmit} className="space-y-4" autoComplete="off">
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="customer_reg_first_name"
                      autoComplete="given-name"
                      placeholder="e.g. Aditya"
                      value={regFirstName}
                      onChange={e => setRegFirstName(e.target.value)}
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
                      name="customer_reg_last_name"
                      autoComplete="family-name"
                      placeholder="e.g. Patil"
                      value={regLastName}
                      onChange={e => setRegLastName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      name="customer_reg_dob"
                      value={regDob}
                      onChange={e => setRegDob(e.target.value)}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors text-slate-700"
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
                      placeholder="e.g. Chiplun, Sangli, Pune"
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
                      name="customer_reg_pincode"
                      autoComplete="postal-code"
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
                      name="customer_reg_state"
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
                    name="customer_reg_landmark"
                    autoComplete="off"
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
                      name="customer_reg_password"
                      autoComplete="new-password"
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
                    {authContext === 'buy_now'
                      ? 'Please log in with your password to complete your plan order.'
                      : 'Sign in with your registered email and password to access your account.'}
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
                    name="customer_login_email"
                    autoComplete="username"
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
                    name="customer_login_password"
                    autoComplete="current-password"
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
                <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h5 className="text-base font-bold text-slate-900">
                      Password Reset Email Dispatched
                    </h5>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      A secure password reset link has been dispatched to <strong className="text-slate-900 font-bold">{resetEmail}</strong>.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <p>
                        <strong className="text-slate-900">Check Spam / Junk Folder:</strong> Automated security emails from Firebase often land in Gmail <span className="font-semibold text-amber-700">Spam</span>, <span className="font-semibold text-amber-700">Promotions</span>, or Outlook <span className="font-semibold text-amber-700">Junk</span>.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <p>
                        <strong className="text-slate-900">Click the Link to Set New Password:</strong> Open the email and follow the reset link to define and save your new password.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      <p>
                        <strong className="text-slate-900">Sign In with New Password:</strong> Once saved, return here and enter your newly chosen password. The system will only accept the new password.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <a
                      href={getEmailProviderUrl(resetEmail)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{getEmailProviderName(resetEmail)}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail(resetEmail);
                        setLoginPassword('');
                        setResetSent(false);
                        setView('login');
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handlePasswordResetSubmit}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                      Resend Email
                    </button>
                  </div>
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
