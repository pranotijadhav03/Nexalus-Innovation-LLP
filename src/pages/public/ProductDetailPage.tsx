import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getProducts, getCategories, getCachedProducts, getCachedCategories, addToPlanCart } from '../../firebase/services';
import { Product, ProductCategory } from '../../types';
import { initialProducts, initialCategories } from '../../data/initialData';
import { QuoteModal } from '../../components/common/QuoteModal';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Package,
  Shield,
  Layers,
  ChevronRight,
  PhoneCall,
  Share2,
  ShoppingCart,
  Plus,
  Minus
} from 'lucide-react';

// Badge color & text helper to match Samarth Enterprises aesthetic
function getProductBadge(product: Product) {
  const cat = (product.categoryName || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase();

  if (product.featured) {
    return 'Innovation';
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

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useToast();

  // Load all products and categories without removing child company items
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = getCachedProducts();
    return cached.length > 0 ? cached : initialProducts;
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const cached = getCachedCategories();
    return cached.length > 0 ? cached : initialCategories;
  });

  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts(undefined, true)
        ]);
        if (cats.length > 0) setCategories(cats);
        if (prods.length > 0) setProducts(prods);
      } catch {}
    };
    loadData();
  }, []);

  // Find target product by id, slug, or model number
  const product = useMemo(() => {
    if (!id) return null;
    const target = id.toLowerCase().trim();
    return (
      products.find(p => p.id.toLowerCase() === target) ||
      products.find(p => (p.slug || '').toLowerCase() === target) ||
      products.find(p => (p.modelNumber || '').toLowerCase() === target) ||
      null
    );
  }, [products, id]);

  const isAm = location.pathname.includes('/brands/am-distributors') || product?.brandId === 'am-distributors' || Boolean(product?.id?.startsWith('prod-am'));
  const isNexalusInnovations = location.pathname.includes('/brands/nexalus-innovations') || product?.brandId === 'nexalus-innovations' || Boolean(product?.id?.startsWith('prod-nexalus-') && !product?.id?.includes('llp'));

  const brandHomeUrl = isAm ? '/brands/am-distributors' : isNexalusInnovations ? '/brands/nexalus-innovations' : '/';
  const brandProductsUrl = isAm ? '/brands/am-distributors/products' : isNexalusInnovations ? '/brands/nexalus-innovations/products' : '/products';
  const brandName = isAm ? 'A.M. Distributors Chiplun' : isNexalusInnovations ? 'Nexalus Innovations' : 'Nexalus Innovations LLP';
  const brandCatalogName = isAm ? 'Products & Supplies' : isNexalusInnovations ? 'Commercial Hardware' : 'Products & Systems';
  const [selectedQty, setSelectedQty] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    const unitPrice = product.price || 0;
    addToPlanCart({
      planId: product.id,
      planName: product.name,
      providerName: isAm ? 'A.M. Distributors' : isNexalusInnovations ? 'Nexalus Innovations' : 'Nexalus Innovations LLP',
      speed: product.categoryName || 'Commercial Grade',
      price: unitPrice * selectedQty,
      unitPrice: unitPrice,
      quantity: selectedQty,
      billingPeriod: 'Standard Procurement',
      brandId: (product.brandId || (isAm ? 'am-distributors' : isNexalusInnovations ? 'nexalus-innovations' : 'nexalus-llp')) as any,
      companyId: isAm ? 'am-distributors' : isNexalusInnovations ? 'nexalus-innovations' : 'nexalus-llp'
    });
    success('Added to Cart', `${product.name} (Qty: ${selectedQty}) has been added to your cart.`);
  };

  // Reset active image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [product?.id]);

  // Find related products (strictly scoped to current company brand)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const pool = products.filter(p => p.id !== product.id && (
      isAm
        ? (p.brandId === 'am-distributors' || p.id.startsWith('prod-am'))
        : isNexalusInnovations
        ? ((p.id.startsWith('prod-nexalus-') && !p.id.includes('llp')) || p.brandId === 'nexalus-innovations')
        : (p.id.includes('nexalus-llp') || p.companyId === 'nexalus-llp')
    ));
    
    // First try same categoryId or categoryName
    let related = pool.filter(
      p =>
        (product.categoryId && p.categoryId === product.categoryId) ||
        (product.categoryName && p.categoryName === product.categoryName)
    );

    // If less than 3, add other scoped products
    if (related.length < 3) {
      const rest = pool.filter(p => !related.includes(p));
      related = [...related, ...rest];
    }

    return related.slice(0, 3);
  }, [products, product, isAm, isNexalusInnovations]);

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The requested product model does not exist or may have been updated.
          </p>
          <div className="pt-2">
            <Link
              to={brandProductsUrl}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-colors ${
                isAm ? 'bg-teal-700 hover:bg-teal-800' : 'bg-[#0c2340] hover:bg-blue-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {brandCatalogName}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = (product.images && product.images.length > 0 ? product.images : ['/images/products/cp-bullet.jpg']).filter(Boolean);
  const activeImage = images[activeImageIndex] || images[0];
  const badge = getProductBadge(product);

  const stockQty = product.stockQuantity !== undefined ? product.stockQuantity : 15;
  const lowThreshold = product.lowStockThreshold !== undefined ? product.lowStockThreshold : 5;
  const isOutOfStock = product.availability === 'out_of_stock' || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= lowThreshold;

  // Specifications list
  const specList = Object.entries(product.specifications || {});

  return (
    <div className="w-full bg-white min-h-screen">
      {/* 1. TOP BREADCRUMB NAVIGATION */}
      <div className="w-full bg-[#f8fafc] border-b border-slate-200/80">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Link to={brandHomeUrl} className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to={brandProductsUrl} className="hover:text-slate-900 transition-colors">
              {brandCatalogName}
            </Link>
            {product.categoryName && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-600 hidden sm:inline">
                  {product.categoryName}
                </span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-[320px]">
              {product.name}
            </span>
          </div>

          <Link
            to={brandProductsUrl}
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors shrink-0 ml-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to {brandCatalogName}</span>
          </Link>
        </div>
      </div>

      {/* 2. MAIN PRODUCT DETAIL CONTENT (Samarth Enterprises Style) */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14 sm:space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-start">
          
          {/* LEFT: Large Product Image Display Container */}
          <div className="space-y-4">
            <div className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-3xl p-6 sm:p-12 flex items-center justify-center min-h-[380px] sm:min-h-[460px] relative overflow-hidden group shadow-xs">
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-[340px] sm:max-h-[380px] max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/products/cp-bullet.jpg';
                }}
              />
            </div>

            {/* Thumbnail switcher if multiple images exist */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl border p-1 bg-white shrink-0 transition-all cursor-pointer overflow-hidden ${
                      activeImageIndex === idx
                        ? 'border-[#0c2340] ring-2 ring-[#0c2340]/20'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information, Specs & Inquiry */}
          <div className="space-y-5">
            {/* Category tag & Amber badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-sky-600 uppercase tracking-wider">
                {product.categoryName || 'Commercial Hardware'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                {badge}
              </span>
              {product.modelNumber && (
                <span className="text-xs font-mono text-slate-400">
                  Model: {product.modelNumber}
                </span>
              )}
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                  <span>Out of Stock • Available on Pre-Order</span>
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                  <span>🔥</span>
                  <span>Only {stockQty} left in stock — Order Soon!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>In Stock • Ready to Dispatch</span>
                </span>
              )}
            </div>

            {/* Large Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {product.description ||
                'High-performance enterprise hardware engineered for critical uptime, seamless deployment, and institutional reliability.'}
            </p>

            {/* Specifications Section */}
            <div className="pt-3 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Specifications
              </h2>

              {specList.length > 0 ? (
                <div className="space-y-2.5">
                  {specList.map(([key, val]) => (
                    <div key={key} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <Check className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold text-slate-900">{key}:</strong> {val}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Certified OEM commercial grade engineering</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Direct official tax invoice &amp; comprehensive manufacturer warranty</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>Turnkey installation &amp; dedicated technical field support</span>
                  </div>
                </div>
              )}
            </div>

            {/* Personalized Guidance & Enquire Now Card */}
            <div className={`rounded-2xl p-6 sm:p-7 mt-8 space-y-4 border ${
              isAm
                ? 'bg-teal-50/70 border-teal-100'
                : isNexalusInnovations
                ? 'bg-indigo-50/70 border-indigo-100'
                : 'bg-sky-50/70 border-sky-100'
            }`}>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {isAm
                  ? 'Get wholesale B2B pricing, daily supply dispatch schedules, and bulk dairy/beverage discounts from our Chiplun distribution team.'
                  : isNexalusInnovations
                  ? 'Get personalized pricing, installation guidance, and enterprise AMC options from our technical infrastructure experts.'
                  : 'Get personalized enterprise pricing, infrastructure consultation, and network solutions from our specialized team.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Enquire Now Button */}
                <button
                  type="button"
                  onClick={() => setIsQuoteOpen(true)}
                  className={`text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-95 ${
                    isAm
                      ? 'bg-teal-700 hover:bg-teal-800'
                      : isNexalusInnovations
                      ? 'bg-indigo-700 hover:bg-indigo-800'
                      : 'bg-[#0c2340] hover:bg-blue-700'
                  }`}
                >
                  <span>Enquire Now</span>
                </button>

                {/* Quantity Stepper */}
                <div className="flex items-center rounded-xl border border-slate-300 bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedQty(prev => Math.max(1, prev - 1))}
                    title="Decrease Quantity"
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-black text-xs sm:text-sm text-slate-800">
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQty(prev => prev + 1)}
                    title="Increase Quantity"
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`font-bold text-xs sm:text-sm py-3 px-5 rounded-xl flex items-center gap-2 border transition-all cursor-pointer active:scale-95 ${
                    isAm
                      ? 'bg-white text-teal-800 border-teal-300 hover:bg-teal-50'
                      : isNexalusInnovations
                      ? 'bg-white text-indigo-800 border-indigo-300 hover:bg-indigo-50'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    Add {selectedQty > 1 ? `(${selectedQty})` : ''} to Cart
                    {product.price ? ` • ₹${((product.price || 0) * selectedQty).toLocaleString('en-IN')}` : ''}
                  </span>
                </button>

                {/* Direct WhatsApp Action */}
                <a
                  href={`https://wa.me/919158886444?text=Hello%20${encodeURIComponent(brandName)},%20I%20am%20inquiring%20about%20${encodeURIComponent(product.name)}%20(Model:%20${product.modelNumber || 'N/A'})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RELATED PRODUCTS (Samarth Enterprises Style: Bottom Grid of 3 Cards) */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-slate-200/80 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Related Products
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {relatedProducts.map((rel) => {
                const relImage = (rel.images && rel.images.length > 0 ? rel.images[0] : null) || (isAm ? '/images/projects/am-distributors-chiplun.jpg' : '/images/products/cp-bullet.jpg');
                const relUrl = isAm
                  ? `/brands/am-distributors/products/${rel.id}`
                  : isNexalusInnovations
                  ? `/brands/nexalus-innovations/products/${rel.id}`
                  : `/products/${rel.id}`;
                return (
                  <Link
                    key={rel.id}
                    to={relUrl}
                    className="group bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 hover:border-slate-300 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl p-2 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-white transition-colors">
                      <img
                        src={relImage}
                        alt={rel.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        {rel.categoryName || 'Equipment'}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                        {rel.name}
                      </h3>
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 group-hover:text-sky-800 transition-colors pt-1">
                        <span>View details</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* QUOTE MODAL */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId={product.brandId}
        websiteId={isAm ? 'am-distributors' : isNexalusInnovations ? 'nexalus-innovations' : 'corporate'}
        websiteName={brandName}
        sourcePage={`Product Detail: ${product.name}`}
        itemName={`${product.name} (${product.modelNumber || 'N/A'})`}
        itemType="product"
      />
    </div>
  );
};
