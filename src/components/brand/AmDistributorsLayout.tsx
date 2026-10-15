import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Truck,
  Droplets,
  IceCream,
  Milk,
  Menu,
  X,
  PhoneCall,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '../common/Button';
import { QuoteModal } from '../common/QuoteModal';
import { ScrollToTop } from '../common/PublicLayout';

export const AmDistributorsLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/brands/am-distributors';

  const navLinks = [
    { label: 'Home', path: '/brands/am-distributors' },
    { label: 'About Depot', path: '/brands/am-distributors/about' },
    { label: 'Products & Supplies', path: '/brands/am-distributors/products' },
    { label: 'Cold-Chain & Fleet', path: '/brands/am-distributors/services' },
    { label: 'Depot Contact & Wholesale', path: '/brands/am-distributors/contact' }
  ];

  const isCurrent = (path: string) => {
    if (path === '/brands/am-distributors') {
      return location.pathname === '/brands/am-distributors';
    }
    return location.pathname.startsWith(path);
  };

  const getSubPageTitle = () => {
    if (location.pathname.includes('/about')) return 'About Chiplun Depot & Cold-Chain';
    if (location.pathname.includes('/products')) return 'Wholesale Products: Water, Ice Cream & Dairy';
    if (location.pathname.includes('/services')) return 'Cold-Chain Fleet & Logistics Services';
    if (location.pathname.includes('/contact')) return 'Chiplun Depot Wholesale Booking';
    return 'Operating Portal';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <ScrollToTop />

      {/* Top Corporate Affiliation & Return Bar */}
      <div className="bg-slate-950 text-slate-300 border-b border-slate-800 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-900/60 hover:bg-teal-800 text-teal-300 font-semibold border border-teal-700/60 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-teal-400" />
              <span>← Back to Nexalus Innovations LLP (Main Portal)</span>
            </Link>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-400">
              Chiplun Regional Cold-Chain &amp; Logistics Hub
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Dispatch: Daily 4:00 AM Morning Route</span>
            </span>
            <span className="flex items-center gap-1 text-teal-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>FSSAI Compliant</span>
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Brand Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <Link
            to="/brands/am-distributors"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-teal-600 transition-colors">
                A.M. DISTRIBUTORS
              </div>
              <div className="text-[10px] font-bold text-teal-700 tracking-wider uppercase mt-1">
                Chiplun Depot • Mineral Water • Ice Cream • Dairy
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
                      ? 'bg-teal-50 text-teal-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="teal"
              size="sm"
              onClick={() => setIsQuoteOpen(true)}
              className="shadow-sm font-bold"
            >
              Inquire Wholesale Supply
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isCurrent(item.path)
                    ? 'bg-teal-50 text-teal-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="teal"
                size="md"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsQuoteOpen(true);
                }}
              >
                Inquire Wholesale Supply
              </Button>
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center text-xs font-semibold text-slate-500 py-2 hover:text-teal-600"
              >
                ← Return to Nexalus Innovations LLP Main Portal
              </Link>
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
                  navigate('/brands/am-distributors');
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-teal-600 hover:bg-slate-100 transition-colors border border-slate-200/90 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link
                to="/brands/am-distributors"
                className="text-slate-600 hover:text-teal-600 transition-colors"
              >
                A.M. Distributors
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
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-lg tracking-tight">
                    A.M. DISTRIBUTORS
                  </div>
                  <div className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">
                    Chiplun Logistics &amp; Distribution Hub
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operating directly from Chiplun, Maharashtra under Nexalus Innovations LLP. The regional cold-chain and FMCG distributor supplying packaged mineral water, commercial ice creams, farm-fresh milk, butter, and full dairy products.
              </p>
              <div className="text-xs text-slate-400 pt-1">
                Parent Entity: <strong className="text-slate-200">Nexalus Innovations LLP</strong>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                Distribution Links
              </h4>
              <ul className="space-y-2 text-xs">
                {navLinks.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/"
                    className="text-teal-400 hover:text-teal-300 font-semibold transition-colors flex items-center gap-1 pt-2"
                  >
                    <span>← Return to Parent LLP Website</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Distribution Lines */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                Supply Verticals
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>• 20-Litre Mineral Water Jars &amp; Dispensers</li>
                <li>• 500ml &amp; 1L Bottled Mineral Water Cases</li>
                <li>• Commercial Bulk Ice Cream Tubs (Amul / Vadilal)</li>
                <li>• Retail Chocobars, Kulfis &amp; Gourmet Cones</li>
                <li>• Daily 4:00 AM Farm-Fresh Milk Pouches</li>
                <li>• Pure Cow Ghee &amp; Table Butter Catering Tins</li>
              </ul>
            </div>

            {/* Column 4: Depot Contact */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
                Chiplun Depot
              </h4>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>A.M. Distributors Depot, Kherdi MIDC Road, Chiplun 415605, Maharashtra</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>distributors@amchiplun.com</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>+91 94220 00000 / Chiplun Depot</span>
                </li>
              </ul>
              <div className="pt-4">
                <Button
                  variant="outline-white"
                  size="sm"
                  onClick={() => setIsQuoteOpen(true)}
                  className="w-full text-xs font-semibold"
                >
                  Book Bulk Order / Wholesale
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} A.M. Distributors Chiplun. All rights reserved. An operating company of Nexalus Innovations LLP.
            </div>
            <div className="flex items-center gap-4">
              <Link to="/brands/am-distributors/about" className="hover:text-slate-400">
                About Depot
              </Link>
              <span>•</span>
              <Link to="/brands/am-distributors/contact" className="hover:text-slate-400">
                Contact Depot
              </Link>
              <span>•</span>
              <Link to="/" className="text-teal-400 hover:text-teal-300 font-semibold">
                Main LLP Corporate Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Quote / Wholesale Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="am-distributors"
      />
    </div>
  );
};
