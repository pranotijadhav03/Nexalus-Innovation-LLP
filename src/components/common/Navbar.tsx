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
import { PlanOrderModal } from './PlanOrderModal';
import { getPlanCart } from '../../firebase/services';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated, isCustomer } = useAuth();
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
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  React.useEffect(() => {
    const handleCartUpdate = (e: any) => {
      const items = e?.detail || getPlanCart();
      setCartCount(Array.isArray(items) ? items.length : 0);
    };
    const handleOpenCart = () => {
      setIsCartModalOpen(true);
    };
    const handleDirectOrder = (e: any) => {
      if (e?.detail) {
        setSelectedPlanForOrder(e.detail);
        setIsOrderModalOpen(true);
      }
    };

    window.addEventListener('nexalus_plan_cart_updated', handleCartUpdate);
    window.addEventListener('open_plan_cart', handleOpenCart);
    window.addEventListener('open_plan_order_direct', handleDirectOrder);

    return () => {
      window.removeEventListener('nexalus_plan_cart_updated', handleCartUpdate);
      window.removeEventListener('open_plan_cart', handleOpenCart);
      window.removeEventListener('open_plan_order_direct', handleDirectOrder);
    };
  }, []);

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
                className={`px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
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
                  className={`inline-flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
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
                className={`px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                  isActive('/services')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Services
              </Link>
              <Link
                to="/plans"
                className={`px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                  isActive('/plans')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Plans & Pricing
              </Link>
              <Link
                to="/products"
                className={`px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                  isActive('/products')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Products
              </Link>
              <Link
                to="/contact"
                className={`px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
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
              {/* Broadband Cart Badge Icon */}
              <button
                type="button"
                onClick={() => setIsCartModalOpen(true)}
                className="relative inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Open Broadband Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Customer Profile & Portal Action */}
              {isAuthenticated && isCustomer ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#0b1739] to-slate-900 text-white border border-slate-800 shadow-md space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm border border-white/20">
                      {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate">
                          {currentUser?.displayName || 'Customer'}
                        </span>
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Verified
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate mt-0.5">
                        {currentUser?.email}
                      </p>
                      {currentUser?.phone && (
                        <p className="text-[10px] text-slate-300 truncate">
                          {currentUser?.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 border border-rose-500/40 transition-colors cursor-pointer"
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

              {isAuthenticated && isCustomer ? (
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>My Customer Account</span>
                </Link>
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
          if (!isAuthenticated) {
            try {
              sessionStorage.setItem('nexalus_pending_order_plan', JSON.stringify(plan));
            } catch {}
            window.dispatchEvent(
              new CustomEvent('open_customer_portal', {
                detail: {
                  view: 'choice',
                  context: 'cart_checkout',
                  prompt: 'Please register a new account, or log in if you already have an account, to complete your broadband booking.'
                }
              })
            );
            return;
          }
          setSelectedPlanForOrder(plan);
          setIsOrderModalOpen(true);
        }}
      />

      {/* Direct Plan Order Modal when checking out from Cart */}
      {selectedPlanForOrder && (
        <PlanOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedPlanForOrder(null);
          }}
          plan={selectedPlanForOrder}
          onOrderSuccess={() => {
            setIsOrderModalOpen(false);
            setSelectedPlanForOrder(null);
          }}
        />
      )}
    </>
  );
};
