import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getCategories, createCategory, deleteCategory, getCachedCategories } from '../../firebase/services';
import { ProductCategory, BrandId } from '../../types';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import { Plus, Trash2, Layers, Shield, Building, ArrowRight } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { isSuperAdmin, isAmAdmin, isInnovationsAdmin, canManageBrand } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const activeConsole = outletCtx?.activeConsole || 'master';
  const activeBrandFilter = outletCtx?.activeBrandFilter || 'corporate';
  const { success, error } = useToast();

  const [categories, setCategories] = useState<ProductCategory[]>(() =>
    getCachedCategories(activeConsole === 'master' ? undefined : activeBrandFilter)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState<BrandId>(
    isAmAdmin || activeConsole === 'am-distributors'
      ? 'am-distributors'
      : activeConsole === 'nexalus-innovations' || isInnovationsAdmin
      ? 'nexalus-innovations'
      : ('nexalus' as any)
  );
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteCandidate, setDeleteCandidate] = useState<ProductCategory | null>(null);

  const loadData = async () => {
    const filter = activeConsole === 'master' ? undefined : activeBrandFilter;
    const data = await getCategories(filter === 'all' ? undefined : filter as any);
    setCategories(data);
  };

  useEffect(() => {
    loadData();
  }, [activeBrandFilter, activeConsole]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!canManageBrand(brandId)) {
      error('Access Denied', 'Cannot create category outside your assigned brand.');
      return;
    }

    setIsSaving(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await createCategory({
        name,
        brandId,
        slug,
        description
      });
      success('Category Created', `${name} created.`);
      setIsModalOpen(false);
      setName('');
      setDescription('');
      loadData();
    } catch (err: any) {
      error('Create Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteCategory(deleteCandidate.id);
      success('Category Deleted', `${deleteCandidate.name} was removed.`);
      setDeleteCandidate(null);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const filteredCategories = categories.filter(c => {
    if (activeConsole === 'nexalus-innovations' || (isInnovationsAdmin && !isSuperAdmin)) {
      return c.brandId === 'nexalus-innovations' || c.brandId === 'cp-plus' || c.brandId === 'one-broadband' || c.brandId === 'itti-networking';
    }
    if (activeConsole === 'am-distributors' || isAmAdmin) {
      return c.brandId === 'am-distributors';
    }
    return true; // Corporate Master view shows all categories for Super Admin
  });

  const nexalusCatCount = categories.filter(
    c => c.brandId === 'nexalus-innovations' || c.brandId === 'cp-plus' || c.brandId === 'one-broadband' || c.brandId === 'itti-networking'
  ).length;
  const amCatCount = categories.filter(c => c.brandId === 'am-distributors').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeConsole === 'nexalus-innovations'
              ? 'Nexalus Innovations Categories'
              : activeConsole === 'am-distributors'
              ? 'A.M. Distributors Categories'
              : 'Product Categories Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeConsole === 'nexalus-innovations'
              ? 'Configure CCTV, optical fiber, and network equipment taxonomy classifications.'
              : activeConsole === 'am-distributors'
              ? 'Configure packaged water, commercial dairy, and cold-chain FMCG categories.'
              : 'Configure surveillance, networking, and cold-chain categories across all subsidiaries.'}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

      {/* Corporate Super Admin Workspace Context Link */}
      {isSuperAdmin && activeConsole === 'master' && (
        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>You are viewing <strong>Corporate Parent</strong> categories only. Child company categories are strictly separated in their own workspaces.</span>
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Brand Division</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {cat.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <BrandBadge brandId={cat.brandId} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {cat.description || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setDeleteCandidate(cat)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
        title="Add Product Category"
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g. PTZ Cameras"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          {isSuperAdmin ? (
            <Select
              label="Operating Company *"
              value={brandId}
              onChange={e => setBrandId(e.target.value as any)}
              options={[
                ...(activeConsole === 'master' ? [{ value: 'nexalus', label: 'Nexalus Corporate Parent (Turnkey & Enterprise)' }] : []),
                ...(activeConsole === 'nexalus-innovations' || activeConsole === 'master' ? [{ value: 'nexalus-innovations', label: 'Nexalus Innovations (CCTV, Internet, Network)' }] : []),
                ...(activeConsole === 'am-distributors' || activeConsole === 'master' ? [{ value: 'am-distributors', label: 'A.M. Distributors Chiplun (Cold-Chain & Logistics)' }] : [])
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

          <TextArea
            label="Description"
            placeholder="Brief purpose of this category..."
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Category Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">{deleteCandidate?.name}</strong>?
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
