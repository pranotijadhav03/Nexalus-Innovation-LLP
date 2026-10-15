import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { Button } from '../../../components/common/Button';
import { QuoteModal } from '../../../components/common/QuoteModal';
import {
  Shield,
  Award,
  CheckCircle2,
  Eye,
  Cpu,
  Video,
  Wrench,
  Users,
  Building2,
  Lock,
  ArrowRight,
  PhoneCall
} from 'lucide-react';

export const CpPlusAboutPage: React.FC = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="space-y-16 pb-20">
      <BrandHeader
        brandId="cp-plus"
        title="About CP PLUS Division — Nexalus Innovations LLP"
        subtitle="Certified surveillance engineering, genuine CP PLUS hardware supply, and enterprise electronic security installations across residential, corporate, and industrial sectors."
        breadcrumbs={[{ label: 'About CP PLUS' }]}
      />

      {/* Hero Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold tracking-wide uppercase">
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              Official CP PLUS Installation Partner
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Leading the Standard in Electronic Security & Intelligent Surveillance
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Operating under the corporate aegis of <strong>Nexalus Innovations LLP</strong>, our CP PLUS division is dedicated to engineering comprehensive, foolproof video surveillance architectures. From single residential properties to massive distributed manufacturing plants, our certified technicians ensure every critical inch is watched and safeguarded.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We do not merely supply CCTV cameras off-the-shelf; we conduct in-depth spatial sight-line analyses, optical focal-length assessments, and network bandwidth calculations to deliver zero-blind-spot coverage that stands up to forensic scrutiny.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button
                variant="sky"
                size="md"
                onClick={() => setIsQuoteOpen(true)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Schedule Free Site Survey
              </Button>
              <Link to="/brands/cp-plus/products">
                <Button variant="outline" size="md">
                  View Camera Catalog
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group">
              <img
                src="/images/cctv-hero-banner.jpg"
                alt="CP PLUS Security Surveillance Command"
                className="w-full h-[380px] sm:h-[420px] object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-6 sm:p-8">
                <div className="text-white space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">
                    Forensic Surveillance Grade
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold">
                    Guaranteed 24/7 Optical Clarity & Threat Detection
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars Grid */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Why Nexalus CP PLUS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Our Surveillance Engineering Standards
            </h2>
            <p className="text-sm text-slate-400">
              Every installation follows rigid aerospace-grade electrical safety, weatherproof sealing, and optimized data throughput guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">100% Genuine CP PLUS</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct authorized sourcing with full manufacturer holographic seal and replacement warranty coverage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Intelligent Edge AI</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deep learning target classification that filters out false alarms from animals, shadows, and rain.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Zero Blind-Spot Layout</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Precision optical focal lengths calibrated to guarantee overlapping fields of vision across entryways and corridors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Proactive AMC & SLA</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scheduled lens cleaning, HDD health diagnostics, firmware patching, and rapid technician dispatch within hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Turnkey Deployment Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
            Precision Execution
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Our 5-Step Deployment Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            How we ensure every CP PLUS CCTV deployment is flawless from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'On-Site Survey',
              desc: 'Physical architectural audit of perimeters, lighting conditions, and cabling conduits.'
            },
            {
              step: '02',
              title: 'System Design',
              desc: 'Selection of optimal focal length, NVR decoding capacity, and PoE power budget calculations.'
            },
            {
              step: '03',
              title: 'Structured Cabling',
              desc: 'Pure copper Cat6 STP cabling inside rigid PVC conduits with surge-protected terminations.'
            },
            {
              step: '04',
              title: 'Camera Calibration',
              desc: 'Positioning, angle focusing, AI motion tripwires, and mobile cloud app pairing.'
            },
            {
              step: '05',
              title: 'Testing & AMC',
              desc: 'Full forensic recording tests, customer handover training, and AMC enrollment.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative"
            >
              <span className="text-2xl font-black text-sky-600/30 font-mono block mb-2">
                {item.step}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Credentials Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-br from-sky-900 via-sky-950 to-slate-950 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
              Direct Security Hotline
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Ready to Upgrade Your Surveillance Infrastructure?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Speak directly with a senior surveillance consultant from Nexalus Innovations LLP. We provide free property blueprints, equipment itemization, and transparent pricing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              variant="sky"
              size="lg"
              onClick={() => setIsQuoteOpen(true)}
            >
              Request Free Estimate
            </Button>
            <Link to="/brands/cp-plus/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-sky-500/40 text-sky-200 hover:bg-sky-900/40"
              >
                Contact Security Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="cp-plus"
        itemName="CP PLUS Surveillance Installation & AMC"
        itemType="service"
      />
    </div>
  );
};
