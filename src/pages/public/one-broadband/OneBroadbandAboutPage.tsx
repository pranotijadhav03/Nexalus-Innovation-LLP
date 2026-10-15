import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { CoverageCheckerModal } from '../../../components/brand/CoverageCheckerModal';
import { Button } from '../../../components/common/Button';
import {
  Wifi,
  Zap,
  Server,
  Shield,
  CheckCircle2,
  Activity,
  Layers,
  ArrowRight,
  Globe2,
  Cpu,
  Search
} from 'lucide-react';

export const OneBroadbandAboutPage: React.FC = () => {
  const [isCoverageOpen, setIsCoverageOpen] = useState(false);

  return (
    <div className="space-y-16 pb-20">
      <BrandHeader
        brandId="one-broadband"
        title="About One Broadband & Networking — Nexalus Innovations LLP"
        subtitle="Ultra-fast symmetrical Gigabit optical fiber backbone, enterprise structured cabling, and mission-critical network integration for homes, enterprises, and campuses."
        breadcrumbs={[{ label: 'About Us' }]}
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              100% Pure Optical Fiber Backbone
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Engineered for Extreme Bandwidth, Zero Jitter & Absolute Reliability
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Operating under <strong>Nexalus Innovations LLP</strong>, One Broadband delivers carrier-grade fiber connectivity engineered without compromise. While legacy internet providers rely on aged copper conduits and over-subscribed neighborhood nodes, our optical lines terminate directly into your modem for uninterrupted symmetrical speeds.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              In strategic partnership with enterprise networking brands like <strong>ITTI Networking</strong> and <strong>Sophos</strong>, we offer end-to-end connectivity: from the fiber core entry point to managed switches, PoE access points, and structured server racks.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button
                variant="teal"
                size="md"
                onClick={() => setIsCoverageOpen(true)}
                icon={<Search className="w-4 h-4" />}
              >
                Check Coverage in Your Area
              </Button>
              <Link to="/brands/one-broadband/plans">
                <Button variant="outline" size="md">
                  Browse Fiber Plans
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group">
              <img
                src="/images/network-hero-banner.jpg"
                alt="One Broadband Enterprise Network Infrastructure"
                className="w-full h-[380px] sm:h-[420px] object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-6 sm:p-8">
                <div className="text-white space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-bold">
                    Gigabit Fiber Infrastructure
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold">
                    Symmetrical Speed with Dual-Ring Redundancy
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Architecture Pillars */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
              Carrier-Grade Engineering
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why Choose One Broadband Network
            </h2>
            <p className="text-sm text-slate-400">
              Built on redundant fiber rings with direct peering at major internet exchanges for lowest gaming & cloud latency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Symmetrical Bandwidth</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Equal upload and download speeds. Send multi-gigabyte video files or host servers without throttling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">99.9% Uptime Ring</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatic failover architecture guarantees uninterrupted connectivity even during physical line breaks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Direct CDN Peering</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ultra-low latency connection to Google, Microsoft Azure, AWS, and Cloudflare nodes for seamless streaming.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Enterprise ITTI Integration</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seamless support for managed switches, enterprise firewalls, and server rack installations by Nexalus engineers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions We Deliver */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Broadband & Networking Segments
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tailored Connectivity For Every Environment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Residential FTTH Fiber</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ultra-reliable fiber for 4K smart TVs, multi-device video conferencing, smart home IoT, and competitive online gaming.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Free Wi-Fi 6 Gigabit Router
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Zero data limits or caps
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Symmetrical 100 to 1000 Mbps
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Dedicated Internet Leased Line</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              1:1 contention ratio with guaranteed bandwidth, static IPv4 subnets, 99.95% SLA agreement, and 2-hour MTTR response.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> 1:1 unshared private bandwidth
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Multiple Static IP allocations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> 24/7 dedicated Network NOC
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Campus LAN & Structured Cabling</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Complete turnkey design and pulling of Cat6A/Optic cabling, enterprise switches, server racks, and mesh Wi-Fi.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Pure Copper 10Gbps Cat6A cabling
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Managed L2/L3 PoE Switch rollout
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> High-density Access Points
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Direct Connection CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-br from-teal-900 via-teal-950 to-slate-950 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Check Fiber Availability
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Get High-Speed Optical Fiber Installed Within 24-48 Hours
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Check if your building or tech park is currently covered by the One Broadband optical grid. Our field engineers provide rapid same-week provisioning.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="teal"
              size="lg"
              onClick={() => setIsCoverageOpen(true)}
              icon={<Search className="w-4 h-4" />}
            >
              Verify My PIN Code
            </Button>
            <Link to="/brands/one-broadband/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-teal-500/40 text-teal-200 hover:bg-teal-900/40"
              >
                Contact Broadband Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CoverageCheckerModal
        isOpen={isCoverageOpen}
        onClose={() => setIsCoverageOpen(false)}
      />
    </div>
  );
};
