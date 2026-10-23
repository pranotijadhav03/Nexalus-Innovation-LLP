import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Shield, Wifi, Building2, Server, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ServiceCard } from '../../components/brand/ServiceCard';
import { QuoteModal } from '../../components/common/QuoteModal';
import { getServices } from '../../firebase/services';
import { Service } from '../../types';

export const SolutionsPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<'all' | 'cp-plus' | 'one-broadband' | 'itti-networking'>('all');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('Integrated IT & Security');

  useEffect(() => {
    async function load() {
      const data = await getServices(undefined, true);
      setServices(data);
    }
    load();
  }, []);

  const filteredServices = selectedBrandFilter === 'all'
    ? services
    : services.filter(s => s.brandId === selectedBrandFilter);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-20 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-black text-cyan-300 uppercase tracking-widest px-3.5 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full inline-block">
            Our Services
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
            Professional Security, Fiber &amp; Networking Services
          </h1>
          <p className="text-base text-slate-300 mt-4 leading-relaxed font-normal">
            Turnkey CCTV installation, optical fiber networking, enterprise structured cabling, and 24/7 AMC maintenance delivered by certified Nexalus engineers across residential and commercial sectors.
          </p>

          {/* Quick Division Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setSelectedBrandFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedBrandFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
            >
              All Services ({services.length})
            </button>
            <button
              onClick={() => setSelectedBrandFilter('cp-plus')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedBrandFilter === 'cp-plus'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              CCTV Surveillance Services
            </button>
            <button
              onClick={() => setSelectedBrandFilter('one-broadband')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedBrandFilter === 'one-broadband'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-teal-400" />
              Fiber Internet Services
            </button>
            <button
              onClick={() => setSelectedBrandFilter('itti-networking')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedBrandFilter === 'itti-networking'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Enterprise Networking &amp; AMC
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid (WHITE THEME) */}
      <section className="w-full bg-white py-14 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
              Service Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Available Engineering & Field Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a service below to request custom site survey or installation pricing.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedService('Custom Turnkey Infrastructure');
              setIsQuoteModalOpen(true);
            }}
          >
            Request Custom Quotation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map(srv => (
            <ServiceCard key={srv.id} service={srv} />
          ))}
        </div>
        </div>
      </section>

      {/* Featured Architecture Overview (RICH CORPORATE BLUE THEME) */}
      <section className="w-full bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] text-white py-14 sm:py-20 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0c1c38]/90 border border-blue-900/50 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Why Integrated Deployment?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              Surveillance and Broadband are Naturally Symbiotic
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
                Modern CCTV cameras don't just record locally — they stream 4K video to mobile phones, sync footage to cloud vaults, and run off-site video analytics. Without a high-speed, uncontended fiber internet connection, remote surveillance lags and buffers.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
                Nexalus Innovations LLP optimizes bandwidth allocation between business internet and video streams, builds redundant power backup racks, and maintains everything under a single Annual Maintenance Contract.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedService('Turnkey IT & Security Architecture');
                  setIsQuoteModalOpen(true);
                }}
              >
                Request an Integrated Proposal
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                IT
              </div>
              <h4 className="font-bold text-sm text-slate-900">Dedicated Leased Circuits</h4>
              <p className="text-xs text-slate-600">
                1:1 symmetrical bandwidth with zero jitter for cloud services and IP video streaming.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                SEC
              </div>
              <h4 className="font-bold text-sm text-slate-900">Perimeter Intrusion Defense</h4>
              <p className="text-xs text-slate-600">
                Intelligent tripwire, human detection, and number plate logging at all entry barriers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                LAN
              </div>
              <h4 className="font-bold text-sm text-slate-900">Campus-Wide Wi-Fi</h4>
              <p className="text-xs text-slate-600">
                Multi-AP wireless controller setup with seamless roaming for guests and employees.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                AMC
              </div>
              <h4 className="font-bold text-sm text-slate-900">Preventive Maintenance</h4>
              <p className="text-xs text-slate-600">
                Quarterly lens cleaning, fiber signal checks, storage audits, and fast repair dispatch.
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Visual Infrastructure Demonstration Cards (WHITE THEME) */}
      <section className="w-full bg-white py-14 sm:py-20 border-b border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white group">
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              <img
                src="/images/cctv-control-room.jpg"
                alt="Security Operations Control Center"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-600">
                  Surveillance Command
                </span>
                <h3 className="text-lg font-bold">24/7 Central Operations Control Center</h3>
                <p className="text-xs text-slate-300">
                  Real-time multi-display video wall monitoring and automated threat notifications.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white group">
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              <img
                src="/images/fiber-technician.jpg"
                alt="Optical Fiber Splicing & Engineering"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600">
                  Optical Backbone
                </span>
                <h3 className="text-lg font-bold">Precision Fiber Splicing & Testing</h3>
                <p className="text-xs text-slate-300">
                  Certified OTDR testing, low-loss fusion splicing, and rugged outdoor conduits.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        brandId="general"
        itemName={selectedService}
        itemType="service"
      />
    </div>
  );
};
