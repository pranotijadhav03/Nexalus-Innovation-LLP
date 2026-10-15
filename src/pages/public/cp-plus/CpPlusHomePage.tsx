import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  Cpu,
  Video,
  Wrench,
  Award,
  PhoneCall,
  ChevronRight,
  Camera,
  PlayCircle
} from 'lucide-react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { ProductCard } from '../../../components/brand/ProductCard';
import { ServiceCard } from '../../../components/brand/ServiceCard';
import { Button } from '../../../components/common/Button';
import { QuoteModal } from '../../../components/common/QuoteModal';
import { getProducts, getServices, getProjects } from '../../../firebase/services';
import { Product, Service, Project } from '../../../types';

export const CpPlusHomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const [allProds, allSrvs, allProjs] = await Promise.all([
        getProducts('cp-plus', true),
        getServices('cp-plus', true),
        getProjects('cp-plus', true)
      ]);
      setProducts(allProds);
      setServices(allSrvs);
      setProjects(allProjs);
    }
    load();
  }, []);

  return (
    <div className="space-y-16 pb-20 pt-6">
      {/* Hero Visual Section with Real CCTV Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-sky-900/50 shadow-2xl">
          {/* Background image & gradient overlay */}
          <div className="relative h-[480px] sm:h-[520px] lg:h-[580px] w-full">
            <img
              src="/images/cctv-hero-banner.jpg"
              alt="CP PLUS Security Surveillance Solutions"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-2xl px-6 sm:px-12 space-y-5 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold tracking-wide uppercase backdrop-blur-md">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  Official Certified CP PLUS Partner
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                  Next-Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">AI Video Surveillance</span> Systems
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Turnkey CCTV design, genuine CP PLUS 4K hardware deployment, and intelligent perimeter defense for residential properties, corporate headquarters, and industrial facilities.
                </p>

                {/* Key Quick Badges */}
                <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-200">
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" /> 4K Ultra HD Forensic Video
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" /> AI Human & Vehicle Tracking
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-sm">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" /> Zero Blind-Spot Layout
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-3 flex flex-wrap gap-3 sm:gap-4">
                  <Link to="/brands/cp-plus/products">
                    <Button variant="sky" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                      Explore CCTV Products
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-sky-400/50 text-sky-200 hover:bg-sky-900/60 backdrop-blur-sm"
                    onClick={() => setIsQuoteOpen(true)}
                  >
                    Request Free Site Survey
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="bg-slate-900/90 border-t border-slate-800 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-sky-400">5,000+</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">CCTV Cameras Deployed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-sky-400">100%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Genuine CP PLUS Hardware</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-sky-400">24/7</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Cloud Monitoring & App</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-sky-400">4 Hours</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Rapid AMC Service SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Division Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">
              CP PLUS Division • Nexalus Innovations LLP
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Certified CCTV Installation & Precision Security Engineering
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We specialize in end-to-end electronic security solutions. Our certified team analyzes spatial parameters, ambient lux levels, and line-of-sight angles to recommend the ideal mix of Dome, Bullet, 4K PTZ Speed Domes, and AI-enabled IP cameras.
            </p>
            <div className="pt-2">
              <Link
                to="/brands/cp-plus/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900 group"
              >
                Learn more about our CCTV engineering capabilities
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-sky-50 rounded-2xl p-6 border border-sky-100 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Need Rapid Assistance?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect with our dedicated CCTV engineers for immediate quotations and on-site inspection scheduling.
            </p>
            <div className="pt-2 space-y-2">
              <a
                href="tel:+918041234500"
                className="flex items-center gap-2 text-xs font-bold text-sky-800 bg-white p-2.5 rounded-xl border border-sky-200 hover:bg-sky-100 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-sky-600" /> +91 (0) 80 4123 4500
              </a>
              <Link to="/brands/cp-plus/contact" className="block">
                <Button variant="sky" size="sm" className="w-full">
                  Book Site Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cameras Grid with High-Res Images */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              Surveillance Lineup
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Featured CP PLUS Security Cameras
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top-selling wireless PT cameras, Starlight full-color domes, 4K PTZ speed domes, and NVRs.
            </p>
          </div>
          <Link
            to="/brands/cp-plus/products"
            className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 shrink-0"
          >
            Browse Full Catalog ({products.length} Products) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* CCTV Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              Turnkey Execution
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Turnkey CCTV Services & AMC Maintenance
            </h2>
          </div>
          <Link
            to="/brands/cp-plus/services"
            className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 shrink-0"
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

      {/* Case Studies & Real Installations */}
      {projects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Proven Track Record
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                Recent CCTV Installation Projects
              </h2>
            </div>
            <Link
              to="/brands/cp-plus/projects"
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 shrink-0"
            >
              View All Deployments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.slice(0, 2).map(proj => (
              <div
                key={proj.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="aspect-16/9 relative overflow-hidden bg-slate-100">
                  <img
                    src={proj.images[0] || '/images/cctv-hero-banner.jpg'}
                    alt={proj.title}
                    className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-xs">
                    {proj.clientType}
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <div className="text-xs text-slate-400 font-medium">
                    {proj.location} • Completed {proj.completionDate}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{proj.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                  <div className="pt-3">
                    <Link
                      to="/brands/cp-plus/projects"
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
                    >
                      Read Case Study <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quote Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-r from-sky-950 via-slate-900 to-sky-900 border border-sky-800 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-bold">
              Protect Your Property with Certified CP PLUS Surveillance
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Get an itemized equipment quote, zero-blind-spot camera layout blueprint, and certified technician installation quote.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="sky" size="lg" onClick={() => setIsQuoteOpen(true)}>
              Request Site Assessment
            </Button>
            <Link to="/brands/cp-plus/contact">
              <Button variant="outline" size="lg" className="border-sky-400/50 text-sky-200 hover:bg-sky-900/50">
                Contact CP PLUS Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="cp-plus"
        itemName="CP PLUS Surveillance Site Survey"
        itemType="quote"
      />
    </div>
  );
};
