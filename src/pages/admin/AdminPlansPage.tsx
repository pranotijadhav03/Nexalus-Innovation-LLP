import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getBroadbandProviders,
  getBroadbandPlansByProvider,
  createBroadbandPlan,
  updateBroadbandPlan,
  setBroadbandPlanPublished,
  updateBroadbandPlanDisplayOrder,
  deleteBroadbandPlan,
  formatBroadbandPrice,
  getInternetPlans,
  createInternetPlan,
  updateInternetPlan,
  deleteInternetPlan,
  subscribeToBroadbandPlans,
  subscribeToInternetPlans,
  getCachedBroadbandProviders,
  getCachedBroadbandPlans,
  getCachedInternetPlans,
  getPlanOrders,
  updatePlanOrderStatus,
  createBroadbandProvider,
  updateBroadbandProvider,
  deleteBroadbandProvider,
  subscribeToBroadbandProviders
} from '../../firebase/services';
import {
  BroadbandPlan,
  BroadbandProvider,
  BroadbandBillingPeriod,
  BroadbandPlanAvailability,
  InternetPlan,
  PlanOrder
} from '../../types';
import { Input, TextArea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Plus,
  Edit2,
  Trash2,
  Wifi,
  Check,
  ShieldAlert,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Globe2,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  ArrowRight
} from 'lucide-react';

type ActiveTab = string;

export const AdminPlansPage: React.FC = () => {
  const { isAmAdmin, isSuperAdmin, isInnovationsAdmin } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const activeConsole = outletCtx?.activeConsole || 'master';
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('airtel');
  const [providers, setProviders] = useState<BroadbandProvider[]>(() => getCachedBroadbandProviders());
  const [broadbandPlans, setBroadbandPlans] = useState<BroadbandPlan[]>(() => getCachedBroadbandPlans('airtel'));
  const [oneBroadbandPlans, setOneBroadbandPlans] = useState<InternetPlan[]>(() => getCachedInternetPlans());
  const [isLoading, setIsLoading] = useState(false);
  const [planOrders, setPlanOrders] = useState<PlanOrder[]>([]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: PlanOrder['status']) => {
    try {
      await updatePlanOrderStatus(orderId, newStatus);
      success('Order Updated', `Order #${orderId} marked as ${newStatus.replace(/_/g, ' ').toUpperCase()}.`);
      const updatedList = await getPlanOrders();
      setPlanOrders(updatedList);
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const activeProvider = providers.find(p => p.id === activeTab);

  // Plan Provider Management Modal State
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<BroadbandProvider | null>(null);
  const [providerId, setProviderId] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerDescription, setProviderDescription] = useState('');
  const [providerEnabled, setProviderEnabled] = useState(true);
  const [providerDisplayOrder, setProviderDisplayOrder] = useState('1');
  const [isSavingProvider, setIsSavingProvider] = useState(false);

  // Delete Provider State
  const [deleteProviderCandidate, setDeleteProviderCandidate] = useState<BroadbandProvider | null>(null);
  const [isDeletingProvider, setIsDeletingProvider] = useState(false);

  const openCreateProviderModal = () => {
    setEditingProvider(null);
    setProviderId('');
    setProviderName('');
    setProviderDescription('');
    setProviderEnabled(true);
    setProviderDisplayOrder(String(providers.length + 1));
    setIsProviderModalOpen(true);
  };

  const openEditProviderModal = (provider: BroadbandProvider) => {
    setEditingProvider(provider);
    setProviderId(provider.id);
    setProviderName(provider.name);
    setProviderDescription(provider.description || '');
    setProviderEnabled(provider.enabled !== false);
    setProviderDisplayOrder(String(provider.displayOrder || 1));
    setIsProviderModalOpen(true);
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName.trim()) {
      error('Validation Error', 'Provider name is required.');
      return;
    }

    const generatedId = (editingProvider ? editingProvider.id : (providerId.trim() || providerName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'))).toLowerCase();

    if (!generatedId) {
      error('Validation Error', 'Provider Identifier is required.');
      return;
    }

    setIsSavingProvider(true);
    try {
      const payload = {
        id: generatedId,
        name: providerName.trim(),
        slug: generatedId,
        description: providerDescription.trim(),
        enabled: providerEnabled,
        displayOrder: parseInt(providerDisplayOrder, 10) || (providers.length + 1)
      };

      if (editingProvider) {
        await updateBroadbandProvider(editingProvider.id, payload);
        success('Provider Updated', `${payload.name} details have been saved.`);
      } else {
        await createBroadbandProvider(payload);
        success('Provider Created', `${payload.name} has been added successfully.`);
        setActiveTab(generatedId);
      }

      setIsProviderModalOpen(false);
      const updated = await getBroadbandProviders(false);
      setProviders(updated);
    } catch (err: any) {
      error('Failed to save provider', err.message);
    } finally {
      setIsSavingProvider(false);
    }
  };

  const handleDeleteProvider = async () => {
    if (!deleteProviderCandidate) return;
    setIsDeletingProvider(true);
    try {
      await deleteBroadbandProvider(deleteProviderCandidate.id);
      success('Provider Removed', `${deleteProviderCandidate.name} has been deleted.`);
      setDeleteProviderCandidate(null);
      const updated = await getBroadbandProviders(false);
      setProviders(updated);
      if (activeTab === deleteProviderCandidate.id) {
        setActiveTab('airtel');
      }
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setIsDeletingProvider(false);
    }
  };

  // Multi-Provider Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BroadbandPlan | null>(null);

  // Multi-Provider Plan Form Fields
  const [name, setName] = useState('');
  const [speed, setSpeed] = useState('100 Mbps');
  const [speedNumeric, setSpeedNumeric] = useState('100');
  const [price, setPrice] = useState('799');
  const [originalPrice, setOriginalPrice] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [billingPeriod, setBillingPeriod] = useState<BroadbandBillingPeriod>('monthly');
  const [validityDays, setValidityDays] = useState('30');
  const [dataAllowance, setDataAllowance] = useState('Truly Unlimited (3300 GB FUP)');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([
    'High-Speed Optical Fiber Connection',
    'Unlimited Local & STD Voice Calling',
    'Wi-Fi Dual-Band Router Setup Included'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [city, setCity] = useState('All');
  const [availability, setAvailability] = useState<BroadbandPlanAvailability>('active');
  const [popular, setPopular] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isSaving, setIsSaving] = useState(false);

  // Legacy One Broadband Modal State
  const [isOneModalOpen, setIsOneModalOpen] = useState(false);
  const [editingOnePlan, setEditingOnePlan] = useState<InternetPlan | null>(null);
  const [oneName, setOneName] = useState('');
  const [oneSpeed, setOneSpeed] = useState('100 Mbps');
  const [oneSpeedNumeric, setOneSpeedNumeric] = useState('100');
  const [onePrice, setOnePrice] = useState('699');
  const [oneBillingPeriod, setOneBillingPeriod] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');
  const [oneDataAllowance, setOneDataAllowance] = useState('Truly Unlimited');
  const [oneFeatures, setOneFeatures] = useState<string[]>([
    'Symmetrical Download & Upload Speed',
    'Dual-Band Wi-Fi 6 Router Rental Included',
    '24/7 Dedicated Support SLA'
  ]);
  const [onePopular, setOnePopular] = useState(false);
  const [oneFeatured, setOneFeatured] = useState(true);
  const [onePublished, setOnePublished] = useState(true);

  // Delete State
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: string; name: string; isLegacy?: boolean } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'orders') {
        const orders = await getPlanOrders();
        setPlanOrders(orders);
      } else if (activeTab === 'one-broadband') {
        const legacy = await getInternetPlans(false);
        setOneBroadbandPlans(legacy);
      } else {
        const [provList, planList] = await Promise.all([
          getBroadbandProviders(false),
          getBroadbandPlansByProvider(activeTab, false)
        ]);
        setProviders(provList);
        setBroadbandPlans(planList);
      }
    } catch (err: any) {
      error('Failed to load plans', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Attach real-time subscription for immediate reactivity
    const unsubBB = subscribeToBroadbandPlans((plans) => {
      if (activeTab !== 'one-broadband') {
        const filtered = plans.filter(p => p.providerId === activeTab);
        setBroadbandPlans(filtered);
      }
    });

    const unsubLegacy = subscribeToInternetPlans((plans) => {
      setOneBroadbandPlans(plans);
    });

    const unsubProv = subscribeToBroadbandProviders((provList) => {
      setProviders(provList);
    });

    return () => {
      unsubBB();
      unsubLegacy();
      unsubProv();
    };
  }, [activeTab]);

  // Access check: Child company admins cannot manage corporate broadband plans
  if (!isSuperAdmin && !isInnovationsAdmin) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center max-w-lg mx-auto space-y-4 shadow-sm my-12 animate-in fade-in duration-150">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Broadband Plans &amp; Pricing belong exclusively to the Corporate Master &amp; Nexalus Innovations management panel. Subsidiary workspaces manage their respective operational catalogs only.
        </p>
      </div>
    );
  }

  // --- MULTI-PROVIDER PLAN HANDLERS ---
  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setSpeed('100 Mbps');
    setSpeedNumeric('100');
    setPrice('799');
    setOriginalPrice('');
    setCurrency('INR');
    setBillingPeriod('monthly');
    setValidityDays('30');
    setDataAllowance('Truly Unlimited (3300 GB FUP)');
    setDescription('');
    setFeatures([
      'High-Speed Symmetrical Optical Fiber',
      'Dual-Band Wi-Fi Router Included',
      'Unlimited Voice Calling'
    ]);
    setNewFeatureText('');
    setCity('All');
    setAvailability('active');
    setPopular(false);
    setFeatured(false);
    setPublished(true);
    setDisplayOrder(String(broadbandPlans.length + 1));
    setIsPlanModalOpen(true);
  };

  const openEditModal = (plan: BroadbandPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setSpeed(plan.speed);
    setSpeedNumeric(String(plan.speedNumeric || 100));
    setPrice(String(plan.price));
    setOriginalPrice(plan.originalPrice !== undefined ? String(plan.originalPrice) : '');
    setCurrency(plan.currency || 'INR');
    setBillingPeriod(plan.billingPeriod || 'monthly');
    setValidityDays(plan.validityDays !== undefined ? String(plan.validityDays) : '30');
    setDataAllowance(plan.dataAllowance || 'Truly Unlimited');
    setDescription(plan.description || '');
    setFeatures([...(plan.features || [])]);
    setNewFeatureText('');
    setCity(plan.city || 'All');
    setAvailability(plan.availability || 'active');
    setPopular(!!plan.popular);
    setFeatured(!!plan.featured);
    setPublished(plan.published !== false);
    setDisplayOrder(String(plan.displayOrder || 1));
    setIsPlanModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures(prev => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !speed.trim()) {
      error('Validation Error', 'Plan Name and Speed are required.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      error('Validation Error', 'Price must be a valid non-negative number.');
      return;
    }

    setIsSaving(true);
    try {
      const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        providerId: activeTab,
        name: name.trim(),
        slug: generatedSlug,
        speed: speed.trim(),
        speedNumeric: parseInt(speedNumeric, 10) || 100,
        price: numPrice,
        originalPrice: originalPrice.trim() ? parseFloat(originalPrice) : undefined,
        currency: currency.trim() || 'INR',
        billingPeriod,
        validityDays: validityDays.trim() ? parseInt(validityDays, 10) : undefined,
        dataAllowance: dataAllowance.trim() || 'Truly Unlimited',
        description: description.trim(),
        features: features.filter(f => f.trim() !== ''),
        city: city.trim() || 'All',
        availability,
        popular,
        featured,
        published,
        displayOrder: parseInt(displayOrder, 10) || 1
      };

      if (editingPlan) {
        await updateBroadbandPlan(editingPlan.id, payload);
        success('Plan Updated', `${name} has been updated successfully.`);
      } else {
        await createBroadbandPlan(payload);
        success('Plan Created', `${name} has been created for ${activeTab.toUpperCase()}.`);
      }

      setIsPlanModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save plan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublished = async (plan: BroadbandPlan) => {
    try {
      const nextPublished = !plan.published;
      await setBroadbandPlanPublished(plan.id, nextPublished);
      setBroadbandPlans(prev =>
        prev.map(p => (p.id === plan.id ? { ...p, published: nextPublished } : p))
      );
      success('Visibility Updated', `${plan.name} is now ${nextPublished ? 'Published' : 'Draft / Unpublished'}.`);
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const handleMoveOrder = async (plan: BroadbandPlan, direction: 'up' | 'down') => {
    const currentOrder = plan.displayOrder || 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    if (newOrder === currentOrder) return;

    try {
      await updateBroadbandPlanDisplayOrder(plan.id, newOrder);
      success('Reordered', `Updated display order for ${plan.name}.`);
      loadData();
    } catch (err: any) {
      error('Reorder Failed', err.message);
    }
  };

  // --- LEGACY ONE BROADBAND HANDLERS ---
  const openCreateOneModal = () => {
    setEditingOnePlan(null);
    setOneName('');
    setOneSpeed('100 Mbps');
    setOneSpeedNumeric('100');
    setOnePrice('699');
    setOneBillingPeriod('monthly');
    setOneDataAllowance('Truly Unlimited');
    setOneFeatures([
      'Symmetrical Speed Guarantee',
      'Dual-Band Wi-Fi Router Setup',
      'Low Jitter & Optimized Peering'
    ]);
    setOnePopular(false);
    setOneFeatured(true);
    setOnePublished(true);
    setIsOneModalOpen(true);
  };

  const openEditOneModal = (plan: InternetPlan) => {
    setEditingOnePlan(plan);
    setOneName(plan.name);
    setOneSpeed(plan.speed);
    setOneSpeedNumeric(String(plan.speedNumeric));
    setOnePrice(String(plan.price));
    setOneBillingPeriod(plan.billingPeriod);
    setOneDataAllowance(plan.dataAllowance);
    setOneFeatures([...plan.includedFeatures]);
    setOnePopular(!!plan.popular);
    setOneFeatured(plan.featured);
    setOnePublished(plan.published);
    setIsOneModalOpen(true);
  };

  const handleSaveOnePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oneName.trim() || !oneSpeed.trim()) {
      error('Validation Error', 'Plan Name and Speed are required.');
      return;
    }

    setIsSaving(true);
    try {
      const generatedSlug = oneName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const planPayload = {
        brandId: 'one-broadband' as const,
        name: oneName,
        slug: generatedSlug,
        speed: oneSpeed,
        speedNumeric: parseInt(oneSpeedNumeric, 10) || 100,
        price: parseFloat(onePrice) || 0,
        billingPeriod: oneBillingPeriod,
        dataAllowance: oneDataAllowance,
        includedFeatures: oneFeatures.filter(f => f.trim() !== ''),
        availability: 'active' as const,
        popular: onePopular,
        featured: oneFeatured,
        published: onePublished
      };

      if (editingOnePlan) {
        await updateInternetPlan(editingOnePlan.id, planPayload);
        success('Plan Updated', `${oneName} has been updated.`);
      } else {
        await createInternetPlan(planPayload);
        success('Plan Created', `${oneName} is now live.`);
      }

      setIsOneModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save plan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      if (deleteCandidate.isLegacy) {
        await deleteInternetPlan(deleteCandidate.id);
        success('Plan Removed', `${deleteCandidate.name} has been deleted.`);
      } else {
        await deleteBroadbandPlan(deleteCandidate.id);
        success('Plan Removed', `${deleteCandidate.name} has been deleted.`);
      }
      setDeleteCandidate(null);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getProviderTabTitle = (tab: ActiveTab) => {
    if (tab === 'one-broadband') return 'One Broadband (FTTH)';
    const found = providers.find(p => p.id === tab);
    if (found) return found.name;
    switch (tab) {
      case 'airtel':
        return 'Airtel Xstream Fiber';
      case 'bsnl':
        return 'BSNL Bharat Fiber';
      case 'railwire':
        return 'RailWire Retail Broadband';
      default:
        return tab.toUpperCase();
    }
  };

  const getProviderDotColor = (id: string) => {
    switch (id) {
      case 'airtel': return 'bg-red-600';
      case 'bsnl': return 'bg-blue-600';
      case 'railwire': return 'bg-orange-600';
      default: return 'bg-indigo-600';
    }
  };

  const getProviderActiveTextColor = (id: string) => {
    switch (id) {
      case 'airtel': return 'text-red-700';
      case 'bsnl': return 'text-blue-700';
      case 'railwire': return 'text-orange-700';
      default: return 'text-indigo-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Broadband Plans &amp; Tariffs Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure broadband speed tiers, tariffs, feature inclusions, and public visibility across regional providers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={openCreateProviderModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Plan Provider
          </Button>

          <Button
            variant="primary"
            onClick={activeTab === 'one-broadband' ? openCreateOneModal : openCreateModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add {activeTab === 'one-broadband' ? 'One Broadband Plan' : `${activeProvider?.name || activeTab.toUpperCase()} Plan`}
          </Button>
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex flex-wrap gap-1.5 items-center border border-slate-200/80">
        {providers.map((p) => {
          const isActive = activeTab === p.id;
          const dotColor = getProviderDotColor(p.id);
          const textColor = getProviderActiveTextColor(p.id);
          return (
            <div key={p.id} className="relative flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab(p.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? `bg-white ${textColor} shadow-sm border border-slate-200/60`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                <span>{p.name}</span>
                {p.enabled === false && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-200 text-slate-600 font-normal">
                    Hidden
                  </span>
                )}
              </button>

              {isActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditProviderModal(p);
                  }}
                  className="ml-1 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title={`Edit ${p.name} provider details`}
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setActiveTab('one-broadband')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'one-broadband'
              ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
          <span>One Broadband (Legacy)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold">
            {oneBroadbandPlans.length} Plans
          </span>
        </button>

        <button
          type="button"
          onClick={openCreateProviderModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 transition-all border border-dashed border-blue-300 ml-auto cursor-pointer"
          title="Add a new broadband provider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Provider</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2.5">
            <Wifi className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {getProviderTabTitle(activeTab)} Catalog
            </h2>
            {activeProvider && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeProvider.enabled !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {activeProvider.enabled !== false ? 'Live on Site' : 'Hidden from Site'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeProvider && (
              <button
                type="button"
                onClick={() => openEditProviderModal(activeProvider)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Provider Details</span>
              </button>
            )}
            <span className="text-[11px] text-slate-500 font-medium">
              {activeTab === 'one-broadband'
                ? `${oneBroadbandPlans.length} plans in system`
                : `${broadbandPlans.length} plans configured`}
            </span>
          </div>
        </div>

        {isLoading && broadbandPlans.length === 0 && oneBroadbandPlans.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-xs font-semibold">Loading plans from Cloud Firestore...</p>
          </div>
        ) : activeTab === 'one-broadband' ? (
          /* One Broadband Legacy Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Plan Name</th>
                  <th className="py-3.5 px-4">Speed</th>
                  <th className="py-3.5 px-4">Tariff Price</th>
                  <th className="py-3.5 px-4">Allowance</th>
                  <th className="py-3.5 px-4">Status / Popular</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {oneBroadbandPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{plan.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {plan.includedFeatures.length} features included
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-teal-800">
                      {plan.speed}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ₹{plan.price} / {plan.billingPeriod}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {plan.dataAllowance}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            plan.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {plan.published ? 'Published' : 'Draft'}
                        </span>
                        {plan.popular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            Popular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditOneModal(plan)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate({ id: plan.id, name: plan.name, isLegacy: true })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : broadbandPlans.length === 0 ? (
          /* Empty state for Airtel / BSNL / RailWire */
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                No plans created for {getProviderTabTitle(activeTab)} yet
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                You can create genuine broadband tariffs, speeds, and feature inclusions for {activeTab.toUpperCase()} using the button below.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
              Create First {activeTab.toUpperCase()} Plan
            </Button>
          </div>
        ) : (
          /* Multi-Provider Plans Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3.5 px-3 w-16 text-center">Order</th>
                  <th className="py-3.5 px-4">Plan Name & Details</th>
                  <th className="py-3.5 px-4">Speed</th>
                  <th className="py-3.5 px-4">Tariff Price</th>
                  <th className="py-3.5 px-4">Validity / Cycle</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {broadbandPlans.map((plan, index) => (
                  <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Display Order Controls */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono text-[11px] font-bold text-slate-700">
                        <span>#{plan.displayOrder || index + 1}</span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(plan, 'up')}
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Move up in display order"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(plan, 'down')}
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Move down in display order"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Plan Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div>
                          <div>{plan.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal line-clamp-1">
                            {plan.features?.length || 0} features &bull; {plan.dataAllowance || 'Truly Unlimited'} &bull; Area: {plan.city || 'All'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Speed */}
                    <td className="py-3.5 px-4 font-black text-blue-800">
                      {plan.speed}
                    </td>

                    {/* Tariff Price */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      <div>
                        {formatBroadbandPrice(plan.price, plan.currency)}
                        {plan.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">
                            {formatBroadbandPrice(plan.originalPrice, plan.currency)}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal uppercase">
                        per {plan.billingPeriod}
                      </div>
                    </td>

                    {/* Billing Period & Validity */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="capitalize font-semibold text-slate-700">{plan.billingPeriod}</div>
                      <div className="text-[10px] text-slate-400">
                        {plan.validityDays ? `${plan.validityDays} days validity` : 'Standard cycle'}
                      </div>
                    </td>

                    {/* Published & Highlights */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(plan)}
                          title="Click to toggle Published / Draft status"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                            plan.published
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {plan.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{plan.published ? 'Published' : 'Draft'}</span>
                        </button>

                        {plan.popular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Popular
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(plan)}
                          title="Edit plan details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate({ id: plan.id, name: plan.name })}
                          title="Delete plan"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Multi-Provider Plan Modal (Airtel / BSNL / RailWire) */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => !isSaving && setIsPlanModalOpen(false)}
        title={editingPlan ? `Edit ${activeTab.toUpperCase()} Plan` : `Create ${activeTab.toUpperCase()} Broadband Plan`}
        maxWidth="4xl"
      >
        <form onSubmit={handleSavePlan} className="space-y-5 max-h-[75vh] overflow-y-auto px-2 py-1">
          <div>
            <Input
              label="Plan Display Name (Card Title Heading)"
              placeholder="e.g. Airtel 31 Mbps (6 Months)"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={isSaving}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Card title heading displayed prominently under the speed banner on public tariffs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Speed Display Text (e.g. 31 Mbps)"
              placeholder="e.g. 100 Mbps"
              value={speed}
              onChange={e => {
                const val = e.target.value;
                const prevSpeed = speed;
                setSpeed(val);
                const numMatch = val.match(/(\d+)/);
                if (numMatch) {
                  setSpeedNumeric(numMatch[1]);
                }
                if (prevSpeed && prevSpeed.trim() && val.trim() && name.includes(prevSpeed)) {
                  setName(name.replace(prevSpeed, val));
                }
                if (prevSpeed && prevSpeed.trim() && val.trim() && description.includes(prevSpeed)) {
                  setDescription(description.replace(new RegExp(prevSpeed, 'g'), val));
                }
                if (prevSpeed && prevSpeed.trim() && val.trim() && Array.isArray(features)) {
                  setFeatures(prev => prev.map(f => f.includes(prevSpeed) ? f.replace(new RegExp(prevSpeed, 'g'), val) : f));
                }
              }}
              required
              disabled={isSaving}
            />
            <Input
              label="Numeric Speed (Mbps for Sorting)"
              type="number"
              placeholder="e.g. 100"
              value={speedNumeric}
              onChange={e => setSpeedNumeric(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Tariff Price"
              type="number"
              placeholder="e.g. 799"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              disabled={isSaving}
            />
            <Input
              label="Original / Strikethrough Price (Optional)"
              type="number"
              placeholder="e.g. 999"
              value={originalPrice}
              onChange={e => setOriginalPrice(e.target.value)}
              disabled={isSaving}
            />
            <Input
              label="Currency Code"
              value={currency}
              onChange={e => setCurrency(e.target.value.toUpperCase())}
              required
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Period</label>
              <select
                value={billingPeriod}
                onChange={e => setBillingPeriod(e.target.value as any)}
                disabled={isSaving}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly (3 Months)</option>
                <option value="semi-annually">Semi-Annually (6 Months)</option>
                <option value="annually">Annually (12 Months)</option>
                <option value="custom">Custom Cycle</option>
              </select>
            </div>
            <Input
              label="Validity (Days)"
              type="number"
              placeholder="e.g. 30"
              value={validityDays}
              onChange={e => setValidityDays(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Data Allowance"
              placeholder="e.g. Truly Unlimited (3300 GB FUP)"
              value={dataAllowance}
              onChange={e => setDataAllowance(e.target.value)}
              disabled={isSaving}
            />
            <Input
              label="City / Regional Restriction"
              placeholder="e.g. All or Chiplun"
              value={city}
              onChange={e => setCity(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <TextArea
            label="Plan Description"
            placeholder="Brief overview of features, router perks, or entertainment inclusions..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            disabled={isSaving}
          />

          {/* Features Builder */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Included Features &amp; Perks</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add plan perk (e.g. Dual-band optical router included)..."
                value={newFeatureText}
                onChange={e => setNewFeatureText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                disabled={isSaving}
                className="flex-1 text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
              <Button variant="secondary" size="sm" type="button" onClick={handleAddFeature} disabled={isSaving}>
                Add
              </Button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {features.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-700">{f}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-sm font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Options & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <Input
              label="Display Order (Rank)"
              type="number"
              value={displayOrder}
              onChange={e => setDisplayOrder(e.target.value)}
              required
              disabled={isSaving}
            />
            <div className="flex flex-col justify-end space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  disabled={isSaving}
                  className="rounded-sm border-slate-300 text-blue-600"
                />
                Published (Publicly Visible)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={e => setPopular(e.target.checked)}
                  disabled={isSaving}
                  className="rounded-sm border-slate-300 text-blue-600"
                />
                Mark as Popular Choice
              </label>
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  disabled={isSaving}
                  className="rounded-sm border-slate-300 text-blue-600"
                />
                Featured Highlight
              </label>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              disabled={isSaving}
              onClick={() => setIsPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSaving}
              icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {isSaving ? 'Saving to Firestore...' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Legacy One Broadband Modal */}
      <Modal
        isOpen={isOneModalOpen}
        onClose={() => !isSaving && setIsOneModalOpen(false)}
        title={editingOnePlan ? 'Edit One Broadband Plan' : 'Create One Broadband Plan'}
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveOnePlan} className="space-y-4">
          <Input
            label="Plan Name"
            placeholder="e.g. 100 MBPS UNLIMITED DATA"
            value={oneName}
            onChange={e => setOneName(e.target.value)}
            required
            disabled={isSaving}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Speed"
              placeholder="e.g. 100 Mbps"
              value={oneSpeed}
              onChange={e => {
                const val = e.target.value;
                setOneSpeed(val);
                const numMatch = val.match(/(\d+)/);
                if (numMatch) {
                  setOneSpeedNumeric(numMatch[1]);
                }
              }}
              required
              disabled={isSaving}
            />
            <Input
              label="Numeric Speed"
              type="number"
              value={oneSpeedNumeric}
              onChange={e => setOneSpeedNumeric(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monthly Price (₹)"
              type="number"
              value={onePrice}
              onChange={e => setOnePrice(e.target.value)}
              required
              disabled={isSaving}
            />
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Period</label>
              <select
                value={oneBillingPeriod}
                onChange={e => setOneBillingPeriod(e.target.value as any)}
                disabled={isSaving}
                className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          <Input
            label="Data Allowance"
            value={oneDataAllowance}
            onChange={e => setOneDataAllowance(e.target.value)}
            disabled={isSaving}
          />
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onePublished}
                onChange={e => setOnePublished(e.target.checked)}
                disabled={isSaving}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onePopular}
                onChange={e => setOnePopular(e.target.checked)}
                disabled={isSaving}
              />
              Popular Badge
            </label>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" disabled={isSaving} onClick={() => setIsOneModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingOnePlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={!!deleteCandidate}
          onClose={() => !isDeleting && setDeleteCandidate(null)}
          title="Delete Broadband Plan"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-slate-900">{deleteCandidate.name}</span>?
            </p>
            <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl font-medium">
              This action removes the tariff and plan record from Cloud Firestore. It will no longer be visible to visitors or selectable in enquiries.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteCandidate(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isDeleting}
                onClick={handleDelete}
                icon={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              >
                {isDeleting ? 'Deleting...' : 'Delete Plan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Plan Provider Management Modal */}
      <Modal
        isOpen={isProviderModalOpen}
        onClose={() => !isSavingProvider && setIsProviderModalOpen(false)}
        title={editingProvider ? `Edit ${editingProvider.name} Provider` : 'Add New Broadband Provider'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProvider} className="space-y-5">
          <div className="space-y-4">
            <div>
              <Input
                label="Provider Brand Name"
                placeholder="e.g. JioFiber, Tata Play Fiber, Excitel"
                value={providerName}
                onChange={(e) => {
                  setProviderName(e.target.value);
                  if (!editingProvider) {
                    setProviderId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The commercial name displayed on tabs and tariff cards.
              </p>
            </div>

            <div>
              <Input
                label="Provider Identifier (ID / Slug)"
                placeholder="e.g. jio-fiber, tata-play"
                value={providerId}
                onChange={(e) => setProviderId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                disabled={!!editingProvider}
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Unique system identifier for Firestore tariffs. {editingProvider ? '(Locked for existing provider)' : 'Generated automatically from name.'}
              </p>
            </div>

            <div>
              <TextArea
                label="Provider Description & Value Proposition"
                placeholder="Brief summary of connection speeds, OTT perks, SLA, and customer support for this provider..."
                value={providerDescription}
                onChange={(e) => setProviderDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Display Order"
                  type="number"
                  min="1"
                  max="99"
                  value={providerDisplayOrder}
                  onChange={(e) => setProviderDisplayOrder(e.target.value)}
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tab ordering position (1 = first).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Public Website Visibility
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="providerEnabled"
                    checked={providerEnabled}
                    onChange={(e) => setProviderEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="providerEnabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Active &amp; Visible on Public Website
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Uncheck to hide this provider and its tariffs from customers.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            {editingProvider && !['airtel', 'bsnl', 'railwire'].includes(editingProvider.id) ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  setIsProviderModalOpen(false);
                  setDeleteProviderCandidate(editingProvider);
                }}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Provider
              </Button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsProviderModalOpen(false)}
                disabled={isSavingProvider}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSavingProvider}
                icon={isSavingProvider ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              >
                {isSavingProvider ? 'Saving...' : editingProvider ? 'Update Provider' : 'Create Provider'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Provider Confirmation Modal */}
      {deleteProviderCandidate && (
        <Modal
          isOpen={!!deleteProviderCandidate}
          onClose={() => !isDeletingProvider && setDeleteProviderCandidate(null)}
          title="Delete Broadband Provider"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete the provider{' '}
              <strong className="text-slate-900">{deleteProviderCandidate.name}</strong>?
              This will remove the provider tab from the admin panel and public portal.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteProviderCandidate(null)}
                disabled={isDeletingProvider}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteProvider}
                disabled={isDeletingProvider}
                icon={isDeletingProvider ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              >
                {isDeletingProvider ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
