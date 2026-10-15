import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getServices, createService, updateService, deleteService } from '../../firebase/services';
import { Service, BrandId } from '../../types';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import { Plus, Edit2, Trash2, Wrench, Shield, Wifi, Building2 } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, canManageBrand } = useAuth();
  const { activeBrandFilter } = useOutletContext<{ activeBrandFilter: BrandId | 'all' }>();
  const { success, error } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getServices(activeBrandFilter === 'all' ? undefined : activeBrandFilter);
      setServices(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeBrandFilter]);

  const openCreateModal = () => {
    setEditingService(null);
    setTitle('');
    const defaultBrand = isAmAdmin ? 'am-distributors' : 'nexalus-innovations';
    setBrandId(defaultBrand);
    setShortDescription('');
    setFullDescription('');
    setIconName(defaultBrand === 'am-distributors' ? 'Truck' : 'ShieldCheck');
    setFeatures(['Certified technical deployment', 'Dedicated warranty support']);
    setTargetAudience('Residential, Commercial');
    setPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (srv: Service) => {
    if (!canManageBrand(srv.brandId)) {
      error('Access Denied', 'You cannot modify services belonging to other brands.');
      return;
    }
    setEditingService(srv);
    setTitle(srv.title);
    setBrandId(srv.brandId);
    setShortDescription(srv.shortDescription);
    setFullDescription(srv.fullDescription);
    setIconName(srv.iconName);
    setFeatures([...srv.features]);
    setTargetAudience(srv.targetAudience.join(', '));
    setPublished(srv.published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim()) {
      error('Validation Error', 'Title and description are required.');
      return;
    }

    if (!canManageBrand(brandId)) {
      error('Access Denied', 'You cannot create services outside your assigned brand.');
      return;
    }

    setIsSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const audienceList = targetAudience.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        title,
        slug,
        brandId,
        shortDescription,
        fullDescription,
        iconName,
        features: features.filter(f => f.trim() !== ''),
        targetAudience: audienceList,
        featured: true,
        published
      };

      if (editingService) {
        await updateService(editingService.id, payload);
        success('Service Updated', `${title} updated successfully.`);
      } else {
        await createService(payload);
        success('Service Created', `${title} created successfully.`);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Service Offerings Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure installation services, surveillance maintenance contracts, and fiber deployments.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Add New Service
        </Button>
      </div>

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
              {services.map(srv => (
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
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(srv)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
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
                  { value: 'nexalus-innovations', label: 'Nexalus Innovations (CCTV, Internet, Network)' },
                  { value: 'am-distributors', label: 'A.M. Distributors Chiplun (Cold-Chain)' }
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
                { value: 'Cpu', label: 'Cpu (AI Analytics)' }
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
