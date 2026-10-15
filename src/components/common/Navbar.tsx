import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  Menu,
  X,
  ChevronDown,
  Layers,
  ArrowRight,
  Cpu,
  Truck,
  Lock
} from 'lucide-react';
import { Button } from './Button';
import { QuoteModal } from './QuoteModal';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Nexalus Logo / Identity */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-102 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors leading-none">
                  NEXALUS
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wider uppercase mt-1">
                  INNOVATIONS LLP
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive('/about')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                About Us
              </Link>

              {/* Our Brands Mega Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsBrandsDropdownOpen(true)}
                onMouseLeave={() => setIsBrandsDropdownOpen(false)}
              >
                <Link
                  to="/brands"
                  className={`px-3 py-2 text-sm font-semibold rounded-lg inline-flex items-center gap-1 transition-colors ${
                    isActive('/brands')
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Our Brands
                  <ChevronDown className="w-4 h-4" />
                </Link>

                {isBrandsDropdownOpen && (
                  <div className="absolute top-full left-0 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 px-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Operating Companies
                    </div>

                    {/* Company 1: Nexalus Innovations */}
                    <Link
                      to="/brands/nexalus-innovations"
                      onClick={() => setIsBrandsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50 transition-colors group/item"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover/item:text-blue-700">
                          Nexalus Innovations
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                          CCTV, Fiber Internet, Enterprise IT &amp; Hardware
                        </div>
                      </div>
                    </Link>

                    {/* Company 2: A.M. Distributors Chiplun */}
                    <Link
                      to="/brands/am-distributors"
                      onClick={() => setIsBrandsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-teal-50 transition-colors group/item"
                    >
                      <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 group-hover/item:bg-teal-600 group-hover/item:text-white transition-colors">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover/item:text-teal-700">
                          A.M. Distributors Chiplun
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                          Mineral Water, Ice Cream, Milk &amp; Dairy Logistics Hub
                        </div>
                      </div>
                    </Link>

                    <div className="pt-2 mt-2 border-t border-slate-100 px-3">
                      <Link
                        to="/brands"
                        onClick={() => setIsBrandsDropdownOpen(false)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
                      >
                        View All Operating Companies <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/services"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive('/services')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Services
              </Link>
              <Link
                to="/products"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive('/products')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Products
              </Link>
              <Link
                to="/contact"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive('/contact')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                title="Admin Portal Login"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin Login</span>
              </Link>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Get a Quote
              </Button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              About Us
            </Link>

            <div className="px-3 py-2.5 rounded-lg bg-slate-50 space-y-2.5 border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Operating Companies
              </div>
              <Link
                to="/brands/nexalus-innovations"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-semibold text-blue-900 py-1 hover:text-blue-600"
              >
                <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
                Nexalus Innovations (CCTV, Fiber, Network)
              </Link>
              <Link
                to="/brands/am-distributors"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-semibold text-teal-900 py-1 hover:text-teal-600"
              >
                <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                A.M. Distributors Chiplun (Cold-Chain Hub)
              </Link>
            </div>

            <Link
              to="/services"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Services
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Products
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Contact
            </Link>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsQuoteModalOpen(true);
                }}
              >
                Get a Quote
              </Button>
              <Link
                to="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </>
  );
};
