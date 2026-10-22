import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Droplets,
  IceCream,
  Milk,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Award,
  Building2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { OurTeamSection } from '../../../components/common/OurTeamSection';
import { ProjectGallerySection } from '../../../components/common/ProjectGallerySection';
import { AreasCoveredSection } from '../../../components/common/AreasCoveredSection';
import { subscribeToBanners, getProducts, getCachedProducts } from '../../../firebase/services';
import { SiteBanner, Product } from '../../../types';
import { QuoteModal } from '../../../components/common/QuoteModal';
import { ProductCard } from '../../../components/brand/ProductCard';
import { initialProducts } from '../../../data/initialData';

export const AmDistributorsPage: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [heroBanner, setHeroBanner] = useState<SiteBanner | null>(() => {
    try {
      const saved = localStorage.getItem('nexalus_site_banners');
      if (saved) {
        const list: SiteBanner[] = JSON.parse(saved);
        const found = list.find(b => b.id === 'ban-am' || b.brandId === 'am-distributors');
        if (found) return found;
      }
    } catch {}
    return null;
  });
  const [divisionProducts, setDivisionProducts] = useState<Product[]>(() =>
    getCachedProducts('am-distributors')
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const unsub = subscribeToBanners((banners) => {
      const b = banners.find(ban => ban.id === 'ban-am' || ban.brandId === 'am-distributors');
      if (b) setHeroBanner(b);
    }, 'am-distributors');

    const refreshData = () => {
      const cached = getCachedProducts('am-distributors');
      if (cached && cached.length > 0) {
        setDivisionProducts(cached);
      }
      getProducts('am-distributors', true).then(prods => {
        if (prods && prods.length > 0) {
          setDivisionProducts(prods);
        }
      }).catch(err => {
        console.warn('Could not fetch A.M. products from Firestore:', err);
      });
    };

    refreshData();

    window.addEventListener('nexalus_data_update', refreshData);
    window.addEventListener('focus', refreshData);
    document.addEventListener('visibilitychange', refreshData);

    return () => {
      unsub();
      window.removeEventListener('nexalus_data_update', refreshData);
      window.removeEventListener('focus', refreshData);
      document.removeEventListener('visibilitychange', refreshData);
    };
  }, []);

  // Dynamically build 4 rich, coordinated slides using uploaded product imagery & matching tailored copy
  const heroSlides = useMemo(() => {
    const waterProd = divisionProducts.find(p => p.categoryId?.includes('water') || p.id === 'prod-am-1');
    const icecreamProd = divisionProducts.find(p => p.categoryId?.includes('icecream') || p.id === 'prod-am-2');
    const milkProd = divisionProducts.find(p => p.categoryId?.includes('dairy') || p.id === 'prod-am-3');
    const butterProd = divisionProducts.find(p => p.id === 'prod-am-4');

    const waterImg = waterProd?.images?.[0] || '/images/products/am-water-jar-20l.jpg';
    const icecreamImg = icecreamProd?.images?.[0] || '/images/products/am-icecream-tub.jpg';
    const dairyImg = milkProd?.images?.[0] || butterProd?.images?.[0] || '/images/products/am-fresh-milk-dairy.jpg';
    const hubImg = '/images/projects/real-warehouse-distribution.jpg';

    return [
      {
        id: 'overview',
        image: hubImg,
        badge: 'Chiplun Regional Cold-Chain & Commercial Wholesale Logistics',
        title: heroBanner?.title || 'A.M. Distributors Chiplun',
        subtitle: 'Packaged Mineral Water • Ice Cream Distributor • Milk, Butter & All Dairy Products',
        description:
          heroBanner?.subtitle ||
          'The dedicated regional cold-chain and commercial distribution hub for Chiplun and the Konkan region. Operating under Nexalus Innovations LLP, we manage temperature-controlled refrigerated logistics for packaged mineral water, commercial ice creams, farm-fresh milk, butter, and complete dairy supplies.',
        primaryCta: 'Order Wholesale / Distribution Supply',
        secondaryCta: 'Contact Chiplun Depot',
        badgeTheme: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
        gradientText: 'from-emerald-300 via-teal-200 to-cyan-300',
        tabLabel: 'Depot Overview'
      },
      {
        id: 'mineral-water',
        image: waterImg,
        badge: 'Ozone-Treated & Automated Steam-Sanitized Jars',
        title: 'Packaged Mineral Water Supply',
        subtitle: '20-Litre Hermetic Sealed Dispensers & 500ml / 1L Bottled Water Cases',
        description:
          'Pure, laboratory-tested natural mineral water for corporate campuses, hotels, factories, and residences across Chiplun, Khed, and Guhagar. Tamper-evident hermetic sealing with daily punctual doorstep replenishment routes.',
        primaryCta: 'Book Water Route Subscription',
        secondaryCta: 'View Mineral Water Specs',
        badgeTheme: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300',
        gradientText: 'from-cyan-300 via-teal-200 to-sky-300',
        tabLabel: 'Mineral Water'
      },
      {
        id: 'ice-cream',
        image: icecreamImg,
        badge: 'Certified -18°C Deep-Freeze Transport Fleet',
        title: 'Commercial Bulk Ice Cream Tubs',
        subtitle: 'Amul, Vadilal & Regional Gourmet Assortments for Parlors & Banquets',
        description:
          'Unbroken sub-zero cold-chain transport for banquet halls, luxury hotels, restaurants, and retail parlors across Chiplun and the Konkan belt. Temperature-monitored reefer vans ensuring zero melting and crystal-free gourmet texture.',
        primaryCta: 'Inquire Ice Cream Wholesale',
        secondaryCta: 'Explore Flavor Portfolio',
        badgeTheme: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
        gradientText: 'from-amber-300 via-orange-200 to-teal-300',
        tabLabel: 'Ice Creams'
      },
      {
        id: 'dairy-milk',
        image: dairyImg,
        badge: 'Daily 4:00 AM Direct Farm Sourcing',
        title: 'Farm-Fresh Milk & Pure Dairy',
        subtitle: 'Standardized 4.5% Fat Milk, Pure Cow Ghee & Table Butter Blocks',
        description:
          'Nutrient-rich, lab-tested standardized milk chilled within two hours of milking. Delivering morning freshness to dairy counters, groceries, hospitals, and bakeries with unbroken morning cold-chains.',
        primaryCta: 'Join Morning Milk Route',
        secondaryCta: 'Dairy Price Breakdown',
        badgeTheme: 'bg-teal-950/70 border-teal-500/40 text-teal-300',
        gradientText: 'from-emerald-300 via-teal-200 to-amber-200',
        tabLabel: 'Milk & Dairy'
      }
    ];
  }, [divisionProducts, heroBanner]);

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
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO BANNER WITH SLIDING PRODUCT IMAGES, DYNAMIC CONTENT & FADE OVERLAY */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-28 border-b border-slate-800 select-none min-h-[580px] sm:min-h-[640px] flex flex-col justify-center">
        {/* Animated Sliding Background Track with Smooth Cross-Fade */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {heroSlides.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-80 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`w-full h-full object-cover filter brightness-95 contrast-105 transition-transform duration-7000 ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />
              </div>
            );
          })}

          {/* Fade Overlay Gradient: Soft dark vignette ensuring vivid image colors while text remains razor sharp */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/45 backdrop-blur-[0.5px] z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(2,6,23,0.85)_100%)] z-10" />
        </div>

        {/* Previous / Next Arrow Controls (Desktop) */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="hidden lg:flex absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-slate-950/60 hover:bg-slate-900/90 text-slate-300 hover:text-white border border-teal-500/30 backdrop-blur-md items-center justify-center transition-all hover:scale-105 shadow-lg group cursor-pointer"
              title="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={handleNextSlide}
              className="hidden lg:flex absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-slate-950/60 hover:bg-slate-900/90 text-slate-300 hover:text-white border border-teal-500/30 backdrop-blur-md items-center justify-center transition-all hover:scale-105 shadow-lg group cursor-pointer"
              title="Next slide"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        {/* Dynamic Foreground Content with Staggered Slide Animations */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl py-6">
          <div key={currentSlide} className="space-y-6">
            {/* Top Badges */}
            <div className="animate-hero-down flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-teal-200 hover:text-white font-bold text-xs sm:text-sm border border-teal-500/40 shadow-xs transition-all group backdrop-blur-md"
              >
                <ArrowLeft className="w-4 h-4 text-teal-400 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Main Website (Nexalus Innovations LLP)</span>
              </Link>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all shadow-xs ${activeSlide.badgeTheme}`}>
                <span className="w-2 h-2 rounded-full bg-teal-400 inline-block animate-pulse" />
                <span>{activeSlide.badge}</span>
              </div>
            </div>

            {/* Main Slide Title */}
            <h1 className="animate-hero-up text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              {activeSlide.title}
            </h1>

            {/* Tailored Subtitle with Gradient Text Shimmer */}
            <p className={`animate-hero-up text-base sm:text-xl font-bold bg-gradient-to-r ${activeSlide.gradientText} bg-clip-text text-transparent [animation-delay:120ms]`}>
              {activeSlide.subtitle}
            </p>

            {/* Description Paragraph */}
            <p className="animate-hero-up text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed [animation-delay:220ms]">
              {activeSlide.description}
            </p>

            {/* CTA Buttons */}
            <div className="animate-hero-up flex flex-wrap items-center justify-center gap-4 pt-2 [animation-delay:320ms]">
              <Button
                variant="teal"
                size="lg"
                onClick={() => setIsQuoteModalOpen(true)}
                icon={<ArrowRight className="w-4 h-4" />}
                className="shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 font-bold transition-all hover:scale-[1.02]"
              >
                {activeSlide.primaryCta}
              </Button>
              <Link to="/contact">
                <Button variant="outline-white" size="lg" className="backdrop-blur-sm hover:bg-white/10 font-bold">
                  {activeSlide.secondaryCta}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Bottom Slide Navigation Tabs */}
        {heroSlides.length > 1 && (
          <div className="relative z-10 pt-8 flex flex-col items-center justify-center gap-2.5 px-4">
            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-teal-500/30 shadow-xl">
              {heroSlides.map((slide, dotIdx) => {
                const isActive = dotIdx === currentSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(dotIdx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-200 border border-teal-400/50 shadow-inner'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-teal-400 scale-125' : 'bg-slate-600'}`} />
                    <span>{slide.tabLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* OUR TEAM - A.M. DISTRIBUTORS CHIPLUN (DIRECTLY AFTER HERO) */}
      {heroBanner?.showTeam !== false && (
        <OurTeamSection division="am-distributors" bgClassName="bg-slate-50/50" />
      )}

      {/* PROJECT GALLERY */}
      <ProjectGallerySection division="am-distributors" />

      {/* 2. CORE BUSINESS VERTICALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest">
            Distribution Verticals
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            4 Core Pillars of A.M. Distributors Chiplun
          </h2>
          <p className="text-sm text-slate-600">
            Dedicated logistics operations delivering daily across Chiplun, Khed, Guhagar, and the Konkan industrial corridor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vertical 1: Packaged Mineral Water */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Packaged Mineral Water</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Purified mineral water in heavy-duty 20-litre hermetic dispenser jars and retail bottle crates with automated steam sanitization.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                20-Litre Hermetic Dispenser Jars
              </li>
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                500ml &amp; 1L Crates Available
              </li>
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Daily Doorstep Office &amp; Home Delivery
              </li>
            </ul>
          </div>

          {/* Vertical 2: Ice Cream Distributor */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <IceCream className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Ice Cream Distributor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Certified -18°C refrigerated reefer delivery vans supplying retail freezer display cabinets, hotels, banquet halls, and restaurants.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                -18°C Insulated Refrigerated Vans
              </li>
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                Bulk 5L Tubs, Premium Cones &amp; Bars
              </li>
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                Strict Cold-Chain Temperature Log
              </li>
            </ul>
          </div>

          {/* Vertical 3: Farm-Fresh Milk */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Milk className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pasteurized Milk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lab-tested pasteurized fresh cow and buffalo milk pouches distributed in crates during early morning 4:00 AM dispatch routes.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                Daily Early Morning 4:00 AM Dispatch
              </li>
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                Standardized Fat 4.5%, SNF 8.5%
              </li>
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                Dairy Outlets &amp; Institutional Supply
              </li>
            </ul>
          </div>

          {/* Vertical 4: Butter & All Dairy */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Butter &amp; All Dairy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pure table butter, desi cow ghee, paneer, and processed cheese blocks for bakeries, institutional caterers, and supermarkets.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Salted Table Butter (100g, 500g)
              </li>
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                1kg &amp; 2.5kg Cheese Blocks
              </li>
              <li className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                100% FSSAI Certified Genuine Dairy
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. DIVISION PRODUCTS CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-600 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Chiplun Depot Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              A.M. Distributors Products &amp; Supplies
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Mineral water, commercial ice creams, pasteurized milk, and butter products.
            </p>
          </div>
          <Button
            variant="teal"
            size="sm"
            onClick={() => setIsQuoteModalOpen(true)}
          >
            Place Wholesale Order
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {divisionProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>



      {/* 4. FACILITY & OPERATIONS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-extrabold text-teal-400 uppercase tracking-widest">
              Chiplun Regional Logistics Depot
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cold-Room Storage &amp; Temperature-Controlled Fleet
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Operating directly from Chiplun, Maharashtra, A.M. Distributors bridges farmers, dairies, and ice cream manufacturers with local retail and hospitality networks. Our refrigerated fleet ensures unbroken cold-chains from depot to delivery.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Chiplun Cold-Room Storage Maintained at Sub-Zero Temperatures</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Daily Punctual 4:00 AM Morning Milk Route Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Automated Steam Cleaning Cycle for 20-Litre Water Jars</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="teal"
                size="md"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Inquire With Chiplun Logistics Desk
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
              <img
                src="/images/projects/real-warehouse-distribution.jpg"
                alt="A.M. Distributors Chiplun Logistics Depot"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AREAS COVERED & SERVICE AVAILABILITY CHECKER */}
      <AreasCoveredSection division="am-distributors" />

      {/* Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        brandId="am-distributors"
      />
    </div>
  );
};
