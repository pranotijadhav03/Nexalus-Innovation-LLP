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
import { User, UserCheck, Sparkles, Package } from 'lucide-react';
import { QuoteModal } from './QuoteModal';
import {
  getPlanCart,
  getScopedPlanCart,
  getCachedCategories,
  getCachedProducts,
  subscribeToCategories,
  subscribeToProducts
} from '../../firebase/services';
import { ProductCategory, Product } from '../../types';
import { initialCategories, initialProducts } from '../../data/initialData';
import { NEXALUS_LOGO_BASE64 } from '../../utils/companyLogoBase64';

const getCategoryRepresentativeImage = (cat: ProductCategory, catProducts: Product[]): string => {
  const productWithImg = catProducts.find(p => p.images && p.images.length > 0 && p.images[0]);
  if (productWithImg) return productWithImg.images[0];

  const key = (cat.id + ' ' + cat.name + ' ' + (cat.slug || '')).toLowerCase();
  if (key.includes('cctv') || key.includes('camera') || key.includes('surveillance')) {
    return '/images/products/cp-dome.jpg';
  }
  if (key.includes('fiber') || key.includes('internet') || key.includes('ont') || key.includes('router') || key.includes('broadband')) {
    return '/images/products/fiber-ont.jpg';
  }
  if (key.includes('network') || key.includes('switch') || key.includes('poe')) {
    return '/images/products/poe-switch.jpg';
  }
  if (key.includes('water') || key.includes('dairy') || key.includes('beverage') || key.includes('fmcg')) {
    return '/images/projects/am-distributors-chiplun.jpg';
  }
  if (key.includes('cabling') || key.includes('cable') || key.includes('hardware') || key.includes('rack') || key.includes('infrastructure') || key.includes('electronics')) {
    return '/images/products/cat6-cable.jpg';
  }
  return '/images/products/cp-dome.jpg';
};

const getCategoryGridClass = (count: number) => {
  if (count <= 2) return 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto';
  if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  if (count === 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
};

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsMegaOpen, setIsProductsMegaOpen] = useState(false);
  const productsTimeoutRef = useRef<any>(null);

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const list = getCachedCategories('nexalus-llp');
    return list.length > 0 ? list : initialCategories.filter(c => c.id.includes('nexalus-llp'));
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const list = getCachedProducts('nexalus-llp');
    return list.length > 0 ? list : initialProducts.filter(p => p.id.includes('nexalus-llp'));
  });

  useEffect(() => {
    const unsubCats = subscribeToCategories((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats.filter(c => c.id.includes('nexalus-llp') || c.companyId === 'nexalus-llp'));
      }
    }, 'nexalus-llp');

    const unsubProds = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) {
        setProducts(prods.filter(p => p.id.includes('nexalus-llp') || p.companyId === 'nexalus-llp'));
      }
    }, 'nexalus-llp');

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  const handleProductsEnter = () => {
    if (productsTimeoutRef.current) clearTimeout(productsTimeoutRef.current);
    setIsProductsMegaOpen(true);
  };

  const handleProductsLeave = () => {
    productsTimeoutRef.current = setTimeout(() => {
      setIsProductsMegaOpen(false);
    }, 350);
  };

  useEffect(() => {
    setIsProductsMegaOpen(false);
  }, [location.pathname]);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const { currentUser, logout, isAuthenticated, isCustomer, isAdmin } = useAuth();
  const { success } = useToast();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownTimeoutRef = useRef<any>(null);

  const handleProfileEnter = () => {
    if (profileDropdownTimeoutRef.current) clearTimeout(profileDropdownTimeoutRef.current);
    setIsProfileDropdownOpen(true);
  };

  const handleProfileLeave = () => {
    profileDropdownTimeoutRef.current = setTimeout(() => {
      setIsProfileDropdownOpen(false);
    }, 300);
  };
  const [cartCount, setCartCount] = useState<number>(() => {
    try {
      return getScopedPlanCart('nexalus-llp').length;
    } catch {
      return 0;
    }
  });

  const effectiveCartCount = isAuthenticated ? cartCount : 0;

  const isLinkedToParent = currentUser
    ? (currentUser.associatedCompanies
        ? currentUser.associatedCompanies.includes('nexalus-llp')
        : (!currentUser.primaryCompany || currentUser.primaryCompany === 'nexalus-llp'))
    : false;

  React.useEffect(() => {
    const handleCartUpdate = (e?: any) => {
      const items = getScopedPlanCart('nexalus-llp');
      setCartCount(Array.isArray(items) ? items.length : 0);
    };
    const handleOpenCart = () => {
      navigate('/account?section=my_cart');
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs relative">
        {/* Main Navigation Bar */}
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-2 xl:gap-4">
            {/* Nexalus Logo / Identity */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="relative shrink-0">
                <img
                  src="/images/parent-company-logo.jpg"
                  alt="Nexalus Innovations LLP"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = NEXALUS_LOGO_BASE64;
                  }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain bg-white shadow-xs border border-slate-200/90 p-0.5 group-hover:scale-105 transition-all duration-200"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center leading-snug">
                  <span className="font-black text-sm sm:text-base xl:text-lg tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors whitespace-nowrap">
                    NEXALUS INNOVATIONS LLP
                  </span>
                </div>
                <span className="hidden xl:block text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                  Enterprise Technology &bull; Infrastructure
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Centrally Positioned, Balanced, Responsive) */}
            <nav className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1.5 flex-1 min-w-0 mx-1.5 xl:mx-4">
              <Link
                to="/"
                className={`px-2 xl:px-3 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-2 xl:px-3 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
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
                  className={`inline-flex items-center gap-1 px-2 xl:px-3 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                    isActive('/brands')
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Our Brands</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
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
                className={`px-2 xl:px-3 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                  isActive('/services')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Services
              </Link>
              <Link
                to="/plans"
                className={`px-2 xl:px-3 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                  isActive('/plans')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span>Plans</span>
                <span className="hidden xl:inline">&nbsp;& Pricing</span>
              </Link>
              <div
                className="relative"
                onMouseEnter={handleProductsEnter}
                onMouseLeave={handleProductsLeave}
              >
                <Link
                  to="/products"
                  onClick={() => setIsProductsMegaOpen(false)}
                  className={`inline-flex items-center gap-1 px-2 xl:px-3 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                    isActive('/products') || isProductsMegaOpen
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Products</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductsMegaOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </Link>
              </div>
              <Link
                to="/contact"
                className={`px-2 xl:px-3 py-1.5 text-xs xl:text-sm font-bold whitespace-nowrap rounded-lg transition-colors ${
                  isActive('/contact')
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0 ml-auto">
              {/* Scoped Cart Badge Icon - Navigates directly to Customer Profile My Cart Section */}
              <Link
                to="/account?section=my_cart"
                className="relative inline-flex items-center justify-center p-1.5 xl:p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Open My Cart"
              >
                <ShoppingCart className="w-4 h-4 xl:w-5 xl:h-5" />
                {effectiveCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-black text-[9px] xl:text-[10px] w-3.5 h-3.5 xl:w-4 xl:h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {effectiveCartCount}
                  </span>
                )}
              </Link>

              {/* Administrator Action */}
              {isAuthenticated && isAdmin ? (
                <div className="flex items-center gap-1.5 xl:gap-2">
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 py-1 xl:py-1.5 px-2.5 xl:px-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                    title="Open Administration Console"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                    <span className="hidden xl:inline">Admin Console</span>
                    <span className="xl:hidden">Admin</span>
                  </Link>

                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="inline-flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                      title="Admin Account"
                    >
                      <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-[10px] xl:text-[11px] flex items-center justify-center">
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
                !isLinkedToParent ? (
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open_customer_portal', { detail: { view: 'sso_link' } }));
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 transition-all cursor-pointer shadow-2xs group"
                    title="Connect your account to Nexalus Innovations LLP"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-black text-[10px] flex items-center justify-center">
                      {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-amber-900 max-w-[110px] truncate">
                      Connect {currentUser?.displayName?.split(' ')[0] || 'Account'}
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">SSO</span>
                  </button>
                ) : (
                <div
                  className="relative"
                  ref={profileDropdownRef}
                  onMouseEnter={handleProfileEnter}
                  onMouseLeave={handleProfileLeave}
                >
                  <Link
                    to="/account"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 transition-all cursor-pointer shadow-2xs group focus:outline-none"
                    title="My Profile & Customer Portal"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors max-w-[130px] truncate">
                      {currentUser?.displayName || 'Customer'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </Link>

                  {/* Dropdown Menu (visible on hover or click) */}
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
                        <Link
                          to="/account?section=my_cart"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full py-2 px-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ShoppingCart className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">My Cart</span>
                          </div>
                          {cartCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              {cartCount}
                            </span>
                          )}
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
              )
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
                size="sm"
                className="px-3 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm font-bold whitespace-nowrap shadow-sm shrink-0"
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

                {/* Products Mega Dropdown (Dynamic Categories) */}
        {isProductsMegaOpen && (
          <div
            onMouseEnter={handleProductsEnter}
            onMouseLeave={handleProductsLeave}
            className="hidden lg:block absolute top-full left-0 right-0 w-full bg-white border-b border-blue-100 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
              {/* Header inside Mega Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Product Categories &amp; Hardware Catalog
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Explore commercial CCTV cameras, high-speed fiber ONTs, enterprise switches, cabling &amp; FMCG distribution.
                  </p>
                </div>
                <Link
                  to="/products"
                  onClick={() => setIsProductsMegaOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors group/all shrink-0"
                >
                  <span>View All Products ({products.length})</span>
                  <ArrowRight className="w-4 h-4 group-hover/all:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Grid of Active Categories (Strictly filtered to Nexalus Innovations LLP, capped at 5) */}
              {(() => {
                const parentCategories = categories.filter(c => c.id.includes('nexalus-llp') || c.companyId === 'nexalus-llp');
                const visibleCategories = parentCategories.slice(0, 5);
                return (
                  <div className={`grid ${getCategoryGridClass(visibleCategories.length)} gap-3 sm:gap-4 pt-4 sm:pt-5`}>
                    {visibleCategories.map((cat) => {
                      const catProducts = products.filter(p => (p.categoryId === cat.id || p.categoryName === cat.name) && p.published !== false);
                      const count = catProducts.length;
                      const catImg = getCategoryRepresentativeImage(cat, catProducts);

                      return (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.id}`}
                          onClick={() => setIsProductsMegaOpen(false)}
                          className="group/card p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
                        >
                          <div>
                            <div className="w-full h-28 sm:h-32 rounded-xl bg-slate-50 group-hover/card:bg-white flex items-center justify-center p-2.5 mb-2.5 transition-colors border border-slate-100 overflow-hidden">
                              <img
                                src={catImg}
                                alt={cat.name}
                                className="max-h-full max-w-full object-contain group-hover/card:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <div className="text-xs sm:text-sm font-black text-slate-900 group-hover/card:text-blue-700 transition-colors leading-snug line-clamp-1">
                              {cat.name}
                            </div>
                            {cat.description && (
                              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {cat.description}
                              </p>
                            )}
                          </div>
                          <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
                            <span className="font-bold text-slate-500">
                              {count} {count === 1 ? 'Product' : 'Products'}
                            </span>
                            <span className="font-extrabold text-blue-600 group-hover/card:translate-x-1 transition-transform flex items-center gap-1">
                              Explore <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

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
              <Link
                to="/account?section=my_cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-orange-500" />
                  <span>My Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-extrabold text-[10px]">
                    {cartCount} item{cartCount > 1 ? 's' : ''}
                  </span>
                )}
              </Link>

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
                !isLinkedToParent ? (
                  <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shrink-0">
                          {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {currentUser?.displayName || 'Customer'}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300">
                        SSO Detected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.dispatchEvent(new CustomEvent('open_customer_portal', { detail: { view: 'sso_link' } }));
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-[#0b2545] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Connect Account to Parent Company</span>
                    </button>
                  </div>
                ) : (
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
              )
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
    </>
  );
};
