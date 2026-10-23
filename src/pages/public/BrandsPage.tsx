import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Truck,
  Droplets,
  Building2,
  Cpu
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const BrandsPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Corporate Portfolio &amp; Operating Brands
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Our Brands &amp; Divisions
          </h1>
          <p className="text-base text-slate-300 mt-4 leading-relaxed">
            Operating under <strong>Nexalus Innovations LLP</strong>, our two specialized brands deliver enterprise technology engineering and regional FMCG cold-chain logistics across Maharashtra.
          </p>
        </div>
      </section>

      {/* 2. Top Brands Showcase Grid (WHITE THEME) */}
      <section className="w-full bg-white py-12 sm:py-16 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Two Operational Pillars
            </h2>
            <p className="text-sm text-slate-600">
              Select an operational brand below to explore products, specialized services, and wholesale portals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brand 1: Nexalus Innovations */}
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-blue-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
              <Link to="/brands/nexalus-innovations" className="block relative h-64 overflow-hidden bg-slate-100 cursor-pointer">
                <img
                  src="/images/server-racks-4508751.jpg"
                  alt="Nexalus Innovations Technology & Network Infrastructure Division"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <div className="p-7 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <Link to="/brands/nexalus-innovations" className="flex items-center gap-3 group/brand cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0 group-hover/brand:bg-blue-600 group-hover/brand:text-white transition-colors">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 group-hover/brand:text-blue-600 transition-colors">
                        Nexalus Innovations
                      </h3>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        CCTV Surveillance, Fiber &amp; IT Networking
                      </p>
                    </div>
                  </Link>

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

            {/* Brand 2: A.M. Distributors Chiplun */}
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-teal-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
              <Link to="/brands/am-distributors" className="block relative h-64 overflow-hidden bg-slate-100 cursor-pointer">
                <img
                  src="/images/projects/real-warehouse-distribution.jpg"
                  alt="A.M. Distributors Chiplun Cold-Chain & FMCG Distribution Facility"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <div className="p-7 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <Link to="/brands/am-distributors" className="flex items-center gap-3 group/brand cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold shrink-0 group-hover/brand:bg-teal-600 group-hover/brand:text-white transition-colors">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-teal-600 group-hover/brand:text-teal-600 transition-colors">
                        A.M. Distributors Chiplun
                      </h3>
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                        Beverage, Dairy &amp; Cold Storage Logistics
                      </p>
                    </div>
                  </Link>

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

      {/* 3. Dedicated Brand Deep Dive: A.M. Distributors Chiplun (RICH BLUE THEME) */}
      <section className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-14 sm:py-20 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#0c1c38]/90 border border-teal-900/50 shadow-2xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-teal-400/60 transition-all">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                    Cold-Chain &amp; Logistics Operating Company
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    A.M. Distributors Chiplun
                  </h2>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Operating directly from Chiplun, Maharashtra, A.M. Distributors is the regional logistics hub commanding temperature-controlled cold-room storage, refrigerated reefer fleet, and dependable daily morning delivery routes across retail, commercial, and hospitality sectors.
              </p>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Distribution Capabilities &amp; Scope:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    'Chiplun Regional Logistics Hub & Cold-Room Storage',
                    'Packaged Mineral Water (20L Jars & Retail Bottles)',
                    'Commercial Ice Cream Distributor (-18°C Reefer Fleet)',
                    'Farm-Fresh Milk, Butter, Ghee & Complete Dairy Line',
                    'Scheduled Morning 4:00 AM Punctual Retail Route',
                    'FSSAI Compliant Temperature-Logged Assurance'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link to="/brands/am-distributors">
                  <Button variant="primary" size="md" className="bg-teal-600 hover:bg-teal-500 shadow-md shadow-teal-500/20" icon={<ArrowRight className="w-4 h-4" />}>
                    Explore A.M. Distributors Portal
                  </Button>
                </Link>
                <Link to="/brands/am-distributors/contact">
                  <Button variant="outline-white" size="md">
                    Inquire Depot Wholesale
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Link to="/brands/am-distributors" className="block rounded-2xl overflow-hidden shadow-lg border border-teal-800/60 cursor-pointer group">
                <img
                  src="/images/projects/real-warehouse-distribution.jpg"
                  alt="A.M. Distributors Chiplun Regional Logistics Hub"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Division 1: Commercial CCTV Surveillance (WHITE THEME) */}
      <section className="w-full bg-white py-14 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:shadow-xl hover:border-blue-300 transition-all">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                    Security &amp; Surveillance Division
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Commercial CCTV Surveillance Solutions
                  </h2>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Delivering commercial 4K video surveillance grids, high-definition IP cameras, automated vehicle number plate recognition (ANPR), Starlight night vision, and centralized multi-screen command room integration for corporate and residential facilities.
              </p>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Division Capabilities:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    '4K Ultra-HD Network IP Bullet & Dome Cameras',
                    'Facial Recognition & Vehicle ANPR Detection',
                    'High-Capacity RAID Network Video Recorders (NVR)',
                    'Centralized Multi-Screen Video Operations Console',
                    'Starlight Zero-Lux Color Night Vision',
                    'Proactive Preventive CCTV AMC Maintenance'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link to="/brands/nexalus-innovations">
                  <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    Explore Nexalus Tech
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" size="md">
                    View Products
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Link to="/brands/nexalus-innovations" className="block rounded-2xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer group">
                <img
                  src="/images/simple-cctv-camera.jpg"
                  alt="Commercial CCTV Surveillance by Nexalus Innovations LLP"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Division 2: Optical Fiber Internet (BLUE THEME) */}
      <section className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-14 sm:py-20 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#0c1c38]/90 border border-teal-900/50 shadow-2xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-teal-400/60 transition-all">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
                  <Wifi className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                    Broadband &amp; Connectivity Division
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    High-Speed Optical Fiber Internet
                  </h2>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Ultra-fast gigabit broadband and dedicated 1:1 symmetrical leased lines engineered over redundant fiber ring backbones. Delivering low latency, guaranteed 99.9% uptime SLAs, and 24/7 proactive network monitoring.
              </p>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Connectivity Capabilities:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    'Symmetrical Gigabit Leased Lines (1:1 Ratio)',
                    'Direct Fiber-to-the-Home (FTTH) Gigabit Broadband',
                    'Dual-Ring Redundant Core Network Architecture',
                    'Low Latency Routing for Corporate Applications',
                    '24/7 Network Operations Center (NOC) Monitoring',
                    'Guaranteed 45-Minute Emergency Response SLA'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link to="/brands/nexalus-innovations">
                  <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    Explore Fiber Plans
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline-white" size="md">
                    Inquire Corporate Line
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Link to="/brands/nexalus-innovations" className="block rounded-2xl overflow-hidden shadow-lg border border-slate-700 cursor-pointer group">
                <img
                  src="/images/fiber-optic-cables.jpg"
                  alt="Optical Fiber Internet by Nexalus Innovations LLP"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Division 3: Enterprise IT Networking (WHITE THEME) */}
      <section className="w-full bg-white py-14 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:shadow-xl hover:border-blue-300 transition-all">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Network Infrastructure Division
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Enterprise IT Networking &amp; Cabling
                  </h2>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Complete Layer-2 and Layer-3 managed PoE+ switching, hardware firewalls, organized server rack integration, and Fluke channel certified structured cabling for offices, campuses, and tech parks.
              </p>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Infrastructure Capabilities:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    'Layer-2/3 Managed PoE+ Gigabit Switches',
                    'Next-Gen UTM Hardware Firewall Integration',
                    'Fluke Channel Certified Pure Copper Cat6A',
                    'Custom Server Rack Assembly & Cable Dressing',
                    'Multi-VLAN Isolation for Voice, Video & Data',
                    'Comprehensive Infrastructure Health Audits'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link to="/brands/nexalus-innovations">
                  <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    Explore Networking Solutions
                  </Button>
                </Link>
                <Link to="/quote">
                  <Button variant="outline" size="md">
                    Request Network Proposal
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Link to="/brands/nexalus-innovations" className="block rounded-2xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer group">
                <img
                  src="/images/cisco-switch-stack-real.jpg"
                  alt="Enterprise IT Networking by Nexalus Innovations LLP"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Corporate Single-Window Integration (BLUE THEME) */}
      <section className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-14 sm:py-20 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 border border-slate-800 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">Single Corporate Umbrella — Nexalus Innovations LLP</h3>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Eliminate vendor friction. We own the complete technology lifecycle from hardware supply and optical fiber connectivity to maintenance SLAs, alongside regional logistics distribution from A.M. Distributors Chiplun.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link to="/quote">
                <Button variant="primary" size="lg">
                  Request Corporate Quotation
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline-white" size="lg">
                  Contact Corporate Office
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
