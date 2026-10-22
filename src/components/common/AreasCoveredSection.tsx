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
import { getServiceAreas, subscribeToServiceAreas } from '../../firebase/services';
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
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [division]);

  // Unique list of covered cities
  const allCities = useMemo(() => {
    const citySet = new Set<string>();
    areas.forEach(a => {
      if (a.city) citySet.add(a.city.trim());
    });
    return Array.from(citySet);
  }, [areas]);

  // Filtered areas matching current search
  const matchedAreas = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return [];

    return areas.filter(a =>
      a.city.toLowerCase().includes(q) ||
      a.locality.toLowerCase().includes(q) ||
      a.pincode.includes(q) ||
      (a.services || []).some(s => s.toLowerCase().includes(q))
    );
  }, [areas, searchTerm]);

  // Default header copies
  const defaultTitle =
    division === 'am-distributors'
      ? 'A.M. Distributors Chiplun — Regional Delivery & Logistics Coverage'
      : division === 'nexalus-innovations'
      ? 'Nexalus Innovations — Active Engineering & Deployment Locations'
      : 'Areas Covered & Service Availability Checker';

  const defaultSubtitle =
    division === 'am-distributors'
      ? 'Type your city or area to verify daily morning milk routes, packaged mineral water jar delivery, and commercial bulk ice cream supply schedules.'
      : division === 'nexalus-innovations'
      ? 'Type your city or industrial area to inspect available 4K CCTV surveillance teams, optical fiber internet connectivity, and on-site engineering SLA.'
      : 'Type your city name or PIN code to instantly check which services (CCTV surveillance, optical fiber leased lines, or cold-chain wholesale supplies) are active in your area.';

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

        {/* Dynamic City Search Bar */}
        <BlurZoomReveal direction="up" delay={80}>
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-cyan-400" />
              </div>
              <input
                type="text"
                list="covered-cities-list"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Type your city name (उदा. Chiplun, Ratnagiri, Sangli, Khed, Pune, Mumbai, Kolhapur, Satara)..."
                className="w-full pl-12 sm:pl-14 pr-12 py-4 bg-slate-900/90 text-white placeholder-slate-400 text-sm sm:text-base rounded-2xl border border-slate-700 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 outline-none shadow-2xl transition-all"
              />
              <datalist id="covered-cities-list">
                {allCities.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Quick Suggestions / Available Hubs Text */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
              <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Covered Hubs:</span>
              {allCities.slice(0, 7).map((c, i) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSearchTerm(c)}
                  className="hover:text-cyan-300 underline underline-offset-4 decoration-slate-700 hover:decoration-cyan-400 transition-colors cursor-pointer text-slate-300 font-medium"
                >
                  {c}{i < Math.min(allCities.length - 1, 6) ? ' •' : ''}
                </button>
              ))}
            </div>
          </div>
        </BlurZoomReveal>

        {/* SEARCH RESULTS */}
        {searchTerm.trim() ? (
          matchedAreas.length > 0 ? (
            /* City Serviced -> Display services */
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm font-bold max-w-2xl mx-auto justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  ✓ Verified: Services are currently active in &ldquo;{searchTerm}&rdquo;
                </span>
              </div>

              {matchedAreas.map((area, idx) => {
                const isAm = area.brandId === 'am-distributors';
                return (
                  <BlurZoomReveal key={area.id || idx} direction="up" delay={idx * 60}>
                    <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                        isAm
                          ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600'
                          : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600'
                      }`} />

                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isAm ? 'bg-teal-500/10 text-teal-400' : 'bg-cyan-500/10 text-cyan-400'
                            }`}>
                              <Building2 className="w-4 h-4" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white">
                              {area.city} <span className="text-slate-400 font-semibold text-sm">({area.locality})</span>
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            PIN: {area.pincode} • State: {area.state}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Fully Operational</span>
                          </span>
                        </div>
                      </div>

                      {/* Services Available in this City */}
                      <div className="space-y-3">
                        <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Services Provided in {area.city}:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(area.services || []).map((service, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70 flex items-start gap-3 hover:border-cyan-400/50 transition-colors"
                            >
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white leading-tight">
                                  {service}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Same-day survey &amp; fast setup SLA
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer: Action */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>Local engineering dispatched directly from regional hub</span>
                        </div>

                        <Button
                          variant={isAm ? 'teal' : 'primary'}
                          size="md"
                          onClick={() => handleBookService(area.city)}
                          className="font-bold text-xs shadow-md whitespace-nowrap w-full sm:w-auto"
                          icon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Book Service in {area.city}
                        </Button>
                      </div>
                    </div>
                  </BlurZoomReveal>
                );
              })}
            </div>
          ) : (
            /* City NOT Serviced -> Display Warning */
            <BlurZoomReveal direction="up" delay={50}>
              <div className="rounded-3xl bg-slate-900/90 border border-amber-500/40 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-2xl animate-fadeIn">
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
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  आम्ही संपूर्ण महाराष्ट्रात आमचे ऑप्टिकल फायबर, 4K सीसीटीव्ही नेटवर्क आणि लॉजिस्टिक्स वेगाने वाढवत आहोत. आपल्या भागात सेवा सुरू करण्यासाठी खालील फॉर्मद्वारे मागणी नोंदवा, आमची टेक्निकल टीम तातडीने संपर्क करेल.
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
          )
        ) : (
          /* Empty search input -> Show directory of covered hubs */
          <BlurZoomReveal direction="up" delay={100}>
            <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    <span>Active Maharashtra Service Corridor Directory</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Type your city name above to check individual locality feasibility or click below to inspect.
                  </p>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 self-start sm:self-auto">
                  {allCities.length} Active Cities
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {allCities.map(city => {
                  const cityAreas = areas.filter(a => a.city.toLowerCase() === city.toLowerCase());
                  const services = Array.from(new Set(cityAreas.flatMap(a => a.services || [])));

                  return (
                    <div
                      key={city}
                      onClick={() => setSearchTerm(city)}
                      className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-cyan-400 transition-all cursor-pointer group space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                          {city}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {services.slice(0, 3).join(', ')}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3 h-3" /> Click to check coverage
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </BlurZoomReveal>
        )}
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
