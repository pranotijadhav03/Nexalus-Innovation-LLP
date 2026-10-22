import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  uploadImageFile,
  getCachedProducts,
  getCachedCategories
} from '../../firebase/services';
import { Product, ProductCategory, BrandId } from '../../types';
import { AdminOutletContext } from '../../components/admin/AdminLayout';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BrandBadge } from '../../components/common/BrandBadge';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  X,
  Building,
  Shield,
  ArrowRight
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, brandScope, canManageBrand } = useAuth();
  const outletCtx = useOutletContext<AdminOutletContext>();
  const activeConsole = outletCtx?.activeConsole || 'master';
  const activeBrandFilter = outletCtx?.activeBrandFilter || 'corporate';
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>(() =>
    getCachedProducts(activeBrandFilter === 'all' || activeBrandFilter === 'corporate' ? undefined : activeBrandFilter)
  );
  const [categories, setCategories] = useState<ProductCategory[]>(() =>
    getCachedCategories(activeBrandFilter === 'all' || activeBrandFilter === 'corporate' ? undefined : activeBrandFilter)
  );
  const [search, setSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [brandId, setBrandId] = useState<BrandId>(
    isAmAdmin ? 'am-distributors' : 'nexalus-innovations'
  );
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [availability, setAvailability] = useState<'in_stock' | 'out_of_stock' | 'pre_order' | 'contact_for_price'>('in_stock');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Resolution', value: '4 Megapixel 2K QHD' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Delete Confirmation
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getProducts(activeBrandFilter === 'all' || activeBrandFilter === 'corporate' ? undefined : activeBrandFilter),
        getCategories(activeBrandFilter === 'all' || activeBrandFilter === 'corporate' ? undefined : activeBrandFilter)
      ]);
      setProducts(prods);
      setCategories(cats);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeBrandFilter]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setModelNumber('');
    const defaultBrand: BrandId = isSuperAdmin
      ? (activeConsole === 'am-distributors'
          ? 'am-distributors'
          : activeConsole === 'nexalus-innovations'
          ? 'nexalus-innovations'
          : ('nexalus' as any))
      : (brandScope as BrandId);
    setBrandId(defaultBrand);
    const availableCats = categories.filter(c => c.brandId === defaultBrand);
    setCategoryId(availableCats[0]?.id || '');
    setDescription('');
    setPrice('');
    setAvailability('in_stock');
    setFeatured(false);
    setPublished(true);
    setImages(['https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80']);
    setSpecs([
      { key: 'Resolution', value: '4MP Ultra HD' },
      { key: 'Lens', value: '2.8mm Wide Angle' }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    if (!canManageBrand(prod.brandId)) {
      error('Access Denied', 'You do not have permission to modify records belonging to other brands.');
      return;
    }

    setEditingProduct(prod);
    setName(prod.name);
    setSlug(prod.slug);
    setModelNumber(prod.modelNumber);
    setBrandId(prod.brandId);
    setCategoryId(prod.categoryId);
    setDescription(prod.description);
    setPrice(prod.price ? String(prod.price) : '');
    setAvailability(prod.availability);
    setFeatured(prod.featured);
    setPublished(prod.published);
    setImages(prod.images.length > 0 ? prod.images : ['https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80']);
    setSpecs(
      Object.entries(prod.specifications || {}).map(([key, value]) => ({ key, value }))
    );
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const url = await uploadImageFile(e.target.files[0]);
        setImages(prev => [url, ...prev]);
        success('Image Uploaded', 'Attached product image successfully.');
      } catch (err: any) {
        error('Upload Failed', err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !modelNumber.trim()) {
      error('Validation Error', 'Name and Model Number are required.');
      return;
    }

    // Role safety check
    if (!canManageBrand(brandId)) {
      error('Permission Denied', 'You cannot create or update products for this brand.');
      return;
    }

    setIsSaving(true);
    try {
      const selectedCat = categories.find(c => c.id === categoryId);
      const generatedSlug = slug.trim()
        ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const specObj: Record<string, string> = {};
      specs.forEach(s => {
        if (s.key.trim() && s.value.trim()) {
          specObj[s.key.trim()] = s.value.trim();
        }
      });

      const productPayload = {
        name,
        slug: generatedSlug,
        modelNumber,
        brandId,
        categoryId: categoryId || 'cat-general',
        categoryName: selectedCat ? selectedCat.name : 'General Equipment',
        description,
        price: price ? parseFloat(price) : undefined,
        currency: 'INR',
        availability,
        featured,
        published,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'],
        specifications: specObj
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
        success('Product Updated', `${name} has been updated in Firestore.`);
      } else {
        await createProduct(productPayload);
        success('Product Created', `${name} has been published.`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to save product', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteProduct(deleteCandidate.id);
      success('Product Removed', `${deleteCandidate.name} was deleted.`);
      setDeleteCandidate(null);
      loadData();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.modelNumber.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCatFilter === 'all' || p.categoryId === selectedCatFilter;
    const matchesCompany =
      activeConsole === 'am-distributors' || isAmAdmin
        ? p.brandId === 'am-distributors'
        : p.brandId !== 'am-distributors';

    return matchesSearch && matchesCat && matchesCompany;
  });

  const nexalusCount = products.filter(
    p => p.brandId === 'nexalus-innovations' || p.brandId === 'cp-plus' || p.brandId === 'one-broadband' || p.brandId === 'itti-networking'
  ).length;
  const amCount = products.filter(p => p.brandId === 'am-distributors').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeConsole === 'nexalus-innovations'
              ? 'Nexalus Innovations Products'
              : activeConsole === 'am-distributors'
              ? 'A.M. Distributors Products'
              : 'Corporate Parent Products Catalog'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeConsole === 'nexalus-innovations'
              ? 'Manage CCTV surveillance cameras, optical fiber equipment, and networking hardware.'
              : activeConsole === 'am-distributors'
              ? 'Manage packaged mineral water, commercial ice creams, and cold-chain FMCG inventories.'
              : 'Turnkey enterprise optical fiber backbones, command server fabrics, and corporate IT products.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={
              activeConsole === 'am-distributors'
                ? '/brands/am-distributors/products'
                : activeConsole === 'nexalus-innovations'
                ? '/brands/nexalus-innovations/products'
                : '/products'
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Open customer-facing products landing page in a new tab"
          >
            <span>View Live Store ↗</span>
          </a>

          <Button
            variant="primary"
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* Corporate Super Admin Workspace Context Link */}
      {isSuperAdmin && activeConsole === 'master' && (
        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>You are viewing <strong>Corporate Parent</strong> products only. Child company catalogs are strictly separated in their own workspaces.</span>
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

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by model or product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <select
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
            value={selectedCatFilter}
            onChange={e => setSelectedCatFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.brandId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Product / Model</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Est. Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0] || '/images/products/cp-v34g.jpg'}
                        alt=""
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== '/images/products/cp-v34g.jpg') {
                            target.src = '/images/products/cp-v34g.jpg';
                          }
                        }}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate max-w-xs">
                          {product.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {product.modelNumber}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <BrandBadge brandId={product.brandId} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {product.categoryName}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Inquiry'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        product.published
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {product.published ? 'Published' : 'Draft'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={
                          product.brandId === 'am-distributors'
                            ? '/brands/am-distributors/products'
                            : '/products'
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="View product on public store"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(product)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Product"
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

      {/* Create / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Record' : 'Create New Product Record'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Title *"
              placeholder="e.g. CP-UNC-TA41ZL4-MDS 4MP IR Bullet Camera"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              label="Model Number / SKU *"
              placeholder="CP-UNC-TA41ZL4-MDS"
              value={modelNumber}
              onChange={e => setModelNumber(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isSuperAdmin ? (
              <Select
                label="Operating Company *"
                value={brandId}
                onChange={e => {
                  const b = e.target.value as BrandId;
                  setBrandId(b);
                  const availableCats = categories.filter(c => c.brandId === b);
                  setCategoryId(availableCats[0]?.id || '');
                }}
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
                  {brandId === 'am-distributors' ? 'A.M. Distributors Chiplun' : 'Nexalus Innovations'} (Locked to Role)
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2.5 bg-white"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                {categories.filter(c => c.brandId === brandId).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Estimated Price (INR)"
              type="number"
              placeholder="e.g. 6850"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>

          <TextArea
            label="Product Description"
            placeholder="Detailed description of features, lens, weatherproof casing, and connectivity..."
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          {/* Image Upload Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Product Images
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {isUploading && <span className="text-xs text-blue-600 animate-pulse">Uploading file...</span>}
            </div>

            <div className="flex gap-2 overflow-x-auto pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group shrink-0">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Technical Specifications */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Technical Specifications
              </label>
              <button
                type="button"
                onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                + Add Spec Row
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {specs.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    placeholder="Parameter (e.g. Resolution)"
                    value={item.key}
                    onChange={e => {
                      const updated = [...specs];
                      updated[idx].key = e.target.value;
                      setSpecs(updated);
                    }}
                    className="w-1/3 rounded-lg border border-slate-300 text-xs px-2.5 py-1.5"
                  />
                  <input
                    placeholder="Value (e.g. 4MP 2560x1440)"
                    value={item.value}
                    onChange={e => {
                      const updated = [...specs];
                      updated[idx].value = e.target.value;
                      setSpecs(updated);
                    }}
                    className="flex-1 rounded-lg border border-slate-300 text-xs px-2.5 py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Published to Public Site
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Featured on Homepage
              </label>
            </div>

            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Product Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{deleteCandidate?.name}</strong>? This action will permanently remove the item from the catalog.
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
