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
  Sparkles,
  Lock
} from 'lucide-react';
import { Button } from '../common/Button';
import { QuoteModal } from '../common/QuoteModal';
import { ScrollToTop } from '../common/PublicLayout';
import { FloatingWhatsAppButton } from '../common/FloatingWhatsAppButton';
import { FloatingCallButton } from '../common/FloatingCallButton';
import { CustomerChoiceModal } from '../common/CustomerChoiceModal';
import { useAuth } from '../../context/AuthContext';
import { User, UserCheck, LogOut, ChevronDown, ShoppingCart, Package } from 'lucide-react';
import { isCustomerLinkedToCompany, getPlanCart, getScopedPlanCart } from '../../firebase/services';
import {
  getCachedBanners,
  subscribeToBanners,
  getCachedCategories,
  subscribeToCategories,
  getCachedProducts,
  subscribeToProducts
} from '../../firebase/services';
import { SiteBanner, NavItemConfig, ProductCategory, Product } from '../../types';
import { initialBanners, initialCategories, initialProducts } from '../../data/initialData';


const getCategoryRepresentativeImage = (cat: ProductCategory, catProducts: Product[]): string => {
  const productWithImg = catProducts.find(p => p.images && p.images.length > 0 && p.images[0]);
  if (productWithImg) return productWithImg.images[0];

  const key = (cat.id + ' ' + cat.name + ' ' + (cat.slug || '')).toLowerCase();
  if (key.includes('water') || key.includes('mineral')) {
    return '/images/products/am-water-jar-20l.jpg';
  }
  if (key.includes('ice') || key.includes('cream')) {
    return '/images/products/am-icecream-tub.jpg';
  }
  if (key.includes('dairy') || key.includes('milk') || key.includes('butter')) {
    return '/images/products/am-fresh-milk-dairy.jpg';
  }
  return '/images/products/am-water-jar-20l.jpg';
};

const getCategoryGridClass = (count: number) => {
  if (count <= 2) return 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto';
  if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  if (count === 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
};

export const AmDistributorsLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsMegaOpen, setIsProductsMegaOpen] = useState(false);
  const productsTimeoutRef = React.useRef<any>(null);

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const list = getCachedCategories('am-distributors');
    return list.length > 0 ? list : initialCategories.filter(c => c.id.startsWith('cat-am'));
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const list = getCachedProducts('am-distributors');
    return list.length > 0 ? list : initialProducts.filter(p => p.id.startsWith('prod-am'));
  });

  React.useEffect(() => {
    const unsubCats = subscribeToCategories((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    }, 'am-distributors');

    const unsubProds = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) setProducts(prods);
    }, 'am-distributors');

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
    }, 400);
  };

  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalView, setCustomerModalView] = useState<'choice' | 'register' | 'login' | 'forgot_password' | 'sso_link'>('choice');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownTimeoutRef = React.useRef<any>(null);
  const { isAuthenticated, isCustomer, currentUser, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Track A.M. Distributors cart item count (distinct products count)
  const [cartCount, setCartCount] = useState<number>(() => {
    try {
      return getScopedPlanCart('am-distributors', currentUser?.uid).length;
    } catch {
      return 0;
    }
  });

  React.useEffect(() => {
    const syncCart = () => {
      try {
        const count = getScopedPlanCart('am-distributors', currentUser?.uid).length;
        setCartCount(count);
      } catch {}
    };
    syncCart();
    window.addEventListener('nexalus_plan_cart_updated', syncCart);
    window.addEventListener('storage', syncCart);
    return () => {
      window.removeEventListener('nexalus_plan_cart_updated', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, [currentUser?.uid]);

  const handleProfileEnter = () => {
    if (profileDropdownTimeoutRef.current) clearTimeout(profileDropdownTimeoutRef.current);
    setIsProfileDropdownOpen(true);
  };

  const handleProfileLeave = () => {
    profileDropdownTimeoutRef.current = setTimeout(() => {
      setIsProfileDropdownOpen(false);
    }, 300);
  };

  // Trigger popup once per session for unlinked visitors (guests or users signed in under other companies)
  React.useEffect(() => {
    if (isLoading) return;

    // Check if customer is already linked to am-distributors
    const isLinkedToAm = isCustomerLinkedToCompany(currentUser, 'am-distributors');

    // If already linked, or an admin is signed in, do not auto-pop
    if (isLinkedToAm) return;
    if (currentUser && currentUser.role !== 'customer') return;

    try {
      const dismissKey = currentUser
        ? ('nexalus_choice_dismissed_am-distributors_' + currentUser.uid)
        : 'nexalus_choice_dismissed_am-distributors_guest';
      const dismissed = sessionStorage.getItem(dismissKey);
      if (!dismissed) {
        const timer = setTimeout(() => {
          setCustomerModalView('choice');
          setIsCustomerModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [currentUser, isLoading]);

  const [depotBanner, setDepotBanner] = useState<SiteBanner | null>(() => {
    const list = getCachedBanners('am-distributors');
    return list.find(b => b.id === 'ban-am' || b.brandId === 'am-distributors') || initialBanners.find(b => b.id === 'ban-am') || null;
  });

  React.useEffect(() => {
    const unsub = subscribeToBanners((banners) => {
      const b = banners.find(ban => ban.id === 'ban-am' || ban.brandId === 'am-distributors');
      if (b) setDepotBanner(b);
    }, 'am-distributors');
    return () => unsub();
  }, []);

  const isHome = location.pathname === '/brands/am-distributors';

  const defaultNavLinks: NavItemConfig[] = [
    { id: 'nav-am-home', label: 'Home', path: '/brands/am-distributors', visible: true, order: 1 },
    { id: 'nav-am-about', label: 'About Depot', path: '/brands/am-distributors/about', visible: true, order: 2 },
    { id: 'nav-am-products', label: 'Products & Supplies', path: '/brands/am-distributors/products', visible: true, order: 3 },
    { id: 'nav-am-services', label: 'Cold-Chain & Fleet', path: '/brands/am-distributors/services', visible: true, order: 4 },
    { id: 'nav-am-contact', label: 'Depot Contact & Wholesale', path: '/brands/am-distributors/contact', visible: true, order: 5 }
  ];

  const navLinks = (depotBanner?.navbarSettings?.navLinks && depotBanner.navbarSettings.navLinks.length > 0
    ? depotBanner.navbarSettings.navLinks
    : defaultNavLinks
  ).filter(l => l.visible !== false).sort((a, b) => a.order - b.order);

  const isCurrent = (path: string) => {
    if (path === '/brands/am-distributors') {
      return location.pathname === '/brands/am-distributors';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path: string, e?: React.MouseEvent) => {
    setIsMobileMenuOpen(false);
    setIsProductsMegaOpen(false);

    const isLanding = location.pathname === '/brands/am-distributors';

    // If clicking Home when already on depot landing page: smooth scroll to top
    if (isLanding && (path === '/brands/am-distributors' || path === '/' || path === '')) {
      if (e) e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Only intercept in-page anchor links containing '#'
    if (path.includes('#')) {
      const sectionId = path.split('#')[1];
      if (isLanding && sectionId) {
        const targetEl = document.getElementById(sectionId) ||
          document.getElementById(`sec-am-${sectionId}`) ||
          document.getElementById(`sec-${sectionId}`);

        if (targetEl) {
          if (e) e.preventDefault();
          const yOffset = -80;
          const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          navigate(`/brands/am-distributors#${sectionId}`, { replace: false });
          return;
        }
      }
    }

    // For all sub-pages (/about, /products, /services, /contact):
    // Explicitly navigate via React Router and reset scroll so contents reflect instantly
    if (e) e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
      {depotBanner?.navbarSettings?.showTopBanner !== false && (
        <div className="bg-slate-950 text-slate-200 border-b border-emerald-950/60 text-xs py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-800/60 font-semibold transition-all shadow-xs group text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Nexalus Innovations LLP</span>
              </Link>
              <span className="hidden md:inline text-slate-600">•</span>
              <span className="hidden md:inline text-emerald-200 font-medium">
                Chiplun Regional Cold-Chain &amp; Logistics Hub
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <a
                href={`tel:${(depotBanner?.navbarSettings?.topBannerPhone || depotBanner?.supportPhone || '+919158886444').replace(/\s+/g, '')}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-emerald-300 hover:text-white font-semibold transition-colors"
                title={`Call Chiplun Depot: ${depotBanner?.navbarSettings?.topBannerPhone || depotBanner?.supportPhone || '+91 9158886444'}`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{depotBanner?.navbarSettings?.topBannerPhone || depotBanner?.supportPhone || '+91 9158886444'}</span>
              </a>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{depotBanner?.navbarSettings?.topBannerText || 'Dispatch: Daily 4:00 AM Morning Route'}</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FSSAI Compliant Depot</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Brand Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs relative">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 xl:gap-4">
          {/* Brand Identity */}
          <Link
            to="/brands/am-distributors"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none shrink-0"
          >
            {depotBanner?.navbarSettings?.logoUrl ? (
              <img
                src={depotBanner.navbarSettings.logoUrl}
                alt="A.M. Distributors"
                className="h-10 sm:h-11 w-auto object-contain rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform border border-emerald-400/30 shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
              </div>
            )}
            <div>
              <div className="text-base sm:text-lg xl:text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                {depotBanner?.navbarSettings?.brandName || 'A.M. DISTRIBUTORS'}
              </div>
              <div className="hidden 2xl:block text-[9px] sm:text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase mt-1 whitespace-nowrap">
                {depotBanner?.navbarSettings?.tagline || 'Chiplun Depot • Mineral Water • Ice Cream • Dairy'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-3 flex-1 min-w-0 mx-4">
            {navLinks.map((item) => {
              const active = isCurrent(item.path);
              const isProducts = item.path.includes('/products') || item.label.toLowerCase().includes('product');

              if (isProducts) {
                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={handleProductsEnter}
                    onMouseLeave={handleProductsLeave}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsProductsMegaOpen(false)}
                      className={`inline-flex items-center gap-1 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-all ${
                        active || isProductsMegaOpen
                          ? 'bg-emerald-50 text-emerald-800 font-bold shadow-xs border border-emerald-200/80'
                          : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100/90'
                      }`}
                    >
                      <span>Products<span className="hidden 2xl:inline"> &amp; Supplies</span></span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductsMegaOpen ? 'rotate-180 text-emerald-700' : ''}`} />
                    </Link>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(item.path, e)}
                  className={`px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 font-bold shadow-xs border border-emerald-200/80'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100/90'
                  }`}
                >
                  {item.path.includes('/about') ? (
                    <>About<span className="hidden 2xl:inline"> Depot</span></>
                  ) : item.path.includes('/services') ? (
                    <>Cold-Chain<span className="hidden 2xl:inline"> &amp; Fleet</span></>
                  ) : item.path.includes('/contact') ? (
                    <>Contact<span className="hidden 2xl:inline"> &amp; Depot</span></>
                  ) : (
                    item.label
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Action Button: Customer Portal + Quote */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Scoped Cart Button */}
            <Link
              to="/brands/am-distributors/account?section=my_cart"
              className="relative inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Open My Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700 hover:text-emerald-700 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated && isCustomer ? (
              isCustomerLinkedToCompany(currentUser, 'am-distributors') ? (
                <div
                  className="relative"
                  onMouseEnter={handleProfileEnter}
                  onMouseLeave={handleProfileLeave}
                >
                  <Link
                    to="/brands/am-distributors/account"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 shadow-2xs transition-colors cursor-pointer group"
                    title="Open A.M. Distributors Customer Profile"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 max-w-[100px] truncate">
                      {currentUser?.displayName?.split(' ')[0] || 'Customer'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </Link>

                  {/* Dropdown Menu on Hover */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* Customer Details Header */}
                      <div className="p-4 bg-emerald-50/80 border-b border-emerald-100 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {currentUser?.displayName || 'Customer'}
                            </span>
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Wholesale
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
                      <div className="p-2 bg-white space-y-1">
                        <Link
                          to="/brands/am-distributors/account"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 border border-emerald-200 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">My Profile &amp; Portal</span>
                        </Link>
                        <Link
                          to="/brands/am-distributors/account?section=broadband_orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full py-2 px-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">My Orders &amp; Challans</span>
                        </Link>
                        <Link
                          to="/brands/am-distributors/account?section=my_cart"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full py-2 px-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ShoppingCart className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">My Cart</span>
                          </div>
                          {cartCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                        <button
                          type="button"
                          onClick={async () => {
                            setIsProfileDropdownOpen(false);
                            await logout();
                            navigate('/brands/am-distributors');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-colors cursor-pointer mt-1"
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
                    setCustomerModalView('sso_link');
                    setIsCustomerModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 transition-all cursor-pointer shadow-2xs group"
                  title="Connect your account to A.M. Distributors"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-black text-[10px] flex items-center justify-center">
                    {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-amber-900 max-w-[110px] truncate">
                    Connect {currentUser?.displayName?.split(' ')[0] || 'Account'}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">SSO</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCustomerModalView('choice');
                  setIsCustomerModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
                title="Customer Portal Registration & Login"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Customer Portal</span>
              </button>
            )}
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
          <div className="lg:hidden bg-white border-b border-emerald-100 px-4 pt-2 pb-6 space-y-2 shadow-lg">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-emerald-300 font-bold text-sm shadow-xs mb-3 border border-emerald-900"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to Nexalus Innovations LLP</span>
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
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
              {isAuthenticated && isCustomer ? (
                isCustomerLinkedToCompany(currentUser, 'am-distributors') ? (
                  <>
                    <Link
                      to="/brands/am-distributors/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 text-teal-800 font-bold text-sm border border-teal-200"
                    >
                      <UserCheck className="w-4 h-4 text-teal-600" />
                      <span>My Customer Account</span>
                    </Link>
                    <Link
                      to="/brands/am-distributors/account?section=my_cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm border border-emerald-200"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                        <span>My Cart</span>
                      </div>
                      {cartCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-black rounded-full bg-emerald-600 text-white">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        await logout();
                        navigate('/brands/am-distributors');
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm border border-rose-200 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setCustomerModalView('sso_link');
                      setIsCustomerModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 font-bold text-sm border border-amber-300 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>Connect {currentUser?.displayName?.split(' ')[0] || 'Account'} (SSO)</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setCustomerModalView('choice');
                    setIsCustomerModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm border border-emerald-200 cursor-pointer"
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Customer Portal (Login / Register)</span>
                </button>
              )}

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
            </div>
          </div>
        )}
      
        {/* Products Mega Dropdown (Dynamic Categories - Capped at 5 like Parent Company) */}
        {isProductsMegaOpen && (
          <div
            onMouseEnter={handleProductsEnter}
            onMouseLeave={handleProductsLeave}
            className="hidden lg:block absolute top-full left-0 right-0 w-full bg-white border-b border-emerald-100 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
              {/* Header inside Mega Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-emerald-50">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    A.M. Distributors Depot Categories
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Fresh daily 4:00 AM dairy supplies, sub-zero ice cream cold-chain, and pure mineral water jars.
                  </p>
                </div>
                <Link
                  to="/brands/am-distributors/products"
                  onClick={() => setIsProductsMegaOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors group/all shrink-0"
                >
                  <span>View All Products ({products.length})</span>
                  <ArrowRight className="w-4 h-4 group-hover/all:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Grid of Active Categories (Capped at 5, Single Row Like Parent Company) */}
              {(() => {
                const visibleCategories = categories.slice(0, 5);
                return (
                  <div className={`grid ${getCategoryGridClass(visibleCategories.length)} gap-3 sm:gap-4 pt-4 sm:pt-5`}>
                    {visibleCategories.map((cat) => {
                      const catProducts = products.filter(p => p.categoryId === cat.id && p.published !== false);
                      const count = catProducts.length;
                      const catImg = getCategoryRepresentativeImage(cat, catProducts);

                      return (
                        <Link
                          key={cat.id}
                          to={`/brands/am-distributors/products?category=${cat.id}`}
                          onClick={() => setIsProductsMegaOpen(false)}
                          className="group/card p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
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
                            <div className="text-xs sm:text-sm font-black text-slate-900 group-hover/card:text-emerald-700 transition-colors leading-snug line-clamp-1">
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
                            <span className="font-extrabold text-emerald-700 group-hover/card:translate-x-1 transition-transform flex items-center gap-1">
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
        <Outlet key={location.pathname + location.search} />
      </main>

      {/* Dedicated Brand Footer */}
      {depotBanner?.footerSettings?.visible !== false && (
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
                      {depotBanner?.navbarSettings?.brandName || 'A.M. DISTRIBUTORS'}
                    </div>
                    <div className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">
                      {depotBanner?.navbarSettings?.tagline || 'Chiplun Logistics & Distribution Hub'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {depotBanner?.footerSettings?.description || 'Operating directly from Chiplun, Maharashtra under Nexalus Innovations LLP. The regional cold-chain and FMCG distributor supplying packaged mineral water, commercial ice creams, farm-fresh milk, butter, and full dairy products.'}
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
                      to="/admin/login"
                      className="text-slate-400 hover:text-teal-300 transition-colors flex items-center gap-1.5 pt-1.5 font-medium"
                    >
                      <Lock className="w-3.5 h-3.5 text-teal-400" />
                      <span>Depot Admin Login</span>
                    </Link>
                  </li>
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
                    <span>{depotBanner?.footerSettings?.address || depotBanner?.officeAddress || 'A.M. Distributors Depot, Kherdi MIDC Road, Chiplun 415605, Maharashtra'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{depotBanner?.footerSettings?.email || depotBanner?.supportEmail || 'distributors@amchiplun.com'}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{depotBanner?.footerSettings?.phone || depotBanner?.supportPhone || '+91 94220 00000 / Chiplun Depot'}</span>
                  </li>
                </ul>
                {depotBanner?.navbarSettings?.showQuoteButton !== false && (
                  <div className="pt-4">
                    <Button
                      variant="outline-white"
                      size="sm"
                      onClick={() => setIsQuoteOpen(true)}
                      className="w-full text-xs font-semibold"
                    >
                      {depotBanner?.navbarSettings?.quoteButtonLabel || 'Book Bulk Order / Wholesale'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                &copy; {new Date().getFullYear()} {depotBanner?.navbarSettings?.brandName || 'A.M. Distributors Chiplun'}. All rights reserved. An operating company of Nexalus Innovations LLP.
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/brands/am-distributors/about" className="hover:text-slate-400">
                  About Depot
                </Link>
                <span>•</span>
                <Link to="/brands/am-distributors/contact" className="hover:text-slate-400">
                  Contact Depot
                </Link>
                <span>•</span>
                <Link to="/admin/login" className="text-slate-400 hover:text-teal-400 flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3 text-teal-400" />
                  <span>Admin Login</span>
                </Link>
                <span>•</span>
                <Link to="/" className="text-teal-400 hover:text-teal-300 font-semibold">
                  Main LLP Corporate Portal
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Direct Phone Call Floating Button (Directly Above WhatsApp) */}
      <FloatingCallButton phoneNumber="+919158886444" title="Direct Call Admin: +91 9158886444" />

      {/* Quick WhatsApp / Calling Connect Floating Button */}
      <FloatingWhatsAppButton
        phoneNumber="919158886444"
        message="Hello A.M. Distributors Chiplun, I would like to inquire about wholesale packaged drinking water, commercial ice cream, and dairy distribution."
        title="Call or Chat on WhatsApp (+91 9158886444)"
      />

      {/* Customer / Wholesale Modal */}
      <CustomerChoiceModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        initialView={customerModalView}
        targetCompanyScope="am-distributors"
      />

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="am-distributors"
      />
    </div>
  );
};
