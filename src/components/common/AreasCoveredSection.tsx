import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  ArrowRight,
  AlertTriangle,
  X,
  Compass
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
  theme?: 'light' | 'dark';
}

export const AreasCoveredSection: React.FC<AreasCoveredSectionProps> = ({
  division = 'corporate',
  title,
  subtitle,
  className = '',
  theme = 'dark'
}) => {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedCity, setSearchedCity] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quotePrefillCity, setQuotePrefillCity] = useState('');

  const searchContainerRef = useRef<HTMLDivElement>(null);

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
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [division]);

  // Close suggestions when clicking outside search bar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Distinct list of covered cities from Firestore
  const allCities = useMemo(() => {
    const citySet = new Set<string>();
    areas.forEach(a => {
      if (a.city) citySet.add(a.city.trim());
    });
    return Array.from(citySet);
  }, [areas]);

  // Google-style autocomplete suggestions as user types
  const suggestions = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return [];
    return allCities.filter(c => c.toLowerCase().includes(q));
  }, [allCities, searchTerm]);

  // Trigger search execution
  const executeSearch = (target?: string) => {
    const q = (target !== undefined ? target : searchTerm).trim();
    if (!q) return;
    setSearchedCity(q);
    setSearchTerm(q);
    setHasSearched(true);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchedCity('');
    setHasSearched(false);
    setShowSuggestions(false);
  };

  // Find areas matching the searched city
  const matchedAreas = useMemo(() => {
    if (!hasSearched || !searchedCity) return [];
    const q = searchedCity.toLowerCase().trim();
    return areas.filter(a =>
      a.city.toLowerCase().includes(q) ||
      a.locality.toLowerCase().includes(q) ||
      a.pincode.includes(q)
    );
  }, [areas, searchedCity, hasSearched]);

  const defaultTitle =
    division === 'am-distributors'
      ? 'A.M. Distributors Chiplun — Regional Delivery & Logistics Coverage'
      : division === 'nexalus-innovations'
      ? 'Nexalus Innovations — Active Engineering & Deployment Locations'
      : 'Areas Covered & Service Availability Checker';

  const defaultSubtitle =
    division === 'am-distributors'
      ? 'Search your city or industrial zone to verify daily morning milk routes, packaged mineral water jar delivery, and commercial bulk ice cream supply schedules.'
      : division === 'nexalus-innovations'
      ? 'Search your city or industrial area to inspect available 4K CCTV surveillance teams, optical fiber internet connectivity, and on-site engineering SLA.'
      : 'Type your city name or PIN code to instantly inspect which services (CCTV surveillance, optical fiber leased lines, or cold-chain wholesale supplies) are operational in your area.';

  const handleBookService = (cityName: string) => {
    setQuotePrefillCity(cityName);
    setIsQuoteOpen(true);
  };

  const isLight = theme === 'light';

  return (
    <section
      id="areas-covered"
      className={`w-full ${isLight ? 'bg-slate-50/90 text-slate-900 border-b border-slate-200/90' : 'bg-slate-950 text-white border-b border-slate-800'} py-16 sm:py-24 relative overflow-hidden ${className}`}
    >
      {/* Background Lighting Gradients */}
      {!isLight && (
        <>
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Section Header */}
        <BlurZoomReveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLight
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-blue-500/10 text-cyan-300 border border-blue-400/20'
            }`}>
              <Compass className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              <span>Service Coverage Search</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {title || defaultTitle}
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {subtitle || defaultSubtitle}
            </p>
          </div>
        </BlurZoomReveal>

        {/* Google-Style Search Interface */}
        <BlurZoomReveal direction="up" delay={80}>
          <div ref={searchContainerRef} className="max-w-2xl mx-auto relative">
            <div className={`relative flex items-center ${
              isLight
                ? 'bg-white border-2 border-slate-300 focus-within:border-blue-600 shadow-xl'
                : 'bg-slate-900/95 border-2 border-slate-700 focus-within:border-cyan-400 shadow-2xl'
            } rounded-full transition-all p-1.5 pl-5 sm:pl-6 focus-within:ring-4 ${
              isLight ? 'focus-within:ring-blue-500/20' : 'focus-within:ring-cyan-500/20'
            }`}>
              <Search className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'} shrink-0 pointer-events-none`} />

              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value.trim()) {
                    setHasSearched(false);
                    setSearchedCity('');
                  }
                }}
                onFocus={() => {
                  if (searchTerm.trim()) setShowSuggestions(true);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    executeSearch();
                  }
                }}
                placeholder="Enter city or area (e.g. Chiplun, Ratnagiri, Sangli, Pune, Mumbai, Kolhapur)..."
                className={`w-full px-3 py-3 sm:py-3.5 bg-transparent ${
                  isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-slate-400'
                } text-sm sm:text-base outline-none`}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`p-2 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'} transition-colors cursor-pointer mr-1`}
                  title="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => executeSearch()}
                className="px-5 sm:px-7 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm rounded-full shrink-0 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </div>

            {/* Google-Style Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={`absolute left-0 right-0 top-full mt-2 ${
                isLight ? 'bg-white border border-slate-200 shadow-2xl divide-slate-100' : 'bg-slate-900 border border-slate-700/80 shadow-2xl divide-slate-800'
              } rounded-2xl overflow-hidden z-50 divide-y`}>
                <div className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-500 bg-slate-50' : 'text-slate-400 bg-slate-950/60'
                }`}>
                  Available Hub Locations:
                </div>
                {suggestions.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => executeSearch(city)}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between ${
                      isLight ? 'hover:bg-slate-50 text-slate-900' : 'hover:bg-slate-800/80 text-white'
                    } transition-colors cursor-pointer group`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'} group-hover:scale-110 transition-transform`} />
                      <span className={`font-semibold text-sm ${isLight ? 'group-hover:text-blue-600 text-slate-900' : 'group-hover:text-cyan-300 text-white'}`}>
                        {city}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Service Available
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Search Prompt when no search made yet */}
            {!hasSearched && (
              <p className={`text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-3`}>
                💡 Tip: Type your city name in the search box above and click <span className={`${isLight ? 'text-blue-600' : 'text-cyan-300'} font-semibold`}>&ldquo;Search&rdquo;</span> or press Enter.
              </p>
            )}
          </div>
        </BlurZoomReveal>

        {/* RESULTS SECTION: Only shown after searching a city */}
        {hasSearched && searchedCity && (
          <div className="pt-2 animate-fadeIn">
            {matchedAreas.length > 0 ? (
              /* Case 1: Services ARE Available in this city */
              <div className="space-y-6">
                {matchedAreas.map((area, idx) => {
                  const isAm = area.brandId === 'am-distributors';
                  return (
                    <BlurZoomReveal key={area.id || idx} direction="up" delay={idx * 60}>
                      <div className={`rounded-3xl ${
  isLight
    ? 'bg-white border border-slate-200/90 shadow-xl hover:border-blue-400'
    : 'bg-slate-900/95 border border-slate-800 shadow-2xl hover:border-cyan-500/50'
} p-6 sm:p-8 space-y-6 relative overflow-hidden group transition-all`}>
                        {/* Top Accent Stripe */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-1.5 ${
                            isAm
                              ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600'
                              : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600'
                          }`}
                        />

                        {/* City Details Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                  isAm ? 'bg-teal-500/10 text-teal-400' : 'bg-cyan-500/10 text-cyan-400'
                                }`}
                              >
                                <MapPin className="w-5 h-5" />
                              </div>
                              <h3 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {area.city}, {area.state}
                              </h3>
                              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                                isLight ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-slate-400 bg-slate-800 border-slate-700'
                              }`}>
                                PIN: {area.pincode}
                              </span>
                            </div>
                            <p className={`text-xs font-medium pl-11 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                              Coverage Zone: <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{area.locality}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Service Active in This Area</span>
                            </span>
                          </div>
                        </div>

                        {/* Available Services Grid */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Active Services Available in {area.city}:</span>
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {(area.services || []).length} verified services operational
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {(area.services && area.services.length > 0 ? area.services : [
                              'Commercial 4K CCTV Video Surveillance',
                              'Gigabit Optical Fiber FTTH Broadband',
                              'Enterprise Networking SLA'
                            ]).map((svc, sIdx) => (
                              <div
                                key={sIdx}
                                className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all group/item ${
  isLight
    ? 'bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white'
    : 'bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 hover:bg-slate-800'
}`}
                              >
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20 group-hover/item:scale-110 transition-transform">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                  <div className={`text-xs font-bold ${isLight ? 'text-slate-900 group-hover/item:text-blue-600' : 'text-white group-hover/item:text-cyan-300'} transition-colors`}>
                                    {svc}
                                  </div>
                                  <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                                    Active Coverage • Fast Installation SLA
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Operational Notes & Quick Book */}
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-slate-300'} text-xs`}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>
                              {area.notes || 'Local technician team and rapid on-site dispatch active.'}
                            </span>
                          </div>

                          <Button
                            variant={isAm ? 'teal' : 'primary'}
                            size="sm"
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
              /* Case 2: Services NOT Available in searched city */
              <BlurZoomReveal direction="up" delay={50}>
                <div className="rounded-3xl bg-slate-900 border border-amber-500/40 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-2xl animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">
                      Service Currently Not Available
                    </h3>
                    <p className="text-sm font-bold text-amber-300">
                      No active operational facility registered in &ldquo;{searchedCity}&rdquo;
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                    We are actively expanding our optical fiber leased lines, 4K CCTV surveillance coverage, and cold-chain supply routes across Maharashtra. Submit your location below to request feasibility, and our engineering team will evaluate rapid deployment.
                  </p>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleBookService(searchedCity)}
                      className="font-bold shadow-lg shadow-blue-500/20"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Request Feasibility for &ldquo;{searchedCity}&rdquo;
                    </Button>
                  </div>
                </div>
              </BlurZoomReveal>
            )}
          </div>
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
