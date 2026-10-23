import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  ArrowRight,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  Warehouse,
  Check,
  Layers,
  Cpu,
  CheckCircle2,
  Activity,
  Wrench,
  Store,
  Home,
  Truck,
  Zap,
  Clock,
  PhoneCall,
  ShoppingCart,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { OurTeamSection } from '../../components/common/OurTeamSection';
import { ProjectGallerySection } from '../../components/common/ProjectGallerySection';
import { AreasCoveredSection } from '../../components/common/AreasCoveredSection';
import { BlurZoomReveal } from '../../components/common/BlurZoomReveal';
import { QuoteModal } from '../../components/common/QuoteModal';
import { PlanOrderModal } from '../../components/common/PlanOrderModal';
import { ServiceCard } from '../../components/brand/ServiceCard';
import { CustomSectionsRenderer } from '../../components/common/CustomSectionsRenderer';
import { Service, BroadbandPlan, InternetPlan, SiteBanner, CartPlanItem } from '../../types';
import {
  subscribeToBroadbandPlans,
  subscribeToInternetPlans,
  formatBroadbandPrice,
  subscribeToBanners,
  addToPlanCart,
  getPlanCart,
  clearPlanCart,
  getCachedBroadbandPlans,
  getCachedInternetPlans,
  getCachedBanners
} from '../../firebase/services';
import { initialBanners, DEFAULT_NEXALUS_SLIDES } from '../../data/initialData';
import { useToast } from '../../context/ToastContext';

// Simple, clear services for Nexalus Innovations LLP
const NEXALUS_CORE_SERVICES: Service[] = [
  {
    id: 'srv-nex-cctv',
    brandId: 'nexalus',
    title: 'CCTV Camera Installation & Setup',
    slug: 'cctv-camera-installation',
    shortDescription: 'Fitting security cameras for homes, shops, and offices with clear night vision and live view on mobile phone.',
    fullDescription: 'Professional CCTV security camera installation and setup by Nexalus Innovations LLP. We provide clear HD cameras, neat concealed wiring, smartphone live view, and free customer demo.',
    iconName: 'ShieldCheck',
    features: [
      'HD & Night Vision Cameras',
      'Live View on Mobile Phone',
      'Clean Concealed Wiring',
      'Free Setup & Customer Demo'
    ],
    targetAudience: [],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv-nex-internet',
    brandId: 'nexalus',
    title: 'High-Speed Fiber Internet Setup',
    slug: 'high-speed-fiber-internet',
    shortDescription: 'Fast and reliable optical fiber broadband connection with Wi-Fi router for smooth browsing, video calls, and streaming.',
    fullDescription: 'Fast optical fiber internet connection installation by Nexalus Innovations LLP. High-speed broadband, dual-band Wi-Fi router setup, and quick local technical support.',
    iconName: 'Wifi',
    features: [
      'Direct Optical Fiber Line',
      'High-Speed Wi-Fi Router Setup',
      'Smooth Video Calls & Streaming',
      'Quick On-Site Installation'
    ],
    targetAudience: [],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv-nex-network',
    brandId: 'nexalus',
    title: 'Office Networking & Maintenance',
    slug: 'office-networking-maintenance',
    shortDescription: 'Complete office LAN cabling, Wi-Fi router setup, network switch configuration, and regular repair and maintenance service.',
    fullDescription: 'Office network cabling, Wi-Fi router setup, network switch configuration, and regular maintenance by Nexalus Innovations LLP.',
    iconName: 'Wrench',
    features: [
      'Office LAN Cable Fitting',
      'Wi-Fi & Network Switch Setup',
      'Quick Repair Visits',
      'Annual Maintenance (AMC) Support'
    ],
    targetAudience: [],
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const HomePage: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activePlace, setActivePlace] = useState<'offices' | 'residential' | 'retail' | 'factories'>('offices');

  // Broadband Plans Section State
  const [homeProviderTab, setHomeProviderTab] = useState<'airtel' | 'bsnl' | 'railwire' | 'one-broadband'>('airtel');
  const [homeBroadbandPlans, setHomeBroadbandPlans] = useState<BroadbandPlan[]>(() => getCachedBroadbandPlans());
  const [homeOnePlans, setHomeOnePlans] = useState<InternetPlan[]>(() => getCachedInternetPlans());
  const [planQuoteItem, setPlanQuoteItem] = useState<{
    providerName: string;
    planName: string;
    speed: string;
    brandId: 'one-broadband' | 'nexalus-innovations';
  } | null>(null);
  const [isPlanQuoteOpen, setIsPlanQuoteOpen] = useState(false);
  const { success } = useToast();

  // Cart State
  const [cartItems, setCartItems] = useState<CartPlanItem[]>(() => getPlanCart());

  // Direct Plan Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<{
    planId?: string;
    planName: string;
    providerName: string;
    speed: string;
    price: number | string;
    billingPeriod?: string;
    brandId?: any;
  } | null>(null);

  const handleAddToCart = (plan: {
    planId: string;
    providerName: string;
    planName: string;
    speed: string;
    price: number;
    billingPeriod: string;
    brandId?: any;
  }) => {
    addToPlanCart(plan);
    success('Added to Cart', `${plan.providerName} - ${plan.planName} (${plan.speed}) added to broadband cart.`);
  };

  const handleBuyNow = (plan: {
    planId?: string;
    planName: string;
    providerName: string;
    speed: string;
    price: number | string;
    billingPeriod?: string;
    brandId?: any;
  }) => {
    setSelectedPlanForOrder(plan);
    setIsOrderModalOpen(true);
  };

  const [heroBanner, setHeroBanner] = useState<SiteBanner>(() => {
    const list = getCachedBanners('nexalus');
    const found = list.find(b => b.id === 'ban-parent' || b.brandId === 'nexalus');
    return found || initialBanners.find(b => b.id === 'ban-parent') || initialBanners[0];
  });

  useEffect(() => {
    const unsubBB = subscribeToBroadbandPlans((plans) => {
      setHomeBroadbandPlans(plans);
    }, { publishedOnly: true });

    const unsubLegacy = subscribeToInternetPlans((plans) => {
      setHomeOnePlans(plans);
    }, true);

    const unsubBanners = subscribeToBanners((banners) => {
      const b = banners.find(x => x.id === 'ban-parent' || x.brandId === 'nexalus');
      if (b) setHeroBanner(b);
    }, 'nexalus');

    const handleCartUpdate = (e: any) => {
      setCartItems(e.detail || getPlanCart());
    };
    window.addEventListener('nexalus_plan_cart_updated', handleCartUpdate);

    const handleDataUpdate = (e: any) => {
      if (!e.detail?.key || e.detail.key.includes('plans')) {
        setHomeBroadbandPlans(getCachedBroadbandPlans());
        setHomeOnePlans(getCachedInternetPlans());
      }
      if (!e.detail?.key || e.detail.key === 'nexalus_site_banners' || e.detail.key.includes('banners')) {
        const list = getCachedBanners('nexalus');
        const found = list.find(b => b.id === 'ban-parent' || b.brandId === 'nexalus');
        if (found) setHeroBanner(found);
      }
    };
    window.addEventListener('nexalus_data_update', handleDataUpdate);

    window.addEventListener('storage', handleDataUpdate);
    window.addEventListener('focus', handleDataUpdate);

    return () => {
      unsubBB();
      unsubLegacy();
      unsubBanners();
      window.removeEventListener('nexalus_plan_cart_updated', handleCartUpdate);
      window.removeEventListener('nexalus_data_update', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
      window.removeEventListener('focus', handleDataUpdate);
    };
  }, []);

  // =========================================================================
  // HERO FULL-WIDTH EDGE-TO-EDGE BANNER (ORIGINAL STARTING CONTENT & AUTHENTIC HARDWARE)
  // =========================================================================
  // Typewriter effect for Website Name in Hero
  const fullBrandName = 'Nexalus Innovations LLP';
  const [typedTitle, setTypedTitle] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let timer: any;
    if (typedTitle.length < fullBrandName.length) {
      timer = setTimeout(() => {
        const nextText = fullBrandName.slice(0, typedTitle.length + 1);
        setTypedTitle(nextText);
        if (nextText.length === fullBrandName.length) {
          setTimeout(() => {
            setIsTypingComplete(true);
          }, 150);
        }
      }, 85);
    } else {
      setIsTypingComplete(true);
    }
    return () => clearTimeout(timer);
  }, [typedTitle]);

  return (
    <div className="flex flex-col w-full">
      {/* =========================================================================
          SLIDE 1: HERO FULL-WIDTH EDGE-TO-EDGE BANNER (ORIGINAL STARTING HERO)
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800 select-none">
        {/* Photographic background image showcasing authentic enterprise server rack on the right */}
        <div className="absolute inset-0">
          <img
            src="/images/fermilab-blue-racks-real.jpg"
            alt="Nexalus Innovations LLP Enterprise Server Rack, Optical Fiber & CCTV Surveillance Infrastructure"
            className="w-full h-full object-cover object-[75%_center] lg:object-[82%_center]"
          />
        </div>

        {/* Clean directional contrast scrim from left to right matching the rest of the website */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/98 via-[#0f2444]/90 via-48% md:via-42% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-[#0a1628]/50 pointer-events-none" />

        {/* Content strictly positioned on the left side, leaving right side clear for high-res authentic hardware */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 flex items-center min-h-[520px] lg:min-h-[620px]">
          <div className="max-w-4xl lg:max-w-5xl space-y-5 text-white mr-auto">
            {/* Operating Entity Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-sky-400 text-xs font-semibold tracking-wide uppercase backdrop-blur-md shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-xs shadow-emerald-400/50" />
              <span>Operating Company — Nexalus Innovations LLP</span>
            </div>

            {/* Main Headline Title: Nexalus Innovations LLP with Typewriter Animation */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight min-h-[1.2em] flex items-center">
              <span className="inline-flex items-center">
                <span>{typedTitle || fullBrandName}</span>
                {!isTypingComplete && (
                  <span className="inline-block w-1 sm:w-1.5 h-[0.8em] bg-cyan-400 ml-2 animate-pulse rounded-full align-middle" />
                )}
              </span>
            </h1>

            {/* Subtitle: Internet, Network & CCTV Services */}
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-300 tracking-tight leading-snug">
              Internet, Network &amp; CCTV Services
            </p>

            {/* Description: The original starting text */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl pt-1">
              Your trusted technology infrastructure partner. Operating under <strong className="text-white font-bold">Nexalus Innovations LLP</strong>, we engineer ultra-fast <strong className="text-white font-bold">gigabit optical fiber</strong> leased lines, managed Layer-2/3 network switching, and certified <strong className="text-white font-bold">video surveillance</strong> systems to empower local businesses.
            </p>

            {/* CTA Action Buttons: Original starting buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/50 px-6 py-3.5 rounded-xl transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Request a Quotation
              </Button>
              <Link to="/products">
                <Button
                  variant="outline-white"
                  size="lg"
                  className="border-slate-700 hover:bg-white/10 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg backdrop-blur-xs"
                >
                  Explore Solutions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SLIDE 2: OUR BRANDS (CLEAN WHITE THEME)
          ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider border border-blue-200">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Our Brands</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Our Brands
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Under <strong>Nexalus Innovations LLP</strong>, we manage two specialized operational brands delivering engineering excellence and regional supply chain logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Division 1: Nexalus Innovations */}
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-blue-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
              <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                  src="/images/server-racks-4508751.jpg"
                  alt="Nexalus Innovations Technology & Network Infrastructure Division"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-7 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        Nexalus Innovations
                      </h3>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        CCTV Surveillance, Fiber &amp; IT Networking
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    Turnkey enterprise technology solutions including certified 4K CCTV video surveillance, ultra-fast gigabit optical fiber leased lines, managed Layer-2/3 network switching, and structured office cabling.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>CCTV Surveillance</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Gigabit Optical Fiber</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Enterprise Switching</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>AMC Maintenance Support</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link to="/brands/nexalus-innovations" className="w-full">
                    <Button variant="primary" size="md" className="w-full justify-center font-bold shadow-md shadow-blue-500/20" icon={<ArrowRight className="w-4 h-4" />}>
                      Visit Nexalus Innovations
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Division 2: A.M. Distributors Chiplun */}
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-teal-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
              <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                  src="/images/projects/real-warehouse-distribution.jpg"
                  alt="A.M. Distributors Chiplun Cold-Chain & FMCG Distribution Facility"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-7 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold shrink-0">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                        A.M. Distributors Chiplun
                      </h3>
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                        Beverage, Dairy &amp; Cold Storage Logistics
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    Authorised master distributor and logistics operator for premium 20L packaged drinking water jars, dairy milk, ice cream cold storage, and daily retail distribution across Chiplun and the Konkan belt.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>20L Mineral Water Cans</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Dairy &amp; Milk Supply</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>-18°C Cold Storage</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Daily Retail Delivery Fleet</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link to="/brands/am-distributors" className="w-full">
                    <Button variant="primary" size="md" className="w-full justify-center font-bold bg-teal-600 hover:bg-teal-500 shadow-md shadow-teal-500/20" icon={<ArrowRight className="w-4 h-4" />}>
                      Visit A.M. Distributors
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: OUR TEAM (SLIDING FOCUS SLIDER)
          ========================================================================= */}
      {heroBanner?.showTeam !== false && (
        <OurTeamSection division="corporate" />
      )}

      {/* =========================================================================
          SECTION: PROJECT GALLERY
          ========================================================================= */}
      <ProjectGallerySection division="corporate" />

      {/* =========================================================================
          SECTION 3: INTEGRATED TECHNOLOGY INFRASTRUCTURE (3 PILLARS - RICH CORPORATE BLUE)
          ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <BlurZoomReveal direction="up" delay={0} duration={700}>
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider border border-blue-400/30">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>INTEGRATED TECHNOLOGY INFRASTRUCTURE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Engineered for Reliability, Speed &amp; Security
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Under <strong>Nexalus Innovations LLP</strong>, we deliver enterprise-grade CCTV surveillance, optical fiber leased lines, and office networking with guaranteed uptime and direct manufacturer warranty.
              </p>
            </div>
          </BlurZoomReveal>

          {/* 3 Pillar Cards Side-by-Side (CCTV, Internet, Networking) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: CCTV Surveillance (Enters from Left) */}
            <BlurZoomReveal
              direction="left"
              xOffset={-80}
              delay={0}
              duration={850}
              blur={12}
              scale={0.92}
              className="h-full flex flex-col"
            >
              <div className="rounded-3xl bg-[#0c1c38]/90 border border-blue-900/50 shadow-xl hover:border-blue-400/60 transition-all duration-300 overflow-hidden flex flex-col justify-between group h-full">
              <div className="relative h-56 overflow-hidden bg-[#081222]">
                <img
                  src="/images/simple-cctv-camera.jpg"
                  alt="Commercial 4K CCTV Video Surveillance Camera"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-400/20 flex items-center justify-center font-bold shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                        CCTV Surveillance
                      </h3>
                      <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                        COMMERCIAL 4K CAMERAS &amp; ANALYTICS
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Commercial 4K network IP cameras with human and vehicle motion detection, full-color night vision, and centralized multi-screen command room integration.
                  </p>

                  <div className="space-y-2 pt-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>4K Ultra-HD 8MP Resolution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>24/7 Starlight Color Night Vision</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Live View on Smartphone App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Clean Concealed Wiring &amp; Conduit</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-900/50">
                  <Link to="/products?brand=cp-plus" className="w-full block">
                    <Button variant="primary" size="md" className="w-full justify-center font-bold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-900/40" icon={<ArrowRight className="w-4 h-4" />}>
                      View CCTV Solutions
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            </BlurZoomReveal>

            {/* Card 2: Optical Fiber Internet (Enters from Center) */}
            <BlurZoomReveal
              direction="center"
              yOffset={35}
              delay={120}
              duration={850}
              blur={12}
              scale={0.90}
              className="h-full flex flex-col"
            >
              <div className="rounded-3xl bg-[#0c1c38]/90 border border-blue-900/50 shadow-xl hover:border-teal-400/60 transition-all duration-300 overflow-hidden flex flex-col justify-between group h-full">
              <div className="relative h-56 overflow-hidden bg-[#081222]">
                <img
                  src="/images/fiber-optic-cables.jpg"
                  alt="High-Speed Optical Fiber Internet Backbone & Patch Terminal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-400/20 flex items-center justify-center font-bold shrink-0">
                      <Wifi className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-teal-300 transition-colors">
                        Optical Fiber Internet
                      </h3>
                      <p className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                        GIGABIT BANDWIDTH &amp; FTTH CONNECTIVITY
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Symmetrical gigabit fiber internet with low latency, redundant ring backhaul, and 99.9% uptime SLA for offices, tech parks, and residential societies.
                  </p>

                  <div className="space-y-2 pt-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Symmetrical Gigabit Speeds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Dual-Band Wi-Fi 6 Routers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Whole-Premises Mesh Roaming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>Quick Local Technician Support</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-900/50">
                  <Link to="/products?brand=one-broadband" className="w-full block">
                    <Button variant="primary" size="md" className="w-full justify-center font-bold bg-teal-600 hover:bg-teal-500 shadow-md shadow-teal-900/40" icon={<ArrowRight className="w-4 h-4" />}>
                      Explore Fiber Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            </BlurZoomReveal>

            {/* Card 3: Enterprise IT Networking (Enters from Right) */}
            <BlurZoomReveal
              direction="right"
              xOffset={80}
              delay={240}
              duration={850}
              blur={12}
              scale={0.92}
              className="h-full flex flex-col"
            >
              <div className="rounded-3xl bg-[#0c1c38]/90 border border-blue-900/50 shadow-xl hover:border-indigo-400/60 transition-all duration-300 overflow-hidden flex flex-col justify-between group h-full">
              <div className="relative h-56 overflow-hidden bg-[#081222]">
                <img
                  src="/images/rackmount-switches-real.jpg"
                  alt="Enterprise IT Networking & Server Rack Testing Infrastructure"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-400/20 flex items-center justify-center font-bold shrink-0">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">
                        Enterprise IT Networking
                      </h3>
                      <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                        MANAGED SWITCHES &amp; STRUCTURED CABLING
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Layer-2/3 managed PoE+ switching fabrics, hardware firewalls, organized server rack integration, and Fluke-certified pure copper Cat6A cabling.
                  </p>

                  <div className="space-y-2 pt-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Layer-2/3 Managed PoE+ Switching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>10G SFP+ Optical Uplinks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Pure Copper Cat6A Structured Cabling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Organized 24U/42U Server Cabinets</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-900/50">
                  <Link to="/products?brand=itti-networking" className="w-full block">
                    <Button variant="primary" size="md" className="w-full justify-center font-bold bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-900/40" icon={<ArrowRight className="w-4 h-4" />}>
                      Explore Network Setup
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            </BlurZoomReveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: THREE DEDICATED HARDWARE SHOWCASE SUBSECTIONS
          1. CCTV Surveillance (White Background)
          2. Fiber Internet & Connectivity (Light Off-White / Blue Background)
          3. Enterprise IT Networking (White Background)
          ========================================================================= */}

      {/* 4.1: CCTV Surveillance */}
      <section className="w-full bg-white text-slate-900 py-16 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wider border border-blue-200/60">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>CCTV Surveillance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Security &amp; Surveillance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore CCTV cameras and surveillance equipment for commercial, industrial, and institutional environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* CCTV Card 1 */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden p-5 flex items-center justify-center border-b border-slate-100">
                  <img
                    src="/images/products/cp-bullet.jpg"
                    alt="CP-UNC-TA41ZL4-MDS 4MP Smart IR Network Bullet Camera"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    CP-PLUS • Model CP-UNC-TA41ZL4-MDS
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    CP-UNC-TA41ZL4-MDS 4MP Smart IR Network Bullet Camera
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    High-performance 4 Megapixel outdoor network bullet camera featuring motorized varifocal lens, Starlight low-light sensitivity, and perimeter intrusion detection.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link to="/products?brand=cp-plus" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center font-bold group-hover:border-blue-600 group-hover:text-blue-600">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* CCTV Card 2 */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden p-5 flex items-center justify-center border-b border-slate-100">
                  <img
                    src="/images/products/cp-dome.jpg"
                    alt="CP-UNC-DA41L3 4MP Full-Color Starlight Fixed Dome Camera"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    CP-PLUS • Model CP-UNC-DA41L3
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    CP-UNC-DA41L3 4MP Full-Color Starlight Fixed Dome Camera
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    24/7 Full-Color dome surveillance camera with warm white LED supplemental lighting, built-in microphone for synchronized audio, and vandal-proof dome casing.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link to="/products?brand=cp-plus" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center font-bold group-hover:border-blue-600 group-hover:text-blue-600">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* CCTV Card 3 */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden p-5 flex items-center justify-center border-b border-slate-100">
                  <img
                    src="/images/products/cp-nvr.jpg"
                    alt="CP-UNR-416T2-V2 16-Channel 4K Network Video Recorder (NVR)"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    CP-PLUS • Model CP-UNR-416T2-V2
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    CP-UNR-416T2-V2 16-Channel 4K Network Video Recorder (NVR)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    Ultra HD 16-channel standalone network video recorder with 4K HDMI output, dual SATA interfaces up to 20TB storage, and remote cloud surveillance app.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link to="/products?brand=cp-plus" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center font-bold group-hover:border-blue-600 group-hover:text-blue-600">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-2 sm:pt-4">
            <Link to="/products?brand=cp-plus">
              <Button
                variant="outline"
                size="md"
                className="font-bold border-blue-600 text-blue-600 hover:bg-blue-50"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View All CCTV Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4.2: Fiber Internet & Connectivity */}
      <section className="w-full bg-slate-50/80 text-slate-900 py-16 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold tracking-wider border border-teal-200/60">
              <Wifi className="w-3.5 h-3.5 text-teal-600" />
              <span>Fiber Internet</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Fiber Internet &amp; Connectivity
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore fiber connectivity equipment, ONT devices, Wi-Fi solutions, and related networking products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Fiber Card 1 */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden p-5 flex items-center justify-center border-b border-slate-100">
                  <img
                    src="/images/products/wifi6-router.jpg"
                    alt="NexFiber Wi-Fi 6 AX3000 Dual-Band Gigabit ONT Router"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    ONE BROADBAND • Model OB-AX3000-ONT
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    NexFiber Wi-Fi 6 AX3000 Dual-Band Gigabit ONT Router
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    High-speed GPON Optical Network Terminal with built-in Wi-Fi 6, 4 Gigabit Ethernet LAN ports, VoIP FXS port, and OFDMA low-latency technology.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link to="/products?brand=one-broadband" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center font-bold group-hover:border-blue-600 group-hover:text-blue-600">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Fiber Card 2 */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden p-5 flex items-center justify-center border-b border-slate-100">
                  <img
                    src="/images/products/mesh-wifi-v2.jpg"
                    alt="NexMesh AX3000 Whole-Home Tri-Band Wi-Fi 6 Mesh System (3-Pack)"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    ONE BROADBAND • Model OB-MESH-AX3000-3PK
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    NexMesh AX3000 Whole-Home Tri-Band Wi-Fi 6 Mesh System (3-Pack)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    Whole-home dead-zone killer mesh Wi-Fi system covering up to 6,000 sq.ft. with seamless single-SSID roaming, gigabit Ethernet backhaul, and zero buffering.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link to="/products?brand=one-broadband" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center font-bold group-hover:border-blue-600 group-hover:text-blue-600">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Fiber Card 3 */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden p-5 flex items-center justify-center border-b border-slate-100">
                  <img
                    src="/images/products/fiber-modem.jpg"
                    alt="NexFiber Gigabit XPON / GPON Optical Fiber Bridge Modem (ONU)"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    ONE BROADBAND • Model OB-ONU-1000G
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    NexFiber Gigabit XPON / GPON Optical Fiber Bridge Modem (ONU)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    Ultra-compact high-speed Gigabit XPON/GPON optical network terminal (ONU) with 1 SC/UPC optical port, 1 Gigabit RJ45 LAN port, and lightning surge protection.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link to="/products?brand=one-broadband" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center font-bold group-hover:border-blue-600 group-hover:text-blue-600">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-2 sm:pt-4">
            <Link to="/products?brand=one-broadband">
              <Button
                variant="outline"
                size="md"
                className="font-bold border-teal-600 text-teal-700 hover:bg-teal-50"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View All Internet Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4.3: Enterprise IT Networking */}
      <section className="w-full bg-white text-slate-900 py-16 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wider border border-indigo-200/60">
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>Enterprise IT Networking</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Networking Equipment
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore networking hardware for business connectivity, structured infrastructure, and enterprise network deployments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Networking Card 1 */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden p-5 flex items-center justify-center border-b border-slate-100">
                  <img
                    src="/images/products/poe-switch.jpg"
                    alt="Sophos XGS 2100 Next-Gen Hardware Firewall & UTM Security Gateway"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    ITTI • Model ITTI-XGS-2100
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    Sophos XGS 2100 Next-Gen Hardware Firewall &amp; UTM Security Gateway
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    Enterprise rackmount Next-Gen Firewall powered by Xstream dual-processor architecture with deep packet inspection, TLS 1.3 decryption, and advanced SD-WAN.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link to="/products?brand=itti-networking" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center font-bold group-hover:border-blue-600 group-hover:text-blue-600">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Networking Card 2 */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden p-5 flex items-center justify-center border-b border-slate-100">
                  <img
                    src="/images/products/poe-switch.jpg"
                    alt="ITTI 48-Port Gigabit Layer-3 Managed Core Switch with 4x 10G SFP+ Uplinks"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    ITTI • Model ITTI-SW-L3-48G
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    ITTI 48-Port Gigabit Layer-3 Managed Core Switch with 4x 10G SFP+ Uplinks
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    High-density enterprise Layer-3 core switch delivering 176 Gbps switching fabric, OSPF/BGP dynamic routing, static routing, and quad 10-Gigabit optical uplink ports.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link to="/products?brand=itti-networking" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center font-bold group-hover:border-blue-600 group-hover:text-blue-600">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Networking Card 3 */}
            <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="relative h-52 sm:h-56 bg-slate-50 overflow-hidden p-5 flex items-center justify-center border-b border-slate-100">
                  <img
                    src="/images/products/server-rack.jpg"
                    alt="ITTI 24U Floor Standing Enterprise Server Rack Cabinet (600x800mm)"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-6 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    ITTI • Model ITTI-RC-24U-800
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    ITTI 24U Floor Standing Enterprise Server Rack Cabinet (600x800mm)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    Heavy duty 24U network and server cabinet with perforated front and rear mesh doors for optimal thermal airflow, 4-way cooling fan unit, and 800 kg static load capacity.
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <div className="pt-4 border-t border-slate-100">
                  <Link to="/products?brand=itti-networking" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-center font-bold group-hover:border-blue-600 group-hover:text-blue-600">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-2 sm:pt-4">
            <Link to="/products?brand=itti-networking">
              <Button
                variant="outline"
                size="md"
                className="font-bold border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View All Networking Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

{/* =========================================================================
          SECTION: BROADBAND PLANS & PRICING SHOWCASE (MULTI-PROVIDER)
          ========================================================================= */}
      <section id="broadband-plans-section" className="w-full bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider border border-blue-400/30">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>HIGH-SPEED BROADBAND INFRASTRUCTURE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                High-Speed Broadband Plans &amp; Tariffs
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Connect your business or home with symmetrical optical fiber internet powered by leading tier-1 providers with local installation and maintenance by Nexalus.
              </p>
            </div>

            <Link to="/plans">
              <Button
                variant="outline"
                size="md"
                className="font-bold border-cyan-400 text-cyan-300 hover:bg-cyan-500/10 whitespace-nowrap cursor-pointer"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View Full Plans &amp; Comparison
              </Button>
            </Link>
          </div>

          {/* Broadband Cart Saved Plans Banner */}
          {cartItems.length > 0 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-blue-500/40 shadow-2xl backdrop-blur-md text-white animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        Broadband Cart ({cartItems.length} Plan{cartItems.length > 1 ? 's' : ''} Saved)
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Ready for Instant Activation &amp; Line Pulling
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white mt-1">
                      {cartItems[0].providerName} — {cartItems[0].planName} ({cartItems[0].speed})
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Tariff: <strong className="text-teal-400 font-extrabold text-sm">₹{cartItems[0].price}</strong>/{cartItems[0].billingPeriod || 'monthly'}
                      {cartItems.length > 1 && <span className="text-slate-400 ml-2">(and {cartItems.length - 1} other saved plan{cartItems.length > 2 ? 's' : ''})</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const first = cartItems[0];
                      setSelectedPlanForOrder({
                        planId: first.planId,
                        planName: first.planName,
                        providerName: first.providerName,
                        speed: first.speed,
                        price: first.price,
                        billingPeriod: first.billingPeriod,
                        brandId: first.brandId
                      });
                      setIsOrderModalOpen(true);
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all transform hover:scale-102 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Proceed to Order (Buy Now)</span>
                  </button>
                  <Link
                    to="/plans"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors whitespace-nowrap"
                  >
                    View All Plans &amp; Cart
                  </Link>
                  <button
                    type="button"
                    onClick={() => clearPlanCart()}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                    title="Clear Broadband Cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Provider Selector Tabs */}
          <div className="inline-flex flex-wrap p-1.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 gap-1.5">
            <button
              type="button"
              onClick={() => setHomeProviderTab('airtel')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                homeProviderTab === 'airtel'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Airtel Xstream Fiber</span>
            </button>

            <button
              type="button"
              onClick={() => setHomeProviderTab('bsnl')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                homeProviderTab === 'bsnl'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>BSNL Bharat Fiber</span>
            </button>

            <button
              type="button"
              onClick={() => setHomeProviderTab('railwire')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                homeProviderTab === 'railwire'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>RailWire Broadband</span>
            </button>

            <button
              type="button"
              onClick={() => setHomeProviderTab('one-broadband')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                homeProviderTab === 'one-broadband'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>One Broadband (FTTH)</span>
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {homeProviderTab === 'one-broadband' ? (
              // Legacy One Broadband Plans Preview
              homeOnePlans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-teal-500/60 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-xl group relative"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {plan.speed}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        One Broadband
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                        {plan.name}
                      </h3>
                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-white">
                          ₹{plan.price}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          /{plan.billingPeriod || 'month'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700/60 space-y-2.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Included Features
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-teal-400 shrink-0" />
                          <span>{plan.dataAllowance || 'Truly Unlimited Data'}</span>
                        </li>
                        {plan.includedFeatures?.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-teal-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-700/60 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart({
                            planId: plan.id,
                            providerName: 'One Broadband',
                            planName: plan.name,
                            speed: plan.speed,
                            price: plan.price,
                            billingPeriod: plan.billingPeriod || 'monthly',
                            brandId: 'one-broadband'
                          })
                        }
                        className="py-2.5 px-3 rounded-xl border border-teal-500/50 text-teal-300 hover:bg-teal-500/10 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleBuyNow({
                            planId: plan.id,
                            providerName: 'One Broadband',
                            planName: plan.name,
                            speed: plan.speed,
                            price: plan.price,
                            billingPeriod: plan.billingPeriod || 'monthly',
                            brandId: 'one-broadband'
                          })
                        }
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Buy Now</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPlanQuoteItem({
                          providerName: 'One Broadband',
                          planName: plan.name,
                          speed: plan.speed,
                          brandId: 'one-broadband'
                        });
                        setIsPlanQuoteOpen(true);
                      }}
                      className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-300 py-1 transition-colors cursor-pointer"
                    >
                      Enquire custom feasibility &rarr;
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Multi-Provider (Airtel, BSNL, RailWire) Plans Preview
              (() => {
                const currentPlans = homeBroadbandPlans
                  .filter(p => p.providerId === homeProviderTab)
                  .slice(0, 3);

                if (currentPlans.length === 0) {
                  return (
                    <div className="col-span-full py-12 px-6 rounded-3xl bg-slate-800/40 border border-slate-700/60 text-center space-y-3">
                      <Wifi className="w-10 h-10 text-slate-500 mx-auto" />
                      <div className="text-base font-bold text-white">
                        {homeProviderTab.toUpperCase()} Broadband Plans
                      </div>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        High-speed fiber connectivity for {homeProviderTab.toUpperCase()} is available across service areas. Request a quote or coverage check to view custom speed tariffs.
                      </p>
                      <div className="pt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setPlanQuoteItem({
                              providerName: homeProviderTab.toUpperCase(),
                              planName: 'Fiber Connection Enquiry',
                              speed: 'High-Speed Fiber',
                              brandId: 'nexalus-innovations'
                            });
                            setIsPlanQuoteOpen(true);
                          }}
                        >
                          Enquire for {homeProviderTab.toUpperCase()} Availability
                        </Button>
                      </div>
                    </div>
                  );
                }

                return currentPlans.map((plan) => {
                  const providerTheme = {
                    airtel: { border: 'hover:border-rose-500/60', badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', btn: 'bg-rose-600 hover:bg-rose-500' },
                    bsnl: { border: 'hover:border-blue-500/60', badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', btn: 'bg-blue-600 hover:bg-blue-500' },
                    railwire: { border: 'hover:border-amber-500/60', badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', btn: 'bg-amber-600 hover:bg-amber-500' }
                  }[homeProviderTab] || { border: 'hover:border-blue-500/60', badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', btn: 'bg-blue-600 hover:bg-blue-500' };

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-3xl bg-slate-800/80 border border-slate-700/80 ${providerTheme.border} transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-xl group relative`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${providerTheme.badgeBg} border`}>
                            {plan.speed}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            {plan.providerId.toUpperCase()} FIBER
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {plan.name}
                          </h3>
                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-black text-white">
                              {formatBroadbandPrice(plan.price, plan.currency)}
                            </span>
                            {plan.originalPrice && (
                              <span className="text-sm text-slate-500 line-through">
                                {formatBroadbandPrice(plan.originalPrice, plan.currency)}
                              </span>
                            )}
                            <span className="text-xs font-semibold text-slate-400">
                              /{plan.billingPeriod || 'month'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700/60 space-y-2.5">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Plan Highlights
                          </div>
                          <ul className="space-y-2 text-xs text-slate-300">
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                              <span>{plan.dataAllowance || 'Truly Unlimited Data'}</span>
                            </li>
                            {plan.features?.slice(0, 3).map((feat, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-700/60 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleAddToCart({
                                planId: plan.id,
                                providerName: plan.providerId === 'airtel' ? 'Airtel Xstream' : plan.providerId === 'bsnl' ? 'BSNL Bharat Fiber' : 'RailWire',
                                planName: plan.name,
                                speed: plan.speed,
                                price: plan.price,
                                billingPeriod: plan.billingPeriod || 'monthly',
                                brandId: 'nexalus-innovations'
                              })
                            }
                            className="py-2.5 px-3 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-700/50 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleBuyNow({
                                planId: plan.id,
                                providerName: plan.providerId === 'airtel' ? 'Airtel Xstream' : plan.providerId === 'bsnl' ? 'BSNL Bharat Fiber' : 'RailWire',
                                planName: plan.name,
                                speed: plan.speed,
                                price: plan.price,
                                billingPeriod: plan.billingPeriod || 'monthly',
                                brandId: 'nexalus-innovations'
                              })
                            }
                            className={`py-2.5 px-3 rounded-xl ${providerTheme.btn} text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer`}
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Buy Now</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPlanQuoteItem({
                              providerName: plan.providerId.toUpperCase(),
                              planName: plan.name,
                              speed: plan.speed,
                              brandId: 'nexalus-innovations'
                            });
                            setIsPlanQuoteOpen(true);
                          }}
                          className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-300 py-1 transition-colors cursor-pointer"
                        >
                          Enquire custom feasibility &rarr;
                        </button>
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      </section>



      {/* =========================================================================
          SLIDE 6: WHERE OUR SERVICES ARE USED (CLEAN WHITE THEME)
          ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider border border-blue-200 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Where We Provide Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Where Our CCTV, Internet &amp; Network Services Are Used
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Nexalus Innovations LLP installs security cameras, high-speed optical fiber internet, and networking setups across these key places:
            </p>
          </div>

          {/* 4 Interactive Places Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setActivePlace('offices')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                activePlace === 'offices'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-600 shadow-xl shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-white/80 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    activePlace === 'offices' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    activePlace === 'offices' ? 'bg-white/25 text-white' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  Offices
                </span>
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base leading-tight">Offices &amp; Workplaces</h4>
                <p className={`text-[11px] mt-1 ${activePlace === 'offices' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Staff Wi-Fi, Fast Internet &amp; Cameras
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActivePlace('residential')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                activePlace === 'residential'
                  ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white border-sky-500 shadow-xl shadow-sky-500/25 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-white/80 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    activePlace === 'residential' ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  <Home className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    activePlace === 'residential' ? 'bg-white/25 text-white' : 'bg-sky-50 text-sky-700'
                  }`}
                >
                  Societies
                </span>
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base leading-tight">Homes &amp; Societies</h4>
                <p className={`text-[11px] mt-1 ${activePlace === 'residential' ? 'text-sky-100' : 'text-slate-500'}`}>
                  Society Gates, Flats &amp; Parking
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActivePlace('retail')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                activePlace === 'retail'
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-white/80 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    activePlace === 'retail' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    activePlace === 'retail' ? 'bg-white/25 text-white' : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  Retail
                </span>
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base leading-tight">Shops &amp; Showrooms</h4>
                <p className={`text-[11px] mt-1 ${activePlace === 'retail' ? 'text-indigo-100' : 'text-slate-500'}`}>
                  Billing Internet &amp; Cash Counters
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActivePlace('factories')}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                activePlace === 'factories'
                  ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white border-slate-900 shadow-xl shadow-blue-900/25 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-white/80 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    activePlace === 'factories' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  <Warehouse className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    activePlace === 'factories' ? 'bg-white/25 text-white' : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  Factories
                </span>
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base leading-tight">Factories &amp; Warehouses</h4>
                <p className={`text-[11px] mt-1 ${activePlace === 'factories' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Entry Gates, Boundary &amp; Godowns
                </p>
              </div>
            </button>
          </div>

          {/* Dynamic Place Details Showcase Box */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-blue-900/10 p-6 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Place Name & How Services Are Used */}
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                      {activePlace === 'offices' && 'Where Used: Corporate Offices & IT Firms'}
                      {activePlace === 'residential' && 'Where Used: Housing Societies, Apartments & Homes'}
                      {activePlace === 'retail' && 'Where Used: Shops, Supermarkets & Showrooms'}
                      {activePlace === 'factories' && 'Where Used: Industrial Plants, Godowns & Logistics Sheds'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-bold">Nexalus Turnkey Setup</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {activePlace === 'offices' && 'CCTV, Fiber Internet & Network Setup for Offices'}
                    {activePlace === 'residential' && 'CCTV, Home Fiber & Intercom for Housing Societies'}
                    {activePlace === 'retail' && 'CCTV & Billing Internet for Shops and Showrooms'}
                    {activePlace === 'factories' && 'CCTV, Outdoor Fiber & Network for Factories & Godowns'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    {activePlace === 'offices' &&
                      'We provide fast fiber broadband for video calls, full Wi-Fi roaming across all rooms, neat LAN cabling to every desk, and clear CCTV cameras with mobile phone view.'}
                    {activePlace === 'residential' &&
                      'Direct optical fiber connection inside every flat for family internet, paired with 24/7 night-vision cameras at building main gates, parking areas, and lift lobbies.'}
                    {activePlace === 'retail' &&
                      'Zero-disconnection fiber internet for POS billing machines, barcode scanners, and UPI QR codes, with high-definition cameras focused on cash counters and entry doors.'}
                    {activePlace === 'factories' &&
                      'Long-distance zoom night-vision cameras for factory boundary walls and truck gates, weatherproof armored fiber connecting separate sheds, and warehouse Wi-Fi.'}
                  </p>
                </div>

                {/* 4 Clear & Short Service Points */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Services Delivered by Nexalus in this Place:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {activePlace === 'offices' && (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">4K Office Security Cameras</strong>
                            <span className="text-slate-500 text-[11px]">Installed at reception, entrance, conference rooms &amp; cabins with live mobile view</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">High-Speed Optical Fiber</strong>
                            <span className="text-slate-500 text-[11px]">Fast, stable internet for video calls, cloud files &amp; zero office work stoppage</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Office Wi-Fi &amp; LAN Cabling</strong>
                            <span className="text-slate-500 text-[11px]">Clean concealed cables to every desk, high-speed Wi-Fi &amp; organized server racks</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Quick Repair &amp; AMC Visits</strong>
                            <span className="text-slate-500 text-[11px]">Same-day technician support, quarterly camera lens cleaning &amp; wire checkups</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activePlace === 'residential' && (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-sky-50/50 hover:border-sky-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Society Main Gate &amp; Parking CCTV</strong>
                            <span className="text-slate-500 text-[11px]">Night-vision cameras at building entry, parking, lifts &amp; perimeter walls</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-sky-50/50 hover:border-sky-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">High-Speed Fiber to Every Flat</strong>
                            <span className="text-slate-500 text-[11px]">Direct optical fiber cable for HD streaming, work from home &amp; smart TV</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-sky-50/50 hover:border-sky-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Video Intercom &amp; Gate Entry</strong>
                            <span className="text-slate-500 text-[11px]">Residents see visitors on mobile app or screen before opening the main gate</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-sky-50/50 hover:border-sky-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Fast Local Area Technician</strong>
                            <span className="text-slate-500 text-[11px]">Prompt local service in your neighborhood for any cable repair or support</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activePlace === 'retail' && (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Cash Counter &amp; Billing CCTV</strong>
                            <span className="text-slate-500 text-[11px]">Sharp camera focus on cash drawer, billing counter, store aisles &amp; main door</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Uninterrupted Billing Internet</strong>
                            <span className="text-slate-500 text-[11px]">Fast connection so POS card swipe, barcode bills &amp; UPI payments never fail</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Separate Wi-Fi for Customers</strong>
                            <span className="text-slate-500 text-[11px]">Keep billing systems isolated and safe while providing store Wi-Fi</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">24/7 Mobile View from Anywhere</strong>
                            <span className="text-slate-500 text-[11px]">Store owners can watch live cameras and audio directly on their smartphone</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activePlace === 'factories' && (
                      <>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Boundary &amp; Long-Distance CCTV</strong>
                            <span className="text-slate-500 text-[11px]">Night-vision zoom cameras covering factory walls, loading docks &amp; plant floors</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Outdoor Armored Optical Fiber</strong>
                            <span className="text-slate-500 text-[11px]">Weatherproof fiber lines linking separate factory sheds, offices &amp; machines</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Truck &amp; Gate Entry Number Logging</strong>
                            <span className="text-slate-500 text-[11px]">Automatic vehicle number plate cameras to track every delivery truck</span>
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-blue-50/50 hover:border-blue-200 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 block font-bold">Warehouse Wi-Fi &amp; AMC Support</strong>
                            <span className="text-slate-500 text-[11px]">Full Wi-Fi signal for inventory barcode scanners, tablets &amp; maintenance audits</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Operational Metric & Case Study Box */}
              <div className="lg:col-span-5 space-y-6">
                {/* Simple Place Information Overview Card */}
                <div
                  className={`p-6 sm:p-7 rounded-3xl text-white space-y-3 shadow-xl ${
                    activePlace === 'offices'
                      ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/20'
                      : activePlace === 'residential'
                      ? 'bg-gradient-to-br from-sky-500 via-blue-600 to-sky-700 shadow-sky-500/20'
                      : activePlace === 'retail'
                      ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 shadow-indigo-500/20'
                      : 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 shadow-blue-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                      Nexalus Onsite Setup
                    </span>
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg sm:text-xl font-bold tracking-tight">
                      {activePlace === 'offices' && 'Turnkey Corporate IT & Camera Setup'}
                      {activePlace === 'residential' && 'Society Safety & High-Speed Home Internet'}
                      {activePlace === 'retail' && 'Retail Billing Network & Cash Protection'}
                      {activePlace === 'factories' && 'Industrial Campus Perimeter & Shed Network'}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                      {activePlace === 'offices' && 'Concealed cabling to every desk, high-definition security cameras with live mobile view, and fast symmetrical fiber internet for uninterrupted office work.'}
                      {activePlace === 'residential' && 'Direct optical fiber line into each flat and 24/7 night-vision cameras at building main gates, vehicle parking areas, and elevator lobbies.'}
                      {activePlace === 'retail' && 'Dedicated internet line so POS machines, card swipe, and UPI payments never fail, paired with sharp cameras monitoring the cash counter and store entry.'}
                      {activePlace === 'factories' && 'Long-range weatherproof zoom cameras covering boundary walls and gates, with heavy-duty armored fiber connecting all production and warehouse sheds.'}
                    </p>
                  </div>
                </div>

                {/* Verified Regional Deployment (Prominently featuring Sangli) */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-blue-600" />
                      Verified Regional Deployment
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-extrabold uppercase">
                      Active Client
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-2">
                    <div className="font-extrabold text-slate-900 text-sm">
                      {activePlace === 'offices' && 'Software & Technology Parks, Sangli'}
                      {activePlace === 'residential' && 'Riverfront Gated Housing Societies, Sangli'}
                      {activePlace === 'retail' && 'Commercial Showrooms & Bank Branches, Sangli'}
                      {activePlace === 'factories' && 'Industrial MIDC Plants & Godowns, Sangli-Kolhapur Corridor'}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {activePlace === 'offices' && 'Scope: 140+ Workstations • 12 Managed Switches • 24 CCTV Cameras • 1 Gbps Fiber Line'}
                      {activePlace === 'residential' && 'Scope: 320 Apartments • FTTH Fiber Connection • 18 Gate Cameras & Intercom Nodes'}
                      {activePlace === 'retail' && 'Scope: 18 Branch & Retail Locations • POS Billing Internet • Cash Counter 4K CCTV'}
                      {activePlace === 'factories' && 'Scope: 45,000 Sq.Ft. Facility • 32x PTZ Domes • 40TB RAID NVR • Armored Fiber'}
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[11px] text-blue-700 font-semibold bg-blue-50/80 p-2.5 rounded-lg border border-blue-100">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Dedicated on-site technician team available in Sangli for prompt service</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full font-bold justify-center shadow-md shadow-blue-500/20"
                      onClick={() => setIsQuoteModalOpen(true)}
                    >
                      Request Site Survey in Sangli
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SLIDE 7: WHY ORGANIZATIONS CHOOSE NEXALUS (RICH CORPORATE BLUE THEME)
          ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-16 sm:py-24 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0c1c38]/90 border border-blue-900/50 shadow-2xl space-y-10">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                Verified Value &amp; Engineering Standards
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Why Organizations Choose Nexalus as Their Infrastructure Partner
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We eliminate multi-vendor friction by combining surveillance hardware distribution with optical network engineering under one unified contract.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#09152a]/90 border border-blue-900/60 shadow-lg hover:border-cyan-400/60 transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-400/20 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">Single Vendor Accountability</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No finger-pointing between your internet service provider and security hardware vendor. We own the complete fiber pipe and video stream.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#09152a]/90 border border-blue-900/60 shadow-lg hover:border-cyan-400/60 transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-400/20 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">100% Genuine OEM Hardware</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct authorized systems integrator for commercial 4K cameras, next-gen hardware firewalls, and dedicated optical fiber leased lines. Authentic serial numbers and warranties.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#09152a]/90 border border-blue-900/60 shadow-lg hover:border-cyan-400/60 transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Wifi className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">Precision Fiber Engineering</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pure optical fiber backhaul designed with redundant ring topologies for minimal jitter, OTDR-tested loss, and enterprise uptime reliability.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#09152a]/90 border border-blue-900/60 shadow-lg hover:border-cyan-400/60 transition-all space-y-3 group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-400/20 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Server className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">Quarterly Health Audits (AMC)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Proactive camera lens cleaning, NVR storage health diagnostics, optical loop testing, and certified rapid restoration SLAs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DYNAMIC CUSTOM SECTIONS (Configured via Admin Section Visibility)
          ========================================================================= */}
      <CustomSectionsRenderer sections={heroBanner?.customSections} brandId="nexalus" />

      {/* =========================================================================
          SECTION: AREAS COVERED & SERVICE AVAILABILITY CHECKER
          ========================================================================= */}
      <AreasCoveredSection division="corporate" />

      {/* =========================================================================
          SLIDE 8: BUSINESS ENQUIRY & SITE SURVEY CTA BANNER (CLEAN WHITE THEME)
          ========================================================================= */}
      <section className="w-full py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white p-8 sm:p-14 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-900/50">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-15 [background-size:20px_20px] pointer-events-none" />

            <div className="relative space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 text-sky-400 text-xs font-bold border border-blue-700/50 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block animate-pulse" />
                <span>Free Engineering Consultation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ready to Upgrade Your Connectivity &amp; Security?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Request a free onsite site survey, custom optical bandwidth proposal, or CCTV Bill of Quantities (BoQ). Our certified engineering team responds promptly.
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link to="/contact">
                <Button
                  variant="white"
                  size="lg"
                  className="px-8 py-4 font-black shadow-xl shadow-blue-950/40 hover:scale-[1.03] active:scale-95 transition-all text-slate-950 bg-white hover:bg-sky-50"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Contact Sales Desk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        brandId="general"
      />

      {/* Plan-Specific Quote Modal */}
      {planQuoteItem && (
        <QuoteModal
          isOpen={isPlanQuoteOpen}
          onClose={() => {
            setIsPlanQuoteOpen(false);
            setPlanQuoteItem(null);
          }}
          brandId={planQuoteItem.brandId}
          itemName={`${planQuoteItem.providerName}: ${planQuoteItem.planName} (${planQuoteItem.speed})`}
          itemType="plan"
          sourcePage="/"
        />
      )}

      {/* Instant Direct Order Modal (BUY NOW) */}
      <PlanOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedPlanForOrder(null);
        }}
        plan={selectedPlanForOrder}
      />
    </div>
  );
};
