import React, { useState } from 'react';
import { Service } from '../../types';
import { Button } from '../common/Button';
import { QuoteModal } from '../common/QuoteModal';
import { BrandBadge } from '../common/BrandBadge';
import {
  ShieldCheck,
  Wrench,
  Cpu,
  Wifi,
  Network,
  Server,
  Building2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
      case 'Wrench': return <Wrench className="w-6 h-6" />;
      case 'Cpu': return <Cpu className="w-6 h-6" />;
      case 'Wifi': return <Wifi className="w-6 h-6" />;
      case 'Network': return <Network className="w-6 h-6" />;
      case 'Server': return <Server className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  const isAm = service.brandId === 'am-distributors';

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between group hover:-translate-y-1">
        <div>
          {/* Top Bar with Icon and Brand Badge */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                isAm
                  ? 'bg-teal-50 text-teal-600 border border-teal-100'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
              }`}
            >
              {getIcon(service.iconName)}
            </div>
            <BrandBadge brandId={service.brandId} size="sm" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
            {service.title}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {service.shortDescription}
          </p>

          {/* Target Audience Pills */}
          {service.targetAudience.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {service.targetAudience.map((audience, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                >
                  {audience}
                </span>
              ))}
            </div>
          )}

          {/* Key Deliverables Bullet Points */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Service Highlights
            </div>
            {service.features.slice(0, 3).map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <Button
            variant={isAm ? 'teal' : 'primary'}
            size="sm"
            className="w-full text-xs font-semibold"
            onClick={() => setIsQuoteOpen(true)}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Enquire for This Service
          </Button>
        </div>
      </div>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId={service.brandId === 'nexalus' ? 'general' : service.brandId}
        itemName={service.title}
        itemType="service"
      />
    </>
  );
};
