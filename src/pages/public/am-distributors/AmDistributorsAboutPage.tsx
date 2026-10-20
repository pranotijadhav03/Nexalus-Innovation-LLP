import React from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Droplets,
  IceCream,
  Milk,
  CheckCircle2,
  Award,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '../../../components/common/Button';

export const AmDistributorsAboutPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-950 via-[#061e24] to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-400/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <Truck className="w-3.5 h-3.5 text-teal-300" />
            <span>Depot Profile • Nexalus Innovations LLP</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            About A.M. Distributors Chiplun
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Chiplun's dependable regional logistics hub managing temperature-controlled cold-room storage, refrigerated fleet distribution, and daily early morning wholesale supply.
          </p>
        </div>
      </section>

      {/* Warehouse & Cold-Chain Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest">
              Regional Supply Powerhouse
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Punctual Logistics Across Chiplun, Khed &amp; Konkan Industrial Belt
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Operating under <strong>Nexalus Innovations LLP</strong>, A.M. Distributors was established to fulfill the urgent demand for reliable, temperature-certified FMCG and cold-chain distribution across Chiplun and surrounding Konkan areas.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our central depot commands modern deep-freeze cold rooms for commercial ice cream storage (-18°C), automated high-pressure steam-sanitized jar washing for packaged mineral water (20L), and refrigerated early morning routes that dispatch every day at 4:00 AM without fail.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/brands/am-distributors/products">
                <Button variant="teal" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Wholesale Catalog
                </Button>
              </Link>
              <Link to="/brands/am-distributors/contact">
                <Button variant="outline" size="md" className="border-teal-600 text-teal-700 hover:bg-teal-50">
                  Contact Chiplun Depot
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-xl shadow-slate-200/80 hover:shadow-2xl hover:shadow-teal-500/10 border border-slate-200 transition-all duration-300 group">
              <img
                src="/images/projects/am-distributors-chiplun.jpg"
                alt="A.M. Distributors Chiplun Regional Logistics Hub"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Standards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold text-teal-600 uppercase tracking-widest">
            Distribution Assurances
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Retailers &amp; Institutions Partner with A.M. Distributors
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-teal-500/20 hover:border-teal-300 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-400" />
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100/80 shadow-xs group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-teal-950 transition-colors">
                4:00 AM Scheduled Route
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Punctual doorstep delivery before morning market opening across Chiplun, Khed, and Guhagar.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-300 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shadow-xs group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-blue-950 transition-colors">
                Automated Sanitization
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Every 20L mineral water jar undergoes high-pressure hot water internal rinsing and tamper-proof sealed caps.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-300 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-sky-400" />
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100/80 shadow-xs group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300">
              <IceCream className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-cyan-950 transition-colors">
                -18°C Continuous Cold Chain
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Insulated reefer vans ensure ice creams and gourmet cones arrive in perfect frozen condition with zero melting.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-300 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shadow-xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-emerald-950 transition-colors">
                FSSAI Certified
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                100% compliant food-grade handling, temperature logging, and genuine manufacturer stock guarantees.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
