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
  ShieldCheck,
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
  if (key.includes('cctv') || key.includes('camera') || key.includes('surveillance')) {
    return '/images/products/cp-dome.jpg';
  }
  if (key.includes('fiber') || key.includes('internet') || key.includes('ont') || key.includes('router') || key.includes('broadband')) {
    return '/images/products/fiber-ont.jpg';
  }
  if (key.includes('network') || key.includes('switch') || key.includes('poe')) {
    return '/images/products/poe-switch.jpg';
  }
  if (key.includes('cabling') || key.includes('cable') || key.includes('hardware') || key.includes('rack') || key.includes('infrastructure') || key.includes('electronics')) {
    return '/images/products/cat6-cable.jpg';
  }
  return '/images/products/cp-dome.jpg';
};

const getCategoryGridClass = (count: number) => {
  if (count <= 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  if (count === 5) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
  return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
};

export const NexalusInnovationsLayout: React.FC = () => {
  const [divisionBanner, setDivisionBanner] = useState<SiteBanner | null>(() => {
    const list = getCachedBanners('nexalus-innovations');
    return list.find(b => b.id === 'ban-innovations' || b.brandId === 'nexalus-innovations') || initialBanners[1] || null;
  });

  React.useEffect(() => {
    const unsub = subscribeToBanners((banners) => {
      const b = banners.find(ban => ban.id === 'ban-innovations' || ban.brandId === 'nexalus-innovations');
      if (b) setDivisionBanner(b);
    }, 'nexalus-innovations');
    return () => unsub();
  }, []);

  const defaultNavLinks: NavItemConfig[] = [
    { id: 'nav-inno-home', label: 'Home', path: '/brands/nexalus-innovations', visible: true, order: 1 },
    { id: 'nav-inno-about', label: 'About Us', path: '/brands/nexalus-innovations/about', visible: true, order: 2 },
    { id: 'nav-inno-products', label: 'Products', path: '/brands/nexalus-innovations/products', visible: true, order: 3 },
    { id: 'nav-inno-services', label: 'Services & AMC', path: '/brands/nexalus-innovations/services', visible: true, order: 4 },
    { id: 'nav-inno-contact', label: 'Contact & Sales', path: '/brands/nexalus-innovations/contact', visible: true, order: 5 }
  ];

  const navLinks = (divisionBanner?.navbarSettings?.navLinks && divisionBanner.navbarSettings.navLinks.length > 0
    ? divisionBanner.navbarSettings.navLinks
    : defaultNavLinks
  ).filter(l => l.visible !== false).sort((a, b) => a.order - b.order);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsMegaOpen, setIsProductsMegaOpen] = useState(false);
  const productsTimeoutRef = React.useRef<any>(null);

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const list = getCachedCategories('nexalus-innovations');
    return list.length > 0 ? list : initialCategories.filter(c => c.id.startsWith('cat-nexalus-') && !c.id.includes('llp'));
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const list = getCachedProducts('nexalus-innovations');
    return list.length > 0 ? list : initialProducts.filter(p => p.id.startsWith('prod-nexalus-') && !p.id.includes('llp'));
  });

  React.useEffect(() => {
    const unsubCats = subscribeToCategories((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    }, 'nexalus-innovations');

    const unsubProds = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) setProducts(prods);
    }, 'nexalus-innovations');

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

  React.useEffect(() => {
    setIsProductsMegaOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Track Nexalus Innovations cart item count (distinct products count)
  const [cartCount, setCartCount] = useState<number>(() => {
    try {
      return getScopedPlanCart('nexalus-innovations', currentUser?.uid).length;
    } catch {
      return 0;
    }
  });

  React.useEffect(() => {
    const syncCart = () => {
      try {
        const count = getScopedPlanCart('nexalus-innovations', currentUser?.uid).length;
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

    // Check if customer is already linked to nexalus-innovations
    const isLinkedToInnovations = isCustomerLinkedToCompany(currentUser, 'nexalus-innovations');

    // If already linked, or an admin is signed in, do not auto-pop
    if (isLinkedToInnovations) return;
    if (currentUser && currentUser.role !== 'customer') return;

    try {
      const dismissKey = currentUser
        ? ('nexalus_choice_dismissed_nexalus-innovations_' + currentUser.uid)
        : 'nexalus_choice_dismissed_nexalus-innovations_guest';
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

  const isHome = location.pathname === '/brands/nexalus-innovations';

  

  const isCurrent = (path: string) => {
    if (path === '/brands/nexalus-innovations') {
      return location.pathname === '/brands/nexalus-innovations';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path: string, e?: React.MouseEvent) => {
    setIsMobileMenuOpen(false);
    setIsProductsMegaOpen(false);

    const isLanding = location.pathname === '/brands/nexalus-innovations';

    // If clicking Home when already on division landing page: smooth scroll to top
    if (isLanding && (path === '/brands/nexalus-innovations' || path === '/' || path === '')) {
      if (e) e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Only intercept in-page anchor links containing '#' (e.g. '#cctv', '/brands/nexalus-innovations#cctv')
    if (path.includes('#')) {
      const sectionId = path.split('#')[1];
      if (isLanding && sectionId) {
        const targetEl = document.getElementById(sectionId) ||
          document.getElementById(`sec-inno-${sectionId}`) ||
          document.getElementById(`section-${sectionId}`) ||
          document.getElementById(`sec-${sectionId}`);

        if (targetEl) {
          if (e) e.preventDefault();
          const yOffset = -80;
          const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          navigate(`/brands/nexalus-innovations#${sectionId}`, { replace: false });
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
    if (location.pathname.includes('/about')) return 'About Nexalus Innovations';
    if (location.pathname.includes('/products')) return 'Commercial Products & Specifications';
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
              <span>Back to Nexalus Innovations LLP</span>
            </Link>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-indigo-200 font-medium">
              Technology &amp; Security Engineering Division
            </span>
          </div>

          {divisionBanner?.navbarSettings?.showTopBanner !== false && (
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping" />
                <span className="text-cyan-300 font-semibold">
                  {divisionBanner?.navbarSettings?.topBannerText || '24/7 Operations NOC SLA'}
                </span>
              </span>
              <Link to={divisionBanner?.navbarSettings?.topBannerLinkPath || '/brands/nexalus-innovations/contact'} className="hover:text-cyan-300 transition-colors">
                {divisionBanner?.navbarSettings?.topBannerLinkText || 'Tech Support Desk'}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Brand Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs relative">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 xl:gap-4">
          {/* Brand Identity */}
          <Link
            to="/brands/nexalus-innovations"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform border border-indigo-400/30 shrink-0">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
            </div>
            <div className="shrink-0">
              <div className="text-base sm:text-lg xl:text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                {divisionBanner?.navbarSettings?.brandName || 'NEXALUS INNOVATIONS'}
              </div>
              <div className="hidden xl:block text-[9px] sm:text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase mt-1 whitespace-nowrap">
                {divisionBanner?.navbarSettings?.tagline || 'CCTV • Fiber Internet • Enterprise IT Networking'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links - Single Neat Horizontal Line */}
          <nav className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1.5 flex-1 min-w-0 mx-1.5 xl:mx-4">
            {navLinks.map((item) => {
              const active = isCurrent(item.path);
              const isProducts = item.path.includes('products') || item.label.toLowerCase() === 'products';

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
                      className={`inline-flex items-center gap-1 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-all ${
                        active || isProductsMegaOpen
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100'
                          : 'text-slate-600 hover:text-indigo-700 hover:bg-slate-100/80'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductsMegaOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                    </Link>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(item.path, e)}
                  className={`px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100'
                      : 'text-slate-600 hover:text-indigo-700 hover:bg-slate-100/80'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Action Buttons - Single Line */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Scoped Cart Button */}
            <Link
              to="/brands/nexalus-innovations/account?section=my_cart"
              className="relative inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Open My Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700 hover:text-indigo-700 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated && isCustomer ? (
              isCustomerLinkedToCompany(currentUser, 'nexalus-innovations') ? (
                <div
                  className="relative"
                  onMouseEnter={handleProfileEnter}
                  onMouseLeave={handleProfileLeave}
                >
                  <Link
                    to="/brands/nexalus-innovations/account"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 shadow-2xs transition-colors cursor-pointer group"
                    title="Open Nexalus Innovations Customer Profile"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 max-w-[100px] truncate">
                      {currentUser?.displayName?.split(' ')[0] || 'Customer'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-700 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </Link>

                  {/* Dropdown Menu on Hover */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* Customer Details Header */}
                      <div className="p-4 bg-indigo-50/80 border-b border-indigo-100 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {(currentUser?.displayName || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {currentUser?.displayName || 'Customer'}
                            </span>
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                              Client
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
                          to="/brands/nexalus-innovations/account"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center gap-2 border border-indigo-200 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">My Profile &amp; Portal</span>
                        </Link>
                        <Link
                          to="/brands/nexalus-innovations/account?section=broadband_orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full py-2 px-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">My Orders &amp; Hardware</span>
                        </Link>
                        <Link
                          to="/brands/nexalus-innovations/account?section=my_cart"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full py-2 px-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ShoppingCart className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">My Cart</span>
                          </div>
                          {cartCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                        <button
                          type="button"
                          onClick={async () => {
                            setIsProfileDropdownOpen(false);
                            await logout();
                            navigate('/brands/nexalus-innovations');
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
                  title="Connect your account to Nexalus Innovations"
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Customer Portal Registration & Login"
              >
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="whitespace-nowrap">Customer Portal</span>
              </button>
            )}

            {divisionBanner?.navbarSettings?.showQuoteButton !== false && (
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsQuoteOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 whitespace-nowrap shrink-0 text-xs xl:text-sm px-3.5 xl:px-4 py-2"
                icon={<PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 shrink-0" />}
              >
                <span className="whitespace-nowrap">
                  {divisionBanner?.navbarSettings?.quoteButtonLabel || 'Request Proposal'}
                </span>
              </Button>
            )}
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
              <span>Back to Nexalus Innovations LLP</span>
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
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
              {isAuthenticated && isCustomer ? (
                isCustomerLinkedToCompany(currentUser, 'nexalus-innovations') ? (
                  <>
                    <Link
                      to="/brands/nexalus-innovations/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-800 font-bold text-sm border border-indigo-200"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>My Customer Account</span>
                    </Link>
                    <Link
                      to="/brands/nexalus-innovations/account?section=my_cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-800 font-bold text-sm border border-indigo-200"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-indigo-600" />
                        <span>My Cart</span>
                      </div>
                      {cartCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-black rounded-full bg-indigo-600 text-white">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        await logout();
                        navigate('/brands/nexalus-innovations');
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
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-800 font-bold text-sm border border-indigo-200 cursor-pointer"
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Customer Portal (Login / Register)</span>
                </button>
              )}

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
      
        {/* Products Mega Dropdown (Dynamic Categories - Capped at 5 like Parent Company) */}
        {isProductsMegaOpen && (
          <div
            onMouseEnter={handleProductsEnter}
            onMouseLeave={handleProductsLeave}
            className="hidden lg:block absolute top-full left-0 right-0 w-full bg-white border-b border-indigo-100 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
              {/* Header inside Mega Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-indigo-50">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Nexalus Innovations Product Categories
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Explore our commercial 4K AI CCTV, gigabit optical fiber hardware &amp; enterprise switching gear.
                  </p>
                </div>
                <Link
                  to="/brands/nexalus-innovations/products"
                  onClick={() => setIsProductsMegaOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors group/all shrink-0"
                >
                  <span>View All Products ({products.length})</span>
                  <ArrowRight className="w-4 h-4 group-hover/all:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Grid of Active Categories (Capped at 5, Single Row Like Parent Company) */}
              {(() => {
                const companyCategories = categories.filter(c => (c.id.startsWith('cat-nexalus-') && !c.id.includes('llp')) || c.companyId === 'nexalus-innovations');
                const visibleCategories = companyCategories.slice(0, 5);
                return (
                  <div className={`grid ${getCategoryGridClass(visibleCategories.length)} gap-3 sm:gap-4 pt-4 sm:pt-5`}>
                    {visibleCategories.map((cat) => {
                      const catProducts = products.filter(p => p.categoryId === cat.id && p.published !== false);
                      const count = catProducts.length;
                      const catImg = getCategoryRepresentativeImage(cat, catProducts);

                      return (
                        <Link
                          key={cat.id}
                          to={`/brands/nexalus-innovations/products?category=${cat.id}`}
                          onClick={() => setIsProductsMegaOpen(false)}
                          className="group/card p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-indigo-50/50 border border-slate-200/90 hover:border-indigo-400 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
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
                            <div className="text-xs sm:text-sm font-black text-slate-900 group-hover/card:text-indigo-700 transition-colors leading-snug line-clamp-1">
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
                            <span className="font-extrabold text-indigo-600 group-hover/card:translate-x-1 transition-transform flex items-center gap-1">
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
        <Outlet key={location.pathname + location.search} />
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
                {divisionBanner?.footerSettings?.description || 'Operating as the dedicated technology division under Nexalus Innovations LLP. Authorized contractor for 4K CCTV surveillance grids, high-speed optical fiber internet, managed switching, and certified AMC maintenance.'}
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
                  <span>{divisionBanner?.footerSettings?.address || divisionBanner?.officeAddress || 'Maharashtra Operations Hub, Ratnagiri & Konkan Region'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{divisionBanner?.footerSettings?.email || divisionBanner?.supportEmail || 'sales@nexalusinnovations.com'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{divisionBanner?.footerSettings?.phone || divisionBanner?.supportPhone || '+91 9158886444'}</span>
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

      {/* Customer Modal */}
      <CustomerChoiceModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        initialView={customerModalView}
        targetCompanyScope="nexalus-innovations"
      />

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="nexalus-innovations"
      />
    </div>
  );
};
