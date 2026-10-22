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
  ShieldCheck
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

  // Collect uploaded product images dynamically for the hero sliding background
  const heroSlides = useMemo(() => {
    const list: { image: string; title: string; category?: string }[] = [];

    divisionProducts.forEach(prod => {
      if (prod.images && prod.images.length > 0) {
        prod.images.forEach(img => {
          if (img && !list.some(s => s.image === img)) {
            list.push({
              image: img,
              title: prod.name,
              category: prod.categoryId
            });
          }
        });
      }
    });

    // Fallbacks if no products exist yet
    if (list.length === 0) {
      return [
        { image: '/images/products/am-water-jar-20l.jpg', title: '20L Packaged Mineral Water Jars' },
        { image: '/images/products/am-icecream-tub.jpg', title: 'Commercial Bulk Ice Cream Tubs' },
        { image: '/images/products/am-fresh-milk-dairy.jpg', title: 'Daily 4:00 AM Farm-Fresh Milk' },
        { image: '/images/products/am-butter-block.jpg', title: 'Pure Butter & Catering Tins' },
        { image: '/images/projects/real-warehouse-distribution.jpg', title: 'Chiplun Regional Cold-Chain Logistics Hub' }
      ];
    }

    return list;
  }, [divisionProducts]);

  // Automatic slide rotation every 4.5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO BANNER WITH SLIDING PRODUCT IMAGES & GENTLE FADE OVERLAY */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-28 border-b border-slate-800 select-none">
        {/* Animated Sliding Background Track */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroSlides.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.image + index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                  isActive
                    ? 'opacity-80 scale-100 translate-x-0'
                    : index < currentSlide
                    ? 'opacity-0 scale-105 -translate-x-12 pointer-events-none'
                    : 'opacity-0 scale-105 translate-x-12 pointer-events-none'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover filter brightness-95 contrast-105"
                />
              </div>
            );
          })}

          {/* Fade Overlay Gradient: Soft dark vignette ensuring vivid image colors while text remains crisp */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/45 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(2,6,23,0.85)_100%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-teal-200 hover:text-white font-bold text-xs sm:text-sm border border-teal-500/40 shadow-xs transition-all group backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Main Website (Nexalus Innovations LLP)</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/50 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block animate-pulse" />
              <span>Operating Company — Nexalus Innovations LLP</span>
            </div>
            {heroBanner?.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold border border-teal-400/40 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <span>{heroBanner.badge}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {heroBanner?.title || 'A.M. Distributors Chiplun'}
          </h1>

          <p className="text-base sm:text-xl text-teal-200 font-medium">
            Packaged Mineral Water • Ice Cream Distributor • Milk, Butter &amp; All Dairy Products
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            The dedicated regional cold-chain and commercial distribution hub for Chiplun and the Konkan region. Operating under Nexalus Innovations LLP, we manage temperature-controlled refrigerated logistics for packaged mineral water, commercial ice creams, farm-fresh milk, butter, and complete dairy supplies.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="teal"
              size="lg"
              onClick={() => setIsQuoteModalOpen(true)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Order Wholesale / Distribution Supply
            </Button>
            <Link to="/contact">
              <Button variant="outline-white" size="lg">
                Contact Chiplun Depot
              </Button>
            </Link>
          </div>
        </div>

        {/* Slide Indicator Dots & Current Product Badge */}
        {heroSlides.length > 1 && (
          <div className="relative z-10 pt-8 flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
            <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-teal-500/30 shadow-md">
              <span className="text-[11px] font-bold text-teal-300">
                Featured: {heroSlides[currentSlide]?.title}
              </span>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                {heroSlides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentSlide(dotIdx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dotIdx === currentSlide
                        ? 'w-6 bg-teal-400'
                        : 'w-2 bg-slate-600 hover:bg-slate-400'
                    }`}
                    title={`Slide to product ${dotIdx + 1}`}
                  />
                ))}
              </div>
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
