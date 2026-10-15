import React, { useState } from 'react';
import { InternetPlan } from '../../types';
import { QuoteModal } from '../common/QuoteModal';
import { ShoppingCart, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface PlanCardProps {
  plan: InternetPlan;
  onCheckCoverageClick?: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div className="group rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Card Header Banner */}
          {!imageError && plan.image ? (
            <div className="relative w-full h-40 overflow-hidden bg-slate-100">
              <img
                src={plan.image}
                alt={plan.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {plan.popular && (
                <div className="absolute top-3 right-3 bg-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  Popular
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full p-5 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-teal-900/40">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">
                  One Broadband FTTH
                </span>
                <div className="text-xl sm:text-2xl font-black text-white">{plan.speed}</div>
              </div>
              {plan.popular && (
                <div className="bg-teal-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  Popular
                </div>
              )}
            </div>
          )}

          {/* Card Body */}
          <div className="p-5 sm:p-6 space-y-3">
            {/* Title */}
            <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-wide uppercase line-clamp-2 min-h-[44px] flex items-center">
              {plan.name}
            </h3>

            {/* Price Box */}
            <div className="pt-2">
              {plan.originalPrice && (
                <div className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                  ₹{plan.originalPrice.toLocaleString('en-IN')}.00
                </div>
              )}
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ₹{plan.price.toLocaleString('en-IN')}.00
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  PER MONTH
                </span>
              </div>
            </div>

            {/* Expandable Features */}
            {showDetails && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 animate-fadeIn">
                <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                  Plan Specifications:
                </div>
                {plan.includedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-5 sm:p-6 pt-0 space-y-2">
          <button
            type="button"
            onClick={() => setIsQuoteOpen(true)}
            className="w-full py-2.5 px-4 rounded-full border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </button>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-center text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 cursor-pointer py-1"
          >
            {showDetails ? (
              <>
                Hide specs <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                View plan details <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        brandId="one-broadband"
        itemName={`${plan.name} (${plan.speed}) - ₹${plan.price}/mo`}
        itemType="plan"
      />
    </>
  );
};
