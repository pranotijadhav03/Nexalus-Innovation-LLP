import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getCachedServices,
  getSolutionRequirements,
  createSolutionRequirement,
  updateSolutionRequirement,
  deleteSolutionRequirement,
  getCachedSolutionRequirements
} from '../../firebase/services';
import { Service, BrandId, SolutionRequirement } from '../../types';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import { Plus, Edit2, Trash2, Wrench, Shield, Wifi, Building2, ArrowRight, Sliders, CheckCircle2 } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, canManageBrand } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const activeConsole = outletCtx?.activeConsole || 'master';
  const activeBrandFilter = outletCtx?.activeBrandFilter || 'corporate';
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = 'services';
  const { success, error } = useToast();

  const effectiveBrand: BrandId | 'nexalus' =
    activeConsole === 'am-distributors' || isAmAdmin
      ? 'am-distributors'
      : activeConsole === 'nexalus-innovations' || isInnovationsAdmin
      ? 'nexalus-innovations'
      : 'nexalus';

  const [services, setServices] = useState<Service[]>(() =>
    getCachedServices(effectiveBrand)
  );
  const [solutions, setSolutions] = useState<SolutionRequirement[]>(() =>
    getCachedSolutionRequirements(effectiveBrand === 'nexalus' ? 'general' : effectiveBrand)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Service Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Service Form
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState<BrandId | 'nexalus'>('nexalus');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [iconName, setIconName] = useState('ShieldCheck');
  const [features, setFeatures] = useState<string[]>([
    'Site survey & cabling layout',
    'Certified hardware installation'
  ]);
  const [targetAudience, setTargetAudience] = useState('Residential, Commercial');
  const [published, setPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Service | null>(null);

  // Solution Requirement Modal State
  const [isSolModalOpen, setIsSolModalOpen] = useState(false);
  const [editingSol, setEditingSol] = useState<SolutionRequirement | null>(null);
  const [solLabel, setSolLabel] = useState('');
  const [solValue, setSolValue] = useState('');
  const [solBrandId, setSolBrandId] = useState<BrandId | 'general' | 'all'>('general');
  const [solDescription, setSolDescription] = useState('');
  const [solOrder, setSolOrder] = useState<number>(1);
  const [solPublished, setSolPublished] = useState(true);
  const [isSavingSol, setIsSavingSol] = useState(false);
  const [deleteSolCandidate, setDeleteSolCandidate] = useState<SolutionRequirement | null>(null);



  const loadData = async () => {
    setIsLoading(true);
    try {
      const [data, solData] = await Promise.all([
        getServices(effectiveBrand as any),
        getSolutionRequirements(effectiveBrand === 'nexalus' ? 'general' : effectiveBrand, false)
      ]);
      setServices(data);
      setSolutions(solData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveBrand, activeConsole]);

  const openCreateModal = () => {
    setEditingService(null);
    setTitle('');
    const defaultBrand = isSuperAdmin
      ? (activeConsole === 'am-distributors'
          ? 'am-distributors'
          : activeConsole === 'nexalus-innovations'
          ? 'nexalus-innovations'
          : ('nexalus' as any))
      : isAmAdmin
      ? 'am-distributors'
      : 'nexalus-innovations';
    setBrandId(defaultBrand);
    setShortDescription('');
    setFullDescription('');
    setIconName(defaultBrand === 'am-distributors' ? 'Truck' : 'ShieldCheck');
    setFeatures(['Certified technical deployment', 'Dedicated warranty support']);
    setTargetAudience('Residential, Commercial');
    setPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setBrandId(service.brandId);
    setShortDescription(service.shortDescription);
    setFullDescription(service.fullDescription);
    setIconName(service.iconName || 'ShieldCheck');
    setFeatures(service.features || []);
    setTargetAudience(service.targetAudience.join(', '));
    setPublished(service.published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim()) return;

    if (!canManageBrand(brandId === 'nexalus' ? 'general' : brandId)) {
      error('Access Denied', 'You cannot create services outside your assigned operating entity.');
      return;
    }

    setIsSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const audienceArr = targetAudience.split(',').map(s => s.trim()).filter(Boolean);

      if (editingService) {
        await updateService(editingService.id, {
          title,
          slug,
          brandId,
          shortDescription,
          fullDescription,
          iconName,
          features,
          targetAudience: audienceArr,
          published
        });
        success('Service Updated', `${title} updated.`);
      } else {
        await createService({
          title,
          slug,
          brandId,
          shortDescription,
          fullDescription,
          iconName,
          features,
          targetAudience: audienceArr,
          published,
          featured: false
        });
        success('Service Created', `${title} added.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save service', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteService(deleteCandidate.id);
      success('Service Deleted', `${deleteCandidate.title} was removed.`);
      setDeleteCandidate(null);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  // Solution Requirements Handlers
  const openCreateSolModal = () => {
    setEditingSol(null);
    setSolLabel('');
    setSolValue('');
    const defaultBrand = activeConsole === 'am-distributors'
      ? 'am-distributors'
      : activeConsole === 'nexalus-innovations'
      ? 'nexalus-innovations'
      : 'general';
    setSolBrandId(defaultBrand);
    setSolDescription('');
    setSolOrder(solutions.length + 1);
    setSolPublished(true);
    setIsSolModalOpen(true);
  };

  const openEditSolModal = (sol: SolutionRequirement) => {
    setEditingSol(sol);
    setSolLabel(sol.label);
    setSolValue(sol.value);
    setSolBrandId(sol.brandId);
    setSolDescription(sol.description || '');
    setSolOrder(sol.order || 1);
    setSolPublished(sol.published);
    setIsSolModalOpen(true);
  };

  const handleSaveSol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solLabel.trim()) return;

    setIsSavingSol(true);
    try {
      const value = solValue.trim() || solLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingSol) {
        await updateSolutionRequirement(editingSol.id, {
          label: solLabel,
          value,
          brandId: solBrandId,
          description: solDescription,
          order: Number(solOrder) || 1,
          published: solPublished
        });
        success('Solution Requirement Updated', `${solLabel} was successfully updated.`);
      } else {
        await createSolutionRequirement({
          label: solLabel,
          value,
          brandId: solBrandId,
          description: solDescription,
          order: Number(solOrder) || 1,
          published: solPublished
        });
        success('Solution Requirement Added', `${solLabel} has been added to the quotation form!`);
      }
      setIsSolModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save solution requirement', err.message);
    } finally {
      setIsSavingSol(false);
    }
  };

  const handleDeleteSol = async () => {
    if (!deleteSolCandidate) return;
    try {
      await deleteSolutionRequirement(deleteSolCandidate.id);
      success('Solution Requirement Deleted', `${deleteSolCandidate.label} was removed.`);
      setDeleteSolCandidate(null);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const filteredServices = services.filter(srv => {
    if (activeConsole === 'am-distributors' || isAmAdmin) {
      return srv.brandId === 'am-distributors';
    }
    if (activeConsole === 'nexalus-innovations' || (isInnovationsAdmin && !isSuperAdmin)) {
      return (
        srv.brandId === 'nexalus-innovations' ||
        srv.brandId === 'cp-plus' ||
        srv.brandId === 'one-broadband' ||
        srv.brandId === 'itti-networking'
      );
    }
    // Corporate Parent Master: strictly parent corporate services!
    return srv.brandId === 'nexalus';
  });

  const filteredSolutions = solutions.filter(sol => {
    if (activeConsole === 'am-distributors' || isAmAdmin) {
      return sol.brandId === 'am-distributors';
    }
    if (activeConsole === 'nexalus-innovations' || (isInnovationsAdmin && !isSuperAdmin)) {
      return sol.brandId === 'nexalus-innovations' || sol.brandId === 'cp-plus' || sol.brandId === 'one-broadband' || sol.brandId === 'itti-networking';
    }
    // Corporate Parent Master: strictly parent corporate solutions!
    return (sol.brandId as any) === 'nexalus' || sol.brandId === 'general';
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeConsole === 'nexalus-innovations'
              ? 'Nexalus Innovations Services'
              : activeConsole === 'am-distributors'
              ? 'A.M. Distributors Services'
              : 'Corporate Parent Services Portfolio'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeConsole === 'nexalus-innovations'
              ? 'Configure CCTV installation, optical fiber maintenance contracts, and network cabling deployments.'
              : activeConsole === 'am-distributors'
              ? 'Configure refrigerated fleet delivery, cold-chain distribution, and wholesale supply services.'
              : 'Turnkey optical fiber engineering, centralized surveillance control rooms, and parent infrastructure.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
            Add New Service
          </Button>
        </div>
      </div>



      {/* Corporate Super Admin Workspace Context Link */}
      {isSuperAdmin && activeConsole === 'master' && (
        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>You are viewing <strong>Corporate Parent Master</strong> console.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => outletCtx?.openChildConsole('nexalus-innovations')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-all cursor-pointer shadow-2xs"
            >
              Nexalus Innovations Workspace →
            </button>
            <button
              type="button"
              onClick={() => outletCtx?.openChildConsole('am-distributors')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-100 text-teal-700 font-bold border border-teal-200 transition-all cursor-pointer shadow-2xs"
            >
              A.M. Distributors Workspace →
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: SERVICES PORTFOLIO */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Service Title</th>
                  <th className="py-3.5 px-4">Division</th>
                  <th className="py-3.5 px-4">Target Sectors</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map(srv => (
                  <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{srv.title}</div>
                      <div className="text-[11px] font-normal text-slate-500 truncate max-w-sm">
                        {srv.shortDescription}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <BrandBadge brandId={srv.brandId} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {srv.targetAudience.join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          srv.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {srv.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(srv)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(srv)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* SERVICE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Create New Service'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Service Title *"
            placeholder="e.g. Turnkey CCTV Installation & Configuration"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isSuperAdmin ? (
              <Select
                label="Operating Company *"
                value={brandId}
                onChange={e => setBrandId(e.target.value as any)}
                options={[
                  ...(activeConsole === 'master' ? [{ value: 'nexalus', label: 'Nexalus Corporate Parent (Turnkey & Infrastructure)' }] : []),
                  ...(activeConsole === 'nexalus-innovations' ? [{ value: 'nexalus-innovations', label: 'Nexalus Innovations (CCTV, Internet, Network)' }] : []),
                  ...(activeConsole === 'am-distributors' ? [{ value: 'am-distributors', label: 'A.M. Distributors Chiplun (Cold-Chain)' }] : [])
                ]}
              />
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Operating Company
                </label>
                <div className="p-2.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">
                  {brandId === 'am-distributors' ? 'A.M. Distributors Chiplun' : 'Nexalus Innovations'} (Role Locked)
                </div>
              </div>
            )}

            <Select
              label="Service Icon"
              value={iconName}
              onChange={e => setIconName(e.target.value)}
              options={[
                { value: 'ShieldCheck', label: 'Shield (Security)' },
                { value: 'Wifi', label: 'Wifi (Broadband)' },
                { value: 'Wrench', label: 'Wrench (Maintenance/AMC)' },
                { value: 'Building2', label: 'Building (Enterprise)' },
                { value: 'Server', label: 'Server (Data & Network)' },
                { value: 'Cpu', label: 'Cpu (Hardware & Systems)' }
              ]}
            />
          </div>

          <TextArea
            label="Short Summary"
            placeholder="One-paragraph summary for cards..."
            rows={2}
            value={shortDescription}
            onChange={e => setShortDescription(e.target.value)}
            required
          />

          <TextArea
            label="Full Detailed Description"
            placeholder="In-depth explanation of technical deliverables, site surveys, and scope..."
            rows={3}
            value={fullDescription}
            onChange={e => setFullDescription(e.target.value)}
          />

          <Input
            label="Target Audience (comma-separated)"
            placeholder="Residential, Commercial, Industrial Complexes"
            value={targetAudience}
            onChange={e => setTargetAudience(e.target.value)}
          />

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={published}
                onChange={e => setPublished(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4"
              />
              Published to Public Site
            </label>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* SOLUTION REQUIREMENT MODAL */}
      <Modal
        isOpen={isSolModalOpen}
        onClose={() => setIsSolModalOpen(false)}
        title={editingSol ? 'Edit Solution Requirement' : 'Add New Solution Requirement'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveSol} className="space-y-4">
          <Input
            label="Solution Requirement Label (Dropdown Text) *"
            placeholder="e.g. Commercial CCTV Surveillance & Security Setup"
            value={solLabel}
            onChange={e => {
              setSolLabel(e.target.value);
              if (!editingSol && !solValue) {
                setSolValue(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30));
              }
            }}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="System Code / Value"
              placeholder="e.g. cctv or water-supply"
              value={solValue}
              onChange={e => setSolValue(e.target.value)}
            />

            <Select
              label="Associated Division / Entity"
              value={solBrandId}
              onChange={e => setSolBrandId(e.target.value as any)}
              options={[
                ...(activeConsole === 'master' ? [{ value: 'general', label: 'Corporate Parent (Turnkey & IT)' }] : []),
                ...(activeConsole === 'nexalus-innovations' ? [{ value: 'nexalus-innovations', label: 'Nexalus Innovations (Tech & Security)' }] : []),
                ...(activeConsole === 'am-distributors' ? [{ value: 'am-distributors', label: 'A.M. Distributors Chiplun (FMCG Logistics)' }] : [])
              ]}
            />
          </div>

          <TextArea
            label="Description / Scope (Optional)"
            placeholder="Brief explanation of this solution package..."
            rows={2}
            value={solDescription}
            onChange={e => setSolDescription(e.target.value)}
          />

          <Input
            label="Display Order (Sequence)"
            type="number"
            min={1}
            value={solOrder}
            onChange={e => setSolOrder(Number(e.target.value))}
          />

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={solPublished}
                onChange={e => setSolPublished(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4"
              />
              Active in Quotation Form Dropdown
            </label>
            <Button type="submit" variant="primary" isLoading={isSavingSol}>
              Save Solution Requirement
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE SERVICE MODAL */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Service Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">{deleteCandidate?.title}</strong>?
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
