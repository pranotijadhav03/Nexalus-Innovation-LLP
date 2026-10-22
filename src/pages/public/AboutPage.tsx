import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Cpu,
  Shield,
  Wifi,
  Server,
  CheckCircle2,
  Target,
  Compass,
  Award,
  Sparkles,
  Layers,
  Wrench,
  Check,
  ArrowRight
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
              <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 shadow-2xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
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
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 hover:border-blue-500 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>CCTV Video Surveillance</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      Commercial 4K network IP cameras, perimeter motion detection, and central command monitoring.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 hover:border-sky-500 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                      <Wifi className="w-4 h-4 text-sky-400" />
                      <span>Optical Fiber Internet</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      Symmetrical gigabit leased lines and high-speed FTTH broadband with 99.9% uptime.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 hover:border-indigo-500 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                      <Server className="w-4 h-4 text-indigo-400" />
                      <span>Enterprise IT Switching</span>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">
                      Layer-2/3 managed PoE+ switching, hardware firewalls, and server rack integration.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 hover:border-cyan-500 transition-colors">
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
          SLIDE 4: VISION & MISSION (COOL AMBIENT SKY & SLATE SLIDE THEME)
          ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-blue-50/70 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
              Strategic Blueprint
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Vision &amp; Purpose
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4 hover:shadow-xl hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To be Maharashtra&apos;s benchmark technology infrastructure enterprise, recognized for unmatched engineering excellence in commercial CCTV surveillance, high-speed optical fiber connectivity, and resilient enterprise IT networks.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4 hover:shadow-xl hover:border-sky-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold shadow-xs">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To empower corporate offices, industrial hubs, residential townships, and institutions with dependable turnkey technology solutions backed by authentic OEM hardware, transparent engineering, and certified onsite support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SLIDE 5: CORE CORPORATE VALUES (EXECUTIVE WHITE CARD GRID)
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
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-lg transition-all space-y-2">
              <div className="text-blue-600 font-black text-xl">01</div>
              <h4 className="font-bold text-slate-900 text-sm">Authentic OEM Hardware</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                100% genuine 4K CCTV cameras, carrier-grade optical fiber equipment, and certified enterprise switches with direct manufacturer warranty.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-sky-300 hover:shadow-lg transition-all space-y-2">
              <div className="text-sky-600 font-black text-xl">02</div>
              <h4 className="font-bold text-slate-900 text-sm">Rapid Onsite Deployment</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fast 24-48 hour turnaround on fiber broadband installations and prompt same-day emergency CCTV camera support.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-lg transition-all space-y-2">
              <div className="text-indigo-600 font-black text-xl">03</div>
              <h4 className="font-bold text-slate-900 text-sm">Fluke-Tested Cabling</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rigorous Fluke channel certification on all pure copper Cat6A and optical fiber patch installations with zero packet loss.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-blue-400 hover:shadow-lg transition-all space-y-2">
              <div className="text-blue-700 font-black text-xl">04</div>
              <h4 className="font-bold text-slate-900 text-sm">Rigorous SLA Commitment</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                99.9% uptime leased lines, proactive quarterly CCTV maintenance audits, and dedicated enterprise account engineers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
