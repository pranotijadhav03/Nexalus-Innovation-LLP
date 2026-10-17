import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Button } from '../common/Button';
import { QuoteModal } from '../common/QuoteModal';
import { WhatsAppShareModal } from '../common/WhatsAppShareModal';
import { ArrowRight, Camera } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const isAm = product.brandId === 'am-distributors';
  const defaultFallback = isAm
    ? '/images/projects/am-distributors-chiplun.jpg'
    : '/images/products/cp-bullet.jpg';

  const [imgSrc, setImgSrc] = useState(product.images?.[0] || defaultFallback);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(product.images?.[0] || defaultFallback);
    setHasError(false);
  }, [product.images, defaultFallback]);

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for Pricing';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const detailPath = isAm ? '/brands/am-distributors/products' : '/brands/nexalus-innovations/products';

  const isCctv =
    product.categoryName?.toLowerCase().includes('cctv') ||
    product.slug?.toLowerCase().includes('cctv') ||
    product.brandId === 'cp-plus';

  // Grab first 4 specifications for deep hardware information
  const specEntries = Object.entries(product.specifications || {}).slice(0, 4);

  return (
    <>
      <div className={`group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 ${
        isCctv ? 'hover:border-indigo-400/60' : isAm ? 'hover:border-emerald-300' : 'hover:border-blue-300'
      }`}>
        {/* Image & Badge Header */}
        <Link to={detailPath} className="relative aspect-4/3 bg-slate-100 overflow-hidden block cursor-pointer">
          {hasError ? (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4 text-center">
              <Camera className="w-10 h-10 text-slate-400 mb-2 opacity-60" />
              <span className="text-xs font-semibold text-slate-500 font-mono">{product.modelNumber}</span>
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={product.name}
              onError={() => {
                if (imgSrc !== defaultFallback) {
                  setImgSrc(defaultFallback);
                } else {
                  setHasError(true);
                }
              }}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                isCctv ? 'group-hover:scale-110' : 'group-hover:scale-105'
              }`}
              loading="lazy"
            />
          )}

        </Link>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider mb-1">
              Model: {product.modelNumber}
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              <Link to={detailPath}>{product.name}</Link>
            </h3>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Quick Specs Snippet */}
            {specEntries.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="text-slate-400 font-medium">{key}:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={value}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & CTA */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">Est. Price</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900">
                {formatPrice(product.price)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Direct WhatsApp to Admin Button */}
              <a
                href={`https://wa.me/919158886444?text=${encodeURIComponent(
                  `Hello Nexalus Innovations, I would like to inquire about this product:\n\n*Product:* ${product.name}\n*Model:* ${product.modelNumber}\n*Price:* ${formatPrice(product.price)}\n\nPlease share availability and quote.`
                )}`}
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
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                title="View Product in Catalog"
              >
                <span>View More</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

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
