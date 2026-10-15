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
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/common/Button';

export const AmDistributorsAboutPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-900/60 text-teal-400 text-xs font-semibold border border-teal-700/50">
            <Truck className="w-3.5 h-3.5" />
            <span>Depot Profile • Nexalus Innovations LLP</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            About A.M. Distributors Chiplun
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
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
                <Button variant="outline" size="md">
                  Contact Chiplun Depot
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="/images/projects/am-distributors-chiplun.jpg"
                alt="A.M. Distributors Chiplun Regional Logistics Hub"
                className="w-full h-96 object-cover"
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
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">4:00 AM Scheduled Route</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Punctual doorstep delivery before morning market opening across Chiplun, Khed, and Guhagar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Automated Sanitization</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every 20L mineral water jar undergoes high-pressure hot water internal rinsing and tamper-proof sealed caps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <IceCream className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">-18°C Continuous Cold Chain</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Insulated reefer vans ensure ice creams and gourmet cones arrive in perfect frozen condition with zero melting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">FSSAI Certified</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% compliant food-grade handling, temperature logging, and genuine manufacturer stock guarantees.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
