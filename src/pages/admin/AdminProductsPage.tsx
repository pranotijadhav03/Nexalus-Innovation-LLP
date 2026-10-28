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
import { Product, ProductCategory, BrandId, CompanyScopeId } from '../../types';
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

const FMCG_PRESETS = [
  { label: '20L Water Jar', url: '/images/products/am-water-jar-20l.jpg' },
  { label: 'Bottled Water Pack', url: '/images/products/am-water-bottles-retail.jpg' },
  { label: 'Ice Cream Tub', url: '/images/products/am-icecream-tub.jpg' },
  { label: 'Ice Cream Cones', url: '/images/products/am-icecream-cones.jpg' },
  { label: 'Farm-Fresh Milk', url: '/images/products/am-fresh-milk-dairy.jpg' },
  { label: 'Table Butter', url: '/images/products/am-butter-block.jpg' },
  { label: 'Catering Cheese', url: '/images/products/am-cheese-block.jpg' }
];

const TECH_PRESETS = [
  { label: '4K Dome CCTV', url: '/images/products/cp-dome.jpg' },
  { label: 'Bullet CCTV', url: '/images/products/cp-bullet.jpg' },
  { label: 'PTZ Speed Dome', url: '/images/products/cp-ptz.jpg' },
  { label: '32Ch NVR', url: '/images/products/cp-nvr.jpg' },
  { label: 'Wi-Fi 6 Router', url: '/images/products/wifi6-router.jpg' },
  { label: 'Fiber ONT', url: '/images/products/fiber-ont.jpg' },
  { label: 'PoE+ Switch', url: '/images/products/poe-switch.jpg' },
  { label: '42U Server Rack', url: '/images/products/server-rack.jpg' },
  { label: 'Cat6 Cable Drum', url: '/images/products/cat6-cable.jpg' }
];

export const AdminProductsPage: React.FC = () => {
  const { isSuperAdmin, isInnovationsAdmin, isAmAdmin, brandScope, canManageBrand } = useAuth();
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

  const [products, setProducts] = useState<Product[]>(() =>
    getCachedProducts(effectiveBrand)
  );
  const [categories, setCategories] = useState<ProductCategory[]>(() =>
    getCachedCategories(effectiveBrand)
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
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Delete Confirmation
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        getProducts(effectiveBrand),
        getCategories(effectiveBrand)
      ]);
      setProducts(prods);
      setCategories(cats);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeConsole, activeBrandFilter]);

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
    setCustomImageUrl('');
    const defaultImg = defaultBrand === 'am-distributors'
      ? '/images/products/am-water-jar-20l.jpg'
      : '/images/products/cp-dome.jpg';
    setImages([defaultImg]);
    setSpecs(
      defaultBrand === 'am-distributors'
        ? [
            { key: 'Packaging', value: 'Food-Grade 20L Sealed Container' },
            { key: 'Dispatch Slot', value: 'Direct Depot Dispatch Within 4 Hours' }
          ]
        : [
            { key: 'Resolution', value: '4MP Ultra HD' },
            { key: 'Lens', value: '2.8mm Wide Angle' }
          ]
    );
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
    setCustomImageUrl('');
    setImages(prod.images.length > 0 ? prod.images : [
      prod.brandId === 'am-distributors'
        ? '/images/products/am-water-jar-20l.jpg'
        : '/images/products/cp-dome.jpg'
    ]);
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
        categoryName: selectedCat ? selectedCat.name : editingProduct?.categoryName || 'General Equipment',
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
        const currentCompanyScope: CompanyScopeId = activeConsole === 'am-distributors' || isAmAdmin
          ? 'am-distributors'
          : (activeConsole === 'nexalus-innovations' || isInnovationsAdmin ? 'nexalus-innovations' : 'nexalus-llp');
        await createProduct({ ...productPayload, companyId: currentCompanyScope }, currentCompanyScope);
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
    
    let matchesCompany = false;
    if (activeConsole === 'am-distributors' || isAmAdmin) {
      matchesCompany = p.companyId === 'am-distributors' || p.brandId === 'am-distributors' || p.id.startsWith('prod-am-');
    } else if (activeConsole === 'nexalus-innovations' || isInnovationsAdmin) {
      matchesCompany = p.companyId === 'nexalus-innovations' ||
        ['nexalus-innovations', 'cp-plus', 'one-broadband', 'itti-networking'].includes(p.brandId) ||
        p.id.startsWith('prod-nex-') || p.id.startsWith('prod-cp-') || p.id.startsWith('prod-ob-') || p.id.startsWith('prod-itti-');
    } else {
      // Parent Corporate Master (Nexalus Innovations LLP):
      matchesCompany = p.companyId === 'nexalus-llp' || p.brandId === 'nexalus' || p.id.startsWith('prod-llp-') || p.id.startsWith('prod-corp-');
    }

    return matchesSearch && matchesCat && matchesCompany;
  });

  const nexalusCount = products.filter(p => p.brandId !== 'am-distributors').length;
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Operating Company
              </label>
              <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                activeConsole === 'am-distributors' || isAmAdmin
                  ? 'bg-teal-50 border-teal-200 text-teal-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <span className="truncate">
                  {activeConsole === 'am-distributors' || isAmAdmin
                    ? 'A.M. Distributors Chiplun'
                    : 'Nexalus Innovations LLP'}
                </span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                  activeConsole === 'am-distributors' || isAmAdmin
                    ? 'bg-teal-200 text-teal-800'
                    : 'bg-blue-200 text-blue-800'
                }`}>
                  {activeConsole === 'am-distributors' || isAmAdmin ? 'Child Unit' : 'Parent Company'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2.5 bg-white"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                {(() => {
                  const matchingCats = (brandId === 'am-distributors')
                    ? categories.filter(c => c.brandId === 'am-distributors')
                    : categories.filter(c => c.brandId !== 'am-distributors');
                  const hasCurrentCat = matchingCats.some(c => c.id === categoryId);
                  return (
                    <>
                      {!hasCurrentCat && categoryId && editingProduct?.categoryName && (
                        <option value={categoryId}>{editingProduct.categoryName}</option>
                      )}
                      {matchingCats.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </>
                  );
                })()}
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

          {/* Enhanced Image Management Box */}
          <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Product Images
              </label>
            </div>

            {/* Upload File + Direct Path/URL Input */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-colors shrink-0">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Choose Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Or paste image path / URL (e.g. /images/products/... or http)"
                    value={customImageUrl}
                    onChange={e => setCustomImageUrl(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customImageUrl.trim()) {
                          setImages(prev => [customImageUrl.trim(), ...prev]);
                          setCustomImageUrl('');
                        }
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate-300 bg-white text-xs px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customImageUrl.trim()) {
                        setImages(prev => [customImageUrl.trim(), ...prev]);
                        setCustomImageUrl('');
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    + Add URL
                  </button>
                </div>
              </div>

              {isUploading && (
                <div className="text-xs text-blue-600 font-medium animate-pulse flex items-center gap-1.5 pt-1">
                  <span>Processing &amp; attaching image instantly...</span>
                </div>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Quick Sample Presets for Testing:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(brandId === 'am-distributors' ? FMCG_PRESETS : TECH_PRESETS).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!images.includes(p.url)) {
                        setImages(prev => [p.url, ...prev]);
                      }
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Previews */}
            <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 group shrink-0 bg-slate-100">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Image"
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
