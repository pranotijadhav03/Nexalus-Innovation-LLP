import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Shield,
  Wifi,
  Server,
  ArrowRight,
  CheckCircle2,
  Target,
  Compass,
  Sparkles,
  Layers,
  Wrench,
  Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full">
      {/* =========================================================================
          SLIDE 1: HERO HEADER (DEEP SLATE & SERVER SCENE)
          ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-20 sm:py-28 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Corporate Profile</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            About Nexalus Innovations LLP
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mt-5 leading-relaxed font-normal">
            A premier technology enterprise providing end-to-end turnkey solutions in commercial CCTV surveillance, high-speed optical fiber internet, and enterprise IT networking infrastructure.
          </p>
        </div>
      </section>

      {/* =========================================================================
          SLIDE 2: CORPORATE OVERVIEW & ENGINEERING RELIABILITY (LUMINOUS DAYLIGHT)
          ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider border border-blue-200">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Engineering Excellence</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                Unified Technology Governance &amp; Reliable Infrastructure
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Nexalus Innovations LLP</strong> was established to provide structured, accountable corporate backing to critical technology infrastructure. Rather than dealing with multiple fragmented vendors for surveillance cameras, internet connectivity, and office switching, we provide a unified single-window solution.
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Our engineering team delivers genuine OEM certified hardware, Fluke-tested structured cabling, 24/7 network monitoring, and guaranteed response SLAs for residential societies, commercial offices, industrial tech parks, and institutions.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link to="/services">
                  <Button variant="primary" size="md" className="font-bold shadow-md shadow-blue-500/20" icon={<ArrowRight className="w-4 h-4" />}>
                    Explore Our Services
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="md" className="font-bold">
                    Contact Corporate Desk
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-slate-900 text-white p-5 sm:p-8 sm:p-10 shadow-2xl border border-slate-800 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        Nexalus Innovations LLP
                      </h3>
                      <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
                        Enterprise Technology Standards
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-full font-bold">
                    Corporate HQ
                  </span>
                </div>

                {/* 4 Infrastructure Pillars Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 hover:border-blue-400 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>CCTV Video Surveillance</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      Commercial 4K network IP cameras, perimeter motion detection, and central command monitoring.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 hover:border-sky-400 hover:bg-slate-800 hover:shadow-lg hover:shadow-sky-500/20 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                      <Wifi className="w-4 h-4 text-sky-400" />
                      <span>Optical Fiber Internet</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      Symmetrical gigabit leased lines and high-speed FTTH broadband with 99.9% uptime.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 hover:border-indigo-400 hover:bg-slate-800 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                      <Server className="w-4 h-4 text-indigo-400" />
                      <span>Enterprise IT Switching</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      Layer-2/3 managed PoE+ switching, hardware firewalls, and server rack integration.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 hover:border-cyan-400 hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <Wrench className="w-4 h-4 text-cyan-400" />
                      <span>Turnkey AMC Maintenance</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      Fluke-tested structured cabling, proactive audits, and rapid onsite restoration SLAs.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-900/40 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-400" />
                    Direct OEM Certified Hardware Integrator
                  </span>
                  <span className="text-sky-400 font-bold">Maharashtra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* =========================================================================
          SLIDE 4: VISION & MISSION (NEXALUS HIGH-TECH THEME - CORPORATE NAVY & CYAN)
          ========================================================================= */}
      <section className="relative w-full bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 text-white py-16 sm:py-24 border-b border-blue-900/50 overflow-hidden">
        {/* Subtle background tech accents */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-black uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Strategic Blueprint</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Our Vision &amp; Purpose
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
              Our guiding principles driving engineering precision, customer trust, and enterprise technology standards across Maharashtra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Our Vision */}
            <div className="relative p-6 sm:p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0c1e3d]/85 to-blue-950/80 border border-blue-500/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(37,99,235,0.3)] space-y-6 hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-500 group overflow-hidden cursor-pointer">
              {/* Theme top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-400" />
              {/* Theme ambient glow inside card */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/25 transition-all duration-500" />

              <div className="relative flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20 group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700 ease-in-out cursor-pointer">
                  <Compass className="w-7 h-7 group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30">
                  Long-Term Vision
                </span>
              </div>

              <div className="relative space-y-3">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Our Vision
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  To be Maharashtra&apos;s benchmark technology infrastructure enterprise, recognized for unmatched engineering excellence in commercial CCTV surveillance, high-speed optical fiber connectivity, and resilient enterprise IT networks.
                </p>
              </div>

              <div className="relative pt-4 border-t border-blue-900/60 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Benchmark Technology Standards Across Maharashtra</span>
              </div>
            </div>

            {/* Card 2: Our Mission */}
            <div className="relative p-6 sm:p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a2344]/85 to-indigo-950/80 border border-cyan-500/30 shadow-2xl hover:shadow-[0_20px_50px_rgba(6,182,212,0.3)] space-y-6 hover:border-cyan-400 hover:-translate-y-1.5 transition-all duration-500 group overflow-hidden cursor-pointer">
              {/* Theme top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500" />
              {/* Theme ambient glow inside card */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-500" />

              <div className="relative flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-500/20 group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700 ease-in-out cursor-pointer">
                  <Target className="w-7 h-7 group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Core Mission
                </span>
              </div>

              <div className="relative space-y-3">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Our Mission
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  To empower corporate offices, industrial hubs, residential townships, and institutions with dependable turnkey technology solutions backed by authentic OEM hardware, transparent engineering, and certified onsite support.
                </p>
              </div>

              <div className="relative pt-4 border-t border-cyan-950/60 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Authentic OEM Hardware &amp; SLA-Backed Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SLIDE 5: CORE CORPORATE VALUES (DYNAMIC ROTATION & SHADOW CARD GRID)
          ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
              Operating Principles
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Our Core Corporate Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Value 1 */}
            <div className="group relative p-7 rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out space-y-3 cursor-pointer overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="text-blue-600 font-black text-2xl tracking-tight group-hover:scale-105 transition-transform duration-300">
                01
              </div>
              <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors duration-300">
                Authentic OEM Hardware
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                100% genuine 4K CCTV cameras, carrier-grade optical fiber equipment, and certified enterprise switches with direct manufacturer warranty.
              </p>
            </div>

            {/* Value 2 */}
            <div className="group relative p-7 rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-2xl hover:shadow-sky-500/20 hover:border-sky-400 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out space-y-3 cursor-pointer overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="text-sky-600 font-black text-2xl tracking-tight group-hover:scale-105 transition-transform duration-300">
                02
              </div>
              <h4 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition-colors duration-300">
                Rapid Onsite Deployment
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fast 24-48 hour turnaround on fiber broadband installations and prompt same-day emergency CCTV camera support.
              </p>
            </div>

            {/* Value 3 */}
            <div className="group relative p-7 rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-400 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out space-y-3 cursor-pointer overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="text-indigo-600 font-black text-2xl tracking-tight group-hover:scale-105 transition-transform duration-300">
                03
              </div>
              <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors duration-300">
                Fluke-Tested Cabling
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rigorous Fluke channel certification on all pure copper Cat6A and optical fiber patch installations with zero packet loss.
              </p>
            </div>

            {/* Value 4 */}
            <div className="group relative p-7 rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-2xl hover:shadow-blue-600/20 hover:border-blue-500 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out space-y-3 cursor-pointer overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="text-blue-700 font-black text-2xl tracking-tight group-hover:scale-105 transition-transform duration-300">
                04
              </div>
              <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors duration-300">
                Rigorous SLA Commitment
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                99.9% uptime leased lines, proactive quarterly CCTV maintenance audits, and dedicated enterprise account engineers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SLIDE 6: CTA BANNER (ROYAL NAVY GRADIENT THEME)
          ========================================================================= */}
      <section className="w-full py-14 sm:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 lg:p-14 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-900/50">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-15 [background-size:20px_20px] pointer-events-none" />

            <div className="relative space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 text-sky-400 text-xs font-bold border border-blue-700/50 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block animate-pulse" />
                <span>Free Engineering Consultation</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ready to Partner with Nexalus Innovations LLP?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Contact our engineering desk today for an onsite survey, customized optical network proposal, or CCTV quotation.
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
    </div>
  );
};
