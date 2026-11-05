import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  PhoneCall
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { OurTeamSection } from '../../../components/common/OurTeamSection';
import { ProjectGallerySection } from '../../../components/common/ProjectGallerySection';
import { QuoteModal } from '../../../components/common/QuoteModal';
import { ProductCard } from '../../../components/brand/ProductCard';
import { CustomSectionsRenderer } from '../../../components/common/CustomSectionsRenderer';
import { getProducts, getCachedProducts, subscribeToProducts, subscribeToBanners, getCachedBanners, getCachedCategories, subscribeToCategories } from '../../../firebase/services';
import { SiteBanner, ProductCategory } from '../../../types';
import { initialProducts, DEFAULT_INNOVATIONS_SECTIONS, DEFAULT_INNOVATIONS_SLIDES } from '../../../data/initialData';
import { Product } from '../../../types';

export const NexalusInnovationsPage: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(() => getCachedProducts('nexalus-innovations'));
  const [heroBanner, setHeroBanner] = useState<SiteBanner | null>(() => {
    const list = getCachedBanners('nexalus-innovations');
    const found = list.find(b => b.id === 'ban-innovations' || b.brandId === 'nexalus-innovations');
    return found || null;
  });

  const [innoCategories, setInnoCategories] = useState<ProductCategory[]>(() =>
    getCachedCategories('nexalus-innovations')
  );

  const cctvCategory = innoCategories.find(c => c.id === 'cat-nexalus-cctv');
  const fiberCategory = innoCategories.find(c => c.id === 'cat-nexalus-internet');
  const networkCategory = innoCategories.find(c => c.id === 'cat-nexalus-networking');
  const electronicsCategory = innoCategories.find(c => c.id === 'cat-nexalus-electronics');

  // Independent toggle states for the 3 Z-pattern product sections (default open)
  const [showCctvProducts, setShowCctvProducts] = useState(true);
  const [showInternetProducts, setShowInternetProducts] = useState(true);
  const [showNetworkProducts, setShowNetworkProducts] = useState(true);

  // Dynamic Multi-Slide Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = useMemo(() => {
    const raw = (heroBanner?.slides && heroBanner.slides.length > 0)
      ? heroBanner.slides
      : DEFAULT_INNOVATIONS_SLIDES;
    return raw.filter(s => (s as any).visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [heroBanner?.slides]);

  // Ensure currentSlide is within bounds when slides change
  useEffect(() => {
    if (currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [heroSlides.length, currentSlide]);

  // Automatic slide rotation every 5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[currentSlide] || heroSlides[0];

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  const innoSections = React.useMemo(() => {
    const list = (heroBanner?.sectionsOrder && heroBanner.sectionsOrder.length > 0)
      ? heroBanner.sectionsOrder
      : DEFAULT_INNOVATIONS_SECTIONS;
    return [...list].sort((a, b) => a.order - b.order);
  }, [heroBanner?.sectionsOrder]);

  const isSectionVisible = (secId: string) => {
    const found = innoSections.find(s => s.id === secId);
    return found ? found.visible !== false : true;
  };

  useEffect(() => {
    async function load() {
      try {
        const prods = await getProducts('nexalus-innovations', true);
        if (prods && prods.length > 0) {
          setAllProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load products for Nexalus Innovations:', err);
      }
    }
    load();

    const unsubBanners = subscribeToBanners((banners) => {
      const b = banners.find(ban => ban.id === 'ban-innovations' || ban.brandId === 'nexalus-innovations');
      if (b) setHeroBanner(b);
    }, 'nexalus-innovations');

    const unsubCategories = subscribeToCategories((cats) => {
      if (cats && cats.length > 0) setInnoCategories(cats);
    }, 'nexalus-innovations');

    const unsubProducts = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) setAllProducts(prods);
    }, 'nexalus-innovations');

    const handleUpdate = () => {
      load();
      const list = getCachedBanners('nexalus-innovations');
      const found = list.find(b => b.id === 'ban-innovations' || b.brandId === 'nexalus-innovations');
      if (found) setHeroBanner(found);
      const freshCats = getCachedCategories('nexalus-innovations');
      if (freshCats && freshCats.length > 0) setInnoCategories(freshCats);
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      unsubBanners();
      unsubCategories();
      unsubProducts();
      window.removeEventListener('nexalus_data_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const getProduct = (id: string): Product => {
    return allProducts.find(p => p.id === id) || initialProducts.find(p => p.id === id) || initialProducts[0];
  };

  // 1. All 9 CCTV Products for Nexalus Innovations (N6)
  const cctvProducts = React.useMemo(() => {
    return allProducts.filter(p => (p.categoryId === 'cat-nexalus-cctv' || p.categoryName?.toLowerCase().includes('cctv')) && p.published !== false);
  }, [allProducts]);

  // 2. All 6 High-Speed Fiber Internet Products (N7)
  const internetProducts = React.useMemo(() => {
    return allProducts.filter(p => (p.categoryId === 'cat-nexalus-internet' || p.categoryName?.toLowerCase().includes('fiber') || p.categoryName?.toLowerCase().includes('internet')) && p.published !== false);
  }, [allProducts]);

  // 3. All 13 Enterprise Networking & Infrastructure Products (N8)
  const networkProducts = React.useMemo(() => {
    return allProducts.filter(p => (p.categoryId === 'cat-nexalus-networking' || p.categoryId === 'cat-nexalus-electronics' || p.categoryName?.toLowerCase().includes('network') || p.categoryName?.toLowerCase().includes('hardware')) && p.published !== false);
  }, [allProducts]);

  const renderInnovationsSection = (secId: string) => {
    switch (secId) {
      case 'sec-inno-hero':
        return (
          <div key="sec-inno-hero" id="sec-inno-hero">
            {/* Dynamic Multi-Slide Animated Hero Carousel */}
            <section className="relative overflow-hidden bg-slate-950 text-white pt-16 sm:pt-20 pb-20 sm:pb-24 border-b border-indigo-950 select-none min-h-[560px] sm:min-h-[620px] flex flex-col justify-center">
              {/* Animated Sliding Background Track with Smooth Cross-Fade */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {heroSlides.map((slide, index) => {
                  const isActive = index === currentSlide;
                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        isActive ? 'opacity-85 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={slide.imageUrl || '/images/tony-webster-server-room.jpg'}
                        alt={slide.title}
                        className={`w-full h-full object-cover filter brightness-90 contrast-105 transition-transform duration-7000 ease-out ${
                          isActive ? 'scale-105' : 'scale-100'
                        }`}
                      />
                    </div>
                  );
                })}
                {/* Tech Gradients and Accent Lighting */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent z-15" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 z-15" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none z-15" />
              </div>

              {/* Prev / Next Slide Controls */}
              {heroSlides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-950/60 hover:bg-indigo-600 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95 group"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-950/60 hover:bg-indigo-600 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95 group"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}

              {/* Slide Content */}
              <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl space-y-5 text-left">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 text-cyan-300 text-xs font-bold border border-indigo-700/60 shadow-sm backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse" />
                      <span>{activeSlide.badge || 'Enterprise Turnkey Engineering • Nexalus Innovations LLP'}</span>
                    </div>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                    {activeSlide.title}
                  </h1>

                  {activeSlide.subtitle && (
                    <p className="text-base sm:text-xl text-cyan-300 font-bold leading-snug">
                      {activeSlide.subtitle}
                    </p>
                  )}

                  {activeSlide.description && (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                      {activeSlide.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    {activeSlide.primaryCtaText && (
                      <Link to={activeSlide.primaryCtaLink || '/brands/nexalus-innovations/contact'}>
                        <Button
                          variant="primary"
                          size="lg"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/50 px-6 py-3 rounded-xl transition-all cursor-pointer border border-indigo-400/30"
                          icon={<ArrowRight className="w-4 h-4 text-cyan-300" />}
                        >
                          {activeSlide.primaryCtaText}
                        </Button>
                      </Link>
                    )}
                    {activeSlide.secondaryCtaText && (
                      <Link to={activeSlide.secondaryCtaLink || '/brands/nexalus-innovations/contact'}>
                        <Button
                          variant="outline-white"
                          size="lg"
                          className="border-indigo-800 hover:bg-indigo-950 text-indigo-200 hover:text-white font-semibold px-5 py-3 rounded-xl"
                          icon={<PhoneCall className="w-4 h-4 text-cyan-400" />}
                        >
                          {activeSlide.secondaryCtaText}
                        </Button>
                      </Link>
                    )}
                    <Link to="/brands/nexalus-innovations/products">
                      <Button
                        variant="outline-white"
                        size="lg"
                        className="border-slate-800 hover:bg-white/5 text-slate-300 font-semibold px-4 py-3 rounded-xl"
                      >
                        Products Catalog
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Dots / Tabs at Bottom */}
              {heroSlides.length > 1 && (
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    {heroSlides.map((slide, idx) => {
                      const isActive = idx === currentSlide;
                      return (
                        <button
                          key={slide.id || idx}
                          type="button"
                          onClick={() => setCurrentSlide(idx)}
                          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 border border-indigo-400/40'
                              : 'bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white border border-white/10'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-300 animate-pulse' : 'bg-slate-400'}`} />
                          <span className="hidden sm:inline truncate max-w-[140px]">{slide.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        );
      case 'sec-inno-sla':
        return (
          <div key="sec-inno-sla" id="sec-inno-sla">
            {/* =========================================================================
          ENGINEERING SLA METRICS BAR
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-3xl bg-white shadow-xl shadow-slate-900/5 border border-slate-200/90">
          <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">4K Ultra-HD</div>
              <p className="text-xs text-slate-500 font-medium">Starlight Color Night Vision</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">1 Gbps Speeds</div>
              <p className="text-xs text-slate-500 font-medium">Dedicated Symmetrical FTTH</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">Layer-3 Switching</div>
              <p className="text-xs text-slate-500 font-medium">370W PoE+ &amp; 10G SFP+ Uplinks</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">45-Min SLA</div>
              <p className="text-xs text-slate-500 font-medium">Rapid Field Dispatch Service</p>
            </div>
          </div>
        </div>
      </section>
          </div>
        );
      case 'sec-inno-team':
        return (
          <div key="sec-inno-team" id="sec-inno-team">
            {/* =========================================================================
          OUR TEAM - NEXALUS INNOVATIONS TECH DIVISION (DIRECTLY AFTER HERO)
          ========================================================================= */}
      {heroBanner?.showTeam !== false && (
        <OurTeamSection division="nexalus-innovations" bgClassName="bg-slate-50/50" />
      )}
          </div>
        );
      case 'sec-inno-projects':
        return (
          <div key="sec-inno-projects" id="sec-inno-projects">
            {/* FEATURED PROJECT GALLERY */}
      <ProjectGallerySection division="nexalus-innovations" />
          </div>
        );
      case 'sec-inno-cctv':
        return (
          <div key="sec-inno-cctv" id="sec-inno-cctv">
            {/* =========================================================================
          Z-TYPE ARCHITECTURE: SECTION 1 (CCTV SURVEILLANCE & SECURITY)
          ROW 1: LEFT = CCTV CARD (SLIDE IN LEFT) | RIGHT = CCTV INFO (SLIDE IN RIGHT)
          ========================================================================= */}
      <section id="section-cctv" className="w-full bg-white py-14 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Z-1 LEFT: CCTV BOX / CARD (Slide In Left animation) */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group animate-slide-left">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src="/images/real-cctv-camera.jpg"
                alt="4K Ultra-HD Network CCTV Surveillance Camera"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  CCTV Surveillance
                </span>
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                4K Ultra-HD • Sony Starvis
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      CCTV Video Surveillance
                    </h3>
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      Commercial 4K UHD • Starlight Night Vision
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Turnkey commercial video surveillance grids engineered for tech parks, logistics warehouses, and commercial establishments with Starlight night clarity and remote mobile monitoring.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>4K Ultra-HD 8MP Sony Starvis Sensors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>24/7 Starlight Full-Color Night Vision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>32x Optical Zoom PTZ Auto-Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Perimeter Tripwire &amp; Intrusion Detection</span>
                  </div>
                </div>
              </div>

              {/* READ MORE BUTTON: Expands / Toggles the {cctvProducts.length} CCTV Products below */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowCctvProducts(!showCctvProducts)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{showCctvProducts ? 'Hide CCTV Products' : `Read More & Explore CCTV Products (${cctvProducts.length} Items)`}</span>
                  {showCctvProducts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Z-1 RIGHT: CCTV INFORMATION & CAPABILITIES (Slide In Right animation) */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-9 border border-blue-900/40 shadow-xl flex flex-col justify-between space-y-6 animate-slide-right">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-blue-400/30 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-sky-400" />
                  DIVISION 01 — VIDEO SURVEILLANCE &amp; SECURITY
                </span>
                <span className="text-xs text-sky-300 font-bold">
                  {cctvProducts.length} OEM Certified Hardware Models
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Commercial CCTV Surveillance Grids &amp; Infrastructure
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Nexalus Innovations delivers turnkey design, OEM procurement, and field deployment of certified commercial video surveillance systems. From 4K Starlight bullet and fixed dome cameras to 32x optical zoom PTZ speed domes and 40TB NVR storage arrays, all installations include structured conduit piping, surge protection, and mobile monitoring apps.
              </p>

              {/* 6 Technical Specification Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-sky-400 font-extrabold uppercase">Resolution</div>
                  <div className="font-black text-white mt-0.5">4K Ultra-HD 8MP</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-sky-400 font-extrabold uppercase">Night Vision</div>
                  <div className="font-extrabold text-white mt-0.5">24/7 Starlight Color</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-sky-400 font-extrabold uppercase">PTZ Zoom</div>
                  <div className="font-extrabold text-white mt-0.5">32x Optical Auto-Track</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-sky-400 font-extrabold uppercase">Detection</div>
                  <div className="font-extrabold text-white mt-0.5">Vehicle ANPR &amp; Tripwire</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-sky-400 font-extrabold uppercase">NVR Storage</div>
                  <div className="font-extrabold text-white mt-0.5">Up to 40TB RAID</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-sky-400 font-extrabold uppercase">Protection</div>
                  <div className="font-extrabold text-white mt-0.5">IP67 Weatherproof</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsQuoteModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 font-bold"
              >
                Get CCTV Site Estimate
              </Button>
              <button
                type="button"
                onClick={() => setShowCctvProducts(true)}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Products Catalog Below</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 6 CCTV PRODUCTS GRID (Revealed by Read More Button) */}
        {showCctvProducts && (
          <div className="space-y-4 pt-2 transition-all duration-500">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-lg">
                  Curated CCTV Hardware Portfolio ({cctvProducts.length} Certified Models)
                </h4>
                <p className="text-xs text-slate-500">
                  Click any product to inspect specifications or request instant project quotation
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {cctvProducts.length} CCTV Products
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cctvProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
        </div>
      </section>
          </div>
        );
      case 'sec-inno-fiber':
        return (
          <div key="sec-inno-fiber" id="sec-inno-fiber">
            {/* =========================================================================
          Z-TYPE ARCHITECTURE: SECTION 2 (OPTICAL FIBER BROADBAND & INTERNET)
          ROW 2: LEFT = FIBER INFO (SLIDE IN LEFT) | RIGHT = FIBER CARD (SLIDE IN RIGHT)
          [REVERSED ZIGZAG ROW]
          ========================================================================= */}
      <section id="section-internet" className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-14 sm:py-20 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Z-2 LEFT: FIBER INTERNET INFORMATION (Slide In Left animation) */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-9 border border-teal-900/40 shadow-xl flex flex-col justify-between space-y-6 order-2 lg:order-1 animate-slide-left">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-teal-400" />
                  DIVISION 02 — OPTICAL FIBER BROADBAND &amp; FTTH
                </span>
                <span className="text-xs text-teal-300 font-bold">
                  {internetProducts.length} Optical Hardware &amp; Plan Models
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                High-Speed Optical Fiber Internet, Wi-Fi 6 &amp; Leased Lines
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ultra-low latency, pure optical fiber to the home (FTTH) and dedicated business leased line solutions. Equipped with cutting-edge Wi-Fi 6 GPON ONT gateways, Tri-band whole-home mesh Wi-Fi systems, and high-gain outdoor repeaters delivering seamless roaming across every square foot.
              </p>

              {/* 6 Technical Specification Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase">Wi-Fi Tech</div>
                  <div className="font-black text-white mt-0.5">Wi-Fi 6 (802.11ax)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase">Throughput</div>
                  <div className="font-extrabold text-white mt-0.5">Up to 4.8 Gbps</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase">Mesh Roaming</div>
                  <div className="font-extrabold text-white mt-0.5">6,000 Sq.Ft. Coverage</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase">WAN Port</div>
                  <div className="font-extrabold text-white mt-0.5">2.5G Multi-Gig Port</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase">Gaming &amp; Ping</div>
                  <div className="font-extrabold text-white mt-0.5">Low-Latency OFDMA</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-teal-400 font-extrabold uppercase">SLA Uptime</div>
                  <div className="font-extrabold text-white mt-0.5">99.9% Continuous SLA</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="teal"
                size="md"
                onClick={() => setIsQuoteModalOpen(true)}
                className="font-bold"
              >
                Check Fiber Plans &amp; Coverage
              </Button>
              <button
                type="button"
                onClick={() => setShowInternetProducts(true)}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Products Catalog Below</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Z-2 RIGHT: FIBER BOX / CARD (Slide In Right animation) */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group order-1 lg:order-2 animate-slide-right">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src="/images/products/mesh-wifi-v2.jpg"
                alt="High-Speed Optical Fiber Internet Gateway &amp; Mesh Wi-Fi"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  Optical Fiber Internet
                </span>
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                1 Gbps • Pure FTTH
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Symmetrical Gigabit Fiber Networks
                    </h3>
                    <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                      Low Latency • Dedicated 1:1 Bandwidth
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Dedicated high-speed fiber internet and GPON optical networking engineered for multi-user commercial sites, enterprises, and heavy data environments.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Pure Optical Fiber to the Premises (FTTH)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Wi-Fi 6 GPON Gigabit Gateway Hardware</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Whole-Premise Mesh Wi-Fi Roaming System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>99.9% Uptime Guarantee with Rapid SLA</span>
                  </div>
                </div>
              </div>

              {/* READ MORE BUTTON: Expands / Toggles the {internetProducts.length} Fiber Products below */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowInternetProducts(!showInternetProducts)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{showInternetProducts ? 'Hide Fiber Hardware' : `Read More & Explore Fiber Products (${internetProducts.length} Items)`}</span>
                  {showInternetProducts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6 OPTICAL FIBER PRODUCTS GRID (Revealed by Read More Button) */}
        {showInternetProducts && (
          <div className="space-y-4 pt-2 transition-all duration-500">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-lg">
                  Curated Optical Fiber &amp; Wi-Fi Portfolio ({internetProducts.length} Certified Models)
                </h4>
                <p className="text-xs text-slate-500">
                  Click any product to inspect specifications or request instant project quotation
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {internetProducts.length} Fiber Products
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {internetProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
        </div>
      </section>
          </div>
        );
      case 'sec-inno-networking':
        return (
          <div key="sec-inno-networking" id="sec-inno-networking">
            {/* =========================================================================
          Z-TYPE ARCHITECTURE: SECTION 3 (ENTERPRISE IT NETWORKING & SWITCHES)
          ROW 3: LEFT = NETWORK CARD (SLIDE IN LEFT) | RIGHT = NETWORK INFO (SLIDE IN RIGHT)
          ========================================================================= */}
      <section id="section-networking" className="w-full bg-white py-14 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Z-3 LEFT: NETWORKING BOX / CARD (Slide In Left animation) */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group animate-slide-left">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src="/images/rackmount-switches-real.jpg"
                alt="Enterprise Layer-2/3 Managed PoE+ Switches &amp; Server Cabinets"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  IT Networking
                </span>
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                370W PoE+ • 10G SFP+
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Enterprise Switching &amp; Server Racks
                    </h3>
                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      Layer-2/3 Managed PoE+ • 10G SFP+ Uplinks
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Turnkey IT infrastructure deployment including managed PoE+ switches, server rack cabinets, Cat6A structured cabling, and Sophos firewalls.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>24 &amp; 48-Port Layer-2/3 Gigabit Managed Switches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>370W High-Budget PoE+ Power Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Floor Standing &amp; Wall Mount Server Cabinets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Fluke-Tested Pure Bare Copper Cat6A Drops</span>
                  </div>
                </div>
              </div>

              {/* READ MORE BUTTON: Expands / Toggles the {networkProducts.length} Network Products below */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowNetworkProducts(!showNetworkProducts)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{showNetworkProducts ? 'Hide Network Hardware' : `Read More & Explore Network Products (${networkProducts.length} Items)`}</span>
                  {showNetworkProducts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Z-3 RIGHT: NETWORKING INFORMATION & CAPABILITIES (Slide In Right animation) */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-9 border border-indigo-900/40 shadow-xl flex flex-col justify-between space-y-6 animate-slide-right">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                  <Server className="w-3 h-3 text-indigo-400" />
                  DIVISION 03 — IT NETWORKING &amp; INFRASTRUCTURE
                </span>
                <span className="text-xs text-indigo-300 font-bold">
                  {networkProducts.length} Enterprise Hardware Models
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Enterprise Campus Switching, Cyber Security &amp; Server Racks
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Enterprise campus switching infrastructure with 24-port and 48-port Layer-2/3 Managed PoE+ switches, Sophos next-gen hardware firewalls, heavy-duty 24U server rack cabinets, 100% solid bare copper Cat6A drums, and optical fiber LIU patch panels for rock-solid network uptime.
              </p>

              {/* 6 Technical Specification Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-indigo-400 font-extrabold uppercase">PoE+ Power</div>
                  <div className="font-black text-white mt-0.5">370W High-Budget</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Optical Uplink</div>
                  <div className="font-extrabold text-white mt-0.5">4 × 10G SFP+ Ports</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Cyber Security</div>
                  <div className="font-extrabold text-white mt-0.5">Sophos XGS Firewall</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Server Rack</div>
                  <div className="font-extrabold text-white mt-0.5">24U Floor Standing</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Cable Spec</div>
                  <div className="font-extrabold text-white mt-0.5">10Gbps Pure Copper</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Certification</div>
                  <div className="font-extrabold text-white mt-0.5">Fluke Channel Tested</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsQuoteModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold"
              >
                Request BoQ Proposal
              </Button>
              <button
                type="button"
                onClick={() => setShowNetworkProducts(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Products Catalog Below</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 6 NETWORKING PRODUCTS GRID (Revealed by Read More Button) */}
        {showNetworkProducts && (
          <div className="space-y-4 pt-2 transition-all duration-500">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-lg">
                  Curated Networking &amp; Switching Portfolio ({networkProducts.length} Certified Models)
                </h4>
                <p className="text-xs text-slate-500">
                  Click any product to inspect specifications or request instant project quotation
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {networkProducts.length} Network Products
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {networkProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
        </div>
      </section>
          </div>
        );
      case 'sec-inno-contact':
        return (
          <div key="sec-inno-contact" id="sec-inno-contact">
            {/* =========================================================================
          SECTION 4: TECHNICAL OPERATIONS & SITE SURVEY DESK (DEEP MIDNIGHT BLUE)
          ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider border border-blue-400/30">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Onsite Technical Site Survey</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Need a Certified Site Survey or Customized BOQ Estimation?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Operating under <strong className="text-white">Nexalus Innovations LLP</strong>, our certified network engineers conduct comprehensive on-premise surveys for CCTV camera placements, optical fiber runs, and server rack installations across Sangli, Ratnagiri, Mumbai, and surrounding regional zones in Maharashtra.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>GST Invoicing, Official OEM Partner Warranty &amp; Fast Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Onsite Technical Site Survey &amp; BoQ Precision Estimation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Fluke Tested Channel Certification for All Structured Cabling Runs</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsQuoteModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
                icon={<Sparkles className="w-4 h-4 text-cyan-300" />}
              >
                Inquire With Nexalus Desk
              </Button>
              <Link to="/brands/nexalus-innovations/contact">
                <Button
                  variant="outline-white"
                  size="md"
                  className="border-indigo-800 hover:bg-indigo-950 text-cyan-300 font-semibold"
                  icon={<PhoneCall className="w-4 h-4" />}
                >
                  Contact Engineering Hub
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <img
                src="/images/cctv-control-room.jpg"
                alt="Nexalus Innovations Security Operations &amp; Control Room"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full space-y-16 sm:space-y-24 pb-20">
      {innoSections.map(sec => {
        if (sec.visible === false) return null;
        return (
          <div key={sec.id} id={sec.id} className="w-full relative scroll-mt-24">
            {sec.id === 'sec-inno-hero' && <span id="hero" className="block -mt-24 pt-24 invisible pointer-events-none" />}
            {sec.id === 'sec-inno-sla' && <span id="sla" className="block -mt-24 pt-24 invisible pointer-events-none" />}
            {sec.id === 'sec-inno-team' && <span id="team" className="block -mt-24 pt-24 invisible pointer-events-none" />}
            {sec.id === 'sec-inno-projects' && <span id="projects" className="block -mt-24 pt-24 invisible pointer-events-none" />}
            {sec.id === 'sec-inno-cctv' && (
              <>
                <span id="cctv" className="block -mt-24 pt-24 invisible pointer-events-none" />
                <span id="section-cctv" className="block -mt-24 pt-24 invisible pointer-events-none" />
              </>
            )}
            {sec.id === 'sec-inno-fiber' && (
              <>
                <span id="fiber" className="block -mt-24 pt-24 invisible pointer-events-none" />
                <span id="internet" className="block -mt-24 pt-24 invisible pointer-events-none" />
                <span id="section-internet" className="block -mt-24 pt-24 invisible pointer-events-none" />
              </>
            )}
            {sec.id === 'sec-inno-networking' && (
              <>
                <span id="networking" className="block -mt-24 pt-24 invisible pointer-events-none" />
                <span id="section-networking" className="block -mt-24 pt-24 invisible pointer-events-none" />
              </>
            )}
            {sec.id === 'sec-inno-contact' && <span id="contact" className="block -mt-24 pt-24 invisible pointer-events-none" />}
            {renderInnovationsSection(sec.id)}
          </div>
        );
      })}
      
      {/* Dynamic Custom Sections configured via admin */}
      <CustomSectionsRenderer sections={heroBanner?.customSections} brandId="nexalus-innovations" />

      {/* Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        brandId="nexalus-innovations"
      />
    </div>
  );
};

