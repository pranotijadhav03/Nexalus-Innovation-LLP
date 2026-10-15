import React from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/common/Button';

export const NexalusInnovationsAboutPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-900/60 text-sky-400 text-xs font-semibold border border-blue-700/50">
            <Cpu className="w-3.5 h-3.5" />
            <span>Division Profile • Nexalus Innovations LLP</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            About Nexalus Innovations
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Maharashtra's certified systems integrator for commercial 4K AI video surveillance, high-speed optical fiber leased lines, and Layer-2/3 managed networking.
          </p>
        </div>
      </section>

      {/* Engineering Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
              Engineering Excellence
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Single-Window Accountability for Surveillance &amp; Optical Networks
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Founded under the corporate umbrella of <strong>Nexalus Innovations LLP</strong>, Nexalus Innovations bridges the critical gap between video surveillance hardware distribution and telecommunications network engineering.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Organizations typically face severe friction when internet downtime impairs surveillance footage or when camera streams choke network bandwidth. Nexalus Innovations eliminates this multi-vendor conflict by engineering the optical fiber backhaul and the video security system under a single unified Service Level Agreement (SLA).
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/brands/nexalus-innovations/products">
                <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  Explore Hardware Catalog
                </Button>
              </Link>
              <Link to="/brands/nexalus-innovations/contact">
                <Button variant="outline" size="md">
                  Contact Technical Desk
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="/images/projects/nexalus-innovations-division.jpg"
                alt="Nexalus Innovations Commercial Technology Facility"
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Standards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Certified Benchmarks
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Technical Benchmarks &amp; Splicing Standards
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
    </div>
  );
};
