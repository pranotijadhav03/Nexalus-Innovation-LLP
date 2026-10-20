import React, { useState } from 'react';
import {
  Truck,
  Droplets,
  IceCream,
  Milk,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ThermometerSnowflake,
  Sparkles
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { QuoteModal } from '../../../components/common/QuoteModal';

export const AmDistributorsServicesPage: React.FC = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const services = [
    {
      icon: <Clock className="w-6 h-6 text-teal-600" />,
      title: 'Daily 4:00 AM Punctual Route Delivery',
      description: 'Scheduled early morning distribution route serving retail grocery stores, dairy booths, hotels, and hospitals across Chiplun, Khed, and Guhagar before business hours.',
      features: ['Automated Route Tracking', 'Pre-dawn 4:00 AM Dispatch', 'Dedicated Experienced Drivers', 'Daily Delivery Records']
    },
    {
      icon: <ThermometerSnowflake className="w-6 h-6 text-cyan-600" />,
      title: '-18°C Cold Chain & Reefer Fleet Logistics',
      description: 'Fully insulated and compressor-chilled transport vans maintaining strict sub-zero temperatures for commercial bulk ice creams, catering tubs, and dairy items.',
      features: ['Real-Time Temperature Datalogging', 'Zero Melt Guarantee', 'Sub-Zero -18°C Deep Freeze', 'Hygienic Clean Fleet']
    },
    {
      icon: <Droplets className="w-6 h-6 text-blue-600" />,
      title: 'Institutional 20L Water Refill Subscriptions',
      description: 'Regular bulk supply of 20-litre hermetic mineral water dispenser jars for tech complexes, manufacturing plants, bank branches, and schools.',
      features: ['Automated Steam Sanitized Jars', 'Tamper-Evident Foil Caps', 'Monthly Billing Subscriptions', 'Hot & Cold Dispenser Supply']
    },
    {
      icon: <Building2 className="w-6 h-6 text-emerald-600" />,
      title: 'Depot Bulk Storage & Cold-Room Rentals',
      description: 'Centrally situated Chiplun logistics depot offering short-term and contract bulk cold-room storage for seasonal inventory and commercial caterers.',
      features: ['High-Capacity Backup Generators', 'FSSAI Certified Hygiene Audits', 'Easy Semi-Truck Loading Bays', 'Real-Time Inventory Receipts']
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-950 via-[#061e24] to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-400/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <Truck className="w-3.5 h-3.5 text-teal-300" />
            <span>Logistics &amp; Fleet • A.M. Distributors Chiplun</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Cold-Chain Logistics &amp; Distribution Services
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            From temperature-logged refrigerated transport to punctual pre-dawn wholesale deliveries, our logistics network powers retail and hospitality across Chiplun.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/80 hover:shadow-2xl hover:shadow-teal-500/15 hover:border-teal-300 hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/80 text-teal-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 shadow-xs">
                  {srv.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-950 transition-colors">{srv.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{srv.description}</p>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {srv.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="teal"
                  size="md"
                  onClick={() => setIsQuoteOpen(true)}
                  className="w-full shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all"
                >
                  Book Route Supply / Inquire
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="am-distributors"
      />
    </div>
  );
};
