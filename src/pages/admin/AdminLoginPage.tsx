import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Activity,
  AlertCircle
} from 'lucide-react';
import { triggerSystemPushNotification, getEmailProviderUrl, getEmailProviderName } from '../../utils/notificationHelpers';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_SEC = 60;

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field errors for inline validation
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Client-side lockout state to prevent rapid brute-force attempts
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const { login, logout, isAuthenticated, isCustomer, isAdmin, currentUser } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated as an administrator
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin && !isCustomer && currentUser?.role !== 'customer') {
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isCustomer, currentUser, navigate]);

  // Set <meta name="robots" content="noindex,nofollow"> on mount and cleanup on unmount
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    const previousContent = meta ? meta.getAttribute('content') : null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
      created = true;
    }
    meta.content = 'noindex,nofollow';

    return () => {
      if (created && meta && meta.parentNode) {
        meta.parentNode.removeChild(meta);
      } else if (meta && previousContent !== null) {
        meta.content = previousContent;
      } else if (meta) {
        meta.removeAttribute('content');
      }
    };
  }, []);

  // Restore saved email preference if "remember me" was checked
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('nexalus_admin_saved_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, []);

  // Cooldown countdown timer for lockout
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Email address is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(val.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val.trim()) {
      setPasswordError('Password is required.');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) validateEmail(val);
    if (formError) setFormError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError) validatePassword(val);
    if (formError) setFormError(null);
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setEmailError('Please enter your registered administrator email address first.');
      return;
    }
    if (!auth) {
      setFormError('Authentication service is currently unavailable.');
      return;
    }
    setIsSubmitting(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, cleanEmail);

      triggerSystemPushNotification('Nexalus Administrator Password Reset', {
        body: `Password reset instructions sent to ${cleanEmail}. Click to open your inbox.`,
        icon: '/favicon.ico'
      });

      success(
        'Reset Notification Dispatched',
        `Password reset instructions sent to ${cleanEmail}. Check your inbox and spam folder.`,
        {
          duration: 10000,
          action: {
            label: getEmailProviderName(cleanEmail),
            url: getEmailProviderUrl(cleanEmail)
          }
        }
      );
      setFormError(null);
    } catch (err: any) {
      setFormError('Unable to send reset email. Please ensure the email address is correct.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if currently locked out or already submitting
    if (lockoutRemaining > 0 || isSubmitting) return;

    setFormError(null);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(email.trim(), password.trim());

      if (res.success) {
        // Handle "Remember me" for email only (never save credentials/password)
        try {
          if (rememberMe) {
            localStorage.setItem('nexalus_admin_saved_email', email.trim());
          } else {
            localStorage.removeItem('nexalus_admin_saved_email');
          }
        } catch {
          // ignore storage error
        }

        setFailedAttempts(0);
        success('Access Granted', 'Administrator credentials verified.');
        navigate('/admin', { replace: true });
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= LOCKOUT_THRESHOLD) {
          setLockoutRemaining(LOCKOUT_DURATION_SEC);
          setFormError(`Too many failed login attempts. For security, please wait ${LOCKOUT_DURATION_SEC} seconds before retrying.`);
        } else {
          setFormError(res.error || 'Invalid email or password. Please verify your credentials and try again.');
        }
      }
    } catch {
      setFormError('An unexpected error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F7F9FC] font-sans antialiased text-slate-900 selection:bg-[#1D4ED8] selection:text-white">
      {/* =========================================================================
          DESKTOP LEFT HERO PANEL (55% width, hidden on mobile/tablet)
          ========================================================================= */}
      <div
        className="hidden lg:flex lg:w-[55%] relative min-h-screen flex-col justify-between p-12 xl:p-16 text-white overflow-hidden bg-cover bg-center select-none"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(11,27,52,0.92) 0%, rgba(11,27,52,0.55) 100%), url('/images/login-bg.webp')`,
          backgroundColor: '#0B1530'
        }}
      >
        {/* Top-left: Official Nexalus Innovations LLP Logo */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg shadow-black/20 shrink-0">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="8" height="8" x="3" y="3" rx="2" />
              <path d="M7 11v4a2 2 0 0 0 2 2h4" />
              <rect width="8" height="8" x="13" y="13" rx="2" />
              <path d="M17 13V9a2 2 0 0 0-2-2h-4" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white leading-none">
              NEXALUS INNOVATIONS
            </span>
            <span className="text-[10px] font-semibold text-slate-300 tracking-wider uppercase mt-1">
              LLP &bull; OPERATIONS CONSOLE
            </span>
          </div>
        </div>

        {/* Middle Content: Headline, Supporting line & 3 Plain-Text Trust Points */}
        <div className="max-w-lg my-auto py-12 z-10 animate-admin-fade-in">
          <h1 className="text-3xl xl:text-[34px] font-semibold text-white tracking-tight leading-tight">
            Secure access to your operations console
          </h1>
          <p className="mt-4 text-base text-slate-200/90 leading-relaxed font-normal">
            Unified management for network infrastructure, surveillance systems, and authorized administration.
          </p>

          {/* 3 Trust points that factually exist in the application */}
          <div className="mt-8 space-y-3.5 pt-2">
            <div className="flex items-center gap-3 text-slate-200 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-center text-blue-300 shrink-0">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="font-medium">Role-based access</span>
            </div>

            <div className="flex items-center gap-3 text-slate-200 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-center text-blue-300 shrink-0">
                <Activity className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="font-medium">Activity logging</span>
            </div>

            <div className="flex items-center gap-3 text-slate-200 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-center text-blue-300 shrink-0">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="font-medium">Authorized personnel only</span>
            </div>
          </div>
        </div>

        {/* Bottom subtle copyright / notice */}
        <div className="text-xs text-slate-400 font-normal z-10">
          &copy; {new Date().getFullYear()} Nexalus Innovations LLP. All rights reserved.
        </div>
      </div>

      {/* =========================================================================
          RIGHT AUTHENTICATION PANEL (45% width on desktop, 100% on tablet/mobile)
          ========================================================================= */}
      <div className="w-full lg:w-[45%] min-h-screen flex flex-col justify-between bg-[#F7F9FC] p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Top bar: Small Back to website text link */}
        <div className="w-full max-w-[420px] mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-[#1D4ED8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 rounded py-1 px-1.5 -ml-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to website</span>
          </Link>
        </div>

        {/* Center: Sign in form container */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8 animate-admin-fade-in">
          {/* Mobile/Tablet Header Logo (shown only when left panel is hidden) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#0B1530] flex items-center justify-center text-white shadow-sm shrink-0">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="8" height="8" x="3" y="3" rx="2" />
                <path d="M7 11v4a2 2 0 0 0 2 2h4" />
                <rect width="8" height="8" x="13" y="13" rx="2" />
                <path d="M17 13V9a2 2 0 0 0-2-2h-4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">
                NEXALUS INNOVATIONS
              </span>
              <span className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase mt-1">
                OPERATIONS CONSOLE
              </span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-[28px] lg:text-[30px] font-semibold text-slate-900 tracking-tight leading-tight">
              Sign in
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 font-normal">
              Enter your credentials to access the administrative console.
            </p>
          </div>

          {/* Accessible Error Alert (aria-live="polite") */}
          {formError && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 p-3.5 rounded-lg bg-red-50/90 border border-red-200/80 flex items-start gap-2.5 text-red-800 text-xs sm:text-sm font-medium leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* EMAIL INPUT */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[13px] sm:text-[14px] font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  disabled={isSubmitting || lockoutRemaining > 0}
                  aria-required="true"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'admin-email-error' : undefined}
                  className={`block w-full h-12 rounded-lg bg-white pl-10 pr-3.5 text-[16px] sm:text-sm text-slate-900 placeholder:text-slate-400 border transition-all focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                    emailError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-[#D5DBE5] focus:border-[#1D4ED8]'
                  }`}
                />
              </div>
              {emailError && (
                <p id="admin-email-error" className="mt-1.5 text-xs text-red-600 font-medium">
                  {emailError}
                </p>
              )}
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-[13px] sm:text-[14px] font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => validatePassword(password)}
                  disabled={isSubmitting || lockoutRemaining > 0}
                  aria-required="true"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'admin-password-error' : undefined}
                  className={`block w-full h-12 rounded-lg bg-white pl-10 pr-11 text-[16px] sm:text-sm text-slate-900 placeholder:text-slate-400 border transition-all focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                    passwordError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-[#D5DBE5] focus:border-[#1D4ED8]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || lockoutRemaining > 0}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:text-[#1D4ED8] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p id="admin-password-error" className="mt-1.5 text-xs text-red-600 font-medium">
                  {passwordError}
                </p>
              )}
            </div>

            {/* REMEMBER ME CHECKBOX */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={isSubmitting || lockoutRemaining > 0}
                  className="w-4 h-4 rounded border-[#D5DBE5] text-[#1D4ED8] focus:ring-[#1D4ED8] focus:ring-offset-0 focus:outline-none cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-600 font-medium">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isSubmitting || lockoutRemaining > 0}
                className="text-xs sm:text-sm font-semibold text-[#1D4ED8] hover:text-[#1E40AF] transition-colors cursor-pointer disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || lockoutRemaining > 0}
                className="w-full h-12 px-4 rounded-[10px] font-semibold text-sm text-white bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#1E3A8A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    <span>Signing in...</span>
                  </div>
                ) : lockoutRemaining > 0 ? (
                  <span>Locked ({lockoutRemaining}s)</span>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>
          </form>

          {/* Factually Accurate Security Hygiene Notice */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
            <p className="text-xs text-slate-500 font-normal">
              Authorized personnel only. Activity may be logged.
            </p>
          </div>
        </div>

        {/* Footer: Empty spacer or clean copyright for balanced layout */}
        <div className="w-full max-w-[420px] mx-auto text-center text-xs text-slate-400 py-2">
          Nexalus Innovations Operations Console
        </div>
      </div>
    </div>
  );
};
