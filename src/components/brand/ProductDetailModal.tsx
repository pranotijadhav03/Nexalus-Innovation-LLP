import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { BrandBadge } from '../common/BrandBadge';
import { useCart } from '../../context/CartContext';
import { CheckoutModal } from '../common/CheckoutModal';
import {
  CheckCircle2,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  Layers,
  Plus,
  Minus,
  Check,
  Camera
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuote?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!product) return null;

  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isAm = product.brandId === 'am-distributors';
  const defaultFallback = isAm
    ? '/images/projects/am-distributors-chiplun.jpg'
    : '/images/products/cp-bullet.jpg';

  const [selectedImg, setSelectedImg] = useState<string>(
    product.images?.[0] || defaultFallback
  );
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setSelectedImg(product.images?.[0] || defaultFallback);
    setImgError(false);
    setQuantity(1);
  }, [product, defaultFallback]);

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for Pricing';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
    openCart();
  };

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  const specList = Object.entries(product.specifications || {});

  return (
    <>
      <Modal
        isOpen={isOpen && !isCheckoutOpen}
        onClose={onClose}
        title={product.name}
        subtitle={`Model: ${product.modelNumber} • Category: ${product.categoryName}`}
        maxWidth="3xl"
      >
        <div className="space-y-6">
          {/* Main Top Grid (Image Left + Info & Buttons Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Product Image & Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-4/3 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center p-3">
                {imgError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-100 rounded-xl">
                    <Camera className="w-12 h-12 text-slate-400 mb-2" />
                    <span className="text-xs font-mono text-slate-500">{product.modelNumber}</span>
                  </div>
                ) : (
                  <img
                    src={selectedImg}
                    alt={product.name}
                    onError={() => {
                      if (selectedImg !== defaultFallback) {
                        setSelectedImg(defaultFallback);
                      } else {
                        setImgError(true);
                      }
                    }}
                    className="w-full h-full object-contain rounded-xl"
                  />
                )}
              </div>

              {/* Thumbnails if multiple images */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedImg(img);
                        setImgError(false);
                      }}
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all cursor-pointer bg-slate-50 ${
                        selectedImg === img ? 'border-blue-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges under Image */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600">
                <div className="flex flex-col items-center gap-1 font-medium">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Free Dispatch</span>
                </div>
                <div className="flex flex-col items-center gap-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>1-Yr Warranty</span>
                </div>
                <div className="flex flex-col items-center gap-1 font-medium">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>GST Tax Invoice</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Info + Add to Cart & Buy Now Buttons */}
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <BrandBadge brandId={product.brandId} />
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <Layers className="w-3 h-3" />
                  {product.categoryName}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  {product.availability === 'in_stock' ? 'In Stock • Ready to Dispatch' : 'Available on Order'}
                </span>
              </div>

              {/* Title & Model */}
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Model: {product.modelNumber}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/50 border border-blue-200/80">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Special Price
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Inclusive of all taxes)
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center bg-slate-100 rounded-xl border border-slate-300 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-900 font-mono text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs text-slate-500">
                    Subtotal: <strong className="text-slate-900 font-mono">{formatPrice((product.price || 0) * quantity)}</strong>
                  </span>
                </div>
              </div>

              {/* ADD TO CART & BUY NOW BUTTONS */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                {/* 2. Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Quick dispatch note */}
              <p className="text-[11px] text-slate-500 text-center pt-1">
                ⚡ Express delivery dispatched from Sangli &amp; Chiplun within 24 hours.
              </p>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product Overview &amp; Information
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Complete Technical Specifications Table */}
          {specList.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Technical Specifications</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {specList.length} parameters
                </span>
              </h3>

              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <tbody>
                    {specList.map(([key, val], idx) => (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
                      >
                        <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 border-b border-slate-100">
                          {key}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 border-b border-slate-100">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Checkout Modal when "Buy Now" is clicked */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          onClose();
        }}
        items={[{ product, quantity }]}
      />
    </>
  );
};
