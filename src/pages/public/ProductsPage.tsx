import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  getProducts,
  getCategories,
  getCachedProducts,
  getCachedCategories,
  subscribeToProducts,
  subscribeToCategories,
  addToPlanCart,
  removeFromPlanCart,
  updateCartItemQuantity,
  getScopedPlanCart
} from '../../firebase/services';
import { Product, ProductCategory, CartPlanItem } from '../../types';
import { initialProducts, initialCategories } from '../../data/initialData';
import { QuoteModal } from '../../components/common/QuoteModal';
import { WhatsAppShareModal } from '../../components/common/WhatsAppShareModal';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  X,
  ArrowRight,
  SlidersHorizontal,
  Package,
  Layers,
  CheckCircle2,
  PhoneCall,
  ShoppingCart,
  Plus,
  Minus
} from 'lucide-react';

// Badge color & text helper to match Samarth Enterprises aesthetic
function getProductBadge(product: Product) {
  const cat = (product.categoryName || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase();

  if (product.featured) {
    return 'Featured';
  }
  if (cat.includes('cctv') || slug.includes('cctv')) {
    return 'Commercial';
  }
  if (cat.includes('fiber') || slug.includes('fiber')) {
    return 'Broadband';
  }
  if (cat.includes('network') || slug.includes('network')) {
    return 'Enterprise';
  }
  return 'Certified';
}

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const brandParam = searchParams.get('brand');
  const catParam = searchParams.get('category');

  // Categories & Products state with instant cache fallback (Parent Company Nexalus Innovations LLP)
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const cached = getCachedCategories('corporate');
    return cached.length > 0 ? cached : initialCategories.filter(c => c.companyId === 'nexalus-llp');
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const cached = getCachedProducts('corporate');
    return cached.length > 0 ? cached : initialProducts.filter(p => p.companyId === 'nexalus-llp');
  });

  // Active Category Filter: 'all' or category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Modals state
  const [activeQuoteProduct, setActiveQuoteProduct] = useState<Product | null>(null);
  const [activeWhatsAppProduct, setActiveWhatsAppProduct] = useState<Product | null>(null);
  const [isBulkQuoteOpen, setIsBulkQuoteOpen] = useState(false);
  const { success } = useToast();

  // Scoped Parent Company Cart Items
  const [cartItems, setCartItems] = useState<CartPlanItem[]>(() => {
    try {
      return getScopedPlanCart('nexalus-llp');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleCartSync = () => {
      try {
        setCartItems(getScopedPlanCart('nexalus-llp'));
      } catch {}
    };
    window.addEventListener('nexalus_plan_cart_updated', handleCartSync);
    window.addEventListener('storage', handleCartSync);
    return () => {
      window.removeEventListener('nexalus_plan_cart_updated', handleCartSync);
      window.removeEventListener('storage', handleCartSync);
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToPlanCart({
      planId: product.id,
      planName: product.name,
      providerName: 'Nexalus Innovations LLP',
      speed: product.categoryName || 'Commercial Hardware',
      price: product.price || 0,
      unitPrice: product.price || 0,
      quantity: 1,
      billingPeriod: 'Standard Procurement',
      brandId: (product.brandId || 'cp-plus') as any,
      companyId: 'nexalus-llp'
    });
    success('Added to Cart', `${product.name} (Qty: 1) has been added to your cart.`);
  };

  const handleIncreaseQty = (e: React.MouseEvent, cartItem: CartPlanItem, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQty = cartItem.quantity || 1;
    const stock = product.stockQuantity !== undefined ? product.stockQuantity : 15;
    if (stock > 0 && currentQty >= stock) return;
    updateCartItemQuantity(cartItem.id, currentQty + 1);
  };

  const handleDecreaseQty = (e: React.MouseEvent, cartItem: CartPlanItem, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQty = cartItem.quantity || 1;
    if (currentQty <= 1) {
      removeFromPlanCart(cartItem.id);
      success('Removed from Cart', `${product.name} removed from your cart.`);
    } else {
      updateCartItemQuantity(cartItem.id, currentQty - 1);
    }
  };

  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        getCategories('corporate'),
        getProducts('corporate', true)
      ]);
      if (cats.length > 0) setCategories(cats);
      if (prods.length > 0) setProducts(prods);
    } catch {
      // fallback to initialData
    }
  };

  useEffect(() => {
    loadData();

    const unsubCats = subscribeToCategories((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    }, 'corporate');

    const unsubProds = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) setProducts(prods);
    }, 'corporate');

    const handleUpdate = () => {
      const freshCats = getCachedCategories('corporate');
      const freshProds = getCachedProducts('corporate');
      if (freshCats.length > 0) setCategories(freshCats);
      setProducts(freshProds);
      loadData();
    };

    window.addEventListener('nexalus_data_update', handleUpdate);

    window.addEventListener('focus', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);

    return () => {
      unsubCats();
      unsubProds();
      window.removeEventListener('nexalus_data_update', handleUpdate);

      window.removeEventListener('focus', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
    };
  }, []);

  // Map URL parameters (brand or category) to selectedCategoryId
  useEffect(() => {
    if (catParam) {
      let matched = categories.find(c => c.id === catParam || c.slug === catParam);
      if (!matched) {
        if (catParam.includes('cctv')) {
          matched = categories.find(c => c.id.includes('cctv'));
        } else if (catParam.includes('fiber') || catParam.includes('broadband')) {
          matched = categories.find(c => c.id.includes('fiber'));
        } else if (catParam.includes('network') || catParam.includes('switch')) {
          matched = categories.find(c => c.id.includes('network'));
        } else if (catParam.includes('infra') || catParam.includes('cabling')) {
          matched = categories.find(c => c.id.includes('turnkey') || c.id.includes('infra'));
        }
      }
      if (matched) {
        setSelectedCategoryId(matched.id);
        return;
      }
    }
    if (brandParam) {
      if (brandParam === 'cp-plus') {
        const cat = categories.find(c => c.id.includes('cctv') || c.name.toLowerCase().includes('cctv'));
        if (cat) {
          setSelectedCategoryId(cat.id);
          return;
        }
      }
      if (brandParam === 'one-broadband') {
        const cat = categories.find(c => c.id.includes('fiber') || c.name.toLowerCase().includes('fiber'));
        if (cat) {
          setSelectedCategoryId(cat.id);
          return;
        }
      }
      if (brandParam === 'itti-networking') {
        const cat = categories.find(c => c.id.includes('network') || c.name.toLowerCase().includes('network'));
        if (cat) {
          setSelectedCategoryId(cat.id);
          return;
        }
      }
    }
    if (!catParam && !brandParam) {
      setSelectedCategoryId('all');
    }
  }, [brandParam, catParam, categories]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    if (catId === 'all') {
      searchParams.delete('category');
      searchParams.delete('brand');
      setSearchParams(searchParams);
    } else {
      searchParams.set('category', catId);
      searchParams.delete('brand');
      setSearchParams(searchParams);
    }
  };

  // Helper to match a product to a category
  const doesProductBelongToCategory = (product: Product, category: ProductCategory): boolean => {
    if (product.categoryId === category.id || product.categoryId === category.slug) return true;
    const catName = category.name.trim().toLowerCase();
    const prodCatName = (product.categoryName || '').trim().toLowerCase();
    if (prodCatName && prodCatName === catName) return true;

    const pCat = (product.categoryId || '').toLowerCase();
    const catId = (category.id || '').toLowerCase();
    const catSlug = (category.slug || '').toLowerCase();

    if (pCat && catId && (pCat.includes(catId) || catId.includes(pCat))) return true;
    if (pCat && catSlug && (pCat.includes(catSlug) || catSlug.includes(pCat))) return true;

    if (category.id.includes('cctv') && (product.categoryId?.includes('cctv') || prodCatName.includes('cctv'))) return true;
    if (category.id.includes('fiber') && (product.categoryId?.includes('fiber') || prodCatName.includes('fiber'))) return true;
    if (category.id.includes('network') && (product.categoryId?.includes('network') || prodCatName.includes('network'))) return true;
    if (category.id.includes('infrastructure') && (product.categoryId?.includes('turnkey') || product.categoryId?.includes('infra') || prodCatName.includes('cabling') || prodCatName.includes('hardware'))) return true;

    return false;
  };

  // Count products per category
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach(cat => {
      const count = products.filter(p => p.published !== false && doesProductBelongToCategory(p, cat)).length;
      map.set(cat.id, count);
    });
    return map;
  }, [categories, products]);

  // Filtered & Sorted Products
  const displayedProducts = useMemo(() => {
    let list = products.filter(product => {
      if (product.published === false) return false;

      // Category filter
      if (selectedCategoryId !== 'all') {
        const cat = categories.find(c => c.id === selectedCategoryId);
        if (cat && !doesProductBelongToCategory(product, cat)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        let matches = false;
        if (q.length <= 3) {
          const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|[^a-z0-9])${escaped}`, 'i');
          matches =
            regex.test(product.name || '') ||
            regex.test(product.modelNumber || '') ||
            regex.test(product.categoryName || '') ||
            regex.test(product.description || '') ||
            Object.entries(product.specifications || {}).some(
              ([k, v]) => regex.test(k) || regex.test(String(v))
            );
        } else {
          matches =
            (product.name || '').toLowerCase().includes(q) ||
            (product.modelNumber || '').toLowerCase().includes(q) ||
            (product.categoryName || '').toLowerCase().includes(q) ||
            (product.description || '').toLowerCase().includes(q) ||
            Object.entries(product.specifications || {}).some(
              ([k, v]) => k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)
            );
        }

        if (!matches) {
          return false;
        }
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return list;
  }, [products, categories, selectedCategoryId, searchQuery, sortBy]);

  const selectedCategoryObj = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="flex flex-col w-full bg-[#f8fafc] min-h-screen">
      {/* 1. TOP BANNER (Samarth Enterprises Style: Dark Navy #09223f with Catalog Pill & Subtitle) */}
      <section className="w-full bg-[#09223f] text-white py-14 sm:py-16 border-b border-blue-900/40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-3">
            {/* Catalog small pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-xs font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>CATALOG</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Product Range
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal pt-1">
              Explore our comprehensive range of high-performance networking, security surveillance, optical fiber solutions, and enterprise hardware engineered for reliability.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN CATALOG BODY */}
      <section className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start">

          {/* LEFT SIDEBAR (Search + Category Filter List) */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-7 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto pr-1 pb-4">
            {/* Search Input Box */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>SEARCH</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#09223f] focus:border-transparent transition-all shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Navigation List */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                CATEGORY
              </label>
              <div className="flex flex-col space-y-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
                {/* All Products Item */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect('all')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    selectedCategoryId === 'all'
                      ? 'bg-[#09223f] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">All Products</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${
                      selectedCategoryId === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {products.length}
                  </span>
                </button>

                {/* Individual Categories */}
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  const count = categoryCounts.get(cat.id) || 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#09223f] text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate text-left">{cat.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Bulk Inquiry Box */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl p-5 border border-blue-100/80 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Enterprise Inquiries</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Need bulk hardware procurement or specialized installation across Konkan?
              </p>
              <button
                type="button"
                onClick={() => setIsBulkQuoteOpen(true)}
                className="w-full py-2 px-3 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>

          {/* RIGHT PRODUCTS AREA */}
          <main className="flex-1 w-full space-y-6">
            {/* Top Bar: Showing X Products & Sort Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="text-sm text-slate-600 font-medium">
                Showing{' '}
                <span className="font-bold text-slate-900">
                  {displayedProducts.length}
                </span>{' '}
                {displayedProducts.length === 1 ? 'product' : 'products'}
                {selectedCategoryObj && (
                  <span className="text-slate-400 ml-1">
                    in <strong className="text-slate-700 font-semibold">{selectedCategoryObj.name}</strong>
                  </span>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 text-xs font-bold text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#09223f] cursor-pointer shadow-xs"
                >
                  <option value="featured">Featured First</option>
                  <option value="name">Product Name (A-Z)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid (3 Columns on desktop, Samarth Enterprises Style) */}
            {displayedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 my-8 shadow-xs">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <Package className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
                  <p className="text-xs text-slate-500">
                    Try adjusting your search query or select another category from the sidebar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId('all');
                  }}
                  className="px-4 py-2 bg-[#09223f] text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {displayedProducts.map((product) => {
                  const badge = getProductBadge(product);
                  const displayImage =
                    (product.images && product.images.length > 0 ? product.images[0] : null) ||
                    '/images/products/cp-bullet.jpg';
                  const cartItem = cartItems.find(i => i.planId === product.id);
                  const stockQty = product.stockQuantity !== undefined ? product.stockQuantity : 15;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden p-4 sm:p-5 relative"
                    >
                      {/* Top Row: Amber Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 tracking-wide">
                          {badge}
                        </span>
                        {product.modelNumber && (
                          <span className="text-[11px] font-mono text-slate-400 truncate max-w-[120px]">
                            {product.modelNumber}
                          </span>
                        )}
                      </div>

                      {/* Product Image Box (Centered, white background, smooth zoom on hover) */}
                      <div
                        onClick={() => navigate('/products/' + product.id)}
                        className="w-full h-44 sm:h-48 flex items-center justify-center p-3 my-1 bg-white cursor-pointer select-none overflow-hidden"
                      >
                        <img
                          src={displayImage}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/products/cp-bullet.jpg';
                          }}
                        />
                      </div>

                      {/* Product Content */}
                      <div className="space-y-1.5 flex-1 flex flex-col justify-end pt-2">
                        {/* Category Name */}
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                          {product.categoryName || 'Commercial Hardware'}
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => navigate('/products/' + product.id)}
                          className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug cursor-pointer"
                          title={product.name}
                        >
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description || 'Enterprise-grade certified hardware engineered for high uptime and durability.'}
                        </p>
                      </div>

                      {/* Dedicated Price Row */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight mb-0.5">
                            {cartItem && (cartItem.quantity || 1) > 1 ? `Total (${cartItem.quantity} items)` : 'Price'}
                          </span>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {product.price
                                ? (cartItem && (cartItem.quantity || 1) > 1
                                    ? `₹${((product.price || 0) * (cartItem.quantity || 1)).toLocaleString('en-IN')}`
                                    : `₹${product.price.toLocaleString('en-IN')}`)
                                : 'Contact for Pricing'}
                            </span>
                            {cartItem && (cartItem.quantity || 1) > 1 && product.price ? (
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                ₹{product.price.toLocaleString('en-IN')} / unit
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Row: Enquire Now Button + Add to Cart/Qty Stepper + Arrow Detail Button */}
                      <div className="mt-2.5 flex items-center gap-2">
                        {/* Enquire Now Button (Navy #09223f) */}
                        <button
                          type="button"
                          onClick={() => setActiveQuoteProduct(product)}
                          className="flex-1 bg-[#09223f] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.98] whitespace-nowrap"
                        >
                          <span>Enquire Now</span>
                        </button>

                        {/* Add to Cart / Quantity Stepper Option */}
                        {cartItem ? (
                          <div
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="inline-flex items-center rounded-xl border border-blue-300 bg-blue-50 text-blue-900 p-1 shadow-2xs gap-1.5 shrink-0"
                            title={`${cartItem.quantity || 1} in cart`}
                          >
                            <button
                              type="button"
                              onClick={(e) => handleDecreaseQty(e, cartItem, product)}
                              title="Decrease Quantity"
                              className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs hover:bg-white active:scale-90 transition-all cursor-pointer text-slate-700 hover:text-rose-600"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black min-w-5 text-center px-0.5">
                              {cartItem.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleIncreaseQty(e, cartItem, product)}
                              title="Increase Quantity"
                              disabled={stockQty > 0 && (cartItem.quantity || 1) >= stockQty}
                              className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs hover:bg-white active:scale-90 transition-all cursor-pointer text-slate-700 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, product)}
                            title="Add to Cart"
                            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}

                        {/* Arrow Button (View Full Product Details Page) */}
                        <Link
                          to={'/products/' + product.id}
                          title="View Product Details"
                          className="w-9 h-9 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </section>



      {/* QUOTE MODAL */}
      {activeQuoteProduct && (
        <QuoteModal
          isOpen={true}
          onClose={() => setActiveQuoteProduct(null)}
          brandId={activeQuoteProduct.brandId}
          websiteId="nexalus-innovations"
          websiteName="Nexalus Innovations"
          sourcePage={`Products Catalog: ${activeQuoteProduct.name}`}
          itemName={activeQuoteProduct.modelNumber ? `${activeQuoteProduct.name} (${activeQuoteProduct.modelNumber})` : activeQuoteProduct.name}
          itemType="product"
        />
      )}

      {/* BULK QUOTE MODAL */}
      <QuoteModal
        isOpen={isBulkQuoteOpen}
        onClose={() => setIsBulkQuoteOpen(false)}
        brandId="nexalus-innovations"
        itemName="Commercial Equipment Bulk Procurement"
        itemType="product"
      />

      {/* WHATSAPP MODAL */}
      {activeWhatsAppProduct && (
        <WhatsAppShareModal
          isOpen={true}
          onClose={() => setActiveWhatsAppProduct(null)}
          product={activeWhatsAppProduct}
        />
      )}
    </div>
  );
};
