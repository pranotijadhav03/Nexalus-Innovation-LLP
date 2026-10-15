import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Check,
  Building2,
  Warehouse,
  Users,
  Lock,
  Camera,
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { QuoteModal } from '../../../components/common/QuoteModal';
import { ProductCard } from '../../../components/brand/ProductCard';
import { getProducts } from '../../../firebase/services';
import { initialProducts } from '../../../data/initialData';
import { Product } from '../../../types';

export const NexalusInnovationsPage: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);

  // Independent toggle states for the 3 Z-pattern product sections
  const [showCctvProducts, setShowCctvProducts] = useState(true);
  const [showInternetProducts, setShowInternetProducts] = useState(true);
  const [showNetworkProducts, setShowNetworkProducts] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const prods = await getProducts(undefined, true);
        if (prods && prods.length > 0) {
          setAllProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load products for Nexalus Innovations:', err);
      }
    }
    load();
  }, []);

  const getProduct = (id: string): Product => {
    return allProducts.find(p => p.id === id) || initialProducts.find(p => p.id === id) || initialProducts[0];
  };

  // 1. 6 CCTV Products
  const cctvProductIds = ['prod-cp-1', 'prod-cp-2', 'prod-cp-5', 'prod-cp-3', 'prod-cp-4', 'prod-cp-6'];
  const cctvProducts = cctvProductIds.map(getProduct).filter(Boolean);

  // 2. 6 High-Speed Fiber Internet Products
  const internetProductIds = ['prod-ob-1', 'prod-ob-2', 'prod-ob-6', 'prod-ob-3', 'prod-ob-4', 'prod-ob-5'];
  const internetProducts = internetProductIds.map(getProduct).filter(Boolean);

  // 3. 6 Enterprise Networking Products
  const networkProductIds = ['prod-itti-6', 'prod-itti-1', 'prod-itti-2', 'prod-itti-4', 'prod-itti-5', 'prod-itti-3'];
  const networkProducts = networkProductIds.map(getProduct).filter(Boolean);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION WITH PROMINENT CLEAR IMAGE DISPLAY (MATCHING SCREENSHOT 2) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-20 lg:py-24 border-b border-slate-800">
        {/* Subtle background tech grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/60 text-sky-300 text-xs font-semibold border border-blue-700/50 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block animate-pulse" />
                <span>Operating Company — Nexalus Innovations LLP</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Nexalus Innovations
              </h1>

              <p className="text-base sm:text-xl text-sky-300 font-semibold">
                AI CCTV Surveillance • High-Speed Optical Fiber Internet • Enterprise IT Networking
              </p>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                The dedicated technical and infrastructure engineering division of Nexalus Innovations LLP. We architect and deploy certified 4K AI CCTV surveillance grids, high-speed optical fiber broadband internet, Layer-2/3 managed PoE+ switching fabrics, and structured cabling for enterprises and institutions.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-900/40 px-6 py-3 rounded-xl transition-all cursor-pointer"
                  onClick={() => setIsQuoteModalOpen(true)}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Request Commercial Proposal
                </Button>
                <Link to="/brands/nexalus-innovations/contact">
                  <Button
                    variant="outline-white"
                    size="lg"
                    className="border-slate-600 hover:bg-white/10 text-white font-medium px-5 py-3 rounded-xl"
                  >
                    Contact Technology Desk
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image Showcase Column: SAME EXACT BRIGHT, CRISP IMAGE FROM HOMEPAGE CARD */}
            <div className="lg:col-span-5">
              <div className="relative group rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-2xl shadow-blue-500/20 bg-slate-900">
                <img
                  src="/images/nexalus-facility-cctv-network.jpg"
                  alt="Nexalus Innovations Commercial Technology Facility"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Badge matching the card exactly */}
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-900/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
                    Technology &amp; Electronics
                  </span>
                </div>

                {/* Bottom caption glass banner */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                  <p className="text-xs font-bold text-white">Nexalus Enterprise Engineering Center</p>
                  <p className="text-[11px] text-sky-300 font-medium">Sangli, Kolhapur &amp; Western Maharashtra Regional Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE ENGINEERING SLA METRICS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-3xl bg-white shadow-xl shadow-blue-900/5 border border-slate-200/90">
          <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80">
            <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">4K Ultra-HD</div>
              <p className="text-xs text-slate-500 font-medium">Starlight Night AI Surveillance</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80">
            <div className="w-12 h-12 rounded-xl bg-teal-100/80 text-teal-600 flex items-center justify-center shrink-0">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">1 Gbps Speeds</div>
              <p className="text-xs text-slate-500 font-medium">Dedicated Symmetrical FTTH</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80">
            <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">Layer-3 Switching</div>
              <p className="text-xs text-slate-500 font-medium">370W PoE+ &amp; 10G SFP+ Uplinks</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl bg-slate-50/80">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">45-Min SLA</div>
              <p className="text-xs text-slate-500 font-medium">Rapid Field Dispatch Service</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Z-TYPE ARCHITECTURE: SECTION 1 (CCTV SURVEILLANCE)
          ROW 1: LEFT = CCTV BOX (WITH READ MORE BUTTON) | RIGHT = CCTV INFORMATION
          ========================================================================= */}
      <section id="section-cctv" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
      </section>

      {/* =========================================================================
          Z-TYPE ARCHITECTURE: SECTION 2 (OPTICAL FIBER BROADBAND & INTERNET)
          ROW 2: LEFT = FIBER INFORMATION | RIGHT = FIBER BOX (WITH READ MORE BUTTON)
          [REVERSED ZIGZAG ROW]
          ========================================================================= */}
      <section id="section-internet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
      </section>

      {/* =========================================================================
          Z-TYPE ARCHITECTURE: SECTION 3 (ENTERPRISE NETWORKING & SWITCHES)
          ROW 3: LEFT = NETWORK BOX (WITH READ MORE BUTTON) | RIGHT = NETWORK INFORMATION
          [ZIGZAG COMPLETED]
          ========================================================================= */}
      <section id="section-networking" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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

          {/* Z-3 RIGHT: NETWORKING INFORMATION & CAPABILITIES */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-9 border border-indigo-900/40 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                  <Server className="w-3 h-3 text-indigo-400" />
                  DIVISION 03 — IT NETWORKING &amp; INFRASTRUCTURE
                </span>
                <span className="text-xs text-indigo-300 font-bold">
                  6 Enterprise Hardware Models
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
                  Curated Networking &amp; Switching Portfolio (6 Certified Models)
                </h4>
                <p className="text-xs text-slate-500">
                  Click any product to inspect specifications or request instant project quotation
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                6 Network Products
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {networkProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. FACILITY & OPERATIONS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-extrabold text-sky-400 uppercase tracking-widest">
              Engineering &amp; Operations Center
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Grade Network &amp; Security Engineering
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Nexalus Innovations brings together high-resolution video surveillance, high-throughput optical fiber, and managed enterprise switching under a single roof. Clients receive authentic OEM certified hardware, professional site surveys, and dedicated account management.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>GST Invoicing, Official OEM Partner Warranty &amp; Fast Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Onsite Technical Site Survey &amp; BoQ Precision Estimation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Fluke Tested Channel Certification for All Structured Cabling Runs</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Inquire With Nexalus Innovations Desk
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
              <img
                src="/images/cctv-control-room.jpg"
                alt="Nexalus Innovations Security Operations &amp; Control Room"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        brandId="nexalus-innovations"
      />
    </div>
  );
};
