import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Compass,
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';
import { ServiceArea } from '../../types';
import { getServiceAreas } from '../../firebase/services';
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
  theme = 'light'
}) => {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedCity, setSearchedCity] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quotePrefillCity, setQuotePrefillCity] = useState('');

  // Dynamic Animated Typewriter Placeholder Effect
  const placeholderPhrases = useMemo(() => [
    'Enter your city (e.g. Chiplun, Ratnagiri)...',
    'Search Ratnagiri (1 Gbps Fiber & 4K CCTV)...',
    'Search Sangli operational zone...',
    'Search Pune enterprise infrastructure...',
    'Search Mumbai connectivity hub...',
    'Search Kolhapur field network...',
    'Search by PIN code (e.g. 415605)...'
  ], []);

  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeletingPhrase, setIsDeletingPhrase] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (searchTerm || isInputFocused) return;

    const currentPhrase = placeholderPhrases[phraseIndex];
    let timeout: any;

    if (!isDeletingPhrase) {
      if (charIndex < currentPhrase.length) {
        timeout = setTimeout(() => {
          setAnimatedPlaceholder(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        }, 55);
      } else {
        timeout = setTimeout(() => {
          setIsDeletingPhrase(true);
        }, 2200);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setAnimatedPlaceholder(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        }, 30);
      } else {
        setIsDeletingPhrase(false);
        setPhraseIndex(prev => (prev + 1) % placeholderPhrases.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeletingPhrase, phraseIndex, placeholderPhrases, searchTerm, isInputFocused]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    let isMounted = true;

    async function loadAreas() {
      try {
        const data = await getServiceAreas();
        if (isMounted) {
          // If division is specified and not corporate/all, filter
          let filtered = data;
          if (division === 'nexalus-innovations') {
            filtered = data.filter(a => a.brandId === 'nexalus' || a.brandId === 'cp-plus' || a.brandId === 'one-broadband' || a.brandId === 'all');
          } else if (division === 'am-distributors') {
            filtered = data.filter(a => a.brandId === 'am-distributors' || a.brandId === 'all');
          }
          setAreas(filtered);
        }
      } catch (err) {
        console.error('Failed to load service areas:', err);
      }
    }

    loadAreas();

    const handleUpdate = () => {
      loadAreas();
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Click outside listener for suggestions dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      isMounted = false;
      window.removeEventListener('nexalus_data_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [division]);

  // Extract unique cities from active areas for autocomplete suggestions
  const availableCities = Array.from(new Set(areas.map(a => a.city))).sort();

  // Filter autocomplete suggestions based on query
  const suggestions = searchTerm.trim()
    ? availableCities.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    : [];

  // Filter matched areas after user performs search - prioritized strictly so searching a city never shows another city
  const matchedAreas = useMemo(() => {
    if (!searchedCity.trim()) return [];
    const q = searchedCity.toLowerCase().trim();

    // 1. Exact city match (e.g. searching "karad" strictly matches Karad)
    const exactCity = areas.filter(a => a.city.toLowerCase().trim() === q);
    if (exactCity.length > 0) return exactCity;

    // 2. City prefix match (e.g. "kara" matches "Karad")
    const prefixCity = areas.filter(a => a.city.toLowerCase().trim().startsWith(q));
    if (prefixCity.length > 0) return prefixCity;

    // 3. Exact Pincode match (e.g. "415110" or "415001")
    const pinMatch = areas.filter(a => a.pincode && a.pincode.trim() === q);
    if (pinMatch.length > 0) return pinMatch;

    // 4. Substring in city name (e.g. "chipl" -> "Chiplun")
    const citySub = areas.filter(a => a.city.toLowerCase().includes(q));
    if (citySub.length > 0) return citySub;

    // 5. Fallback: locality match only if query did not match any city
    return areas.filter(a => a.locality.toLowerCase().includes(q));
  }, [searchedCity, areas]);

  const executeSearch = (cityToSearch?: string) => {
    const target = (cityToSearch || searchTerm).trim();
    if (!target) return;
    setSearchedCity(target);
    setSearchTerm(target);
    setHasSearched(true);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchedCity('');
    setHasSearched(false);
    setShowSuggestions(false);
  };

  const handleBookService = (city: string) => {
    setQuotePrefillCity(city);
    setIsQuoteOpen(true);
  };

  const defaultTitle =
    division === 'am-distributors'
      ? 'A M Distributors Logistics & Cold-Chain Routes'
      : division === 'nexalus-innovations'
      ? 'Turnkey CCTV, Fiber & IT Networking Deployment Hubs'
      : 'Find Nexalus Service & Infrastructure in Your Area';

  const defaultSubtitle =
    division === 'am-distributors'
      ? 'Daily automated scheduled supply routes across Chiplun, Khed, Guhagar, Ratnagiri and surrounding commercial markets.'
      : division === 'nexalus-innovations'
      ? 'Certified field engineer hubs with rapid response teams, local optical fiber leased line points of presence, and 4K CCTV setups.'
      : 'Enter your city or area below to check active coverage, view operational divisions, and request rapid onsite feasibility evaluation.';

  return (
    <section
      id="areas-covered"
      className={`w-full ${
        isLight
          ? 'bg-white text-slate-900 border-slate-200/90'
          : 'bg-slate-950 text-white border-slate-800'
      } py-16 sm:py-24 border-b relative overflow-hidden isolate ${className}`}
    >
      {/* Coverage Area Commercial Photography Background */}
      <div
        className="absolute inset-0 z-[-2] bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url('/images/coverage%20area%20background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }}
        aria-hidden="true"
      />
      {/* Soft Translucent Overlay (0.58 Opacity for High Contrast Foreground & Clearly Visible Photography) */}
      <div
        className={`absolute inset-0 z-[-1] ${isLight ? 'bg-white/58' : 'bg-slate-950/75'} pointer-events-none`}
        aria-hidden="true"
      />

      {/* Background Lighting Gradients */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Section Header */}
        <BlurZoomReveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${
              isLight
                ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                : 'bg-blue-500/10 text-cyan-300 border-blue-400/20'
            } text-xs font-bold uppercase tracking-wider`}>
              <Compass className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'}`} />
              <span>Service Coverage Search</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${isLight ? 'text-slate-900' : 'text-white'} tracking-tight`}>
              {title || defaultTitle}
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed max-w-2xl mx-auto`}>
              {subtitle || defaultSubtitle}
            </p>
          </div>
        </BlurZoomReveal>

        {/* Google-Style Search Interface with Animated Typewriter Placeholder & Luminous Halo */}
        <BlurZoomReveal direction="up" delay={80}>
          <div ref={searchContainerRef} className="max-w-2xl mx-auto relative group">
            {/* Ambient Animated Halo Glow */}
            <div
              className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-400/25 to-blue-600/20 blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none"
              style={{ animation: 'pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            />

            <div className={`relative flex items-center ${
              isLight
                ? 'bg-white/95 backdrop-blur-md border-2 border-slate-200/90 shadow-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15'
                : 'bg-slate-900/95 backdrop-blur-md border-2 border-slate-700 shadow-2xl focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/20'
            } rounded-full transition-all duration-300 p-1.5 pl-5 sm:pl-6`}>
              <Search className={`w-5 h-5 ${isLight ? 'text-blue-600' : 'text-cyan-400'} shrink-0 pointer-events-none transition-transform group-focus-within:scale-110`} />

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
                  setIsInputFocused(true);
                  if (searchTerm.trim()) setShowSuggestions(true);
                }}
                onBlur={() => {
                  setIsInputFocused(false);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    executeSearch();
                  }
                }}
                placeholder={isInputFocused ? 'Type city, pin code or area name...' : (animatedPlaceholder ? `${animatedPlaceholder}|` : 'Enter city or area (e.g. Chiplun, Ratnagiri, Sangli, Pune)...')}
                className={`w-full px-3 py-3 sm:py-3.5 bg-transparent ${isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-slate-400'} text-sm sm:text-base outline-none font-medium`}
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
                className="px-5 sm:px-7 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm rounded-full shrink-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </div>

            {/* Google-Style Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={`absolute left-0 right-0 top-full mt-2 ${
                isLight ? 'bg-white border-slate-200 divide-slate-100 text-slate-800' : 'bg-slate-900 border-slate-700/80 divide-slate-800 text-white'
              } border rounded-2xl shadow-2xl overflow-hidden z-50 divide-y`}>
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
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/80'
                    } transition-colors cursor-pointer group`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'} group-hover:scale-110 transition-transform`} />
                      <span className={`font-semibold ${isLight ? 'text-slate-800 group-hover:text-blue-600' : 'text-white group-hover:text-cyan-300'} text-sm`}>
                        {city}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ Service Available
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Search Prompt and Quick-Access City Chips when no search made yet */}
            {!hasSearched && (
              <div className="mt-4 space-y-2.5 animate-in fade-in duration-500">
                {/* Popular Search City Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'} font-semibold mr-1`}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Live Hubs:</span>
                  </span>

                  {['Chiplun', 'Ratnagiri', 'Sangli', 'Pune', 'Mumbai', 'Kolhapur'].map(quickCity => (
                    <button
                      key={quickCity}
                      type="button"
                      onClick={() => {
                        setSearchTerm(quickCity);
                        executeSearch(quickCity);
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer transform hover:-translate-y-0.5 ${
                        isLight
                          ? 'bg-white/90 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 shadow-2xs hover:border-cyan-500/40'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{quickCity}</span>
                    </button>
                  ))}
                </div>

                <p className={`text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  💡 Tip: Click any live operational hub above or type your location to check 1 Gbps Fiber &amp; 4K CCTV availability.
                </p>
              </div>
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
                          ? 'bg-slate-50/80 border-slate-200/90 shadow-xl'
                          : 'bg-slate-900/95 border-slate-800 shadow-2xl'
                      } border p-6 sm:p-8 space-y-6 relative overflow-hidden group hover:border-cyan-500/50 transition-all`}>
                        {/* Top Accent Stripe */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-1.5 ${
                            isAm
                              ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600'
                              : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600'
                          }`}
                        />

                        {/* City Details Header */}
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${
                          isLight ? 'border-slate-200' : 'border-slate-800/80'
                        } pb-5`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                  isAm ? 'bg-teal-500/10 text-teal-600' : isLight ? 'bg-blue-50 text-blue-600' : 'bg-cyan-500/10 text-cyan-400'
                                }`}
                              >
                                <MapPin className="w-5 h-5" />
                              </div>
                              <h3 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'} tracking-tight`}>
                                {area.city}, {area.state}
                              </h3>
                              <span className={`font-mono text-xs font-bold ${
                                isLight ? 'text-slate-600 bg-slate-200/70 border-slate-300' : 'text-slate-400 bg-slate-800 border-slate-700'
                              } px-2 py-0.5 rounded-md border`}>
                                PIN: {area.pincode}
                              </span>
                            </div>
                            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} font-medium pl-11`}>
                              Coverage Zone: <span className={`${isLight ? 'text-slate-900' : 'text-white'} font-semibold`}>{area.locality}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Service Active in This Area</span>
                            </span>
                          </div>
                        </div>

                        {/* Available Services Grid */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-blue-700' : 'text-cyan-400'} flex items-center gap-1.5`}>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Active Services Available in {area.city}:</span>
                            </h4>
                            <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
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
                                className={`flex items-start gap-3 p-3.5 rounded-2xl ${
                                  isLight
                                    ? 'bg-white border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/20'
                                    : 'bg-slate-800/60 border-slate-700/60 hover:border-cyan-500/40 hover:bg-slate-800'
                                } border transition-all group/item shadow-2xs`}
                              >
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20 group-hover/item:scale-110 transition-transform">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t ${
                          isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-slate-300'
                        } text-xs`}>
                          <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-cyan-400'} shrink-0`} />
                            <span>
                              {area.notes || 'Local technician team and rapid on-site dispatch active.'}
                            </span>
                          </div>

                          <Button
                            variant={isAm ? 'teal' : 'primary'}
                            size="sm"
                            onClick={() => handleBookService(area.city)}
                            className="font-bold text-xs shadow-md whitespace-nowrap w-full sm:w-auto"
                            icon={<ArrowRight className="w-4 h-4" />}
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
                <div className={`rounded-3xl ${
                  isLight ? 'bg-slate-50 border-amber-300 shadow-xl' : 'bg-slate-900 border-amber-500/40 shadow-2xl'
                } border p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 animate-fadeIn`}>
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-400/30 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h3 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Service Currently Not Available
                    </h3>
                    <p className={`text-sm font-bold ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                      No active operational facility registered in &ldquo;{searchedCity}&rdquo;
                    </p>
                  </div>

                  <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed max-w-md mx-auto`}>
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
