import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Wifi, Menu, X, PhoneCall, ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import { Button } from '../common/Button';
import { QuoteModal } from '../common/QuoteModal';
import { CoverageCheckerModal } from './CoverageCheckerModal';
import { ScrollToTop } from '../common/PublicLayout';

export const OneBroadbandLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isCoverageOpen, setIsCoverageOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/brands/one-broadband' },
    { label: 'About Us', path: '/brands/one-broadband/about' },
    { label: 'Internet Plans', path: '/brands/one-broadband/plans' },
    { label: 'Wi-Fi Hardware', path: '/brands/one-broadband/products' },
    { label: 'FTTH Services', path: '/brands/one-broadband/services' },
    { label: 'Coverage Check', path: '/brands/one-broadband/coverage' },
    { label: 'Contact', path: '/brands/one-broadband/contact' }
  ];

  const isCurrent = (path: string) => {
    if (path === '/brands/one-broadband') {
      return location.pathname === '/brands/one-broadband';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <ScrollToTop />



      {/* One Broadband Dedicated Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo - Links to One Broadband Home */}
          <Link
            to="/brands/one-broadband"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-teal-700 transition-colors">
                ONE BROADBAND
              </div>
              <div className="text-[10px] font-bold text-teal-700 tracking-widest uppercase mt-0.5">
                High-Speed Fiber Internet
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

          {/* Right Header Action */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCoverageOpen(true)}
              icon={<Search className="w-3.5 h-3.5" />}
              className="text-xs border-teal-200 text-teal-800 hover:bg-teal-50"
            >
              Check PIN
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={() => setIsQuoteOpen(true)}
              className="shadow-sm shadow-teal-600/20"
            >
              Book Connection
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 shadow-lg animate-fadeIn">
            {navLinks.map((item) => {
              const active = isCurrent(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-teal-50 text-teal-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="teal"
                size="md"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsQuoteOpen(true);
                }}
                className="w-full"
              >
                Book Connection
              </Button>
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Back to Nexalus Corporate Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Return to Main Portal Strip */}
      <div className="bg-slate-100 border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Corporate Affiliation
            </div>
            <div className="text-sm font-semibold text-slate-800">
              One Broadband Optical Division is an authorized business unit of <span className="text-slate-950 font-bold">Nexalus Innovations LLP</span>.
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 hover:text-blue-700 font-bold text-sm shadow-xs hover:shadow transition-all group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Main Nexalus Portal
          </Link>
        </div>
      </div>

      {/* Dedicated One Broadband Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-white tracking-tight">ONE BROADBAND</span>
                  <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                    High-Speed Fiber Division
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
                Next-generation pure optical fiber internet with symmetrical download & upload speeds. Truly unlimited data from 60 Mbps to 1 Gbps, dual-band Wi-Fi 6 routers, and enterprise leased lines.
              </p>

              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <div>Broadband NOC Hotline: <span className="text-white font-medium">+91 (0) 80 4123 4500</span></div>
                <div>Billing & Connection Desk: <span className="text-white font-medium">broadband@nexalusinnovations.com</span></div>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Broadband Portal</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/brands/one-broadband" className="hover:text-teal-400 transition-colors">Broadband Home</Link></li>
                <li><Link to="/brands/one-broadband/about" className="hover:text-teal-400 transition-colors">About Our Fiber</Link></li>
                <li><Link to="/brands/one-broadband/plans" className="hover:text-teal-400 transition-colors">All 7 Internet Plans</Link></li>
                <li><Link to="/brands/one-broadband/products" className="hover:text-teal-400 transition-colors">Wi-Fi Routers & Mesh</Link></li>
                <li><Link to="/brands/one-broadband/services" className="hover:text-teal-400 transition-colors">FTTH & Leased Lines</Link></li>
                <li><Link to="/brands/one-broadband/coverage" className="hover:text-teal-400 transition-colors">Check PIN Coverage</Link></li>
                <li><Link to="/brands/one-broadband/contact" className="hover:text-teal-400 transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            {/* Col 3: Data Plans */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Popular Tariffs</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/brands/one-broadband/plans" className="hover:text-teal-400 transition-colors">60 Mbps Unlimited (₹600/mo)</Link></li>
                <li><Link to="/brands/one-broadband/plans" className="hover:text-teal-400 transition-colors">100 Mbps Unlimited (₹1,100/mo)</Link></li>
                <li><Link to="/brands/one-broadband/plans" className="hover:text-teal-400 transition-colors">150 Mbps Unlimited (₹1,500/mo)</Link></li>
                <li><Link to="/brands/one-broadband/plans" className="hover:text-teal-400 transition-colors">200 Mbps Unlimited (₹2,000/mo)</Link></li>
                <li><Link to="/brands/one-broadband/plans" className="hover:text-teal-400 transition-colors">300 Mbps Unlimited (₹3,000/mo)</Link></li>
                <li><Link to="/brands/one-broadband/plans" className="hover:text-teal-400 transition-colors">1 Gbps Enterprise (₹12,000/mo)</Link></li>
              </ul>
            </div>

            {/* Col 4: Corporate Link */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Nexalus Network</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link to="/" className="hover:text-white flex items-center gap-1 text-teal-400">
                    Nexalus Corporate Portal <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
                <li><Link to="/brands/cp-plus" className="hover:text-sky-400 transition-colors">CP PLUS (Security & CCTV)</Link></li>
                <li><Link to="/brands/itti-networking" className="hover:text-indigo-400 transition-colors">ITTI Networking (Hardware)</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Corporate Services</Link></li>
                <li><Link to="/quote" className="hover:text-white transition-colors">Enterprise Quotations</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} One Broadband Division. Operated under Nexalus Innovations LLP.
            </div>
            <div className="flex items-center gap-4">
              <Link to="/brands/one-broadband/contact" className="hover:text-slate-300">Support Desk</Link>
              <span>•</span>
              <Link to="/" className="hover:text-slate-300">Nexalus Portal</Link>
            </div>
          </div>
        </div>
      </footer>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="one-broadband"
      />

      <CoverageCheckerModal
        isOpen={isCoverageOpen}
        onClose={() => setIsCoverageOpen(false)}
      />
    </div>
  );
};
