import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Layers,
  ChevronDown,
  Cpu,
  ShoppingCart,
  ShieldCheck,
  Truck,
  ArrowRight,
  LogOut,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, UserCheck } from 'lucide-react';
import { QuoteModal } from './QuoteModal';
import { PlanCartModal } from './PlanCartModal';
import { getPlanCart } from '../../firebase/services';
import { NEXALUS_LOGO_BASE64 } from '../../utils/companyLogoBase64';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated, isCustomer, isAdmin } = useAuth();
  const { success } = useToast();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [cartCount, setCartCount] = useState<number>(() => {
    try {
      return getPlanCart().length;
    } catch {
      return 0;
    }
  });
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const effectiveCartCount = isAuthenticated ? cartCount : 0;

  React.useEffect(() => {
    const handleCartUpdate = (e?: any) => {
      const items = e?.detail || getPlanCart();
      setCartCount(Array.isArray(items) ? items.length : 0);
    };
    const handleOpenCart = () => {
      setIsCartModalOpen(true);
    };

    window.addEventListener('nexalus_plan_cart_updated', handleCartUpdate);
    window.addEventListener('open_plan_cart', handleOpenCart);

    // Initial check on mount or user switch
    handleCartUpdate();

    return () => {
      window.removeEventListener('nexalus_plan_cart_updated', handleCartUpdate);
      window.removeEventListener('open_plan_cart', handleOpenCart);
    };
  }, [currentUser?.uid, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleSignOut = async () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    success('Signed Out', 'You have been logged out successfully.');
    if (location.pathname.startsWith('/account')) {
      navigate('/');
    }
  };

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
            {/* Left Section: Nexalus Brand Identity + Desktop Navigation Links */}
            <div className="flex items-center gap-5 xl:gap-8 min-w-0">
              {/* Nexalus Logo / Identity */}
              <Link to="/" className="flex items-center gap-3 sm:gap-3.5 group shrink-0">
                <div className="relative shrink-0">
                  <img
                    src="/images/parent-company-logo.jpg"
                    alt="Nexalus Innovations LLP"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = NEXALUS_LOGO_BASE64;
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain bg-white shadow-sm border border-slate-200/90 p-0.5 group-hover:scale-105 group-hover:shadow-md transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center leading-snug">
                    <span className="font-black text-base sm:text-lg xl:text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors whitespace-nowrap">
                      NEXALUS INNOVATIONS LLP
                    </span>
                  </div>
                  <span className="hidden sm:block text-[10.5px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                    Enterprise Technology &bull; Infrastructure
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
                <Link
                  to="/"
                  className={`px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                    isActive('/') && location.pathname === '/'
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                    isActive('/about')
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  About Us
                </Link>

                {/* Brands Dropdown */}
                <div className="relative group">
                  <Link
                    to="/brands"
                    className={`inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                      isActive('/brands')
                        ? 'text-blue-600 bg-blue-50/80'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Our Brands</span>
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </Link>

                  <div className="absolute top-full left-0 w-80 pt-2 before:absolute before:-top-3 before:left-0 before:w-full before:h-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="p-2.5 bg-white rounded-2xl shadow-xl border border-slate-200/90 space-y-1">
                      <Link
                        to="/brands/nexalus-innovations"
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
                            CCTV, Fiber Internet &amp; Office Networking
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/brands/am-distributors"
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
                            Mineral Water, Dairy &amp; Cold-Chain Logistics Hub
                          </div>
                        </div>
                      </Link>

                      <div className="pt-2 mt-2 border-t border-slate-100 px-3">
                        <Link
                          to="/brands"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
                        >
                          <span>View All Brands</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  to="/services"
                  className={`px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                    isActive('/services')
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Services
                </Link>
                <Link
                  to="/plans"
                  className={`px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                    isActive('/plans')
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Plans & Pricing
                </Link>
                <Link
                  to="/products"
                  className={`px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                    isActive('/products')
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Products
                </Link>
                <Link
                  to="/contact"
                  className={`px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                    isActive('/contact')
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  Contact
                </Link>
              </nav>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0 ml-4">
              {/* Broadband Cart Badge Icon (Visible only if authenticated customer with items) */}
              <button
                type="button"
                onClick={() => setIsCartModalOpen(true)}
                className="relative inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Open Broadband Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {effectiveCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {effectiveCartCount}
                  </span>
                )}
              </button>

              {/* Administrator Action */}
              {isAuthenticated && isAdmin ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 shadow-xs transition-all cursor-pointer"
                    title="Open Administration Console"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                    <span>Admin Console</span>
                  </Link>

                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                      title="Admin Account"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">
                        {(currentUser?.displayName || 'A').charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-3.5 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {currentUser?.displayName || 'Administrator'}
                            </span>
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              Admin
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {currentUser?.email}
                          </p>
                        </div>
                        <div className="p-2 space-y-1">
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="w-full py-2 px-3 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Launch Admin Console</span>
                          </Link>
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-all cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-600" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : isAuthenticated && isCustomer ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 transition-all cursor-pointer shadow-2xs group focus:outline-none"
                    title="My Account"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors max-w-[130px] truncate">
                      {currentUser?.displayName || 'Customer'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu (only visible when user clicks) */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* Customer Details Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {currentUser?.displayName || 'Customer'}
                            </span>
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {currentUser?.email}
                          </p>
                          {currentUser?.phone && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {currentUser?.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Actions */}
                      <div className="p-2.5 bg-white space-y-1.5">
                        <Link
                          to="/account"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-98 text-blue-800 font-bold text-xs flex items-center gap-2 border border-blue-200 transition-all cursor-pointer shadow-2xs"
                        >
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">My Profile &amp; Subscriber Portal</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-all cursor-pointer shadow-2xs"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open_customer_portal', { detail: { view: 'choice' } }));
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Customer Portal</span>
                </button>
              )}

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
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2">
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

            {/* Our Brands in Mobile Drawer */}
            <div className="px-3 py-2.5 rounded-xl bg-slate-50 space-y-2 border border-slate-200/80 my-1">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Our Brands
              </div>
              <Link
                to="/brands/nexalus-innovations"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-bold text-blue-900 py-1 hover:text-blue-600"
              >
                <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Nexalus Innovations (CCTV, Fiber, Network)</span>
              </Link>
              <Link
                to="/brands/am-distributors"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-bold text-teal-900 py-1 hover:text-teal-600"
              >
                <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>A.M. Distributors Chiplun (FMCG Logistics)</span>
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
              to="/plans"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Plans & Pricing
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

            <div className="pt-3 flex flex-col gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartModalOpen(true);
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-orange-500" />
                  <span>Broadband Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-extrabold text-[10px]">
                    {cartCount} item{cartCount > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              {isAuthenticated && isAdmin ? (
                <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-200/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {(currentUser?.displayName || 'A').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.displayName || 'Administrator'}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                      ADMIN
                    </span>
                  </div>
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-200" />
                    <span>Open Admin Console</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : isAuthenticated && isCustomer ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.displayName || 'Customer'}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-blue-100" />
                    <span>My Profile &amp; Subscriber Portal</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open_customer_portal', { detail: { view: 'choice' } }));
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Customer Portal</span>
                </button>
              )}



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
            </div>
          </div>
        )}
      </header>

      {/* Global Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />

      {/* Global Plan Cart Modal */}
      <PlanCartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onProceedToOrder={(plan) => {
          if (!isCustomer) {
            try {
              sessionStorage.setItem('nexalus_pending_order_plan', JSON.stringify(plan));
            } catch {}
            window.dispatchEvent(
              new CustomEvent('open_customer_portal', {
                detail: {
                  view: 'choice',
                  context: 'cart_checkout',
                  prompt: 'Customer Login Required: Please register or log in with your verified Customer account to complete your broadband booking.'
                }
              })
            );
            return;
          }
          window.dispatchEvent(
            new CustomEvent('open_plan_order_direct', { detail: plan })
          );
        }}
      />
    </>
  );
};
