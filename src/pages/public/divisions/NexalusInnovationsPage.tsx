import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  Cpu,
  ArrowRight,
  ArrowLeft,
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
  Building2,
  Lock,
  Activity,
  Zap,
  PhoneCall
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

  // 1. Exactly 6 Curated CCTV Products
  const cctvProductIds = ['prod-cp-1', 'prod-cp-2', 'prod-cp-5', 'prod-cp-3', 'prod-cp-4', 'prod-cp-6'];
  const cctvProducts = cctvProductIds.map(getProduct).filter(Boolean);

  // 2. Exactly 6 Curated High-Speed Fiber Internet Products
  const internetProductIds = ['prod-ob-1', 'prod-ob-2', 'prod-ob-6', 'prod-ob-3', 'prod-ob-4', 'prod-ob-5'];
  const internetProducts = internetProductIds.map(getProduct).filter(Boolean);

  // 3. Exactly 6 Curated Enterprise Networking Products
  const networkProductIds = ['prod-itti-6', 'prod-itti-1', 'prod-itti-2', 'prod-itti-4', 'prod-itti-5', 'prod-itti-3'];
  const networkProducts = networkProductIds.map(getProduct).filter(Boolean);

  return (
    <div className="flex flex-col w-full">
      {/* =========================================================================
          SLIDE 1: HERO SECTION (ELECTRIC CYBER INDIGO & NEON CYAN THEME)
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-950 via-[#0d132b] to-slate-950 text-white py-16 sm:py-24 border-b border-indigo-950">
        {/* Subtle background tech accents */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950 text-cyan-300 text-xs font-bold border border-indigo-700/50 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping" />
                  <span>Division of Nexalus Innovations LLP • Commercial Infrastructure</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Nexalus Innovations
              </h1>

              <p className="text-base sm:text-xl text-cyan-300 font-bold">
                AI CCTV Surveillance • High-Speed Optical Fiber Internet • Enterprise IT Networking
              </p>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                The specialized engineering division of <strong className="text-white">Nexalus Innovations LLP</strong>. We architect and deploy certified 4K AI CCTV surveillance grids, high-speed optical fiber internet, Layer-2/3 managed PoE+ switching fabrics, and structured cabling for enterprises and commercial facilities.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/50 px-6 py-3 rounded-xl transition-all cursor-pointer border border-indigo-400/30"
                  onClick={() => setIsQuoteModalOpen(true)}
                  icon={<ArrowRight className="w-4 h-4 text-cyan-300" />}
                >
                  Request Commercial Proposal
                </Button>
                <Link to="/brands/nexalus-innovations/contact">
                  <Button
                    variant="outline-white"
                    size="lg"
                    className="border-indigo-800 hover:bg-indigo-950 text-indigo-200 hover:text-white font-semibold px-5 py-3 rounded-xl"
                    icon={<PhoneCall className="w-4 h-4 text-cyan-400" />}
                  >
                    Contact Technology Desk
                  </Button>
                </Link>
                <Link to="/brands/nexalus-innovations/products">
                  <Button
                    variant="outline-white"
                    size="lg"
                    className="border-slate-800 hover:bg-white/5 text-slate-300 font-semibold px-4 py-3 rounded-xl"
                  >
                    Hardware Catalog
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image Showcase Column: AUTHENTIC REAL PHOTOGRAPH */}
            <div className="lg:col-span-5">
              <div className="relative group rounded-3xl overflow-hidden border border-blue-800/40 bg-slate-900 shadow-2xl shadow-blue-950/50">
                <img
                  src="/images/tony-webster-server-room.jpg"
                  alt="Nexalus Innovations Commercial Technology Facility"
                  className="w-full h-[320px] sm:h-[380px] lg:h-[420px] object-cover object-[70%_center] group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
                    Engineering Facility
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <p className="text-xs text-slate-500 font-medium">Starlight Night AI Surveillance</p>
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

      {/* =========================================================================
          SECTION 1: AI CCTV VIDEO SURVEILLANCE (ELECTRIC INDIGO & CYBER CYAN THEME)
          ========================================================================= */}
      <section id="section-cctv" className="w-full bg-slate-900 text-white py-16 sm:py-24 border-b border-indigo-950 relative overflow-hidden">
        {/* Tech Grid Background Accent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-indigo-900/50 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider border border-indigo-500/40">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>DIVISION 01 — AI CCTV SURVEILLANCE &amp; SECURITY</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Commercial 4K AI CCTV Video Surveillance Grids
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Turnkey AI video surveillance engineered with Sony Starvis starlight sensors, 32x optical zoom PTZ tracking domes, smart video intercoms, and multi-bay 4K NVR arrays with 100% genuine OEM warranty.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-indigo-950 text-cyan-300 border border-indigo-700">
                6 CCTV Hardware Models
              </span>
              <Button
                variant="primary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                CCTV Site Estimate
              </Button>
            </div>
          </div>

          {/* INTERACTIVE CCTV CAMERA SPOTLIGHT: ANIMATED ZOOM & AI RETICLE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/80 p-6 sm:p-8 rounded-3xl border border-indigo-900/60 shadow-2xl">
            {/* Left Column: Technical Capabilities (Slide In Left animation) */}
            <div className="lg:col-span-6 space-y-5 animate-slide-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 text-xs font-mono font-bold border border-cyan-800/60">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>AI OPTICAL PERIMETER TRACKING</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Deep Learning Human &amp; Vehicle Classification
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Our certified security camera installations feature motorized varifocal optical zoom lenses, zero-latency local NVR storage, and active deterrence strobe lights. Move your cursor over the camera preview to inspect the AI optical targeting system.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-800/40 space-y-1">
                  <div className="text-cyan-300 font-black">4K Sony Starvis Sensor</div>
                  <div className="text-slate-400 text-[11px]">Full color colorimetry down to 0.001 Lux</div>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-800/40 space-y-1">
                  <div className="text-cyan-300 font-black">30m-60m Smart IR</div>
                  <div className="text-slate-400 text-[11px]">Adaptive anti-reflection night optics</div>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-800/40 space-y-1">
                  <div className="text-cyan-300 font-black">IK10 Vandal-Proof</div>
                  <div className="text-slate-400 text-[11px]">Heavy-duty cast alloy enclosure</div>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-800/40 space-y-1">
                  <div className="text-cyan-300 font-black">IP67 Weather Rating</div>
                  <div className="text-slate-400 text-[11px]">Submersible rain &amp; dust defense</div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 font-bold"
                  icon={<Sparkles className="w-4 h-4 text-cyan-300" />}
                >
                  Book Onsite Camera Survey
                </Button>
              </div>
            </div>

            {/* Right Column: Interactive Camera Viewfinder with Zoom-in & HUD Radar */}
            <div className="lg:col-span-6 animate-slide-right">
              <div className="cctv-interactive-card relative overflow-hidden rounded-3xl border-2 border-indigo-500/40 bg-slate-950 group shadow-2xl">
                {/* Camera Image with Smooth Zoom on Hover */}
                <img
                  src="/images/real-cctv-camera.jpg"
                  alt="4K AI Security Dome Camera Optics"
                  className="cctv-img-zoom w-full h-[320px] sm:h-[380px] object-cover transition-transform duration-700 ease-out"
                />

                {/* Simulated Moving Scan Line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan pointer-events-none" />

                {/* Top HUD Bar: Live Status */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-red-500/50 text-[11px] font-mono text-white shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping" />
                    <span className="font-black text-red-400">REC</span>
                    <span className="text-slate-300">● 4K 60FPS</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-indigo-950/80 backdrop-blur-md border border-indigo-400/50 text-[10px] font-mono text-cyan-300 font-bold">
                    AI TRIPWIRE ARMED
                  </div>
                </div>

                {/* Center Optical Crosshair Reticle (Appears / animates on hover) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-36 h-36 border border-cyan-400/40 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <div className="w-24 h-24 border border-dashed border-cyan-300/60 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '12s' }}>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400" />
                    </div>
                  </div>
                </div>

                {/* Bottom HUD: Detection Target Box */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/50 text-[11px] font-mono text-cyan-300">
                    <div>TARGET: [HUMAN DETECTED]</div>
                    <div className="text-[9px] text-slate-400">CONFIDENCE: 99.4% • LENS: 2.7-13.5mm</div>
                  </div>

                  <div className="text-[10px] text-slate-300 font-mono bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/10">
                    ZOOM: 4.0X OPTICAL
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6 CCTV Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {cctvProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: OPTICAL FIBER INTERNET & FTTH (RICH CORPORATE DEEP BLUE THEME)
          ========================================================================= */}
      <section id="section-internet" className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-16 sm:py-24 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900/50 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-400/30">
                <Wifi className="w-3.5 h-3.5 text-teal-400" />
                <span>DIVISION 02 — OPTICAL FIBER BROADBAND &amp; FTTH</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                High-Speed Optical Fiber Internet, Routers &amp; Mesh Wi-Fi
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Symmetrical gigabit FTTH broadband gateways, Tri-band Wi-Fi 6 mesh roaming nodes, and outdoor high-gain repeaters engineered for uninterrupted enterprise uptime and minimal ping.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-teal-900/60 text-teal-300 border border-teal-700/50">
                6 Optical Fiber Models
              </span>
              <Button
                variant="teal"
                size="sm"
                className="font-bold shadow-md shadow-teal-900/40"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Explore Fiber Plans
              </Button>
            </div>
          </div>

          {/* 6 Optical Fiber Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {internetProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ENTERPRISE IT NETWORKING & SWITCHES (CLEAN SLATE/WHITE THEME)
          ========================================================================= */}
      <section id="section-networking" className="w-full bg-slate-50 py-16 sm:py-24 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-200">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span>DIVISION 03 — ENTERPRISE IT NETWORKING &amp; SWITCHES</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Layer-2/3 Managed PoE+ Switching &amp; Server Cabinets
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                High-density 24 &amp; 48-port Layer-2/3 managed switches, 10G optical SFP+ uplinks, cold-rolled server cabinets, and Fluke-certified pure copper Cat6A structured cabling.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                6 Networking Models
              </span>
              <Button
                variant="primary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 font-bold"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Inquire Network Setup
              </Button>
            </div>
          </div>

          {/* 6 Enterprise Networking Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {networkProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: TECHNICAL OPERATIONS & SITE SURVEY DESK (DEEP MIDNIGHT BLUE)
          ========================================================================= */}
      <section className="w-full bg-slate-950 text-white py-16 sm:py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider border border-blue-400/30">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Onsite Technical Site Survey</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Need a Certified Site Survey or Customized BOQ Estimation?
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Operating under <strong className="text-white">Nexalus Innovations LLP</strong>, our certified network engineers conduct comprehensive on-premise surveys for CCTV camera placements, optical fiber runs, and server rack installations across Sangli, Maharashtra, and surrounding regional zones.
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
