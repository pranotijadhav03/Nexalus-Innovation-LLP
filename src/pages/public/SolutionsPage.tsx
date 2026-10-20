import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Shield, Wifi, Building2, Server, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
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
      {/* Header (Nexalus Dark Tech Brand Theme) */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        {/* Subtle background tech accents */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Our Services • Nexalus Solutions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Professional Security, Fiber &amp; Networking Services
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Turnkey CCTV installation, optical fiber networking, enterprise structured cabling, and 24/7 AMC maintenance delivered by certified Nexalus engineers across residential and commercial sectors.
          </p>

          {/* Quick Division Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
            <button
              onClick={() => setSelectedBrandFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedBrandFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/35 border border-blue-500 -translate-y-0.5'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/90 hover:shadow-md hover:border-slate-600 hover:-translate-y-0.5 border border-slate-700/80 backdrop-blur-sm'
              }`}
            >
              All Services ({services.length})
            </button>
            <button
              onClick={() => setSelectedBrandFilter('cp-plus')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedBrandFilter === 'cp-plus'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/35 border border-sky-500 -translate-y-0.5'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/90 hover:shadow-md hover:border-sky-500/50 hover:-translate-y-0.5 border border-slate-700/80 backdrop-blur-sm'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>CCTV Surveillance Services</span>
            </button>
            <button
              onClick={() => setSelectedBrandFilter('one-broadband')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedBrandFilter === 'one-broadband'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/35 border border-blue-500 -translate-y-0.5'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/90 hover:shadow-md hover:border-blue-500/50 hover:-translate-y-0.5 border border-slate-700/80 backdrop-blur-sm'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-blue-400" />
              <span>Fiber Internet Services</span>
            </button>
            <button
              onClick={() => setSelectedBrandFilter('itti-networking')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedBrandFilter === 'itti-networking'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35 border border-indigo-500 -translate-y-0.5'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/90 hover:shadow-md hover:border-indigo-500/50 hover:-translate-y-0.5 border border-slate-700/80 backdrop-blur-sm'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enterprise Networking &amp; AMC</span>
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid (Customer-Focused Service Display) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="w-full sm:w-auto justify-center"
          >
            Request Custom Quotation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map(srv => (
            <ServiceCard key={srv.id} service={srv} />
          ))}
        </div>
      </section>

      {/* Featured Architecture Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 sm:p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/80 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Why Integrated Deployment?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Surveillance and Broadband are Naturally Symbiotic
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Modern CCTV cameras don't just record locally — they stream 4K video to mobile phones, sync footage to cloud vaults, and run off-site video analytics. Without a high-speed, uncontended fiber internet connection, remote surveillance lags and buffers.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
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
                className="shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
              >
                Request an Integrated Proposal
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-xl hover:shadow-blue-500/15 hover:border-blue-400 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 space-y-2 relative overflow-hidden group/item">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover/item:scale-110 transition-transform">
                IT
              </div>
              <h4 className="font-bold text-sm text-slate-900">Dedicated Leased Circuits</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                1:1 symmetrical bandwidth with zero jitter for cloud services and IP video streaming.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-xl hover:shadow-sky-500/15 hover:border-sky-400 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 space-y-2 relative overflow-hidden group/item">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-400" />
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover/item:scale-110 transition-transform">
                SEC
              </div>
              <h4 className="font-bold text-sm text-slate-900">Perimeter Intrusion Defense</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Intelligent tripwire, human detection, and number plate logging at all entry barriers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-xl hover:shadow-indigo-500/15 hover:border-indigo-400 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 space-y-2 relative overflow-hidden group/item">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-blue-500" />
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover/item:scale-110 transition-transform">
                LAN
              </div>
              <h4 className="font-bold text-sm text-slate-900">Campus-Wide Wi-Fi</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-AP wireless controller setup with seamless roaming for guests and employees.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-xl hover:shadow-amber-500/15 hover:border-amber-400 hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 space-y-2 relative overflow-hidden group/item">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover/item:scale-110 transition-transform">
                AMC
              </div>
              <h4 className="font-bold text-sm text-slate-900">Preventive Maintenance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quarterly lens cleaning, fiber signal checks, storage audits, and fast repair dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Infrastructure Demonstration Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/80 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-1.5 transition-all duration-300 bg-white group">
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

          <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/80 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-1.5 transition-all duration-300 bg-white group">
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
