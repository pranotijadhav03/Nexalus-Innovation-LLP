import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getCategories, createCategory, updateCategory, deleteCategory, getCachedCategories } from '../../firebase/services';
import { ProductCategory, BrandId, CompanyScopeId } from '../../types';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { isSuperAdmin, isAmAdmin, isInnovationsAdmin, canManageBrand } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const activeConsole = outletCtx?.activeConsole || 'master';
  const activeBrandFilter = outletCtx?.activeBrandFilter || 'corporate';
  const { success, error } = useToast();

  const effectiveBrand: BrandId | 'nexalus' =
    activeConsole === 'am-distributors' || isAmAdmin
      ? 'am-distributors'
      : activeConsole === 'nexalus-innovations' || isInnovationsAdmin
      ? 'nexalus-innovations'
      : 'nexalus';

  const [categories, setCategories] = useState<ProductCategory[]>(() =>
    getCachedCategories(effectiveBrand)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
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
    const data = await getCategories(effectiveBrand);
    setCategories(data);
  };

  useEffect(() => {
    loadData();
  }, [activeBrandFilter, activeConsole]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    const defaultBrand = isAmAdmin || activeConsole === 'am-distributors'
      ? 'am-distributors'
      : 'nexalus-innovations';
    setBrandId(defaultBrand);
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: ProductCategory) => {
    if (!canManageBrand(cat.brandId)) {
      error('Access Denied', 'Cannot modify category outside your assigned brand.');
      return;
    }
    setEditingCategory(cat);
    setName(cat.name);
    setBrandId(cat.brandId);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Validation Error', 'Category name is required.');
      return;
    }

    if (!canManageBrand(brandId)) {
      error('Access Denied', 'Cannot assign category to unauthorized operating unit.');
      return;
    }

    setIsSaving(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name,
          brandId,
          slug,
          description
        });
        success('Category Updated', `${name} updated successfully.`);
      } else {
        await createCategory({
          name,
          brandId,
          companyId: currentCompanyScope,
          slug,
          description
        }, currentCompanyScope);
        success('Category Created', `${name} created successfully.`);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setName('');
      setDescription('');
      loadData();
    } catch (err: any) {
      error('Operation Failed', err.message);
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

  const currentCompanyScope: CompanyScopeId = activeConsole === 'am-distributors' || isAmAdmin
    ? 'am-distributors'
    : (activeConsole === 'nexalus-innovations' || isInnovationsAdmin ? 'nexalus-innovations' : 'nexalus-llp');

  const filteredCategories = categories.filter(c => {
    if (activeConsole === 'am-distributors' || isAmAdmin) {
      return c.companyId === 'am-distributors' || c.brandId === 'am-distributors' || c.id.startsWith('cat-am-');
    }
    if (activeConsole === 'nexalus-innovations' || isInnovationsAdmin) {
      return c.companyId === 'nexalus-innovations' ||
        ['nexalus-innovations', 'cp-plus', 'one-broadband', 'itti-networking'].includes(c.brandId) ||
        c.id.startsWith('cat-nex-');
    }
    // Parent Corporate Master (Nexalus Innovations LLP):
    return c.companyId === 'nexalus-llp' || c.brandId === 'nexalus' || c.id.startsWith('cat-llp-') || c.id.startsWith('cat-corp-');
  });

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
              : 'Configure commercial CCTV surveillance, optical fiber, and enterprise networking hardware categories.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
            Add Category
          </Button>
        </div>
      </div>

      {/* Corporate Super Admin Workspace Context Link */}
      {isSuperAdmin && activeConsole === 'master' && (
        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>You are viewing <strong>Corporate Parent</strong> categories (matching the Landing Page Commercial Hardware Catalog).</span>
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
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No product categories registered for this workspace.
                  </td>
                </tr>
              ) : (
                filteredCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
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
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(cat)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit Product Category' : 'Add Product Category'}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g. CCTV Surveillance or Optical Fiber"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Operating Company
            </label>
            <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
              activeConsole === 'am-distributors' || isAmAdmin
                ? 'bg-teal-50 border-teal-200 text-teal-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <span>
                {activeConsole === 'am-distributors' || isAmAdmin
                  ? 'A.M. Distributors Chiplun (FMCG Cold-Chain & Logistics)'
                  : 'Nexalus Innovations LLP (Commercial Hardware)'}
              </span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                activeConsole === 'am-distributors' || isAmAdmin
                  ? 'bg-teal-200 text-teal-800'
                  : 'bg-blue-200 text-blue-800'
              }`}>
                {activeConsole === 'am-distributors' || isAmAdmin ? 'Child Division' : 'Parent Company'}
              </span>
            </div>
          </div>

          <TextArea
            label="Description"
            placeholder="Brief scope of products in this category..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCategory(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Delete Product Category"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete category <strong>{deleteCandidate?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
