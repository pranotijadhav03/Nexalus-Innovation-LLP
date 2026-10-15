import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      error('Email Required', 'Please enter your administrator email address.');
      return;
    }
    if (!password.trim()) {
      error('Password Required', 'Password is required to access the dashboard.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim(), password.trim());
    setIsSubmitting(false);

    if (res.success) {
      success('Dashboard Unlocked', 'Administrator credentials verified. Access granted.');
      navigate('/admin');
    } else {
      error('Access Denied', res.error || 'Invalid administrator email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Soft, Bright Modern Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-300/20 via-sky-200/25 to-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Crisp Subtle Dot Grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 text-slate-300"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="dot-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Main SaaS Card matching the Website's Clean Light Design System */}
      <div className="sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-blue-900/5 border border-slate-200 space-y-6">
          {/* Logo Mark: Official Website Layers Logo + Corporate Name */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-3">
              {/* Official Nexalus Innovations Logo Icon matching Navbar.tsx */}
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0 ring-4 ring-blue-500/10">
                <Layers className="w-7 h-7" />
              </div>

              <div className="text-left">
                <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  NEXALUS
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase leading-none mt-1">
                  INNOVATIONS LLP
                </div>
              </div>
            </div>

            {/* Portal Title & Sleek Blue Pill Badge */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ADMIN
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                MASTER PORTAL
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium text-center mt-1.5">
              Enterprise management and multi-tenant console access
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* EMAIL ADDRESS */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                ADMINISTRATOR EMAIL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="admin@nexalus.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 pl-10 pr-3.5 py-3 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-hidden transition-all font-medium shadow-2xs"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                SECURITY PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="admin123"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 pl-10 pr-10 py-3 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-hidden transition-all font-medium shadow-2xs"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button: Premium Corporate Blue matching the Website */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Enterprise Security Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted Admin Gateway</span>
          </div>

          {/* Footer Copyright */}
          <div className="text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              © 2026 Nexalus Innovations LLP. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
