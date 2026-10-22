import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Cpu,
  Menu,
  X,
  PhoneCall,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Layers,
  Shield,
  Wifi,
  Server,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Clock,
  Lock
} from 'lucide-react';
import { Button } from '../common/Button';
import { QuoteModal } from '../common/QuoteModal';
import { ScrollToTop } from '../common/PublicLayout';
import { FloatingWhatsAppButton } from '../common/FloatingWhatsAppButton';
import { FloatingCallButton } from '../common/FloatingCallButton';
import { CustomerChoiceModal } from '../common/CustomerChoiceModal';
import { useAuth } from '../../context/AuthContext';
import { User, UserCheck } from 'lucide-react';

export const NexalusInnovationsLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const { isAuthenticated, isCustomer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/brands/nexalus-innovations';

  const navLinks = [
    { label: 'Home', path: '/brands/nexalus-innovations' },
    { label: 'About Us', path: '/brands/nexalus-innovations/about' },
    { label: 'Hardware Catalog', path: '/brands/nexalus-innovations/products' },
    { label: 'Services & AMC', path: '/brands/nexalus-innovations/services' },
    { label: 'Contact & Sales Desk', path: '/brands/nexalus-innovations/contact' }
  ];

  const isCurrent = (path: string) => {
    if (path === '/brands/nexalus-innovations') {
      return location.pathname === '/brands/nexalus-innovations';
    }
    return location.pathname.startsWith(path);
  };

  const getSubPageTitle = () => {
    if (location.pathname.includes('/about')) return 'About Nexalus Innovations';
    if (location.pathname.includes('/products')) return 'Hardware Catalog & Specifications';
    if (location.pathname.includes('/services')) return 'Engineering Services & AMC';
    if (location.pathname.includes('/contact')) return 'Contact Technical Sales Desk';
    return 'Operating Portal';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <ScrollToTop />

      {/* Top Corporate Affiliation & Return Bar */}
      <div className="bg-slate-950 text-slate-200 border-b border-indigo-950/60 text-xs py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-800/60 font-semibold transition-all shadow-xs group text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
              <span>← Back to Nexalus Innovations LLP</span>
            </Link>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-indigo-200 font-medium">
              Technology &amp; Security Engineering Division
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping" />
              <span className="text-cyan-300 font-semibold">24/7 Operations NOC SLA</span>
            </span>
            <Link to="/brands/nexalus-innovations/contact" className="hover:text-cyan-300 transition-colors">
              Tech Support Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Dedicated Brand Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <Link
            to="/brands/nexalus-innovations"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform border border-indigo-400/30">
              <Cpu className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                NEXALUS INNOVATIONS
              </div>
              <div className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase mt-1">
                CCTV • Fiber Internet • Enterprise IT Networking
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = isCurrent(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-700 hover:bg-slate-100/80'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && isCustomer ? (
              <Link
                to="/account"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-xs"
                title="My Customer Account"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>My Account</span>
              </Link>
            ) : !isAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer"
                title="Customer Portal Registration & Login"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Customer Portal</span>
              </button>
            ) : null}
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsQuoteOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20"
              icon={<PhoneCall className="w-4 h-4 text-cyan-300" />}
            >
              Request Proposal
            </Button>
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-indigo-100 px-4 pt-2 pb-6 space-y-2 shadow-lg">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-indigo-300 hover:text-white font-bold text-sm shadow-xs mb-3 border border-indigo-900"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>← Back to Nexalus Innovations LLP</span>
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isCurrent(item.path)
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsQuoteOpen(true);
                }}
              >
                Request Proposal
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Interior Page Breadcrumbs & Back Button */}
      {false && (
        <div className="bg-white border-b border-slate-200/90 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
            <button
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate('/brands/nexalus-innovations');
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors border border-slate-200/90 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link
                to="/brands/nexalus-innovations"
                className="text-slate-600 hover:text-blue-600 transition-colors"
              >
                Nexalus Innovations
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-900 font-bold">{getSubPageTitle()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Website Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Dedicated Brand Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Cpu className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-lg tracking-tight">
                    NEXALUS INNOVATIONS
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                    Technology &amp; Network Infrastructure
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operating as the dedicated technology division under Nexalus Innovations LLP. Authorized contractor for 4K CCTV surveillance grids, high-speed optical fiber internet, managed switching, and certified AMC maintenance.
              </p>
              <div className="text-xs text-slate-400 pt-1">
                Parent Entity: <strong className="text-slate-200">Nexalus Innovations LLP</strong>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                Division Links
              </h4>
              <ul className="space-y-2 text-xs">
                {navLinks.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/admin/login"
                    className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 pt-1.5 font-medium"
                  >
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Tech Admin Login</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1 pt-2"
                  >
                    <span>← Return to Parent LLP Website</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Technical Solutions */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                Technical Solutions
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>• 4K Starlight Color Night IP Cameras</li>
                <li>• Symmetrical Gigabit Leased Lines</li>
                <li>• Layer-2 / Layer-3 Managed PoE+ Switches</li>
                <li>• Fluke Certified Cat6A &amp; Fiber Splicing</li>
                <li>• 24/7 Surveillance Operations Room AMC</li>
                <li>• Gate ANPR &amp; Tripwire Intrusion Alarms</li>
              </ul>
            </div>

            {/* Column 4: Contact & Desk */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                Engineering Desk
              </h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Maharashtra Operations Hub, Ratnagiri &amp; Konkan Region</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>tech@nexalusinnovations.com</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>+91 94220 00000 / +91 98230 00000</span>
                </li>
              </ul>
              <div className="pt-4">
                <Button
                  variant="outline-white"
                  size="sm"
                  onClick={() => setIsQuoteOpen(true)}
                  className="w-full text-xs font-semibold border-indigo-900 hover:bg-indigo-950 text-cyan-300"
                >
                  Schedule Site Survey
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} Nexalus Innovations. All rights reserved. A subsidiary of Nexalus Innovations LLP.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/brands/nexalus-innovations/about" className="hover:text-slate-400">
                About Division
              </Link>
              <span>•</span>
              <Link to="/brands/nexalus-innovations/contact" className="hover:text-slate-400">
                Contact
              </Link>
              <span>•</span>
              <Link to="/admin/login" className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>Admin Login</span>
              </Link>
              <span>•</span>
              <Link to="/" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Main LLP Corporate Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Direct Phone Call Floating Button (Directly Above WhatsApp) */}
      <FloatingCallButton phoneNumber="+919158886444" title="Direct Call Admin: +91 9158886444" />

      {/* Quick WhatsApp / Calling Connect Floating Button */}
      <FloatingWhatsAppButton
        phoneNumber="919158886444"
        message="Hello Nexalus Innovations, I would like to inquire about your CCTV surveillance, fiber internet and enterprise networking services."
        title="Call or Chat on WhatsApp (+91 9158886444)"
      />

      {/* Quote Modal */}
      <CustomerChoiceModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        initialView="login"
      />

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="nexalus-innovations"
      />
    </div>
  );
};
