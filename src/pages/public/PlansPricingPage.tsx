import React, { useState, useEffect, useMemo } from 'react';
import {
  getBroadbandProviders,
  getPublishedBroadbandPlans,
  formatBroadbandPrice,
  getInternetPlans,
  subscribeToBroadbandPlans,
  subscribeToInternetPlans,
  addToPlanCart,
  getPlanCart,
  removeFromPlanCart,
  clearPlanCart,
  getCachedBroadbandProviders,
  getCachedBroadbandPlans,
  getCachedInternetPlans
} from '../../firebase/services';
import {
  BroadbandPlan,
  BroadbandProvider,
  InternetPlan,
  CartPlanItem,
  BrandId
} from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { QuoteModal } from '../../components/common/QuoteModal';
import {
  Wifi,
  Check,
  Search,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Loader2,
  Clock,
  Layers,
  Building,
  HelpCircle,
  ShoppingCart,
  ShoppingBag,
  Lock,
  Trash2,
  X,
  CreditCard,
  CheckCircle2
} from 'lucide-react';

type ProviderTab = 'airtel' | 'bsnl' | 'railwire' | 'one-broadband';

// Helper to robustly extract numeric speed in Mbps from display text or numeric field
function getEffectiveSpeed(p: { speedNumeric?: number; speed?: string }): number {
  if (p.speed) {
    const match = p.speed.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return typeof p.speedNumeric === 'number' ? p.speedNumeric : 0;
}

export const PlansPricingPage: React.FC = () => {
  const { success, info } = useToast();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ProviderTab>('airtel');
  const [providers, setProviders] = useState<BroadbandProvider[]>(() => getCachedBroadbandProviders());
  const [broadbandPlans, setBroadbandPlans] = useState<BroadbandPlan[]>(() => getCachedBroadbandPlans());
  const [oneBroadbandPlans, setOneBroadbandPlans] = useState<InternetPlan[]>(() => getCachedInternetPlans());
  const [isLoading, setIsLoading] = useState(false);

  // Cart State
  const [cartItems, setCartItems] = useState<CartPlanItem[]>(() => getPlanCart());
  const [isCartOpen, setIsCartOpen] = useState(false);





  // Filters
  const [selectedSpeedFilter, setSelectedSpeedFilter] = useState<'all' | 'entry' | 'mid' | 'high'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');

  // Lead Quote Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedPlanForQuote, setSelectedPlanForQuote] = useState<{
    providerName: string;
    planName: string;
    speed: string;
    price: number | string;
    billingPeriod: string;
    brandId: 'one-broadband' | 'nexalus-innovations';
  } | null>(null);

  // Sync Cart State on custom events
  useEffect(() => {
    const handleCartUpdate = (e: any) => {
      setCartItems(e.detail || getPlanCart());
    };
    window.addEventListener('nexalus_plan_cart_updated', handleCartUpdate);
    return () => {
      window.removeEventListener('nexalus_plan_cart_updated', handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Initial load for provider metadata
    getBroadbandProviders(true).then(provList => {
      if (isMounted) setProviders(provList);
    });

    // Real-time live subscription for broadband plans (Airtel, BSNL, RailWire)
    const unsubBroadband = subscribeToBroadbandPlans((plans) => {
      if (isMounted) {
        setBroadbandPlans(plans);
        setIsLoading(false);
      }
    }, { publishedOnly: true });

    // Real-time live subscription for legacy One Broadband plans
    const unsubLegacy = subscribeToInternetPlans((plans) => {
      if (isMounted) {
        setOneBroadbandPlans(plans);
      }
    }, true);

    const handleDataUpdate = () => {
      getBroadbandProviders(true).then(provList => {
        if (isMounted) setProviders(provList);
      });
    };
    window.addEventListener('nexalus_data_update', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);

    return () => {
      isMounted = false;
      unsubBroadband();
      unsubLegacy();
      window.removeEventListener('nexalus_data_update', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
    };
  }, []);

  // Filtered Plans for active tab
  const currentTabPlans = useMemo(() => {
    if (activeTab === 'one-broadband') {
      return oneBroadbandPlans.filter(p => {
        const speed = getEffectiveSpeed(p);
        if (selectedSpeedFilter === 'entry') return speed <= 60;
        if (selectedSpeedFilter === 'mid') return speed > 60 && speed <= 150;
        if (selectedSpeedFilter === 'high') return speed > 150;
        return true;
      });
    }

    return broadbandPlans.filter(p => {
      if (p.providerId !== activeTab) return false;

      // Robust speed filter based on effective numeric speed
      const speed = getEffectiveSpeed(p);
      if (selectedSpeedFilter === 'entry' && speed > 60) return false;
      if (selectedSpeedFilter === 'mid' && (speed <= 60 || speed > 150)) return false;
      if (selectedSpeedFilter === 'high' && speed <= 150) return false;

      // City filter
      if (selectedCityFilter !== 'all') {
        const targetCity = selectedCityFilter.toLowerCase();
        const planCity = (p.city || 'all').toLowerCase();
        if (planCity !== 'all' && !planCity.includes(targetCity)) {
          if (!p.cities || !p.cities.some(c => c.toLowerCase().includes(targetCity))) {
            return false;
          }
        }
      }

      return true;
    });
  }, [activeTab, broadbandPlans, oneBroadbandPlans, selectedSpeedFilter, selectedCityFilter]);

  // Unique cities list for filter dropdown
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    broadbandPlans.forEach(p => {
      if (p.city && p.city.toLowerCase() !== 'all') set.add(p.city);
      if (p.cities) p.cities.forEach(c => set.add(c));
    });
    return Array.from(set);
  }, [broadbandPlans]);

  const handleOpenQuote = (plan: {
    providerName: string;
    planName: string;
    speed: string;
    price: number | string;
    billingPeriod: string;
    brandId: 'one-broadband' | 'nexalus-innovations';
  }) => {
    setSelectedPlanForQuote(plan);
    setIsQuoteModalOpen(true);
  };

  // Add to cart handler
  const handleAddToCart = (plan: {
    planId: string;
    providerName: string;
    planName: string;
    speed: string;
    price: number;
    billingPeriod: string;
    brandId?: 'one-broadband' | 'nexalus-innovations';
  }) => {
    addToPlanCart(plan);
    success('Added to Cart', `${plan.providerName} - ${plan.planName} (${plan.speed}) added to your broadband cart.`);
  };

  // Direct Buy Now handler
  const handleBuyNow = (plan: {
    planId?: string;
    planName: string;
    providerName: string;
    speed: string;
    price: number | string;
    billingPeriod?: string;
    brandId?: BrandId | 'one-broadband' | 'nexalus-innovations';
  }) => {
    if (!isAuthenticated) {
      try {
        sessionStorage.setItem('nexalus_pending_order_plan', JSON.stringify(plan));
      } catch {}
      info('Registration / Login Required', 'Please register or log in first to buy this plan.');
      window.dispatchEvent(
        new CustomEvent('open_customer_portal', {
          detail: {
            view: 'choice',
            context: 'buy_now',
            prompt: `Please register a new customer account, or log in if you already have an account, to buy ${plan.providerName} - ${plan.planName} (${plan.speed}).`
          }
        })
      );
      return;
    }

    // Direct checkout: Trigger global PlanOrderModal
    window.dispatchEvent(
      new CustomEvent('open_plan_order_direct', { detail: plan })
    );
  };

  const getProviderMeta = (tab: ProviderTab) => {
    switch (tab) {
      case 'airtel':
        return {
          name: 'Airtel Xstream Fiber',
          short: 'Airtel',
          color: 'from-red-600 via-rose-600 to-red-700',
          badgeBg: 'bg-red-50 text-red-700 border-red-200',
          accent: 'text-red-600',
          border: 'hover:border-red-500',
          buttonVariant: 'primary' as const,
          description: 'High-speed broadband with Wi-Fi calling, Wynk benefits, and zero throttling.'
        };
      case 'bsnl':
        return {
          name: 'BSNL Bharat Fiber',
          short: 'BSNL',
          color: 'from-blue-700 via-indigo-700 to-blue-800',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          accent: 'text-blue-600',
          border: 'hover:border-blue-500',
          buttonVariant: 'primary' as const,
          description: 'Government-grade reliable optical fiber infrastructure with expansive coverage across Konkan.'
        };
      case 'railwire':
        return {
          name: 'RailWire Broadband',
          short: 'RailWire',
          color: 'from-amber-600 via-orange-600 to-amber-700',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          accent: 'text-amber-600',
          border: 'hover:border-amber-500',
          buttonVariant: 'primary' as const,
          description: 'RailTel Corporation retail network with ultra-low latency optical peering.'
        };
      case 'one-broadband':
        return {
          name: 'One Broadband (FTTH)',
          short: 'One Broadband',
          color: 'from-teal-700 via-cyan-800 to-teal-900',
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
          accent: 'text-teal-700',
          border: 'hover:border-teal-500',
          buttonVariant: 'teal' as const,
          description: 'Pure symmetrical optical fiber FTTH with Gigabit Wi-Fi 6 router setup.'
        };
    }
  };

  const meta = getProviderMeta(activeTab);

  return (
    <div className="space-y-12 pb-24 relative">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Authorized Regional Broadband &amp; Optical Fiber Partner</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
            PLANS &amp; PRICING
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            High-speed optical fiber connectivity for homes, commercial offices, and multi-tenant campuses across Chiplun, Khed, and coastal Maharashtra.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Symmetrical Speed Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Free Dual-Band Wi-Fi Setup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> 24/7 Rapid Regional NOC SLA
            </span>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Provider Selector Tabs & Cart Trigger */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => setActiveTab('airtel')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'airtel'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'airtel' ? 'bg-white' : 'bg-red-500'}`} />
              <span>Airtel Xstream</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bsnl')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'bsnl'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'bsnl' ? 'bg-white' : 'bg-blue-500'}`} />
              <span>BSNL Bharat Fiber</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('railwire')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'railwire'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'railwire' ? 'bg-white' : 'bg-orange-500'}`} />
              <span>RailWire Retail</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('one-broadband')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'one-broadband'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'one-broadband' ? 'bg-white' : 'bg-teal-500'}`} />
              <span>One Broadband (FTTH)</span>
            </button>
          </div>
        </div>

        {/* Provider Overview Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${meta.badgeBg}`}>
                {meta.short}
              </span>
              <h2 className="text-base font-bold text-slate-900">{meta.name}</h2>
            </div>
            <p className="text-xs text-slate-600">{meta.description}</p>
          </div>

          {/* Speed Tier Filters */}
          <div className="flex flex-wrap items-center gap-1.5 self-stretch md:self-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Speed:</span>
            <button
              type="button"
              onClick={() => setSelectedSpeedFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedSpeedFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedSpeedFilter('entry')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedSpeedFilter === 'entry'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              &le; 60 Mbps
            </button>
            <button
              type="button"
              onClick={() => setSelectedSpeedFilter('mid')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedSpeedFilter === 'mid'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              100 Mbps
            </button>
            <button
              type="button"
              onClick={() => setSelectedSpeedFilter('high')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedSpeedFilter === 'high'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              150+ Mbps
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-500 space-y-3 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-xs font-semibold">Fetching published broadband plans...</p>
          </div>
        ) : currentTabPlans.length === 0 ? (
          /* Empty / Inquire State */
          <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4 max-w-2xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Wifi className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Tariffs for {meta.name} Are Being Updated
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                Our optical network engineers are deploying new fiber nodes for {meta.short}. Submit an enquiry below to verify building-level feasibility and lock in exclusive local introductory pricing.
              </p>
            </div>
            <Button
              variant={meta.buttonVariant}
              onClick={() =>
                handleOpenQuote({
                  providerName: meta.name,
                  planName: `${meta.short} High-Speed Optical Fiber`,
                  speed: 'Custom Feasibility',
                  price: 'Contact for Tariff',
                  billingPeriod: 'monthly',
                  brandId: activeTab === 'one-broadband' ? 'one-broadband' : 'nexalus-innovations'
                })
              }
              icon={<PhoneCall className="w-4 h-4" />}
            >
              Check {meta.short} Coverage &amp; Request Tariff
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'one-broadband'
              ? (currentTabPlans as InternetPlan[]).map(plan => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Card Top Banner */}
                      <div className="p-5 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                            One Broadband FTTH
                          </span>
                          <div className="text-2xl font-black text-white">{plan.speed}</div>
                        </div>
                        {plan.popular && (
                          <span className="bg-teal-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                            Popular
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight line-clamp-1">
                            {plan.name}
                          </h3>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {plan.dataAllowance}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">
                            ₹{plan.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            / {plan.billingPeriod}
                          </span>
                        </div>

                        {/* Features List */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Included Plan Benefits:
                          </div>
                          <ul className="space-y-1.5 text-xs text-slate-600">
                            {plan.includedFeatures.map((feat, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Dual Action Buttons: Add to Cart & Buy Now */}
                    <div className="p-6 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddToCart({
                              planId: plan.id,
                              providerName: 'One Broadband',
                              planName: plan.name,
                              speed: plan.speed,
                              price: plan.price,
                              billingPeriod: plan.billingPeriod || 'monthly',
                              brandId: 'one-broadband'
                            })
                          }
                          className="py-2.5 px-3 rounded-xl border border-teal-600 text-teal-700 bg-teal-50/60 hover:bg-teal-100 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleBuyNow({
                              planId: plan.id,
                              providerName: 'One Broadband',
                              planName: plan.name,
                              speed: plan.speed,
                              price: plan.price,
                              billingPeriod: plan.billingPeriod || 'monthly',
                              brandId: 'one-broadband'
                            })
                          }
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Buy Now</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenQuote({
                            providerName: 'One Broadband',
                            planName: plan.name,
                            speed: plan.speed,
                            price: plan.price,
                            billingPeriod: plan.billingPeriod,
                            brandId: 'one-broadband'
                          })
                        }
                        className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors cursor-pointer"
                      >
                        Enquire custom feasibility &rarr;
                      </button>
                    </div>
                  </div>
                ))
              : (currentTabPlans as BroadbandPlan[]).map(plan => (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group ${meta.border}`}
                  >
                    <div>
                      {/* Card Top Banner */}
                      <div className={`p-5 bg-gradient-to-r ${meta.color} text-white flex items-center justify-between`}>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                            {meta.name}
                          </span>
                          <div className="text-2xl font-black text-white">{plan.speed}</div>
                        </div>
                        {plan.popular && (
                          <span className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                            Popular Choice
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight line-clamp-1">
                            {plan.name}
                          </h3>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{plan.dataAllowance || 'Truly Unlimited'}</span>
                            {plan.city && plan.city.toLowerCase() !== 'all' && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {plan.city}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="pt-2 border-t border-slate-100">
                          {plan.originalPrice && (
                            <div className="text-xs text-slate-400 line-through">
                              {formatBroadbandPrice(plan.originalPrice, plan.currency)}
                            </div>
                          )}
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">
                              {formatBroadbandPrice(plan.price, plan.currency)}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              / {plan.billingPeriod}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {plan.description && (
                          <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                            {plan.description}
                          </p>
                        )}

                        {/* Features List */}
                        {plan.features && plan.features.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Included Plan Benefits:
                            </div>
                            <ul className="space-y-1.5 text-xs text-slate-600">
                              {plan.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dual Action Buttons: Add to Cart & Buy Now */}
                    <div className="p-6 pt-0 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddToCart({
                              planId: plan.id,
                              providerName: meta.name,
                              planName: plan.name,
                              speed: plan.speed,
                              price: plan.price,
                              billingPeriod: plan.billingPeriod || 'monthly',
                              brandId: 'nexalus-innovations'
                            })
                          }
                          className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleBuyNow({
                              planId: plan.id,
                              providerName: meta.name,
                              planName: plan.name,
                              speed: plan.speed,
                              price: plan.price,
                              billingPeriod: plan.billingPeriod || 'monthly',
                              brandId: 'nexalus-innovations'
                            })
                          }
                          className={`py-2.5 px-3 rounded-xl bg-gradient-to-r ${meta.color} hover:opacity-95 text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer`}
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Buy Now</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenQuote({
                            providerName: meta.name,
                            planName: plan.name,
                            speed: plan.speed,
                            price: plan.price,
                            billingPeriod: plan.billingPeriod,
                            brandId: 'nexalus-innovations'
                          })
                        }
                        className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors cursor-pointer"
                      >
                        Enquire custom feasibility &rarr;
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        )}

        {/* Feasibility & Enterprise Campus Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
              Commercial &amp; Campus Fiber Feasibility
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Need Multi-Gigabit Leased Line (ILL) or Custom Fiber Splicing?
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Nexalus Innovations provides certified enterprise optical network engineering, dedicated static IPv4 subnets, and dual-homed redundant fiber backbones for industrial units and tech offices.
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() =>
              handleOpenQuote({
                providerName: 'Enterprise Fiber',
                planName: 'Enterprise Dedicated Internet Leased Line (1:1 ILL)',
                speed: 'Gigabit Dedicated',
                price: 'Custom Enterprise SLA',
                billingPeriod: 'monthly',
                brandId: 'nexalus-innovations'
              })
            }
            className="shrink-0"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Request Enterprise Quote
          </Button>
        </div>
      </section>

      {/* CART DRAWER / MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your Broadband Cart</h3>
                  <p className="text-[11px] text-slate-300">{cartItems.length} plan{cartItems.length !== 1 ? 's' : ''} selected</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {cartItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">Your cart is empty</p>
                  <p className="text-xs text-slate-400">Click &ldquo;Add to Cart&rdquo; on any broadband plan to save it here.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {item.providerName}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">{item.planName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="font-bold text-indigo-600">{item.speed}</span>
                        <span>•</span>
                        <span className="font-extrabold text-slate-900">₹{item.price.toLocaleString('en-IN')}/{item.billingPeriod || 'mo'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCartOpen(false);
                          handleBuyNow({
                            planId: item.planId,
                            planName: item.planName,
                            providerName: item.providerName,
                            speed: item.speed,
                            price: item.price,
                            billingPeriod: item.billingPeriod,
                            brandId: item.brandId
                          });
                        }}
                        className="py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Buy Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromPlanCart(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove from Cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={clearPlanCart}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue Browsing
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Zap className="w-3.5 h-3.5 fill-current" />}
                    onClick={() => {
                      if (cartItems.length > 0) {
                        const first = cartItems[0];
                        setIsCartOpen(false);
                        handleBuyNow({
                          planId: first.planId,
                          planName: first.planName,
                          providerName: first.providerName,
                          speed: first.speed,
                          price: first.price,
                          billingPeriod: first.billingPeriod,
                          brandId: first.brandId
                        });
                      }
                    }}
                  >
                    Buy First ({cartItems[0]?.planName})
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quote / Feasibility Modal */}
      {selectedPlanForQuote && (
        <QuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => {
            setIsQuoteModalOpen(false);
            setSelectedPlanForQuote(null);
          }}
          brandId={selectedPlanForQuote.brandId}
          itemName={`${selectedPlanForQuote.providerName}: ${selectedPlanForQuote.planName} (${selectedPlanForQuote.speed})`}
          itemType="plan"
          sourcePage="/plans"
        />
      )}
    </div>
  );
};
