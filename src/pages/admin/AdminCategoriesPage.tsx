import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getCategories, createCategory, deleteCategory } from '../../firebase/services';
import { ProductCategory, BrandId } from '../../types';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import { Plus, Trash2, Layers } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { isSuperAdmin, isAmAdmin, canManageBrand } = useAuth();
  const { activeBrandFilter } = useOutletContext<{ activeBrandFilter: BrandId | 'all' }>();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState<BrandId>(isAmAdmin ? 'am-distributors' : 'nexalus-innovations');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [deleteCandidate, setDeleteCandidate] = useState<ProductCategory | null>(null);

  const loadData = async () => {
    const data = await getCategories(activeBrandFilter === 'all' ? undefined : activeBrandFilter);
    setCategories(data);
  };

  useEffect(() => {
    loadData();
  }, [activeBrandFilter]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Product Categories Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure surveillance & networking categories used in public product filters.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

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
              {categories.map(cat => (
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
                { value: 'nexalus-innovations', label: 'Nexalus Innovations (CCTV, Internet, Network)' },
                { value: 'am-distributors', label: 'A.M. Distributors Chiplun (Cold-Chain & Logistics)' }
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

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSaving} className="w-full sm:w-auto justify-center font-bold">
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
