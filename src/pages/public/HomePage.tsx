import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  ArrowRight,
  Award,
  Users,
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
  Truck
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { QuoteModal } from '../../components/common/QuoteModal';
import { BlurZoomReveal } from '../../components/common/BlurZoomReveal';
import { OurTeamSection } from '../../components/common/OurTeamSection';
import { ServiceCard } from '../../components/brand/ServiceCard';
import { Service } from '../../types';

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

  // Scroll reveal animation for Brands cards (triggers ONLY when user scrolls down to Our Brands)
  const [brandsVisible, setBrandsVisible] = useState(false);
  const brandsSectionRef = useRef<HTMLDivElement>(null);

  // Scroll reveal animation for 3 Technology Pillars (CCTV, Fiber, Networking)
  const [pillarsVisible, setPillarsVisible] = useState(false);
  const pillarsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // 1. Brands cards visibility check
      if (brandsSectionRef.current) {
        const rect = brandsSectionRef.current.getBoundingClientRect();
        const hasScrolledFromTop = window.scrollY > 100;
        const isCardsInView = rect.top < windowHeight - 120 && rect.bottom > 80;

        if (hasScrolledFromTop && isCardsInView) {
          setBrandsVisible(true);
        } else if (window.scrollY < 80 || rect.top > windowHeight || rect.bottom < 0) {
          setBrandsVisible(false);
        }
      }

      // 2. Pillars cards visibility check
      if (pillarsSectionRef.current) {
        const pRect = pillarsSectionRef.current.getBoundingClientRect();
        const isPillarsInView = pRect.top < windowHeight - 80 && pRect.bottom > 80;
        if (isPillarsInView) {
          setPillarsVisible(true);
        } else if (pRect.top > windowHeight || pRect.bottom < 0) {
          setPillarsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Typewriter effect for Website Name in Hero
  const fullBrandName = 'Nexalus Innovations LLP';
  const [typedTitle, setTypedTitle] = useState('');
  const [isDeletingTitle, setIsDeletingTitle] = useState(false);

  useEffect(() => {
    let timer: any;
    if (!isDeletingTitle && typedTitle.length < fullBrandName.length) {
      timer = setTimeout(() => {
        setTypedTitle(fullBrandName.slice(0, typedTitle.length + 1));
      }, 95);
    } else if (!isDeletingTitle && typedTitle.length === fullBrandName.length) {
      timer = setTimeout(() => {
        setIsDeletingTitle(true);
      }, 3500);
    } else if (isDeletingTitle && typedTitle.length > 0) {
      timer = setTimeout(() => {
        setTypedTitle(fullBrandName.slice(0, typedTitle.length - 1));
      }, 45);
    } else if (isDeletingTitle && typedTitle.length === 0) {
      setIsDeletingTitle(false);
    }
    return () => clearTimeout(timer);
  }, [typedTitle, isDeletingTitle]);

  return (
    <div className="flex flex-col w-full">
      {/* =========================================================================
          SLIDE 1: HERO FULL-WIDTH EDGE-TO-EDGE BANNER (DEEP MIDNIGHT & SERVER MESH)
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800 min-h-[calc(100svh-4rem)] sm:min-h-[calc(100vh-5rem)] flex flex-col justify-between">
        {/* Photographic background image showcasing authentic enterprise server rack */}
        <div className="absolute inset-0">
          <img
            src="/images/fermilab-blue-racks-real.jpg"
            alt="Nexalus Innovations LLP Enterprise Server Rack, Optical Fiber & CCTV Surveillance Infrastructure"
            className="w-full h-full object-cover object-[75%_center] lg:object-[82%_center]"
          />
        </div>

        {/* Clean directional contrast scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/98 via-[#0f2444]/90 via-45% md:via-40% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-[#0a1628]/50 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-6 sm:py-16 lg:py-20 flex flex-col justify-between min-h-[calc(100svh-4rem)] sm:min-h-0 w-full flex-1">
          <div className="max-w-4xl lg:max-w-5xl space-y-4 sm:space-y-5 text-white mr-auto my-auto">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white min-h-[1.25em] flex items-center">
              <span className="inline-flex items-center flex-wrap sm:flex-nowrap break-words">
                <span className="break-words">{typedTitle}</span>
                <span className="inline-block w-[3px] sm:w-1 h-[0.8em] bg-cyan-400 ml-1.5 animate-pulse rounded-full shrink-0 align-middle" />
              </span>
            </h1>

            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-sky-300 tracking-tight leading-snug">
              Internet, Network &amp; CCTV Services
            </p>

            <p className="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed font-normal max-w-xl pt-0.5 sm:pt-1">
              Your trusted technology infrastructure partner. Operating under <strong className="text-white font-bold">Nexalus Innovations LLP</strong>, we engineer ultra-fast <strong className="text-white font-bold">gigabit optical fiber</strong> leased lines, managed Layer-2/3 network switching, and certified <strong className="text-white font-bold">video surveillance</strong> systems to empower local businesses.
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/50 px-6 py-3.5 rounded-xl transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Request a Quotation
              </Button>
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  variant="outline-white"
                  size="lg"
                  className="w-full sm:w-auto justify-center border-slate-700 hover:bg-white/10 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg backdrop-blur-xs"
                >
                  Explore Solutions
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Bottom Status Cue: Anchors the bottom of the viewport gracefully */}
          <div className="sm:hidden pt-4 pb-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 mt-auto">
            <span className="flex items-center gap-1.5 font-medium text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Technology &amp; Security Engineering</span>
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              Scroll to explore ↓
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SLIDE 2: OUR BRANDS (CLEAN WHITE THEME)
          ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-20 border-b border-slate-200/90 overflow-hidden">
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

          <div ref={brandsSectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Division 1: Nexalus Innovations (Left Card - Slides in from left) */}
            <div
              className={`w-full h-full flex flex-col transform-gpu transition-all duration-1000 ease-out ${
                brandsVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-16 sm:-translate-x-28 pointer-events-none'
              }`}
            >
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-2xl hover:shadow-blue-500/15 hover:border-blue-400 hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between group flex-1 cursor-pointer">
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src="/images/server-racks-4508751.jpg"
                    alt="Nexalus Innovations Technology & Network Infrastructure Division"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 sm:p-7 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-700">
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
            </div>

            {/* Division 2: A.M. Distributors Chiplun (Right Card - Slides in from right) */}
            <div
              className={`w-full h-full flex flex-col transform-gpu transition-all duration-1000 ease-out delay-150 ${
                brandsVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-16 sm:translate-x-28 pointer-events-none'
              }`}
            >
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-2xl hover:shadow-teal-500/15 hover:border-teal-400 hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between group flex-1 cursor-pointer">
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src="/images/projects/real-warehouse-distribution.jpg"
                    alt="A.M. Distributors Chiplun Cold-Chain & FMCG Distribution Facility"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 sm:p-7 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-700">
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
        </div>
      </section>

      {/* =========================================================================
          SECTION: OUR TEAM (SLIDING FOCUS SLIDER)
          ========================================================================= */}
      <OurTeamSection division="corporate" />

      {/* =========================================================================
          SECTION 3: INTEGRATED TECHNOLOGY INFRASTRUCTURE (3 PILLARS - RICH CORPORATE BLUE)
          ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
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

          {/* 3 Pillar Cards Side-by-Side (CCTV, Internet, Networking) */}
          <div ref={pillarsSectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: CCTV Surveillance (Enters from Left) */}
            <div
              className={`w-full h-full flex flex-col transform-gpu transition-all duration-1000 ease-out ${
                pillarsVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-16 md:-translate-x-28 pointer-events-none'
              }`}
            >
              <div className="rounded-3xl bg-[#0c1c38]/90 border border-blue-900/50 shadow-xl card-hover-glow-cyan overflow-hidden flex flex-col justify-between group cursor-pointer flex-1">
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
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>4K Ultra-HD 8MP Resolution</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>24/7 Starlight Color Night Vision</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Live View on Smartphone App</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
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
            </div>

            {/* Card 2: Optical Fiber Internet (Enters from Top / Above) */}
            <div
              className={`w-full h-full flex flex-col transform-gpu transition-all duration-1000 ease-out delay-150 ${
                pillarsVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-16 md:-translate-y-24 pointer-events-none'
              }`}
            >
              <div className="rounded-3xl bg-[#0c1c38]/90 border border-blue-900/50 shadow-xl card-hover-glow-teal overflow-hidden flex flex-col justify-between group cursor-pointer flex-1">
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
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Symmetrical Gigabit Speeds</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Dual-Band Wi-Fi 6 Routers</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Whole-Premises Mesh Roaming</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
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
            </div>

            {/* Card 3: Enterprise IT Networking (Enters from Right) */}
            <div
              className={`w-full h-full flex flex-col transform-gpu transition-all duration-1000 ease-out delay-300 ${
                pillarsVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-16 md:translate-x-28 pointer-events-none'
              }`}
            >
              <div className="rounded-3xl bg-[#0c1c38]/90 border border-blue-900/50 shadow-xl card-hover-glow-indigo overflow-hidden flex flex-col justify-between group cursor-pointer flex-1">
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
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>Layer-2/3 Managed PoE+ Switching</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>10G SFP+ Optical Uplinks</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>Pure Copper Cat6A Structured Cabling</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
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
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURED EQUIPMENT & HARDWARE SHOWCASE (CLEAN PREMIUM THEME)
          ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-white via-slate-50/50 to-white text-slate-900 py-16 sm:py-24 border-b border-slate-200/90 relative overflow-hidden">
        {/* Subtle ambient tech background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <BlurZoomReveal delay={0} yOffset={20} blur={10}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200/80 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Certified Commercial Equipment</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
                  <span className="text-[10px] text-emerald-600 font-bold normal-case">Direct OEM Stock</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Featured Commercial Hardware
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Genuine OEM certified security cameras, optical fiber terminals, and managed switches with on-site deployment warranty by Nexalus Innovations.
                </p>
              </div>
              <Link to="/products" className="shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  className="font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transform hover:scale-[1.03] active:scale-95 transition-all"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Browse All Hardware
                </Button>
              </Link>
            </div>
          </BlurZoomReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Hardware 1: CCTV Surveillance (CP-PLUS) - Slide in from LEFT */}
            <BlurZoomReveal delay={50} blur={12} scale={0.92} direction="left" xOffset={-70}>
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between overflow-hidden card-zoom-hover card-hover-glow-blue h-full">
                <div>
                  {/* Spotlight Image Container with Radial Glow Backdrop */}
                  <div className="relative h-64 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white overflow-hidden p-6 flex items-center justify-center border-b border-slate-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18)_0%,transparent_70%)] pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                    
                    <img
                      src="/images/products/cp-bullet.jpg"
                      alt="4K Ultra-HD IR Bullet Camera"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md img-zoom-hover transform-gpu"
                      loading="lazy"
                    />

                    {/* Category Tag */}
                    <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-md shadow-blue-600/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                      CCTV Surveillance
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-blue-600 font-bold tracking-wider">
                      <span>CP-PLUS</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60">MODEL CP-UNR-4K</span>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      4K Ultra-HD IR Bullet Camera
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      IP67 weatherproof metal casing, 50-meter infrared night vision, and human motion tracking.
                    </p>

                    {/* Industrial Specification Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        8MP Sony Starvis
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        50m Color Night Vision
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        IP67 Metal Casing
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link to="/products?brand=cp-plus" className="block w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center font-bold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transform active:scale-95 transition-all"
                      icon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                    >
                      View Product Specs
                    </Button>
                  </Link>
                </div>
              </div>
            </BlurZoomReveal>

            {/* Featured Hardware 2: Fiber Broadband (ONE BROADBAND) - Zoom in from CENTER */}
            <BlurZoomReveal delay={180} blur={12} scale={0.92} direction="up" yOffset={35}>
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between overflow-hidden card-zoom-hover card-hover-glow-teal h-full">
                <div>
                  {/* Spotlight Image Container with Radial Glow Backdrop */}
                  <div className="relative h-64 bg-gradient-to-b from-teal-50/70 via-slate-50 to-white overflow-hidden p-6 flex items-center justify-center border-b border-slate-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.18)_0%,transparent_70%)] pointer-events-none group-hover:scale-125 transition-transform duration-700" />

                    <img
                      src="/images/products/wifi6-router.jpg"
                      alt="Gigabit Wi-Fi 6 Dual-Band Router"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md img-zoom-hover transform-gpu"
                      loading="lazy"
                    />

                    {/* Category Tag */}
                    <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider bg-teal-600 text-white px-3 py-1.5 rounded-full shadow-md shadow-teal-600/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-200 animate-pulse" />
                      Fiber Broadband
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-teal-600 font-bold tracking-wider">
                      <span>ONE BROADBAND</span>
                      <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md border border-teal-200/60">MODEL ONE-G600AX</span>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                      Gigabit Wi-Fi 6 Dual-Band Router
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Up to 3 Gbps combined wireless speed, 4 high-gain antennas, and ultra-low latency for HD calls.
                    </p>

                    {/* Industrial Specification Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        3 Gbps Wi-Fi 6
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        4 High-Gain Antennas
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        Ultra-Low Latency Ping
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link to="/products?brand=one-broadband" className="block w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center font-bold bg-teal-600 hover:bg-teal-500 shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 transform active:scale-95 transition-all"
                      icon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                    >
                      View Product Specs
                    </Button>
                  </Link>
                </div>
              </div>
            </BlurZoomReveal>

            {/* Featured Hardware 3: IT Networking (ITTI) - Slide in from RIGHT */}
            <BlurZoomReveal delay={300} blur={12} scale={0.92} direction="right" xOffset={70}>
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between overflow-hidden card-zoom-hover card-hover-glow-indigo h-full">
                <div>
                  {/* Spotlight Image Container with Radial Glow Backdrop */}
                  <div className="relative h-64 bg-gradient-to-b from-indigo-50/70 via-slate-50 to-white overflow-hidden p-6 flex items-center justify-center border-b border-slate-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18)_0%,transparent_70%)] pointer-events-none group-hover:scale-125 transition-transform duration-700" />

                    <img
                      src="/images/products/poe-switch.jpg"
                      alt="24-Port Gigabit Managed PoE+ Switch"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md img-zoom-hover transform-gpu"
                      loading="lazy"
                    />

                    {/* Category Tag */}
                    <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-md shadow-indigo-600/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
                      IT Networking
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-indigo-600 font-bold tracking-wider">
                      <span>ITTI</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">MODEL ITTI-GS24-POE</span>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      24-Port Gigabit Managed PoE+ Switch
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      370W total PoE power budget, 4 SFP fiber uplink ports, VLAN segmentation, and QoS traffic priority.
                    </p>

                    {/* Industrial Specification Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        370W PoE+ Power Budget
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        4x SFP Fiber Uplinks
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">
                        VLAN &amp; QoS Traffic
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link to="/products?brand=itti-networking" className="block w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center font-bold bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transform active:scale-95 transition-all"
                      icon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
                    >
                      View Product Specs
                    </Button>
                  </Link>
                </div>
              </div>
            </BlurZoomReveal>
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
                  <div className="flex flex-wrap items-center gap-2">
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
          <div className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-[#0c1c38]/90 border border-blue-900/50 shadow-2xl space-y-10">
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
          SLIDE 8: BUSINESS ENQUIRY & SITE SURVEY CTA BANNER (CLEAN WHITE THEME)
          ========================================================================= */}
      <section className="w-full py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white p-6 sm:p-10 lg:p-14 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-900/50">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-15 [background-size:20px_20px] pointer-events-none" />

            <div className="relative space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 text-sky-400 text-xs font-bold border border-blue-700/50 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block animate-pulse" />
                <span>Free Engineering Consultation</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ready to Upgrade Your Connectivity &amp; Security?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Request a free onsite site survey, custom optical bandwidth proposal, or CCTV Bill of Quantities (BoQ). Our certified engineering team responds promptly.
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link to="/contact" className="w-full sm:w-auto">
                <Button
                  variant="white"
                  size="lg"
                  className="w-full sm:w-auto justify-center px-8 py-4 font-black shadow-xl shadow-blue-950/40 hover:scale-[1.03] active:scale-95 transition-all text-slate-950 bg-white hover:bg-sky-50"
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
    </div>
  );
};
