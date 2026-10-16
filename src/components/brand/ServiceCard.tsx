import React, { useState } from 'react';
import { Service } from '../../types';
import { Button } from '../common/Button';
import { QuoteModal } from '../common/QuoteModal';
import {
  ShieldCheck,
  Wrench,
  Cpu,
  Wifi,
  Network,
  Server,
  Building2,
  CheckCircle2,
  ArrowRight,
  MessageCircle
} from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  variant?: 'light' | 'dark';
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, variant = 'light' }) => {
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
  const isDark = variant === 'dark';

  return (
    <>
      <div
        className={`rounded-2xl border transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between group hover:-translate-y-1 ${
          isDark
            ? 'bg-slate-900/95 text-white border-slate-800 hover:border-cyan-400/60 shadow-xl shadow-slate-950/50 hover:shadow-cyan-500/10'
            : 'bg-white text-slate-900 border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300'
        }`}
      >
        <div>
          {/* Top Bar with Icon */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                isDark
                  ? 'bg-blue-950/80 text-cyan-400 border border-blue-800/80 shadow-md shadow-blue-950/50'
                  : isAm
                  ? 'bg-teal-50 text-teal-600 border border-teal-100'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
              }`}
            >
              {getIcon(service.iconName)}
            </div>
          </div>

          <div className="mb-1.5">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-cyan-400' : 'text-blue-600'
              }`}
            >
              Nexalus Innovations LLP
            </span>
          </div>

          <h3
            className={`text-lg font-bold leading-snug transition-colors ${
              isDark ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-blue-600'
            }`}
          >
            {service.title}
          </h3>
          <p
            className={`text-xs mt-2 leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {service.shortDescription}
          </p>

          {/* Key Deliverables Bullet Points */}
          <div
            className={`mt-5 pt-4 space-y-2 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}
          >
            <div
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Service Highlights
            </div>
            {service.features.slice(0, 3).map((feat, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 text-xs ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    isDark ? 'text-cyan-400' : 'text-blue-500'
                  }`}
                />
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`mt-6 pt-5 border-t ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <Button
            variant={isDark ? 'primary' : isAm ? 'teal' : 'primary'}
            size="sm"
            className={`w-full text-xs font-semibold justify-center ${
              isDark ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 font-bold' : ''
            }`}
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
        websiteId={
          service.brandId === 'am-distributors'
            ? 'am-distributors'
            : service.brandId === 'nexalus-innovations'
            ? 'nexalus-innovations'
            : 'corporate'
        }
        websiteName={
          service.brandId === 'am-distributors'
            ? 'A.M. Distributors Chiplun'
            : service.brandId === 'nexalus-innovations'
            ? 'Nexalus Innovations'
            : 'Nexalus Innovations LLP'
        }
        sourcePage={`Service Card: ${service.title}`}
        itemName={service.title}
        itemType="service"
      />
    </>
  );
};
