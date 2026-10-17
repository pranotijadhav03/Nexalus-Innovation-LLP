import React, { useState } from 'react';
import {
  Cpu,
  Shield,
  Wifi,
  Server,
  Wrench,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { QuoteModal } from '../../../components/common/QuoteModal';

export const NexalusInnovationsServicesPage: React.FC = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const services = [
    {
      icon: <Shield className="w-6 h-6 text-sky-600" />,
      title: 'Turnkey 4K Commercial CCTV Installation',
      description: 'End-to-end commercial surveillance deployment including camera positioning analysis, PoE switch cabling, NVR rack setup, and remote view mobile configuration.',
      features: ['Starlight Color Night Vision', 'Perimeter Tripwire & Vehicle ANPR', 'Redundant NVR Storage', 'Fluke Tested PoE Drops']
    },
    {
      icon: <Wifi className="w-6 h-6 text-teal-600" />,
      title: 'Optical Fiber Splicing & Leased Lines',
      description: 'Dedicated high-speed symmetrical fiber connections, core-alignment fusion splicing, OTDR loss certification, and multi-building optical backhaul rings.',
      features: ['Symmetrical 1:1 Bandwidth', 'OTDR Loss Reports under 0.02dB', 'Armored Outdoor Fiber Routing', 'Dual-Ring Redundancy']
    },
    {
      icon: <Server className="w-6 h-6 text-indigo-600" />,
      title: 'Enterprise Switching & Structured Cabling',
      description: 'Layer-2 and Layer-3 managed PoE+ networking switches, 42U server rack consolidation, patch panel termination, and VLAN segmentation.',
      features: ['370W High-Budget PoE+ Ports', '10G SFP+ Optical Uplinks', 'Isolated Surveillance VLANs', 'Fire-Retardant Cable Trays']
    },
    {
      icon: <Wrench className="w-6 h-6 text-amber-600" />,
      title: 'Comprehensive CCTV & Network AMC Maintenance',
      description: 'Preventive quarterly maintenance contracts covering lens cleaning, power supply diagnostics, cable loop tests, and guaranteed 2-hour emergency restoration.',
      features: ['Quarterly Lens & Dome Polishing', 'NVR Health & HDD Smart Testing', 'Guaranteed Restoration SLA', 'Standby Spare Units Provided']
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-900/60 text-sky-400 text-xs font-semibold border border-blue-700/50">
            <Cpu className="w-3.5 h-3.5" />
            <span>Engineering &amp; Support • Nexalus Innovations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Engineering Services &amp; AMC
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            From precision fusion splicing to enterprise server racks and comprehensive quarterly maintenance, our certified technicians ensure zero downtime.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between space-y-6"
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
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsQuoteOpen(true)}
                  className="w-full"
                >
                  Book Site Audit / Proposal
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="nexalus-innovations"
      />
    </div>
  );
};
