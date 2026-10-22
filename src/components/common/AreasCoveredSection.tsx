import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  ShieldCheck,
  Truck,
  Wifi,
  Shield,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { ServiceArea } from '../../types';
import { subscribeToServiceAreas } from '../../firebase/services';
import { BlurZoomReveal } from './BlurZoomReveal';
import { Button } from './Button';
import { QuoteModal } from './QuoteModal';

interface AreasCoveredSectionProps {
  division?: 'corporate' | 'nexalus-innovations' | 'am-distributors';
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AreasCoveredSection: React.FC<AreasCoveredSectionProps> = ({
  division = 'corporate',
  title,
  subtitle,
  className = ''
}) => {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('Chiplun');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quotePrefillCity, setQuotePrefillCity] = useState('');

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToServiceAreas((allAreas) => {
      if (!isMounted) return;
      let filtered = allAreas;
      if (division === 'nexalus-innovations') {
        filtered = allAreas.filter(a => a.brandId === 'nexalus' || a.brandId === 'one-broadband' || a.brandId === 'all');
      } else if (division === 'am-distributors') {
        filtered = allAreas.filter(a => a.brandId === 'am-distributors' || a.brandId === 'all');
      }
      setAreas(filtered);
      setIsLoading(false);

      // Default selected city based on division if not yet set
      if (!selectedCity) {
        if (division === 'am-distributors') {
          setSelectedCity('Chiplun');
        } else if (division === 'nexalus-innovations') {
          setSelectedCity('Sangli');
        } else {
          setSelectedCity('Chiplun');
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [division, selectedCity]);

  // Unique list of covered cities
  const allCities = useMemo(() => {
    const citySet = new Set<string>();
    areas.forEach(a => {
      if (a.city) citySet.add(a.city.trim());
    });
    return Array.from(citySet);
  }, [areas]);

  // Filtered areas matching current search or selected city
  const matchedAreas = useMemo(() => {
    if (!searchTerm.trim()) {
      if (!selectedCity) return areas;
      return areas.filter(a => a.city.toLowerCase() === selectedCity.toLowerCase());
    }

    const q = searchTerm.toLowerCase().trim();
    return areas.filter(a =>
      a.city.toLowerCase().includes(q) ||
      a.locality.toLowerCase().includes(q) ||
      a.pincode.includes(q) ||
      (a.services || []).some(s => s.toLowerCase().includes(q))
    );
  }, [areas, searchTerm, selectedCity]);

  // Default header copies
  const defaultTitle =
    division === 'am-distributors'
      ? 'A.M. Distributors Chiplun — Regional Delivery & Logistics Coverage'
      : division === 'nexalus-innovations'
      ? 'Nexalus Innovations — Active Engineering & Deployment Locations'
      : 'Areas Covered & Service Availability Checker';

  const defaultSubtitle =
    division === 'am-distributors'
      ? 'Enter your city or area to verify daily morning milk routes, packaged mineral water jar delivery, and commercial bulk ice cream supply schedules.'
      : division === 'nexalus-innovations'
      ? 'Enter your city or industrial area to inspect available 4K CCTV surveillance teams, optical fiber internet connectivity, and on-site engineering SLA.'
      : 'Enter your city or PIN code to instantly inspect which services (CCTV surveillance, optical fiber leased lines, or cold-chain wholesale supplies) are operational in your area.';

  const handleBookService = (cityName: string) => {
    setQuotePrefillCity(cityName);
    setIsQuoteOpen(true);
  };

  return (
    <section
      id="areas-covered"
      className={`w-full bg-slate-950 text-white py-16 sm:py-24 border-b border-slate-800 relative overflow-hidden ${className}`}
    >
      {/* Background Lighting Gradients */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <BlurZoomReveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-400/20 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Operational Service Registry</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {title || defaultTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {subtitle || defaultSubtitle}
            </p>
          </div>
        </BlurZoomReveal>

        {/* Interactive Search Bar & Popular City Pills (Restored original style) */}
        <BlurZoomReveal direction="up" delay={80}>
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Input Container */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-cyan-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.trim()) setSelectedCity('');
                }}
                placeholder="Enter city or area (उदा. Chiplun, Ratnagiri, Sangli, Pune, Mumbai, Kolhapur)..."
                className="w-full pl-12 sm:pl-14 pr-12 py-4 bg-slate-900/90 text-white placeholder-slate-400 text-sm sm:text-base rounded-2xl border border-slate-700 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 outline-none shadow-2xl transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity(allCities[0] || 'Chiplun');
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Quick-Pick Popular City Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none text-xs">
              <span className="text-slate-400 font-semibold shrink-0 text-[11px] uppercase tracking-wider">
                Select City:
              </span>
              {allCities.map(c => {
                const isSelected =
                  (!searchTerm && selectedCity.toLowerCase() === c.toLowerCase()) ||
                  (searchTerm.toLowerCase().trim() === c.toLowerCase());
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCity(c);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30 scale-105'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </BlurZoomReveal>

        {/* RESULTS: City Selected or Searched -> Services Displayed Cleanly */}
        {matchedAreas.length > 0 ? (
          <div className="space-y-6">
            {matchedAreas.map((area, idx) => {
              const isAm = area.brandId === 'am-distributors';
              const isOperational = area.status === 'fully_operational';

              return (
                <BlurZoomReveal key={area.id || idx} direction="up" delay={idx * 60}>
                  <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
                    {/* Top Accent Stripe */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                      isAm
                        ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600'
                        : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600'
                    }`} />

                    {/* Header Row: City, Locality, Pincode & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isAm ? 'bg-teal-500/10 text-teal-400' : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {area.city}, {area.state}
                          </h3>
                          <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                            PIN: {area.pincode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium pl-10">
                          Coverage Zone: <span className="text-white font-semibold">{area.locality}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                          isOperational
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isOperational ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                          {isOperational ? 'Fully Operational' : 'Expanding Soon'}
                        </span>

                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          isAm
                            ? 'bg-teal-950/80 text-teal-300 border-teal-500/40'
                            : 'bg-blue-950/80 text-cyan-300 border-blue-500/40'
                        }`}>
                          {isAm ? 'A.M. Distributors' : 'Nexalus Innovations'}
                        </span>
                      </div>
                    </div>

                    {/* Services Grid (City Selected/Searched -> Services Displayed Clearly!) */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Active Services Available in {area.city}:</span>
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {(area.services || []).length} verified services
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(area.services && area.services.length > 0 ? area.services : [
                          'Commercial 4K CCTV Surveillance',
                          'Gigabit Optical Fiber Internet',
                          'Enterprise Office Networking'
                        ]).map((svc, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 hover:bg-slate-800 transition-all group/item"
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20 group-hover/item:scale-110 transition-transform">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover/item:text-cyan-300 transition-colors">
                                {svc}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Active in {area.locality}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational Notes & Quick Book Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>
                          {area.notes || 'Direct technician dispatch and scheduled route support active.'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant={isAm ? 'teal' : 'primary'}
                          size="sm"
                          onClick={() => handleBookService(area.city)}
                          className="font-bold text-xs shadow-md whitespace-nowrap"
                          icon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Book Service in {area.city}
                        </Button>
                      </div>
                    </div>
                  </div>
                </BlurZoomReveal>
              );
            })}
          </div>
        ) : (
          /* City NOT Found / Unserviceable area notice */
          <BlurZoomReveal direction="up" delay={50}>
            <div className="rounded-3xl bg-slate-900 border border-amber-500/40 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  या भागात सध्या थेट सेवा उपलब्ध नाही
                </h3>
                <p className="text-sm font-bold text-amber-300">
                  Service Currently Not Available in &ldquo;{searchTerm}&rdquo;
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                आम्ही संपूर्ण महाराष्ट्रात आमचे ऑप्टिकल फायबर, 4K सीसीटीव्ही नेटवर्क आणि लॉजिस्टिक्स वेगाने वाढवत आहोत. आपल्या भागात सेवा सुरू करण्यासाठी खालील बटनावर क्लिक करून मागणी नोंदवा, आमची टेक्निकल टीम तातडीने संपर्क करेल.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleBookService(searchTerm)}
                  className="font-bold shadow-lg shadow-blue-500/20"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Request Feasibility for &ldquo;{searchTerm}&rdquo;
                </Button>
              </div>
            </div>
          </BlurZoomReveal>
        )}

        {/* Directory List of All Covered Hubs at a glance (bottom corridor) */}
        <BlurZoomReveal direction="up" delay={120}>
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Maharashtra Active Network & Supply Corridor</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Operating across Chiplun, Ratnagiri, Sangli, Kolhapur, Pune, Mumbai & surrounding MIDCs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
              {allCities.map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity(city);
                  }}
                  className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                    selectedCity.toLowerCase() === city.toLowerCase() && !searchTerm
                      ? 'bg-blue-600/30 text-white border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/40 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/60'
                  }`}
                >
                  <div className="text-xs font-black truncate">{city}</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">Active Hub</div>
                </button>
              ))}
            </div>
          </div>
        </BlurZoomReveal>
      </div>

      {/* Quote / Feasibility Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => {
          setIsQuoteOpen(false);
          setQuotePrefillCity('');
        }}
        brandId={division === 'am-distributors' ? 'am-distributors' : 'nexalus'}
        itemName={quotePrefillCity ? `Feasibility Check for ${quotePrefillCity}` : 'Service Coverage Request'}
        itemType="service"
        sourcePage="/#areas-covered"
      />
    </section>
  );
};
