import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi,
  Zap,
  Server,
  Shield,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Search,
  Activity,
  Layers,
  PhoneCall,
  Globe2
} from 'lucide-react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { PlanCard } from '../../../components/brand/PlanCard';
import { ProductCard } from '../../../components/brand/ProductCard';
import { ServiceCard } from '../../../components/brand/ServiceCard';
import { CoverageCheckerModal } from '../../../components/brand/CoverageCheckerModal';
import { Button } from '../../../components/common/Button';
import { getInternetPlans, getProducts, getServices } from '../../../firebase/services';
import { InternetPlan, Product, Service } from '../../../types';

export const OneBroadbandHomePage: React.FC = () => {
  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isCoverageOpen, setIsCoverageOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const [allPlans, allProds, allSrvs] = await Promise.all([
        getInternetPlans(true),
        getProducts('one-broadband', true),
        getServices('one-broadband', true)
      ]);
      setPlans(allPlans);
      setProducts(allProds);
      setServices(allSrvs);
    }
    load();
  }, []);

  return (
    <div className="space-y-16 pb-20 pt-6">
      {/* Hero Visual Section with Real Optical Fiber Network Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-teal-900/50 shadow-2xl">
          {/* Background image & gradient overlay */}
          <div className="relative h-[480px] sm:h-[520px] lg:h-[580px] w-full">
            <img
              src="/images/network-hero-banner.jpg"
              alt="One Broadband Fiber Network Infrastructure"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-2xl px-6 sm:px-12 space-y-5 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold tracking-wide uppercase backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                  Pure Optical Fiber Infrastructure
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                  Ultra-Fast <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Gigabit Optical Fiber</span> Internet
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Symmetrical upload & download speeds up to 1 Gbps, 99.9% uptime ring topology, truly unlimited data with zero throttling, and dual-band Wi-Fi 6 routers for homes, societies, and commercial spaces.
                </p>

                {/* Key Quick Badges */}
                <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-200">
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" /> 1 Gbps Symmetrical Speed
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" /> Wi-Fi 6 Router Included
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" /> 99.9% Uptime SLA
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-3 flex flex-wrap gap-3 sm:gap-4">
                  <Button
                    variant="teal"
                    size="lg"
                    onClick={() => setIsCoverageOpen(true)}
                    icon={<Search className="w-4 h-4" />}
                  >
                    Check Coverage in My PIN
                  </Button>
                  <Link to="/brands/one-broadband/plans">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-teal-400/50 text-teal-200 hover:bg-teal-900/60 backdrop-blur-sm"
                    >
                      Compare Fiber Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="bg-slate-900/90 border-t border-slate-800 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">1 Gbps</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Maximum Symmetrical Speed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">&lt; 3ms</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Ultra-Low Gaming Latency</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">99.9%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Ring Backbone Uptime</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">24 Hours</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Express Installation SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Division Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              One Broadband Division • Nexalus Innovations LLP
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Carrier-Grade Fiber Connectivity with Integrated ITTI Networking
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We eliminate buffering, packet loss, and throttled bandwidth. One Broadband connects premises directly to multi-gigabit optical fiber rings backed by ITTI managed switches, Sophos next-gen hardware firewalls, and certified Cat6A structured network backbones.
            </p>
            <div className="pt-2">
              <Link
                to="/brands/one-broadband/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900 group"
              >
                Learn more about our fiber network infrastructure
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-teal-50 rounded-2xl p-6 border border-teal-100 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Need New Connection?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Check instant feasibility in your locality or book high-speed fiber provisioning with our field dispatch team.
            </p>
            <div className="pt-2 space-y-2">
              <a
                href="tel:+918041234500"
                className="flex items-center gap-2 text-xs font-bold text-teal-800 bg-white p-2.5 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-teal-600" /> +91 (0) 80 4123 4500
              </a>
              <Button
                variant="teal"
                size="sm"
                className="w-full"
                onClick={() => setIsCoverageOpen(true)}
              >
                Check Local Coverage
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Internet Plans Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Fiber Tariffs
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 uppercase tracking-tight">
              INTERNET SERVICE DATA PLANS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Truly unlimited data with zero FUP limit. Wi-Fi router included with free installation.
            </p>
          </div>
          <Link
            to="/brands/one-broadband/plans"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 shrink-0"
          >
            View All 7 Plans <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.slice(0, 6).map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onCheckCoverageClick={() => setIsCoverageOpen(true)}
            />
          ))}
        </div>
      </section>

      {/* Networking Hardware */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Hardware & Peripherals
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                Enterprise Switches & Fiber Gateways
              </h2>
            </div>
            <Link
              to="/brands/one-broadband/products"
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 shrink-0"
            >
              All Hardware Catalog ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Networking Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Network Operations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Broadband & Enterprise Networking Services
            </h2>
          </div>
          <Link
            to="/brands/one-broadband/services"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 shrink-0"
          >
            All Services <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map(srv => (
            <ServiceCard key={srv.id} service={srv} />
          ))}
        </div>
      </section>

      {/* Coverage Check CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-r from-teal-950 via-slate-900 to-teal-900 border border-teal-800 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-bold">
              Check If One Broadband Fiber is Live in Your Building
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Enter your PIN code to see active fiber rings and instant connection feasibility in Bangalore and Karnataka.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="teal"
              size="lg"
              onClick={() => setIsCoverageOpen(true)}
              icon={<Search className="w-4 h-4" />}
            >
              Verify My Coverage
            </Button>
            <Link to="/brands/one-broadband/contact">
              <Button variant="outline" size="lg" className="border-teal-400/50 text-teal-200 hover:bg-teal-900/50">
                Contact Broadband Desk
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
