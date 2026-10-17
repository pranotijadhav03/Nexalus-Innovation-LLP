import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Wifi,
  Server,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers
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
            Engineering Divisions
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Technology Divisions
          </h1>
          <p className="text-base text-slate-300 mt-4 leading-relaxed">
            Operating under <strong>Nexalus Innovations LLP</strong>, our specialized engineering divisions provide comprehensive security surveillance, optical fiber connectivity, and enterprise network infrastructure across Maharashtra.
          </p>
        </div>
      </section>

      {/* 2. Division 1: Commercial CCTV Surveillance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <Link to="/services">
                <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Services
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="md">
                  View Hardware Catalog
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="/images/simple-cctv-camera.jpg"
                alt="Commercial CCTV Surveillance by Nexalus Innovations LLP"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Division 2: Optical Fiber Internet */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:shadow-xl hover:border-blue-300 transition-all">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                  Broadband &amp; Connectivity Division
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  High-Speed Optical Fiber Internet
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Ultra-fast gigabit broadband and dedicated 1:1 symmetrical leased lines engineered over redundant fiber ring backbones. Delivering low latency, guaranteed 99.9% uptime SLAs, and 24/7 proactive network monitoring.
            </p>

            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
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
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link to="/services">
                <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Fiber Plans
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="md">
                  Inquire Corporate Line
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="/images/fiber-optic-cables.jpg"
                alt="Optical Fiber Internet by Nexalus Innovations LLP"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Division 3: Enterprise IT Networking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <Link to="/services">
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
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="/images/cisco-switch-stack-real.jpg"
                alt="Enterprise IT Networking by Nexalus Innovations LLP"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Corporate Single-Window Integration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 border border-slate-800 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold">Single Corporate Umbrella — Nexalus Innovations LLP</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Eliminate vendor friction. We own the complete technology lifecycle from hardware supply and optical fiber connectivity to maintenance SLAs.
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
      </section>
    </div>
  );
};
