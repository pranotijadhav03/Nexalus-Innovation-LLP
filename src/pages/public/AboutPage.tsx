import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Cpu,
  Truck,
  Shield,
  Wifi,
  Server,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Target,
  Compass,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-blue-900/10 via-slate-50 to-white py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Corporate Profile
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
            About Nexalus Innovations LLP
          </h1>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            A premier technology enterprise operating across Maharashtra, providing end-to-end solutions in AI CCTV surveillance, high-speed optical fiber internet, and enterprise IT networking infrastructure.
          </p>
        </div>
      </section>

      {/* 2. CORPORATE ENTITY OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Parent Entity
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Unified Technology Governance &amp; Engineering Reliability
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nexalus Innovations LLP was established to provide structured, accountable corporate backing to critical technology infrastructure. Rather than dealing with fragmented vendors for CCTV, internet, and office switching, we provide a unified single-window contract.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our engineering divisions deliver OEM certified hardware, Fluke-tested structured cabling, 24/7 network monitoring, and guaranteed response SLAs for residential societies, commercial offices, industrial tech parks, and institutions.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link to="/brands">
                <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Our Divisions
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="md">
                  Contact Corporate Desk
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> Corporate Entity Structure
              </h3>

              <div className="p-4.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Parent LLP Entity
                </div>
                <div className="text-lg font-black text-white">NEXALUS INNOVATIONS LLP</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Headquartered in Maharashtra. Manages executive operations, quality assurance, strategic partnerships, centralized logistics contracts, and platform administration.
                </p>
              </div>

              {/* 2 Child Companies Quick Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <Cpu className="w-4 h-4" /> Nexalus Innovations
                  </div>
                  <div className="text-xs text-slate-300">
                    Electronics Material, CCTV Sales &amp; Networking, Fiber Internet &amp; Infrastructure.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
                    <Truck className="w-4 h-4" /> A.M. Distributors Chiplun
                  </div>
                  <div className="text-xs text-slate-300">
                    Chiplun Regional Hub: Packaged Mineral Water, Ice Cream, Milk, Butter &amp; Dairy Distribution.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR OPERATING COMPANIES (WITH VISIT WEBSITE BUTTONS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Operating Divisions
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Operating Companies &amp; Specializations
          </h2>
          <p className="text-sm text-slate-600">
            Click &ldquo;Visit&rdquo; to open the dedicated website portal and explore the comprehensive catalogue and service details for each company.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Operating Company 1: Nexalus Innovations */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-blue-300 transition-all duration-300">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src="/images/projects/nexalus-innovations-division.jpg"
                alt="Nexalus Innovations Commercial Technology Facility"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
                  Technology &amp; Electronics
                </span>
              </div>
            </div>

            <div className="p-8 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Nexalus Innovations</h3>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">
                    Electronics, CCTV, Fiber Internet &amp; Networking Division
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Nexalus Innovations operates as our dedicated technical systems and network infrastructure arm. Serving corporate complexes, tech parks, retailers, and institutions with genuine OEM hardware and professional engineering.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Official Division Scope:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Electronics Material &amp; Hardware</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Sales &amp; Networking (CCTV)</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>High-Speed Optical Fiber Internet</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Enterprise Switches &amp; Server Racks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Visit Website Button */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link to="/brands/nexalus-innovations" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto"
                    icon={<ExternalLink className="w-4 h-4" />}
                  >
                    Visit
                  </Button>
                </Link>
                <span className="text-xs text-slate-400 font-medium">
                  5 Commercial Catalog Items
                </span>
              </div>
            </div>
          </div>

          {/* Operating Company 2: A.M. Distributors Chiplun */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-teal-300 transition-all duration-300">
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src="/images/projects/am-distributors-chiplun.jpg"
                alt="A.M. Distributors Chiplun Regional Logistics Hub"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1 rounded-full bg-teal-600 text-white text-xs font-bold shadow-md">
                  Cold-Chain &amp; Logistics
                </span>
              </div>
            </div>

            <div className="p-8 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">A.M. Distributors Chiplun</h3>
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mt-1">
                    Cold-Chain Dairy &amp; Packaged Goods Logistics Hub
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  A.M. Distributors is our regional distribution powerhouse based in Chiplun, Maharashtra. Equipped with temperature-controlled warehousing, reefer fleet, and daily morning distribution routes for retail outlets and hospitality.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Official Division Scope:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Chiplun Distribution Hub</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Packaged Mineral Water Distribution</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Ice Cream Distributor (-18°C Fleet)</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Milk, Butter &amp; All Dairy Products</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Read More / Open Website Button */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link to="/brands/am-distributors" className="w-full sm:w-auto">
                  <Button
                    variant="teal"
                    size="md"
                    className="w-full sm:w-auto"
                    icon={<ExternalLink className="w-4 h-4" />}
                  >
                    Visit
                  </Button>
                </Link>
                <span className="text-xs text-slate-400 font-medium">
                  4 Cold-Chain Catalog Items
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VISION & MISSION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To be Maharashtra&apos;s benchmark commercial enterprise known for excellence in both advanced technology infrastructure (CCTV, fiber internet, and enterprise networking via Nexalus Innovations) and regional cold-chain distribution (pure water and dairy logistics via A.M. Distributors Chiplun).
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To deliver certified OEM hardware, turnkey security surveillance, high-speed optical fiber, and dependable regional cold-chain supply backed by transparent practices, punctual morning dispatch, and uncompromising quality standards.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CORE VALUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Operating Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Core Corporate Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="text-blue-600 font-black text-xl">01</div>
            <h4 className="font-bold text-slate-900 text-sm">Authentic OEM Hardware</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% genuine 4K CCTV cameras, carrier-grade optical fiber equipment, and certified enterprise switches with manufacturer warranty.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="text-sky-600 font-black text-xl">02</div>
            <h4 className="font-bold text-slate-900 text-sm">Rapid Onsite Deployment</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fast 24-48 hour turnaround on fiber broadband installations and prompt same-day emergency CCTV support.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="text-teal-600 font-black text-xl">03</div>
            <h4 className="font-bold text-slate-900 text-sm">Fluke-Tested Cabling</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rigorous Fluke channel certification on all pure copper Cat6A and optical fiber patch installations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="text-purple-600 font-black text-xl">04</div>
            <h4 className="font-bold text-slate-900 text-sm">Rigorous SLA Commitment</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              99.9% uptime leased lines, proactive quarterly CCTV maintenance audits, and dedicated enterprise account executives.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
