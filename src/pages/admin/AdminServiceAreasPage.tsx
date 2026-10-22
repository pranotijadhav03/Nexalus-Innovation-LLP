import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
  getCachedServiceAreas
} from '../../firebase/services';
import { ServiceArea, BrandId } from '../../types';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  ShieldAlert,
  Search,
  Check,
  X,
  Building2,
  Truck,
  Shield,
  Wifi,
  Sparkles,
  Tag,
  RefreshCw,
  Layers,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';

const PRESET_TECH_SERVICES = [
  '4K CCTV Surveillance',
  'Optical Fiber Internet',
  'Enterprise Networking & Switching',
  'Structured Cabling & Rack Setup',
  'Annual Maintenance Contract (AMC)'
];

const PRESET_AM_SERVICES = [
  '20-Litre Packaged Drinking Water',
  'Premium Bulk Ice Cream Delivery',
  'Farm Fresh Cow & Buffalo Milk',
  'Cold-Chain Logistics & Transport'
];

export const AdminServiceAreasPage: React.FC = () => {
  const { isAmAdmin, isInnovationsAdmin, isSuperAdmin, isAdmin } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const activeConsole = outletCtx?.activeConsole || 'master';
  const { success, error } = useToast();

  const [areas, setAreas] = useState<ServiceArea[]>(() => getCachedServiceAreas());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);

  // Form State
  const [brandId, setBrandId] = useState<ServiceArea['brandId']>('all');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Chiplun');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('415605');
  const [status, setStatus] = useState<'fully_operational' | 'expanding_soon' | 'planned'>('fully_operational');
  const [notes, setNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteCandidate, setDeleteCandidate] = useState<ServiceArea | null>(null);

  // Sync initial brand selection with active console
  useEffect(() => {
    if (activeConsole === 'nexalus-innovations') {
      setBrandFilter('nexalus');
    } else if (activeConsole === 'am-distributors') {
      setBrandFilter('am-distributors');
    }
  }, [activeConsole]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getServiceAreas();
      setAreas(data);
    } catch (err: any) {
      error('Failed to Load', err?.message || 'Could not fetch service areas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center max-w-lg mx-auto space-y-4 shadow-sm my-12 animate-in fade-in duration-150">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600">
          Service area management is restricted to authorized administrative consoles.
        </p>
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingArea(null);
    let defaultBrand: ServiceArea['brandId'] = 'all';
    let defaultCity = 'Chiplun';
    let defaultPincode = '415605';
    let defaultServices = [...PRESET_AM_SERVICES];

    if (activeConsole === 'nexalus-innovations' || isInnovationsAdmin) {
      defaultBrand = 'nexalus';
      defaultCity = 'Sangli';
      defaultPincode = '416416';
      defaultServices = [...PRESET_TECH_SERVICES];
    } else if (activeConsole === 'am-distributors' || isAmAdmin) {
      defaultBrand = 'am-distributors';
      defaultCity = 'Chiplun';
      defaultPincode = '415605';
      defaultServices = [...PRESET_AM_SERVICES];
    }

    setBrandId(defaultBrand);
    setLocality('');
    setCity(defaultCity);
    setState('Maharashtra');
    setPincode(defaultPincode);
    setStatus('fully_operational');
    setNotes('');
    setSelectedServices(defaultServices);
    setCustomServiceInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (area: ServiceArea) => {
    setEditingArea(area);
    setBrandId(area.brandId);
    setLocality(area.locality);
    setCity(area.city);
    setState(area.state);
    setPincode(area.pincode);
    setStatus(area.status);
    setNotes(area.notes || '');
    setSelectedServices(area.services && area.services.length > 0 ? [...area.services] : []);
    setCustomServiceInput('');
    setIsModalOpen(true);
  };

  const togglePresetService = (serviceName: string) => {
    if (selectedServices.includes(serviceName)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceName));
    } else {
      setSelectedServices([...selectedServices, serviceName]);
    }
  };

  const handleAddCustomService = () => {
    const trimmed = customServiceInput.trim();
    if (!trimmed) return;
    if (!selectedServices.includes(trimmed)) {
      setSelectedServices([...selectedServices, trimmed]);
    }
    setCustomServiceInput('');
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setSelectedServices(selectedServices.filter(s => s !== serviceToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locality.trim() || !pincode.trim() || !city.trim()) {
      error('Validation Error', 'City, Locality, and 6-digit PIN code are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        brandId,
        locality: locality.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        status,
        notes: notes.trim(),
        services: selectedServices
      };

      if (editingArea) {
        await updateServiceArea(editingArea.id, payload);
        success('Service Area Updated', `${locality} (${city}) has been updated.`);
      } else {
        await createServiceArea(payload);
        success('Service Area Added', `${locality} (${city}) registered with ${selectedServices.length} active services.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save area', err.message || 'Error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteServiceArea(deleteCandidate.id);
      success('Area Removed', `${deleteCandidate.locality} was deleted from registry.`);
      setDeleteCandidate(null);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  // Filtered list
  const filteredAreas = useMemo(() => {
    return areas.filter(a => {
      // Console or user filter
      if (brandFilter !== 'all') {
        if (brandFilter === 'nexalus' && !(a.brandId === 'nexalus' || a.brandId === 'one-broadband' || a.brandId === 'all')) {
          return false;
        }
        if (brandFilter === 'am-distributors' && !(a.brandId === 'am-distributors' || a.brandId === 'all')) {
          return false;
        }
      }

      if (statusFilter !== 'all' && a.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inCity = a.city.toLowerCase().includes(q);
        const inLocality = a.locality.toLowerCase().includes(q);
        const inPin = a.pincode.includes(q);
        const inServices = (a.services || []).some(s => s.toLowerCase().includes(q));
        const inNotes = (a.notes || '').toLowerCase().includes(q);
        return inCity || inLocality || inPin || inServices || inNotes;
      }

      return true;
    });
  }, [areas, brandFilter, statusFilter, searchQuery]);

  // Aggregate stats
  const totalCities = useMemo(() => {
    const s = new Set<string>();
    areas.forEach(a => s.add(a.city.toLowerCase().trim()));
    return s.size;
  }, [areas]);

  const totalServices = useMemo(() => {
    const s = new Set<string>();
    areas.forEach(a => (a.services || []).forEach(serv => s.add(serv)));
    return s.size;
  }, [areas]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2 border border-blue-200">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Operational Geographic Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Areas Covered &amp; City Services Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage operational cities, local delivery hubs, PIN codes, and available services across Nexalus Innovations LLP and A.M. Distributors.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={loadData}
            isLoading={isLoading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="teal"
            size="md"
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
            className="shadow-md shadow-teal-700/20"
          >
            Add Service Area
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{areas.length}</div>
            <div className="text-xs font-bold text-slate-500">Registered Localities</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalCities}</div>
            <div className="text-xs font-bold text-slate-500">Operational Cities</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalServices}</div>
            <div className="text-xs font-bold text-slate-500">Service Types Offered</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {areas.filter(a => a.status === 'fully_operational').length}
            </div>
            <div className="text-xs font-bold text-slate-500">Fully Active Zones</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search city, PIN code, locality, or service..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Division Filter Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBrandFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                brandFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Hubs ({areas.length})
            </button>
            <button
              type="button"
              onClick={() => setBrandFilter('nexalus')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                brandFilter === 'nexalus' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nexalus Tech
            </button>
            <button
              type="button"
              onClick={() => setBrandFilter('am-distributors')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                brandFilter === 'am-distributors' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A.M. Logistics
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter areas by operational status"
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="fully_operational">Fully Operational</option>
            <option value="expanding_soon">Expanding Soon</option>
            <option value="planned">Planned Nodes</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">PIN &amp; Locality</th>
                <th className="py-3.5 px-4">City / State</th>
                <th className="py-3.5 px-4">Division</th>
                <th className="py-3.5 px-4 min-w-[280px]">Available Services in City</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Feeder / Schedule Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold">No service areas found matching your query.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setBrandFilter('all'); setStatusFilter('all'); }}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAreas.map(area => {
                  const isAm = area.brandId === 'am-distributors';
                  const isTech = area.brandId === 'nexalus' || area.brandId === 'one-broadband';

                  return (
                    <tr key={area.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* PIN & Locality */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-black text-slate-900 text-sm">{area.pincode}</div>
                        <div className="font-bold text-slate-800 text-xs mt-0.5">{area.locality}</div>
                      </td>

                      {/* City & State */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{area.city}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{area.state}</div>
                      </td>

                      {/* Division Badge */}
                      <td className="py-3.5 px-4">
                        {area.brandId === 'all' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Sparkles className="w-3 h-3" />
                            All Divisions
                          </span>
                        ) : isAm ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            <Truck className="w-3 h-3" />
                            A.M. Distributors
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Shield className="w-3 h-3" />
                            Nexalus Tech
                          </span>
                        )}
                      </td>

                      {/* Available Services */}
                      <td className="py-3.5 px-4">
                        {area.services && area.services.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {area.services.map((svc, idx) => {
                              const isWater = svc.toLowerCase().includes('water');
                              const isMilk = svc.toLowerCase().includes('milk') || svc.toLowerCase().includes('ice');
                              const isCctv = svc.toLowerCase().includes('cctv');
                              const isFiber = svc.toLowerCase().includes('fiber') || svc.toLowerCase().includes('net');

                              let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                              if (isWater) badgeClass = 'bg-cyan-50 text-cyan-800 border-cyan-200';
                              else if (isMilk) badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                              else if (isCctv) badgeClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                              else if (isFiber) badgeClass = 'bg-blue-50 text-blue-800 border-blue-200';

                              return (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}
                                >
                                  <Tag className="w-2.5 h-2.5 opacity-70" />
                                  <span>{svc}</span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No explicit services tagged</span>
                        )}
                      </td>

                      {/* Operational Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            area.status === 'fully_operational'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : area.status === 'expanding_soon'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              area.status === 'fully_operational'
                                ? 'bg-emerald-500 animate-pulse'
                                : area.status === 'expanding_soon'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {area.status === 'fully_operational'
                            ? 'OPERATIONAL'
                            : area.status === 'expanding_soon'
                            ? 'EXPANDING'
                            : 'PLANNED'}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                        {area.notes || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(area)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Service Area"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(area)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Service Area"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArea ? `Edit Service Area — ${editingArea.locality}` : 'Register New Service Area & City Services'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Brand Division Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Operating Division / Entity *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBrandId('all')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  brandId === 'all'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="font-extrabold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>All Divisions</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Parent Website &amp; Both Child Sites</div>
              </button>

              <button
                type="button"
                onClick={() => setBrandId('nexalus')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  brandId === 'nexalus' || brandId === 'one-broadband'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="font-extrabold text-xs flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nexalus Innovations</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">CCTV, Fiber Leased Lines, IT Switching</div>
              </button>

              <button
                type="button"
                onClick={() => setBrandId('am-distributors')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  brandId === 'am-distributors'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="font-extrabold text-xs flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-teal-600" />
                  <span>A.M. Distributors</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Chiplun Water, Dairy &amp; Cold-Chain</div>
              </button>
            </div>
          </div>

          {/* Location Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City Name *"
              placeholder="e.g. Chiplun, Ratnagiri, Sangli, Pune..."
              value={city}
              onChange={e => setCity(e.target.value)}
              required
            />
            <Input
              label="Locality / Industrial Hub / Depot *"
              placeholder="e.g. Chiplun MIDC & Industrial Cluster"
              value={locality}
              onChange={e => setLocality(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="6-Digit PIN Code *"
              placeholder="415605"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              required
            />
            <Input
              label="State *"
              value={state}
              onChange={e => setState(e.target.value)}
              required
            />
            <Select
              label="Operational Status *"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              options={[
                { value: 'fully_operational', label: 'Fully Operational (Active Dispatch)' },
                { value: 'expanding_soon', label: 'Expanding Soon (Rolling Out)' },
                { value: 'planned', label: 'Planned / Future Node' }
              ]}
            />
          </div>

          {/* Available Services in this Area / City */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black text-slate-900">
                  Available Services in this City / Zone *
                </label>
                <p className="text-[11px] text-slate-500">
                  Select which services are operational in this city so users can see and book them.
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {selectedServices.length} Selected
              </span>
            </div>

            {/* Quick 1-Click Checkboxes */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Nexalus Innovations Tech Services:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TECH_SERVICES.map(svc => {
                  const isChecked = selectedServices.includes(svc);
                  return (
                    <label
                      key={svc}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50/80 border-blue-400 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePresetService(svc)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{svc}</span>
                    </label>
                  );
                })}
              </div>

              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 pt-2">
                A.M. Distributors Wholesale Logistics:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_AM_SERVICES.map(svc => {
                  const isChecked = selectedServices.includes(svc);
                  return (
                    <label
                      key={svc}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-teal-50/80 border-teal-400 text-teal-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePresetService(svc)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>{svc}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Service Input */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or type custom service (e.g. Commercial Cold-Room Storage)..."
                  value={customServiceInput}
                  onChange={e => setCustomServiceInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomService();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomService}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Active Selected Services Tag Cloud with Remove Button */}
            {selectedServices.length > 0 && (
              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                {selectedServices.map(svc => (
                  <span
                    key={svc}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-800 shadow-2xs"
                  >
                    <span>{svc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(svc)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Remove service"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Internal / Route Schedule Notes"
            placeholder="e.g. Daily morning 4 AM milk delivery vehicle; 10Gbps OTDR tested fiber backhaul"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="teal"
              size="md"
              isLoading={isSaving}
              icon={<Check className="w-4 h-4" />}
            >
              Save Service Area &amp; Services
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Area Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">{deleteCandidate?.locality}</strong> ({deleteCandidate?.city}, {deleteCandidate?.pincode})?
          </p>
          <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
            This will immediately remove this coverage hub and its services from the public city coverage checker on both parent and child websites.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
