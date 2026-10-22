import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { ProductDetailModal } from './ProductDetailModal';
import { QuoteModal } from '../common/QuoteModal';
import { WhatsAppShareModal } from '../common/WhatsAppShareModal';
import { BlurZoomReveal } from '../common/BlurZoomReveal';
import { ArrowRight, Camera } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
  direction?: 'left' | 'right' | 'up' | 'down' | 'auto';
  delay?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  direction = 'auto',
  delay
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const isAm = product.brandId === 'am-distributors';
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

  return (
    <>
      <BlurZoomReveal
        direction={cardDirection}
        xOffset={xOffset}
        delay={cardDelay}
        duration={750}
        blur={10}
        scale={0.93}
        className="h-full flex flex-col"
      >
        <div className={`group bg-white rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/70 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 flex flex-col overflow-hidden card-zoom-hover h-full relative ${
          isCctv ? 'hover:border-indigo-400/60 hover:shadow-indigo-500/15' : isAm ? 'hover:border-teal-400 hover:shadow-teal-500/20' : 'hover:border-blue-300 hover:shadow-blue-500/15'
        }`}>
          {isAm && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 z-20 pointer-events-none" />}
          <div onClick={() => setIsDetailOpen(true)} className="relative aspect-4/3 bg-slate-100 overflow-hidden block cursor-pointer select-none">
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
          </div>

          {/* Content Body */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
                Model: {product.modelNumber}
              </div>
              <h3 className={`font-bold text-slate-900 ${isAm ? 'group-hover:text-teal-600' : 'group-hover:text-blue-600'} transition-colors line-clamp-2 leading-snug`}>
                <span onClick={() => setIsDetailOpen(true)} className="cursor-pointer hover:underline">{product.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              {/* Hardware Specs Preview */}
              {specEntries.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  {specEntries.map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-tight">{key}</span>
                      <span className="font-semibold text-slate-700 truncate block mt-0.5">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Action Row */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Official Price</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* WhatsApp Order Button */}
                <a
                  href={`https://wa.me/919158886444?text=Hello%20Nexalus,%20I%20am%20interested%20in%20product%20${encodeURIComponent(product.name)}%20(${product.modelNumber})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Inquire directly on WhatsApp"
                  aria-label="Inquire on WhatsApp"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>

                {/* View Product Details Button */}
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(true)}
                  className={`inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isAm
                      ? 'text-teal-700 hover:text-teal-800 hover:bg-teal-50 border border-teal-200'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200'
                  }`}
                  title="View Complete Specifications & Purchase Options"
                >
                  <span>View More</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                {/* Enquire Modal Button */}
                <button
                  type="button"
                  onClick={() => setIsQuoteOpen(true)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isAm
                      ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </BlurZoomReveal>

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
        websiteId={isAm ? 'am-distributors' : 'nexalus-innovations'}
        websiteName={isAm ? 'A.M. Distributors Chiplun' : 'Nexalus Innovations'}
        sourcePage={`Product Card: ${product.name}`}
        itemName={`${product.name} (${product.modelNumber})`}
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
