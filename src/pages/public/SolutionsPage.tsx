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
      <section className="bg-gradient-to-b from-blue-900/10 via-slate-50 to-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 border border-blue-200 rounded-full inline-block">
            Our Services
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
            Professional Security, Fiber & Networking Services
          </h1>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Turnkey CCTV installation, optical fiber networking, enterprise structured cabling, and 24/7 AMC maintenance delivered by certified Nexalus engineers across residential and commercial sectors.
          </p>

          {/* Quick Division Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setSelectedBrandFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedBrandFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Services ({services.length})
            </button>
            <button
              onClick={() => setSelectedBrandFilter('cp-plus')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedBrandFilter === 'cp-plus'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-sky-500" />
              CCTV Surveillance Services
            </button>
            <button
              onClick={() => setSelectedBrandFilter('one-broadband')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedBrandFilter === 'one-broadband'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-blue-500" />
              Fiber Internet Services
            </button>
            <button
              onClick={() => setSelectedBrandFilter('itti-networking')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedBrandFilter === 'itti-networking'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-indigo-500" />
              Enterprise Networking &amp; AMC
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
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
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
      </section>

      {/* Visual Infrastructure Demonstration Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
