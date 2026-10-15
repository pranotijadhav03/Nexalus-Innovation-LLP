import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Button } from '../common/Button';
import { QuoteModal } from '../common/QuoteModal';
import { WhatsAppShareModal } from '../common/WhatsAppShareModal';
import { Shield, Sparkles, Check, ArrowRight, Share2, MessageCircle, Camera } from 'lucide-react';

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

  const detailPath = '/products';

  // Grab first 4 specifications for deep hardware information
  const specEntries = Object.entries(product.specifications || {}).slice(0, 4);



  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
        {/* Image & Badge Header */}
        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
          {hasError ? (
            <div className="w-full h-full bg-linear-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4 text-center">
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
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs">
              {product.categoryName}
            </span>
            {product.featured && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-3 z-10">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs ${
                product.availability === 'in_stock'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {product.availability === 'in_stock' ? 'In Stock' : 'On Order'}
            </span>
          </div>
        </div>

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

            <div className="flex items-center gap-1.5">
              {/* WhatsApp Share Draft Button */}
              <button
                type="button"
                onClick={() => setIsWhatsAppOpen(true)}
                title="Share Draft to Customer on WhatsApp"
                className="p-2 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded-lg transition-colors border border-emerald-200"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              <Link
                to={detailPath}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="View Full Specifications"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Button
                size="sm"
                variant={isAm ? 'teal' : 'primary'}
                onClick={() => setIsQuoteOpen(true)}
              >
                Enquire
              </Button>
            </div>
          </div>
        </div>
      </div>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId={product.brandId}
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
