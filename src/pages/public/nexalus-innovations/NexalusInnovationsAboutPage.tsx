import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Shield,
  Wifi,
  Server,
  CheckCircle2,
  Award,
  Users,
  Building2,
  Layers,
  ArrowRight,
  Clock,
  PhoneCall,
  Check,
  FileCheck,
  Zap,
  Wrench,
  Sparkles
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { QuoteModal } from '../../../components/common/QuoteModal';

export const NexalusInnovationsAboutPage: React.FC = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-5 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 text-sky-300 text-xs font-semibold border border-blue-700/50">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Division Profile • Nexalus Innovations LLP</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Engineering Dependable Enterprise Networks &amp; Security Grids
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Operating as the dedicated technology and commercial infrastructure division under <strong className="text-white">Nexalus Innovations LLP</strong>. We engineer turnkey 4K commercial video surveillance, symmetrical optical fiber leased lines, and Layer-2/3 managed networking across Maharashtra.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsQuoteOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 font-bold"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Request Site Audit &amp; BOQ
            </Button>
            <Link to="/brands/nexalus-innovations/contact">
              <Button
                variant="outline-white"
                size="lg"
                className="border-slate-700 hover:bg-white/10 text-slate-200 font-semibold"
                icon={<PhoneCall className="w-4 h-4 text-sky-400" />}
              >
                Contact Engineering Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ENGINEERING PHILOSOPHY & SINGLE-WINDOW ACCOUNTABILITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Shield className="w-3.5 h-3.5" />
              <span>Engineering Excellence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Single-Window Accountability for Surveillance, Fiber &amp; Switching
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Founded under the corporate umbrella of <strong>Nexalus Innovations LLP</strong>, Nexalus Innovations bridges the critical gap between electronic surveillance hardware distribution and telecommunications network engineering.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Organizations typically face severe friction when internet downtime impairs surveillance footage or when camera streams choke local network bandwidth. Nexalus Innovations eliminates this multi-vendor conflict by architecting the optical fiber backhaul, the Layer-2/3 switching fabrics, and the video security system under a unified Service Level Agreement (SLA).
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero-Vendor Blame</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">One engineering team handles both surveillance and network data pipelines.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fluke Certified Drops</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Every Cat6A drop is tested for return loss, NEXT, and cross-talk.</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/brands/nexalus-innovations/products">
                <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Hardware Catalog
                </Button>
              </Link>
              <Link to="/brands/nexalus-innovations/services">
                <Button variant="outline" size="md">
                  View Engineering Services
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 group">
              <img
                src="/images/tony-webster-datacenter-racks.jpg"
                alt="Nexalus Innovations Commercial Technology Facility"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. TURNKEY 4-STAGE ENGINEERING LIFECYCLE */}
      <section className="bg-slate-50 py-16 sm:py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
              Execution Methodology
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our 4-Stage Turnkey Project Delivery Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every commercial deployment follows a disciplined engineering procedure to guarantee flawless signal fidelity, tamper resistance, and long-term hardware reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                  01
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Onsite Spatial Audit &amp; Lux Analysis</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our certified engineers inspect site dimensions, ambient lux levels for low-light camera lens matching, RF signal propagation, and structural conduit paths to prevent blind spots.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Blind-Spot Mapping
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-sm">
                  02
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Technical BOQ &amp; Capacity Sizing</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Accurate Bill of Quantities (BOQ) with precise NVR storage RAID sizing (30/60/90 days retention), PoE power budget headroom calculations, and optical fiber attenuation planning.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-teal-600 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" /> Precise GST BOQ Proposal
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                  03
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Structured Cabling &amp; Fusion Splicing</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Installation using heavy-gauge electrical conduits, weatherproof IP67 enclosures, core-alignment optical fusion splicing, and professional server rack cable comb dressing.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> Core Fusion Splicing
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                  04
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Fluke Testing &amp; Client Handover</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Drop-by-drop Fluke Channel test reports, OTDR optical loss documentation, secure smartphone app pairing, and administrator training with 1-year on-site support warranty.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Fluke Channel Certified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE CORE INFRASTRUCTURE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Core Competencies
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Three Infrastructure Specializations
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Commercial CCTV Surveillance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Industrial and enterprise video security featuring Sony Starvis low-light optical sensors, motorized optical zoom PTZ domes, vandal-proof IK10 housings, and multi-drive NVR storage servers.
            </p>
            <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>4K Starlight Full-Color Night Vision</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Tripwire &amp; Perimeter Intrusion Alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Encrypted Remote Smartphone Live View</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Optical Fiber &amp; FTTH Leased Lines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Symmetrical gigabit leased lines and FTTH connectivity designed for mission-critical video data, VoIP communication, and multi-tenant commercial establishments.
            </p>
            <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Symmetrical 1:1 Upload &amp; Download Speed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Wi-Fi 6 GPON ONT Gateway Hardware</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Low Latency for Video Streaming &amp; Cloud</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Managed Switching &amp; Server Racks</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Layer-2/3 Managed PoE+ switching, 10G SFP+ optical uplinks, cold-rolled steel server cabinets, Sophos firewall integration, and Cat6A structured network backbones.
            </p>
            <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>370W High-Budget PoE+ Power Delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Isolated VLANs for Data &amp; Surveillance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>100% Solid Bare Copper Cat6A Drops</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. COMMERCIAL SECTORS WE SERVE */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-sky-400 uppercase tracking-widest">
              Industry Experience
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Sectors &amp; Facilities We Protect
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Tailored turnkey infrastructure engineered specifically for commercial and institutional environments across Maharashtra.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <Building2 className="w-8 h-8 text-sky-400" />
              <h3 className="font-bold text-white text-base">Industrial &amp; MIDC Plants</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Perimeter fence monitoring, heavy truck weighbridge camera integration, and high-temp industrial plant cabling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <Layers className="w-8 h-8 text-teal-400" />
              <h3 className="font-bold text-white text-base">Warehouses &amp; Logistics</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                High-bay warehouse Wi-Fi coverage, loading bay dispatch security, and wide-angle aisle surveillance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <Users className="w-8 h-8 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Corporate Campuses</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Multi-floor Cat6A cabling, biometric access control integration, and central server rack consolidation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <Shield className="w-8 h-8 text-amber-400" />
              <h3 className="font-bold text-white text-base">Hospitals &amp; Education</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                High-throughput optical fiber backhaul rings, campus perimeter defense, and centralized monitoring command rooms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TECHNICAL BENCHMARKS & CERTIFICATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Certified Benchmarks
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Quality Benchmarks &amp; Splicing Standards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">OEM Certified Cameras</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% authentic manufacturer serial numbers, certified tamper alerts, and full manufacturer warranty on dome, bullet, and PTZ models.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Fluke-Tested Cabling</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pure oxygen-free electrolytic copper Cat6A cabling with individual drop Fluke Channel certification reports for zero packet loss.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">OTDR Spliced Fiber</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Precision core-alignment fusion splicing with OTDR optical loss documentation under 0.02 dB per joint for maximum carrier uptime.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Quarterly AMC Care</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dedicated field maintenance contracts including quarterly physical lens cleaning, optical power checks, and 2-hour emergency dispatch.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CTA STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Upgrade Your Commercial Surveillance or Network?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Contact our engineering desk today for an onsite survey, optical fiber plan recommendation, or formal BOQ quotation.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsQuoteOpen(true)}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold"
            >
              Request Proposal
            </Button>
            <Link to="/brands/nexalus-innovations/contact">
              <Button
                variant="outline-white"
                size="lg"
                className="border-white/30 hover:bg-white/10"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="nexalus-innovations"
      />
    </div>
  );
};
