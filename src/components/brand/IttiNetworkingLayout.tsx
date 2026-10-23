import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Server, Menu, X, PhoneCall, ArrowLeft, ArrowUpRight, Lock } from 'lucide-react';
import { Button } from '../common/Button';
import { QuoteModal } from '../common/QuoteModal';
import { ScrollToTop } from '../common/PublicLayout';

export const IttiNetworkingLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/brands/itti-networking' },
    { label: 'Products', path: '/products?brand=itti-networking' },
    { label: 'Services', path: '/services' },
    { label: 'Contact & AMC', path: '/contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <ScrollToTop />



      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            to="/brands/itti-networking"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-700 transition-colors">
                ITTI NETWORKING
              </div>
              <div className="text-[10px] font-bold text-indigo-700 tracking-widest uppercase mt-0.5">
                Enterprise Infrastructure & Firewalls
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsQuoteOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
            >
              Enterprise RFP Quote
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 shadow-lg animate-fadeIn">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Enterprise RFP Quote
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
              ITTI Networking Division is operated under <span className="text-slate-950 font-bold">Nexalus Innovations LLP</span>.
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

      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-white tracking-tight">ITTI NETWORKING</span>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    Infrastructure Division
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Sophos firewalls, Layer 2/3 core switches, Cat6A structured cabling, server rack cabinets, and campus network architectures.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Hardware</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/products?brand=itti-networking" className="hover:text-indigo-400">Sophos XGS Firewalls</Link></li>
                <li><Link to="/products?brand=itti-networking" className="hover:text-indigo-400">24/48-Port Managed PoE+ Switches</Link></li>
                <li><Link to="/products?brand=itti-networking" className="hover:text-indigo-400">High-Density Fiber LIUs</Link></li>
                <li><Link to="/products?brand=itti-networking" className="hover:text-indigo-400">Server Rack Cabinets</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Corporate Portal</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/" className="text-indigo-400 flex items-center gap-1 hover:text-white">Nexalus Corporate Portal <ArrowUpRight className="w-3 h-3" /></Link></li>
                <li><Link to="/brands/cp-plus" className="hover:text-sky-400">CP PLUS (Security & CCTV)</Link></li>
                <li><Link to="/brands/one-broadband" className="hover:text-teal-400">One Broadband (Fiber)</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Nexalus</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact Helpdesk</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct Line: <span className="text-white font-medium">+91 (0) 80 4123 4500</span><br />
                Email: <span className="text-white font-medium">networking@nexalusinnovations.com</span>
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} ITTI Networking Division. Operated under Nexalus Innovations LLP.
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/login" className="hover:text-indigo-400 text-slate-400 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-indigo-400" />
                <span>Admin Login</span>
              </Link>
              <span>•</span>
              <Link to="/" className="hover:text-slate-300">Nexalus Portal</Link>
            </div>
          </div>
        </div>
      </footer>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="itti-networking"
      />
    </div>
  );
};
