import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, CartPlanItem } from '../../types';
import { ProductDetailModal } from './ProductDetailModal';
import { QuoteModal } from '../common/QuoteModal';
import { WhatsAppShareModal } from '../common/WhatsAppShareModal';
import { BlurZoomReveal } from '../common/BlurZoomReveal';
import { ArrowRight, Camera, ShoppingCart, Plus, Minus } from 'lucide-react';
import { addToPlanCart, removeFromPlanCart, updateCartItemQuantity, getPlanCart } from '../../firebase/services';
import { useToast } from '../../context/ToastContext';

interface ProductCardProps {
  product: Product;
  index?: number;
  direction?: 'left' | 'right' | 'up' | 'down' | 'auto' | 'none';
  delay?: number;
  animate?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  direction = 'auto',
  delay,
  animate = true
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const { success } = useToast();
  const isAm = product.brandId === 'am-distributors' || product.id.startsWith('prod-am');
  const isNexalusInnovations = product.brandId === 'nexalus-innovations' || (product.id.startsWith('prod-nexalus-') && !product.id.includes('llp'));
  const productDetailUrl = isAm
    ? `/brands/am-distributors/products/${product.id}`
    : isNexalusInnovations
    ? `/brands/nexalus-innovations/products/${product.id}`
    : `/products/${product.id}`;

  const [cartItem, setCartItem] = useState<CartPlanItem | null>(() => {
    try {
      const items = getPlanCart();
      return items.find((i: CartPlanItem) => i.planId === product.id) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleCartSync = (e?: any) => {
      try {
        const items = e?.detail || getPlanCart();
        setCartItem((items || []).find((i: CartPlanItem) => i.planId === product.id) || null);
      } catch {}
    };
    window.addEventListener('nexalus_plan_cart_updated', handleCartSync);
    window.addEventListener('storage', handleCartSync);
    return () => {
      window.removeEventListener('nexalus_plan_cart_updated', handleCartSync);
      window.removeEventListener('storage', handleCartSync);
    };
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = addToPlanCart({
      planId: product.id,
      planName: product.name,
      providerName: isAm ? 'A.M. Distributors' : isNexalusInnovations ? 'Nexalus Innovations' : 'Nexalus Innovations LLP',
      speed: product.categoryName || 'Commercial Grade',
      price: product.price || 0,
      unitPrice: product.price || 0,
      quantity: 1,
      billingPeriod: 'Standard Procurement',
      brandId: (product.brandId || (isAm ? 'am-distributors' : isNexalusInnovations ? 'nexalus-innovations' : 'nexalus-llp')) as any,
      companyId: isAm ? 'am-distributors' : isNexalusInnovations ? 'nexalus-innovations' : 'nexalus-llp'
    });
    setCartItem(added);
    success('Added to Cart', `${product.name} (Qty: 1) has been added to your cart.`);
  };

  const handleIncreaseQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      const currentQty = cartItem.quantity || 1;
      const stock = product.stockQuantity !== undefined ? product.stockQuantity : 15;
      if (stock > 0 && currentQty >= stock) {
        return;
      }
      updateCartItemQuantity(cartItem.id, currentQty + 1);
    } else {
      handleAddToCart(e);
    }
  };

  const handleDecreaseQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    const currentQty = cartItem.quantity || 1;
    if (currentQty <= 1) {
      removeFromPlanCart(cartItem.id);
      setCartItem(null);
      success('Removed from Cart', `${product.name} removed from your cart.`);
    } else {
      updateCartItemQuantity(cartItem.id, currentQty - 1);
    }
  };

  const defaultFallback = isAm
    ? '/images/projects/am-distributors-chiplun.jpg'
    : '/images/products/cp-bullet.jpg';

  const images = (product.images && product.images.length > 0 ? product.images : [defaultFallback]).filter(Boolean);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    setActiveImgIndex(0);
  }, [product.images]);

  useEffect(() => {
    if (images.length <= 1) return;
    const staggerDelay = ((index || 0) % 4) * 800;
    let intervalId: any;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setActiveImgIndex(prev => (prev + 1) % images.length);
      }, 4200);
    }, staggerDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [images.length, index]);

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for Pricing';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const isCctv =
    product.categoryName?.toLowerCase().includes('cctv') ||
    product.slug?.toLowerCase().includes('cctv') ||
    product.brandId === 'cp-plus';

  const specEntries = Object.entries(product.specifications || {}).slice(0, 4);

  let cardDirection: 'left' | 'right' | 'up' = 'up';
  if (direction === 'left' || direction === 'right' || direction === 'up') {
    cardDirection = direction;
  } else if (index !== undefined) {
    cardDirection = index % 2 === 0 ? 'left' : 'right';
  }

  const cardDelay = delay ?? (index !== undefined ? (index % 3) * 100 : 0);
  const xOffset = cardDirection === 'left' ? -55 : cardDirection === 'right' ? 55 : 0;
  const isAnimated = animate && direction !== 'none';

  const stockQty = product.stockQuantity !== undefined ? product.stockQuantity : 15;
  const lowThreshold = product.lowStockThreshold !== undefined ? product.lowStockThreshold : 5;
  const isOutOfStock = product.availability === 'out_of_stock' || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= lowThreshold;

  const cardBody = (
    <div className={`group bg-white rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 flex flex-col overflow-hidden card-zoom-hover h-full relative ${
      isCctv ? 'hover:border-indigo-400/60 hover:shadow-indigo-500/15' : isAm ? 'hover:border-teal-400 hover:shadow-teal-500/20' : 'hover:border-blue-300 hover:shadow-blue-500/15'
    }`}>
          {isAm && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 z-20 pointer-events-none" />}
          <Link to={productDetailUrl} className="relative aspect-4/3 bg-slate-100 overflow-hidden block cursor-pointer select-none">
            {/* Stock Status Badge Floating on Product Image */}
            <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white backdrop-blur-md shadow-md border border-rose-400/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
                  <span>Out of Stock</span>
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white backdrop-blur-md shadow-md border border-amber-300/50 animate-pulse">
                  <span>🔥</span>
                  <span>Only {stockQty} Left!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-emerald-700 backdrop-blur-md shadow-sm border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>In Stock</span>
                </span>
              )}
            </div>

            {images.map((img, i) => {
              const isActive = i === activeImgIndex;
              return (
                <img
                  key={img + i}
                  src={img}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                    isActive
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-105 z-0 pointer-events-none'
                  } ${isCctv ? 'group-hover:scale-110' : 'group-hover:scale-105'}`}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to default if error
                    (e.currentTarget as HTMLImageElement).src = defaultFallback;
                  }}
                />
              );
            })}

            {/* Subtle Carousel Dots if product has multiple images */}
            {images.length > 1 && (
              <div
                className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 bg-slate-950/60 backdrop-blur-xs px-2 py-1 rounded-full shadow-xs pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((_, dotI) => (
                  <button
                    key={dotI}
                    type="button"
                    onClick={() => setActiveImgIndex(dotI)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      dotI === activeImgIndex ? 'w-4 bg-teal-300' : 'w-1.5 bg-white/50 hover:bg-white'
                    }`}
                    title={`View photo ${dotI + 1}`}
                  />
                ))}
              </div>
            )}
          </Link>

          {/* Content Body */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              {product.modelNumber && (
                <div className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Model: {product.modelNumber}
                </div>
              )}
              <h3 className={`font-bold text-slate-900 ${isAm ? 'group-hover:text-teal-600' : 'group-hover:text-blue-600'} transition-colors line-clamp-2 leading-snug`}>
                <Link to={productDetailUrl} className="cursor-pointer hover:underline">{product.name}</Link>
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              {/* Hardware Specs Preview */}
              {specEntries.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  {specEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100/90 text-slate-700 min-w-0"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                        {key}
                      </span>
                      <span
                        className="font-semibold text-slate-800 text-[11px] truncate text-right min-w-0"
                        title={val}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Action Row */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {cartItem && (cartItem.quantity || 1) > 1 ? `Price (${cartItem.quantity} items)` : 'Official Price'}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {cartItem && (cartItem.quantity || 1) > 1
                    ? `₹${((product.price || 0) * (cartItem.quantity || 1)).toLocaleString('en-IN')}`
                    : formatPrice(product.price)}
                </span>
                {cartItem && (cartItem.quantity || 1) > 1 && product.price ? (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    ₹{product.price.toLocaleString('en-IN')} each
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* 1. Enquire Now Button (Clean Action) */}
                <button
                  type="button"
                  onClick={() => setIsQuoteOpen(true)}
                  className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer text-white flex items-center justify-center gap-1.5 ${
                    isAm
                      ? 'bg-teal-700 hover:bg-teal-800'
                      : isCctv
                      ? 'bg-indigo-700 hover:bg-indigo-800'
                      : 'bg-[#09223f] hover:bg-blue-700'
                  }`}
                >
                  <span>Enquire Now</span>
                </button>

                {/* 2. Add to Cart / Quantity Stepper Option */}
                {cartItem ? (
                  <div
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className={`inline-flex items-center rounded-xl border p-1 shadow-2xs gap-1.5 ${
                      isAm
                        ? 'border-teal-300 bg-teal-50 text-teal-900'
                        : isCctv
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                        : 'border-blue-300 bg-blue-50 text-blue-900'
                    }`}
                    title={`${cartItem.quantity || 1} in cart`}
                  >
                    <button
                      type="button"
                      onClick={handleDecreaseQty}
                      title="Decrease Quantity"
                      className="w-5 h-5 rounded-md flex items-center justify-center font-black text-xs hover:bg-white active:scale-90 transition-all cursor-pointer text-slate-700 hover:text-rose-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black min-w-4 text-center">
                      {cartItem.quantity || 1}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncreaseQty}
                      title="Increase Quantity"
                      disabled={stockQty > 0 && (cartItem.quantity || 1) >= stockQty}
                      className="w-5 h-5 rounded-md flex items-center justify-center font-black text-xs hover:bg-white active:scale-90 transition-all cursor-pointer text-slate-700 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    title="Add to Cart"
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95 ${
                      isAm
                        ? 'border-teal-200 text-teal-700 hover:bg-teal-50'
                        : isCctv
                        ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                )}

                {/* 3. View More Button (Scoped to Brand) */}
                <Link
                  to={productDetailUrl}
                  className={`inline-flex items-center justify-center gap-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isAm
                      ? 'text-teal-700 hover:text-teal-800 hover:bg-teal-50 border border-teal-200'
                      : isCctv
                      ? 'text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200'
                  }`}
                  title="View Complete Specifications & Purchase Options"
                >
                  <span>View More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
  );

  return (
    <>
      {isAnimated ? (
        <BlurZoomReveal
          direction={cardDirection}
          xOffset={xOffset}
          delay={cardDelay}
          duration={550}
          blur={4}
          scale={0.97}
          className="h-full flex flex-col"
        >
          {cardBody}
        </BlurZoomReveal>
      ) : (
        <div className="h-full flex flex-col">
          {cardBody}
        </div>
      )}

      <ProductDetailModal
        product={product}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenQuote={() => setIsQuoteOpen(true)}
      />

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId={product.brandId}
        websiteId={isAm ? 'am-distributors' : isNexalusInnovations ? 'nexalus-innovations' : 'corporate'}
        websiteName={isAm ? 'A.M. Distributors Chiplun' : isNexalusInnovations ? 'Nexalus Innovations' : 'Nexalus Innovations LLP'}
        sourcePage={`Product Card: ${product.name}`}
        itemName={product.modelNumber ? `${product.name} (${product.modelNumber})` : product.name}
        itemType="product"
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        product={product}
      />
    </>
  );
};
