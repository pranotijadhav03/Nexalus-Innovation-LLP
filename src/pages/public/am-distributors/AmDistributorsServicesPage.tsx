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
  ThermometerSnowflake
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
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-900/60 text-teal-400 text-xs font-semibold border border-teal-700/50">
            <Truck className="w-3.5 h-3.5" />
            <span>Logistics &amp; Fleet • A.M. Distributors Chiplun</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Cold-Chain Logistics &amp; Distribution Services
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
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
              className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-teal-300 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                  {srv.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{srv.title}</h3>
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
                  className="w-full"
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
