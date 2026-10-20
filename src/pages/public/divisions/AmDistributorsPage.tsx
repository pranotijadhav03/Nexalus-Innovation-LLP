import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Droplets,
  IceCream,
  Milk,
  ArrowRight,
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
import { QuoteModal } from '../../../components/common/QuoteModal';
import { BlurZoomReveal } from '../../../components/common/BlurZoomReveal';
import { ProductCard } from '../../../components/brand/ProductCard';
import { OurTeamSection } from '../../../components/common/OurTeamSection';
import { initialProducts } from '../../../data/initialData';

export const AmDistributorsPage: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Products belonging to A.M. Distributors Chiplun
  const divisionProducts = initialProducts.filter(
    p => p.brandId === 'am-distributors'
  );

  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO BANNER (TEAL / DARK SLATE THEME) */}
      <section className="relative w-full overflow-hidden bg-slate-950 text-white pt-20 pb-24 border-b border-teal-900/40">
        <div className="absolute inset-0">
          <img
            src="/images/projects/real-warehouse-distribution.jpg"
            alt="A.M. Distributors Chiplun Regional Logistics Hub"
            className="w-full h-full object-cover opacity-35 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-700/50 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block animate-pulse" />
              <span>Operating Company — Nexalus Innovations LLP</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            A.M. Distributors Chiplun
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
      </section>

      {/* =========================================================================
          OUR TEAM SECTION (A.M. DISTRIBUTORS CHIPLUN DEPOT DIVISION)
          Directly below Hero fold with pure white background
          ========================================================================= */}
      <OurTeamSection division="am-distributors" bgClassName="bg-white" />

      {/* =========================================================================
          SECTION 3: CORE BUSINESS VERTICALS (SOFT TEAL THEME)
          ========================================================================= */}
      <section className="w-full bg-teal-50/70 py-16 sm:py-24 border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlurZoomReveal delay={0} yOffset={15} blur={8}>
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
          </BlurZoomReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vertical 1: Packaged Mineral Water */}
          <BlurZoomReveal delay={0} blur={10} scale={0.93} yOffset={24}>
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-teal-500/20 hover:border-teal-400 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 space-y-4 relative overflow-hidden group h-full flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100/80 shadow-xs group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                  <Droplets className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-950 transition-colors">Packaged Mineral Water</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Purified mineral water in heavy-duty 20-litre hermetic dispenser jars and retail bottle crates with automated steam sanitization.
                </p>
              </div>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
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
          </BlurZoomReveal>

          {/* Vertical 2: Ice Cream Distributor */}
          <BlurZoomReveal delay={120} blur={10} scale={0.93} yOffset={24}>
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-rose-500/20 hover:border-rose-400 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 space-y-4 relative overflow-hidden group h-full flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-400 to-rose-400" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/80 shadow-xs group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                  <IceCream className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-950 transition-colors">Ice Cream Distributor</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Certified -18°C refrigerated reefer delivery vans supplying retail freezer display cabinets, hotels, banquet halls, and restaurants.
                </p>
              </div>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
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
          </BlurZoomReveal>

          {/* Vertical 3: Farm-Fresh Milk */}
          <BlurZoomReveal delay={240} blur={10} scale={0.93} yOffset={24}>
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-sky-500/20 hover:border-sky-400 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 space-y-4 relative overflow-hidden group h-full flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-sky-400 to-blue-400" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100/80 shadow-xs group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                  <Milk className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-950 transition-colors">Pasteurized Milk</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lab-tested pasteurized fresh cow and buffalo milk pouches distributed in crates during early morning 4:00 AM dispatch routes.
                </p>
              </div>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
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
          </BlurZoomReveal>

          {/* Vertical 4: Butter & All Dairy */}
          <BlurZoomReveal delay={360} blur={10} scale={0.93} yOffset={24}>
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-400 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 space-y-4 relative overflow-hidden group h-full flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80 shadow-xs group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-950 transition-colors">Butter &amp; All Dairy</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pure table butter, desi cow ghee, paneer, and processed cheese blocks for bakeries, institutional caterers, and supermarkets.
                </p>
              </div>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
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
          </BlurZoomReveal>
        </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: DIVISION PRODUCTS CATALOG (CLEAN WHITE THEME)
          ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {divisionProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FACILITY & OPERATIONS SPOTLIGHT (TEAL / DARK SLATE THEME)
          ========================================================================= */}
      <section className="w-full bg-slate-900 py-16 sm:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/70 text-white border border-teal-800/40 shadow-2xl shadow-teal-950/50 hover:shadow-teal-500/10 hover:border-teal-600/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400" />
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
                  className="shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 transition-all"
                >
                  Inquire With Chiplun Logistics Desk
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group-hover:shadow-teal-500/20 transition-all duration-300">
                <img
                  src="/images/projects/real-warehouse-distribution.jpg"
                  alt="A.M. Distributors Chiplun Logistics Depot"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        brandId="am-distributors"
      />
    </div>
  );
};
