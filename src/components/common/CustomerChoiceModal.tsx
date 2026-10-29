import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Wifi,
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
  ArrowLeft,
  Shield,
  ShieldCheck,
  Loader2,
  Sparkles,
  Bell,
  ExternalLink,
  Calendar,
  Send
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

  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setFormError(null);
      setRegPassword('');
      setRegConfirmPassword('');
    }
  }, [isOpen, initialView]);

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
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className={`relative bg-white w-full ${
          view === 'choice' ? 'max-w-4xl' : view === 'register' ? 'max-w-3xl' : 'max-w-xl'
        } rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all my-auto`}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes nexalusLogoFade {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
              box-shadow: 0 6px 24px -2px rgba(197, 160, 89, 0.45);
            }
            50% {
              opacity: 0.35;
              transform: scale(0.96);
              box-shadow: 0 2px 10px -2px rgba(197, 160, 89, 0.15);
            }
          }
          @keyframes nexalusAuraPulse {
            0%, 100% {
              opacity: 0.65;
              transform: scale(1);
            }
            50% {
              opacity: 0.2;
              transform: scale(0.9);
            }
          }
        `}</style>
        {/* Subtle Corporate Architectural Background Watermark */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
          style={{
            backgroundImage: "url('/images/parent-company-hero-banner.jpg')"
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/92 to-white/98 pointer-events-none"
          aria-hidden="true"
        />

        {/* Floating Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close dialog"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer border border-slate-200/70 hover:scale-105"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Body Content */}
        <div className="relative z-10 p-5 sm:p-8 md:p-9 max-h-[85vh] overflow-y-auto">
          {resetSent && (
            <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-emerald-50 border-2 border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-800 shadow-md shadow-blue-900/5 animate-in slide-in-from-top-2">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bell className="w-4 h-4 animate-bounce text-amber-300" />
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#071930] text-white font-bold text-xs shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{getEmailProviderName(resetEmail)}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {formError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">{formError}</div>
            </div>
          )}

          {/* VIEW 1: CHOICE STATE (Are you a new or existing customer?) */}
          {view === 'choice' && (
            <div className="space-y-6">
              {/* Subtle Architectural Grid Pattern Overlay */}
              <div
                className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(#0b2545_1px,transparent_1px)] [background-size:18px_18px] opacity-[0.035] pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative text-center space-y-3.5">
                {/* Official Corporate Seal with Champagne Gold Accent & Fade In/Out Animation */}
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                  {/* Left Micro-Trust Pill */}
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50/90 border border-slate-200/80 text-[11px] font-semibold text-slate-600 shadow-2xs backdrop-blur-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Partner</span>
                  </div>

                  {/* Centered Seal with Radiant Aura & Fade Animation */}
                  <div className="relative flex justify-center items-center group">
                    <div
                      className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-400/25 via-blue-500/15 to-transparent blur-xl pointer-events-none"
                      style={{ animation: 'nexalusAuraPulse 3.5s ease-in-out infinite' }}
                    />
                    <img
                      src="/images/parent-company-logo.jpg"
                      alt="Nexalus Innovations LLP Official Seal"
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#c5a059]/70 ring-4 ring-amber-50/90 bg-white shadow-lg"
                      style={{ animation: 'nexalusLogoFade 3.5s ease-in-out infinite' }}
                    />
                  </div>

                  {/* Right Micro-Trust Pill */}
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50/90 border border-slate-200/80 text-[11px] font-semibold text-slate-600 shadow-2xs backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ISO Certified</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/70 text-[#0b2545] text-[11px] font-bold tracking-wider uppercase">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>CLIENT ONBOARDING &amp; ACCOUNT PORTAL</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Welcome to Nexalus Innovations LLP
                  </h4>
                  <p className="text-sm sm:text-base font-bold text-slate-700">
                    Are you a new customer or an existing customer?
                  </p>
                </div>

                {/* 3 Core Solution Pillars to Fill the Space Purposefully */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50/90 border border-teal-200/70 text-teal-800 text-[11px] font-semibold">
                    <Wifi className="w-3.5 h-3.5 text-teal-600" />
                    <span>High-Speed Fiber</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50/90 border border-blue-200/70 text-blue-800 text-[11px] font-semibold">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Commercial CCTV</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50/90 border border-indigo-200/70 text-indigo-800 text-[11px] font-semibold">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Enterprise IT</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
                  Select your onboarding option below to request fiber internet, book commercial CCTV consultations, and track service requests.
                </p>

                {/* Champagne Gold Refined Separator */}
                <div className="flex items-center justify-center gap-3 pt-0.5">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent" />
                  <span className="text-[10px] text-[#c5a059] font-serif">✦</span>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-1">
                {/* Choice 1: New Customer */}
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('register');
                  }}
                  className="group relative p-6 sm:p-7 bg-white rounded-3xl border-2 border-slate-200/90 hover:border-blue-600 text-left transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-600/10 cursor-pointer flex flex-col justify-between overflow-hidden isolate"
                >
                  {/* Subtle Realistic Architectural Glass Building Backdrop on the Right */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-right opacity-15 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundImage: "url('/images/nexalus-facility-cctv-network.jpg')" }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <UserPlus className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                        First Time
                      </span>
                    </div>

                    <div>
                      <h5 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        New Customer
                      </h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Create your verified profile to apply for broadband and security installations.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Instant connection inquiries</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>On-site surveys and consultations</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Transparent corporate pricing</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Dedicated priority onboarding</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-slate-100">
                    <div className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-black text-white bg-[#0b2545] hover:bg-[#071930] flex items-center justify-center gap-2 shadow-sm transition-all group-hover:gap-3">
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>

                {/* Choice 2: Existing Customer */}
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('login');
                  }}
                  className="group relative p-6 sm:p-7 bg-white rounded-3xl border-2 border-slate-200/90 hover:border-slate-800 text-left transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-900/10 cursor-pointer flex flex-col justify-between overflow-hidden isolate"
                >
                  {/* Subtle Realistic Desk / Office Commercial Photography on the Right */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-right opacity-15 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundImage: "url('/images/pexels-switch-desk.jpg')" }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <LogIn className="w-6 h-6 text-slate-800" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Returning
                      </span>
                    </div>

                    <div>
                      <h5 className="text-xl font-black text-slate-900 group-hover:text-slate-900 transition-colors">
                        Existing Customer
                      </h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Sign in to access your active inquiries, service quotes, and account dashboard.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                        <span>Track quotation progress</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                        <span>Manage service requests</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                        <span>View saved service addresses</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                        <span>Dedicated customer desk</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-slate-100">
                    <div className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-black text-slate-900 bg-white border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center gap-2 shadow-2xs transition-all group-hover:gap-3">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Task 3: Continue Without Logging In */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 group py-1.5"
                >
                  <span>Continue browsing website without logging in</span>
                  <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>

              {/* Bottom Security Assurance Note */}
              <div className="pt-3 border-t border-slate-100/90 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
                <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Your information is secure and will only be used to process your service requests.</span>
              </div>
            </div>
          )}

          {/* VIEW 2: REGISTRATION FORM */}
          {view === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4" autoComplete="off">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-[#0b2545] tracking-tight">
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#0b2545] px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
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
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors text-slate-700"
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
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] font-medium text-slate-700"
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                      className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:bg-white transition-colors"
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
                  className="text-xs text-slate-600 hover:text-[#0b2545] font-medium cursor-pointer"
                >
                  Already have an account? <span className="font-bold underline">Login here</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#0b2545] hover:bg-[#071930] shadow-md shadow-[#0b2545]/20 disabled:opacity-50 transition-all cursor-pointer"
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

          {/* VIEW 3: EXISTING CUSTOMER LOGIN (Redesigned with Premium Corporate Design Language) */}
          {view === 'login' && (
            <div className="space-y-5">
              {/* Top Navigation Row: Back Button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('choice');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-[#0b2545] hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Selection</span>
                </button>

                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Returning Customer
                </span>
              </div>

              {/* Centered Brand & Header Section (Matching Reference Image) */}
              <div className="text-center space-y-3">
                {/* Official Nexalus Innovations Logo Seal with Champagne Gold Accent */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <img
                      src="/images/parent-company-logo.jpg"
                      alt="Nexalus Innovations LLP"
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover shadow-md border-2 border-[#c5a059]/50 ring-4 ring-amber-50/80 bg-white"
                    />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/70 text-[#0b2545] text-[11px] font-bold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0b2545]" />
                  <span>CUSTOMER PORTAL &bull; ACCOUNT ACCESS</span>
                </div>

                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Welcome back
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed font-medium">
                    Sign in to manage your service requests, quotations and account details.
                  </p>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto space-y-4 pt-1">
                {/* Email Address */}
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

                {/* Password Field */}
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
                      className="text-xs font-semibold text-slate-500 hover:text-[#0b2545] hover:underline cursor-pointer transition-colors"
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
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      tabIndex={-1}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Prominent Full-Width Deep Navy Sign In Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#0b2545] hover:bg-[#071930] active:bg-[#051322] shadow-md shadow-[#0b2545]/20 hover:shadow-lg hover:shadow-[#0b2545]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
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

                {/* Footer Navigation Link */}
                <div className="pt-2 text-center space-y-1.5">
                  <p className="text-xs text-slate-600 font-medium">
                    New to Nexalus?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setView('register');
                      }}
                      className="font-bold text-[#0b2545] hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </p>
                </div>
              </form>

              {/* Bottom Security Assurance Note (Matching Reference Image) */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
                <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Your information is secure and will only be used to process your service requests.</span>
              </div>
            </div>
          )}

          {/* VIEW 4: FORGOT PASSWORD */}
          {view === 'forgot_password' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setView('login');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-[#0b2545] hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>

                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Password Recovery
                </span>
              </div>

              {/* Centered Brand & Header Section */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <img
                    src="/images/parent-company-logo.jpg"
                    alt="Nexalus Innovations LLP"
                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover shadow-md border-2 border-[#c5a059]/50 ring-4 ring-amber-50/80 bg-white"
                  />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/70 text-[#0b2545] text-[11px] font-bold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0b2545]" />
                  <span>PASSWORD RECOVERY</span>
                </div>

                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Reset your password
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed font-medium">
                    Enter your registered email address and we will dispatch an official password reset link.
                  </p>
                </div>
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
                        <strong className="text-slate-900">Check Spam / Junk Folder:</strong> Automated security emails often land in Gmail <span className="font-semibold text-amber-700">Spam</span> or Outlook <span className="font-semibold text-amber-700">Junk</span>.
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
                        <strong className="text-slate-900">Sign In with New Password:</strong> Once saved, return here and enter your newly chosen password.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setLoginEmail(resetEmail);
                        setView('login');
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0b2545] hover:bg-[#071930] shadow-md transition-all cursor-pointer"
                    >
                      <span>Return to Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordResetSubmit} className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registered Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="customer_reset_email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b2545] focus:ring-2 focus:ring-[#0b2545]/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#0b2545] hover:bg-[#071930] active:bg-[#051322] shadow-md shadow-[#0b2545]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching Reset Link...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Password Reset Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Security Assurance Note */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium text-center">
                <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Your information is secure and will only be used to process your service requests.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
