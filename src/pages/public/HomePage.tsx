import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  ArrowRight,
  Award,
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building2,
  Sparkles,
  Warehouse,
  Check,
  Lock,
  Layers,
  Cpu,
  Truck,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { QuoteModal } from '../../components/common/QuoteModal';
import { ProductCard } from '../../components/brand/ProductCard';
import { ServiceCard } from '../../components/brand/ServiceCard';
import { getProducts, getServices } from '../../firebase/services';
import { initialProducts } from '../../data/initialData';
import { Product, Service } from '../../types';

// Curated 18 core technology products: 6 CCTV, 6 Internet, 6 Networking
const CURATED_CATALOG_IDS = {
  cctv: ['prod-cp-1', 'prod-cp-2', 'prod-cp-5', 'prod-cp-3', 'prod-cp-4', 'prod-cp-6'],
  internet: ['prod-ob-1', 'prod-ob-2', 'prod-ob-6', 'prod-ob-3', 'prod-ob-4', 'prod-ob-5'],
  network: ['prod-itti-6', 'prod-itti-1', 'prod-itti-2', 'prod-itti-4', 'prod-itti-5', 'prod-itti-3']
};

export const HomePage: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'cctv' | 'internet' | 'network'>('all');
  const [showCctvProducts, setShowCctvProducts] = useState(true);
  const [showInternetProducts, setShowInternetProducts] = useState(true);
  const [showNetworkProducts, setShowNetworkProducts] = useState(true);
  const [activeSector, setActiveSector] = useState<'corporate' | 'logistics' | 'residential' | 'banking'>('corporate');
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [products, services] = await Promise.all([
          getProducts(undefined, true),
          getServices(undefined, true)
        ]);

        // Use loaded products or fallback to initialProducts
        setAllProducts(products.length > 0 ? products : initialProducts);
        setFeaturedServices(services.filter(s => s.featured).slice(0, 3));
      } catch (err) {
        console.error('Error loading homepage content:', err);
        setAllProducts(initialProducts);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    // Listen for local updates from admin panel
    const handleUpdate = () => loadData();
    window.addEventListener('nexalus_data_update', handleUpdate);
    return () => window.removeEventListener('nexalus_data_update', handleUpdate);
  }, []);

  // Helper to find curated product by ID
  const getProductById = (id: string): Product => {
    const found = allProducts.find(p => p.id === id);
    if (found) return found;
    const initial = initialProducts.find(p => p.id === id);
    return initial || allProducts[0];
  };

  // 3 CCTV items
  const cctvProducts = CURATED_CATALOG_IDS.cctv.map(getProductById).filter(Boolean);
  // 3 Internet items
  const internetProducts = CURATED_CATALOG_IDS.internet.map(getProductById).filter(Boolean);
  // 3 Network items
  const networkProducts = CURATED_CATALOG_IDS.network.map(getProductById).filter(Boolean);

  // Active products in the Live Catalog based on selected filter (Total 9 items)
  const displayedCatalogProducts = (() => {
    switch (catalogFilter) {
      case 'cctv':
        return cctvProducts;
      case 'internet':
        return internetProducts;
      case 'network':
        return networkProducts;
      case 'all':
      default:
        return [...cctvProducts, ...internetProducts, ...networkProducts];
    }
  })();

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO FULL-WIDTH EDGE-TO-EDGE BANNER (PROFESSIONAL CORPORATE STYLING) */}
      <section className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800">
        {/* Photographic background image showcasing the authentic enterprise server rack on the right */}
        <div className="absolute inset-0">
          <img
            src="/images/nexalus-rack-hero-bg.jpg"
            alt="Nexalus Innovations LLP Enterprise Server Rack, Optical Fiber & AI CCTV Surveillance Infrastructure"
            className="w-full h-full object-cover object-[75%_center] lg:object-[82%_center]"
          />
        </div>

        {/* Clean directional contrast scrim from left to right for optimal typography readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/98 via-slate-950/85 via-45% md:via-40% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Content strictly positioned on the left side, leaving right side clear for high-res hardware */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 flex items-center min-h-[520px] lg:min-h-[620px]">
          <div className="max-w-2xl space-y-5 text-white mr-auto">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-sky-400 text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-xs shadow-emerald-400/50" />
              <span>Operating Company — Nexalus Innovations LLP</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.12] text-white">
              Nexalus Innovations LLP
            </h1>

            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-300 tracking-tight leading-snug">
              Internet, Network &amp; CCTV Services
            </p>

            <p className="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed font-normal max-w-xl pt-1">
              Your trusted technology infrastructure partner for Sangli, Kolhapur and Western Maharashtra. Operating under <strong className="text-white font-bold">Nexalus Innovations LLP</strong>, we engineer ultra-fast <strong className="text-white font-bold">gigabit optical fiber</strong> leased lines, managed Layer-2/3 network switching, and certified AI-powered <strong className="text-white font-bold">video surveillance</strong> systems to empower local businesses.
            </p>

            {/* CTA Action Buttons matching visual design */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-950/50 px-6 py-3.5 rounded-xl transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
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

      {/* 2. DEDICATED OPERATING SUBSIDIARIES & WEBSITES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Operating Entities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Two Operating Companies
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Under <strong>Nexalus Innovations LLP</strong>, we operate two distinct, independent commercial businesses with dedicated websites, specialized teams, and comprehensive regional distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Nexalus Innovations */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-blue-300 transition-all duration-300">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src="/images/nexalus-facility-cctv-network.jpg"
                alt="Nexalus Innovations Commercial Technology Facility"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
                  Technology &amp; Electronics
                </span>
              </div>
            </div>

            <div className="p-8 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Nexalus Innovations</h3>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      CCTV • Optical Fiber Internet • Enterprise IT Networking
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The dedicated technical arm delivering commercial 4K AI CCTV surveillance grids, symmetrical optical fiber leased lines, Layer-2/3 managed PoE+ switching, server rack cabling, and certified AMC maintenance.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>4K AI Surveillance Cameras</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Gigabit Optical Fiber Routers</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Managed PoE+ Gigabit Switches</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Preventive AMC Maintenance</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <Link to="/brands/nexalus-innovations" className="w-full sm:w-auto">
                  <Button variant="primary" size="md" className="w-full sm:w-auto font-bold shadow-md" icon={<ArrowRight className="w-4 h-4" />}>
                    Visit
                  </Button>
                </Link>
                <Link to="/brands/nexalus-innovations/products" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                  View Hardware Catalog →
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: A.M. Distributors Chiplun */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-teal-300 transition-all duration-300">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src="/images/projects/am-distributors-chiplun.jpg"
                alt="A.M. Distributors Chiplun Regional Logistics Hub"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold shadow-md">
                  Cold-Chain &amp; Logistics
                </span>
              </div>
            </div>

            <div className="p-8 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">A.M. Distributors Chiplun</h3>
                    <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                      Mineral Water • Commercial Ice Cream • Dairy Supply
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Operating directly from Chiplun, Maharashtra with cold-room storage and refrigerated fleet logistics. Daily scheduled 4:00 AM morning wholesale routes across Chiplun, Khed, and the Konkan belt.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>20-Litre Mineral Water Cans</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>-18°C Ice Cream Reefer Fleet</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Farm-Fresh Milk Crates Daily</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>FSSAI Compliant Depot Storage</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <Link to="/brands/am-distributors" className="w-full sm:w-auto">
                  <Button variant="teal" size="md" className="w-full sm:w-auto font-bold shadow-md" icon={<ArrowRight className="w-4 h-4" />}>
                    Visit
                  </Button>
                </Link>
                <Link to="/brands/am-distributors/contact" className="text-xs font-bold text-teal-600 hover:text-teal-800">
                  Inquire Depot Wholesale →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE CATALOG: 18 CERTIFIED PRODUCTS (6 CCTV, 6 INTERNET, 6 NETWORKING) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Live Technology Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              CCTV, Fiber Internet &amp; Enterprise Networking
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore 18 certified enterprise technology solutions across AI surveillance, optical fiber connectivity, and managed networking.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0"
          >
            View Complete Catalog ({allProducts.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Catalog Category Switcher Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCatalogFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              catalogFilter === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Solutions (18 Items)
          </button>
          <button
            onClick={() => setCatalogFilter('cctv')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              catalogFilter === 'cctv'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            CCTV Surveillance (6 Items)
          </button>
          <button
            onClick={() => setCatalogFilter('internet')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              catalogFilter === 'internet'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-teal-400" />
            Fiber Internet (6 Items)
          </button>
          <button
            onClick={() => setCatalogFilter('network')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              catalogFilter === 'network'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            Enterprise Networking (6 Items)
          </button>
        </div>

        {/* =========================================================================
            Z-TYPE ARCHITECTURE: SECTION 1 (CCTV SURVEILLANCE)
            ROW 1: LEFT = CCTV BOX (WITH READ MORE BUTTON) | RIGHT = CCTV INFORMATION
            ========================================================================= */}
        {(catalogFilter === 'all' || catalogFilter === 'cctv') && (
          <div id="section-cctv" className="space-y-8 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Z-1 LEFT: CCTV BOX / CARD (Styled like the subsidiary card with Read More button) */}
              <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                <div className="relative h-60 overflow-hidden bg-slate-100">
                  <img
                    src="/images/products/cp-dome.jpg"
                    alt="4K Ultra-HD AI Network CCTV Surveillance Dome Camera"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      AI CCTV Surveillance
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
                          AI CCTV Video Surveillance
                        </h3>
                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          Commercial 4K UHD • Starlight Night Vision
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Turnkey AI video surveillance grids engineered for tech parks, logistics warehouses, and commercial establishments with Starlight night clarity and remote mobile monitoring.
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
                        <span>AI Vehicle ANPR &amp; Perimeter Tripwire</span>
                      </div>
                    </div>
                  </div>

                  {/* READ MORE BUTTON: Expands the 6 CCTV Products below */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCctvProducts(!showCctvProducts)}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{showCctvProducts ? 'Hide CCTV Products' : 'Read More & Explore CCTV Products (6 Items)'}</span>
                      {showCctvProducts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Z-1 RIGHT: CCTV INFORMATION & CAPABILITIES */}
              <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-9 border border-blue-900/40 shadow-xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-blue-400/30 flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-sky-400" />
                      DIVISION 01 — VIDEO SURVEILLANCE &amp; SECURITY
                    </span>
                    <span className="text-xs text-sky-300 font-bold">
                      6 OEM Certified Hardware Models
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    Commercial AI CCTV Surveillance Grids &amp; Threat Analytics
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Nexalus Innovations delivers turnkey design, OEM procurement, and field deployment of certified commercial video surveillance systems. From 4K Starlight bullet and fixed dome cameras to 32x optical zoom PTZ speed domes and 40TB AI NVR storage arrays, all installations include structured conduit piping, surge protection, and mobile monitoring apps.
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
                      <div className="text-[10px] text-sky-400 font-extrabold uppercase">AI Analytics</div>
                      <div className="font-extrabold text-white mt-0.5">Vehicle ANPR &amp; Face</div>
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
                      Curated CCTV Hardware Portfolio (6 Certified Models)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Click any product to inspect specifications or request instant project quotation
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    6 CCTV Products
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
        )}

        {/* =========================================================================
            Z-TYPE ARCHITECTURE: SECTION 2 (OPTICAL FIBER BROADBAND & INTERNET)
            ROW 2: LEFT = FIBER INFORMATION | RIGHT = FIBER BOX (WITH READ MORE BUTTON)
            [REVERSED ZIGZAG ROW]
            ========================================================================= */}
        {(catalogFilter === 'all' || catalogFilter === 'internet') && (
          <div id="section-internet" className="space-y-8 pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Z-2 LEFT: FIBER INTERNET INFORMATION & ARCHITECTURE */}
              <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-9 border border-teal-900/40 shadow-xl flex flex-col justify-between space-y-6 order-2 lg:order-1">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                      <Wifi className="w-3 h-3 text-teal-400" />
                      DIVISION 02 — OPTICAL FIBER BROADBAND &amp; FTTH
                    </span>
                    <span className="text-xs text-teal-300 font-bold">
                      6 Optical Hardware &amp; Plan Models
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

              {/* Z-2 RIGHT: INTERNET BOX / CARD (Styled like the subsidiary card with Read More button) */}
              <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group order-1 lg:order-2">
                <div className="relative h-60 overflow-hidden bg-slate-100">
                  <img
                    src="/images/products/wifi6-router.jpg"
                    alt="Wi-Fi 6 AX3000 Gigabit Dual-Band GPON ONT Gateway"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5" />
                      Fiber Internet &amp; Wi-Fi 6
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    Wi-Fi 6 AX3000 • 1 Gbps
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
                          Optical Fiber Broadband
                        </h3>
                        <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                          Symmetrical Speeds • FTTH &amp; Mesh Wi-Fi
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      High-speed optical fiber leased lines, Wi-Fi 6 GPON ONT gateways, whole-premises Tri-Band mesh systems, and ultra-low ping for business and remote workstations.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Symmetrical Speeds up to 1 Gbps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Dual-Band Wi-Fi 6 (802.11ax) Gateways</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Tri-Band Seamless Mesh Roaming Systems</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>99.9% Uptime SLA with 24/7 Monitoring</span>
                      </div>
                    </div>
                  </div>

                  {/* READ MORE BUTTON: Expands the 6 Fiber Internet Products below */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setShowInternetProducts(!showInternetProducts)}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{showInternetProducts ? 'Hide Fiber Hardware' : 'Read More & Explore Fiber Hardware (6 Items)'}</span>
                      {showInternetProducts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 6 FIBER INTERNET PRODUCTS GRID (Revealed by Read More Button) */}
            {showInternetProducts && (
              <div className="space-y-4 pt-2 transition-all duration-500">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">
                      Curated Fiber Broadband Hardware &amp; Plans (6 Certified Models)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Click any product to inspect specifications or request instant project quotation
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    6 Fiber Products
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
        )}

        {/* =========================================================================
            Z-TYPE ARCHITECTURE: SECTION 3 (ENTERPRISE NETWORKING & SWITCHES)
            ROW 3: LEFT = NETWORK BOX (WITH READ MORE BUTTON) | RIGHT = NETWORK INFORMATION
            [ZIGZAG COMPLETED]
            ========================================================================= */}
        {(catalogFilter === 'all' || catalogFilter === 'network') && (
          <div id="section-networking" className="space-y-8 pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Z-3 LEFT: NETWORKING BOX / CARD (Styled like the subsidiary card with Read More button) */}
              <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                <div className="relative h-60 overflow-hidden bg-slate-100">
                  <img
                    src="/images/products/poe-switch.jpg"
                    alt="Enterprise 24-Port Gigabit Managed PoE+ Switch & Router"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" />
                      Managed PoE+ Switching
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    Layer-3 • 370W PoE+
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
                          Enterprise IT Networking
                        </h3>
                        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                          Layer-2/3 Switches • Server Racks • Cat6A
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enterprise campus switching infrastructure with 24-port and 48-port Layer-2/3 Managed PoE+ switches, Sophos hardware firewalls, heavy-duty 24U server rack enclosures, and Cat6A cabling.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>24/48-Port Layer-2/3 Managed PoE+ Switches</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>4x 10G SFP+ High-Speed Optical Uplinks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Sophos XGS Next-Gen Hardware Firewalls</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>24U / 42U Heavy-Duty Server Rack Enclosures</span>
                      </div>
                    </div>
                  </div>

                  {/* READ MORE BUTTON: Expands the 6 Networking Products below */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setShowNetworkProducts(!showNetworkProducts)}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{showNetworkProducts ? 'Hide Networking Equipment' : 'Read More & Explore Networking Equipment (6 Items)'}</span>
                      {showNetworkProducts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Z-3 RIGHT: NETWORKING INFORMATION & INFRASTRUCTURE */}
              <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-9 border border-indigo-900/40 shadow-xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                      <Server className="w-3 h-3 text-indigo-400" />
                      DIVISION 03 — ENTERPRISE IT NETWORKING &amp; SWITCHES
                    </span>
                    <span className="text-xs text-indigo-300 font-bold">
                      6 Switching &amp; Infrastructure Models
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    Enterprise Campus Switching, Firewalls &amp; Server Infrastructure
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Design and implementation of resilient local area networks (LAN) and wide area networks (WAN). We provide OEM certified enterprise managed switches with up to 370W PoE budget, 10G SFP+ optical uplinks, Sophos cybersecurity firewall gateways, and precision-engineered server rack enclosures.
                  </p>

                  {/* 6 Technical Specification Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <div className="text-[10px] text-indigo-400 font-extrabold uppercase">PoE Budget</div>
                      <div className="font-black text-white mt-0.5">Up to 370W PoE+</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Uplink</div>
                      <div className="font-extrabold text-white mt-0.5">4x 10G SFP+ Optical</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Firewall</div>
                      <div className="font-extrabold text-white mt-0.5">Sophos XGS Hardware</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Rack Depth</div>
                      <div className="font-extrabold text-white mt-0.5">24U 800mm Depth</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Copper Speed</div>
                      <div className="font-extrabold text-white mt-0.5">10Gbps Fluke Certified</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <div className="text-[10px] text-indigo-400 font-extrabold uppercase">Support</div>
                      <div className="font-extrabold text-white mt-0.5">24/7 Level-3 NOC</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Request Network BoQ Proposal
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
                      Curated Enterprise IT Networking Hardware (6 Certified Models)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Click any product to inspect specifications or request instant project quotation
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    6 Networking Products
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
        )}
      </section>

      {/* 4. FEATURED SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Engineering &amp; Support
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Professional Installation &amp; Services
          </h2>
          <p className="text-sm text-slate-600">
            Backed by certified technicians, precision fiber splicing tools, and stringent quality audits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* 5. WHO CHOOSES NEXALUS & ENTERPRISE CLIENT SECTOR MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Turnkey Engineering Verticals</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Who Chooses Nexalus Innovations
          </h2>
          <p className="text-sm text-slate-600">
            From regional technology parks to cold-chain logistics hubs, leading organizations trust Nexalus Innovations for certified surveillance, optical fiber leased lines, and mission-critical network uptime.
          </p>
        </div>

        {/* 4 Interactive Sector Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setActiveSector('corporate')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              activeSector === 'corporate'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeSector === 'corporate' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <Building2 className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                activeSector === 'corporate' ? 'bg-white/25 text-white' : 'bg-blue-50 text-blue-700'
              }`}>
                Corporate IT
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">Tech Parks &amp; IT Hubs</h4>
              <p className={`text-[11px] mt-1 ${activeSector === 'corporate' ? 'text-blue-100' : 'text-slate-500'}`}>
                1 Gbps Leased Lines &amp; Switching
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSector('logistics')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              activeSector === 'logistics'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 scale-[1.02]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeSector === 'logistics' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Warehouse className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                activeSector === 'logistics' ? 'bg-white/25 text-white' : 'bg-indigo-50 text-indigo-700'
              }`}>
                Industrial
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">Warehouses &amp; Depots</h4>
              <p className={`text-[11px] mt-1 ${activeSector === 'logistics' ? 'text-indigo-100' : 'text-slate-500'}`}>
                32x PTZ Zoom &amp; Perimeter Defense
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSector('residential')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              activeSector === 'residential'
                ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/25 scale-[1.02]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeSector === 'residential' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-600'
              }`}>
                <Users className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                activeSector === 'residential' ? 'bg-white/25 text-white' : 'bg-teal-50 text-teal-700'
              }`}>
                Residential
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">Gated Townships</h4>
              <p className={`text-[11px] mt-1 ${activeSector === 'residential' ? 'text-teal-100' : 'text-slate-500'}`}>
                100% FTTH Drop &amp; Video Intercom
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveSector('banking')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              activeSector === 'banking'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeSector === 'banking' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <Lock className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                activeSector === 'banking' ? 'bg-white/25 text-white' : 'bg-emerald-50 text-emerald-700'
              }`}>
                Banking &amp; Retail
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">Banks &amp; High-Security</h4>
              <p className={`text-[11px] mt-1 ${activeSector === 'banking' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Starlight Vault CCTV &amp; Audio
              </p>
            </div>
          </button>
        </div>

        {/* Dynamic Deep Sector Showcase Box */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-blue-900/5 p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Scope & Hardware Deployment */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                    {activeSector === 'corporate' && 'Sector 01 Deployment Architecture'}
                    {activeSector === 'logistics' && 'Sector 02 Deployment Architecture'}
                    {activeSector === 'residential' && 'Sector 03 Deployment Architecture'}
                    {activeSector === 'banking' && 'Sector 04 Deployment Architecture'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-semibold">Turnkey SLA Implementation</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {activeSector === 'corporate' && 'Commercial Tech Parks & Corporate IT Campuses'}
                  {activeSector === 'logistics' && 'Logistics Warehouses, Cold-Rooms & Freight Depots'}
                  {activeSector === 'residential' && 'Smart Gated Townships & Luxury Housing Societies'}
                  {activeSector === 'banking' && 'Financial Institutions, Bank Branches & Premium Retail'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                  {activeSector === 'corporate' &&
                    'Turnkey Cat6A 10Gbps structured cabling architecture, 48-port Layer-3 Managed PoE+ switching fabrics, Sophos hardware firewalls, and high-density Wi-Fi 6 roaming supporting 500+ simultaneous corporate clients with zero packet loss.'}
                  {activeSector === 'logistics' &&
                    'Industrial perimeter security and high-throughput optical backbone rings for cold-chain storage and high-value cargo fulfillment facilities. Features 32x optical zoom PTZ tracking and automated vehicle license recognition.'}
                  {activeSector === 'residential' &&
                    'Complete end-to-end optical fiber distribution delivering gigabit broadband directly into every flat or villa. Integrated with smart cloud-connected IP video door phone intercoms and automated security boom barriers.'}
                  {activeSector === 'banking' &&
                    'High-security video surveillance and isolated financial data network infrastructure designed specifically to meet RBI and banking regulatory compliance with synchronized audio, Starlight night vision, and tamper-proof storage.'}
                </p>
              </div>

              {/* 4 Detailed Technical Hardware Deployments */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Certified Engineering Hardware Stack
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {activeSector === 'corporate' && (
                    <>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">1 Gbps Dedicated Leased Line</strong>
                          <span className="text-slate-500 text-[11px]">1:1 symmetrical bandwidth with BGP multi-homing</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Sophos XGS Next-Gen Firewall</strong>
                          <span className="text-slate-500 text-[11px]">Deep packet inspection &amp; zero-trust VPN gateways</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Layer-3 Managed 370W PoE+</strong>
                          <span className="text-slate-500 text-[11px]">4x 10G SFP+ uplinks &amp; 802.1Q VLAN routing</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Cat6A Fluke Channel Certified</strong>
                          <span className="text-slate-500 text-[11px]">100% solid oxygen-free copper 10Gbps cabling</span>
                        </div>
                      </div>
                    </>
                  )}
                  {activeSector === 'logistics' && (
                    <>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">32x Optical Zoom PTZ Cameras</strong>
                          <span className="text-slate-500 text-[11px]">Auto-tracking speed domes for perimeter defense</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Automated ANPR Vehicle Gates</strong>
                          <span className="text-slate-500 text-[11px]">Real-time number plate OCR recognition logging</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Multi-Building Fiber Ring</strong>
                          <span className="text-slate-500 text-[11px]">Armored single-mode fiber with 10G SFP+ links</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">40TB RAID Multi-Bay NVR</strong>
                          <span className="text-slate-500 text-[11px]">Continuous 24/7 recording with hot-swap drives</span>
                        </div>
                      </div>
                    </>
                  )}
                  {activeSector === 'residential' && (
                    <>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">100% FTTH Optical Fiber Drop</strong>
                          <span className="text-slate-500 text-[11px]">Direct gigabit fiber line inside every residential flat</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Wi-Fi 6 GPON ONT Gateways</strong>
                          <span className="text-slate-500 text-[11px]">Dual-band high-throughput whole-apartment coverage</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">IP Video Door Intercoms</strong>
                          <span className="text-slate-500 text-[11px]">Touchscreen monitors + mobile gate pass app</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Resident Boom Barrier ANPR</strong>
                          <span className="text-slate-500 text-[11px]">Automatic vehicle gate opening for authorized flats</span>
                        </div>
                      </div>
                    </>
                  )}
                  {activeSector === 'banking' && (
                    <>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">24/7 Full-Color Starlight Domes</strong>
                          <span className="text-slate-500 text-[11px]">Zero-lux night clarity for currency counters &amp; vaults</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Teller Two-Way Audio Recording</strong>
                          <span className="text-slate-500 text-[11px]">Noise-canceling microphones at cash exchange desks</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Isolated Banking CCTV VLAN</strong>
                          <span className="text-slate-500 text-[11px]">Zero network cross-leakage &amp; AES-256 cloud backup</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block font-bold">Multi-Branch Central NOC Room</strong>
                          <span className="text-slate-500 text-[11px]">Unified multi-screen video operations console</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Key Operational Metric & Case Study Box */}
            <div className="lg:col-span-5 space-y-6">
              {/* Highlight Metric Card */}
              <div className={`p-6 rounded-3xl text-white space-y-3 shadow-lg ${
                activeSector === 'corporate' ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/20' :
                activeSector === 'logistics' ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 shadow-indigo-500/20' :
                activeSector === 'residential' ? 'bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 shadow-teal-500/20' :
                'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-500/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    SLA Benchmark
                  </span>
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-black tracking-tight">
                    {activeSector === 'corporate' && '99.99% Uptime'}
                    {activeSector === 'logistics' && '32x Optical Zoom'}
                    {activeSector === 'residential' && '100% FTTH Drop'}
                    {activeSector === 'banking' && '24/7 Starlight Color'}
                  </div>
                  <p className="text-xs text-white/90 font-medium mt-1">
                    {activeSector === 'corporate' && 'Symmetrical 1 Gbps Leased Line with 45-Min SLA Support'}
                    {activeSector === 'logistics' && '200m Smart IR Perimeter Night Vision with Auto-Tracking'}
                    {activeSector === 'residential' && 'Gigabit Optical Speed to Every Residential Apartment'}
                    {activeSector === 'banking' && 'AES-256 Encrypted RBI Compliant Vault Video & Audio'}
                  </p>
                </div>
              </div>

              {/* Verified Field Deployment Highlight */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    Verified Regional Deployment
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold uppercase">
                    Active Client
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="font-extrabold text-slate-800">
                    {activeSector === 'corporate' && 'Software & Technology Park, Sangli-Kolhapur Corridor'}
                    {activeSector === 'logistics' && 'Regional Cold-Chain & Freight Logistics Complex, Chiplun'}
                    {activeSector === 'residential' && 'Riverfront Premium Gated Township, Sangli'}
                    {activeSector === 'banking' && 'Co-Operative Urban Banking Network, Western Maharashtra'}
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    {activeSector === 'corporate' && 'Scope: 140+ Workstations • 12 Managed Switches • 24 Cameras • 1 Gbps Fiber'}
                    {activeSector === 'logistics' && 'Scope: 45,000 Sq.Ft. Facility • 32x PTZ Domes • 40TB RAID NVR • High-Power PoE+'}
                    {activeSector === 'residential' && 'Scope: 320 Apartments • FTTH Splitter Architecture • 18 ANPR & Intercom Nodes'}
                    {activeSector === 'banking' && 'Scope: 18 Branch Locations • Cash Counter Microphones • Isolated VLANs • Central NOC'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/80">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold justify-center"
                    onClick={() => setIsQuoteModalOpen(true)}
                  >
                    Request Sector Technical Survey
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Enterprises Partner with Nexalus */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 text-slate-900 border border-slate-200 shadow-sm">
          <div className="max-w-3xl mb-8 space-y-2">
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">
              Verified Value &amp; Engineering Standards
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why Organizations Choose Nexalus as Their Infrastructure Partner
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              We eliminate multi-vendor friction by combining surveillance hardware distribution with optical network engineering under one unified contract.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Single Vendor Accountability</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                No finger-pointing between your internet service provider and security hardware vendor. We own the complete fiber pipe and video stream.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">100% Genuine OEM Hardware</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct authorized systems integrator for commercial 4K AI cameras, next-gen UTM firewalls, and dedicated optical fiber leased lines. Authentic serial numbers and manufacturer warranties.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Precision Fiber Engineering</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pure optical fiber backhaul designed with redundant ring topologies for minimal jitter, OTDR-tested loss, and enterprise uptime reliability.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Quarterly Health Audits (AMC)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Proactive camera lens cleaning, NVR storage health diagnostics, optical loop testing, and certified rapid restoration SLAs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BUSINESS ENQUIRY & SITE SURVEY CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="relative space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 text-sky-400 text-xs font-semibold border border-blue-700/50">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
              <span>Free Engineering Consultation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Ready to Upgrade Your Connectivity &amp; Security Infrastructure?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Request a free onsite site survey, custom optical bandwidth proposal, or CCTV Bill of Quantities (BoQ). Our certified engineering team responds within 2 business hours.
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsQuoteModalOpen(true)}
            >
              Request a Quotation
            </Button>
            <Link to="/contact">
              <Button
                variant="outline-white"
                size="lg"
              >
                Contact Sales Desk
              </Button>
            </Link>
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
