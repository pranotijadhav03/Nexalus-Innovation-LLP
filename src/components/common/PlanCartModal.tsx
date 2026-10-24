import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Trash2,
  Zap,
  ShoppingBag,
  ArrowRight,
  Wifi,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react';
import {
  getPlanCart,
  removeFromPlanCart,
  clearPlanCart
} from '../../firebase/services';
import { CartPlanItem } from '../../types';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export interface PlanCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToOrder: (plan: {
    planId?: string;
    planName: string;
    providerName: string;
    speed: string;
    price: number | string;
    billingPeriod?: string;
    brandId?: any;
  }) => void;
}

export const PlanCartModal: React.FC<PlanCartModalProps> = ({
  isOpen,
  onClose,
  onProceedToOrder
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { info } = useToast();
  const [cartItems, setCartItems] = useState<CartPlanItem[]>(() => {
    try {
      return getPlanCart();
    } catch {
      return [];
    }
  });

  // Sync cart items with localStorage and events
  useEffect(() => {
    const refreshCart = (e?: any) => {
      const items = e?.detail || getPlanCart();
      setCartItems(Array.isArray(items) ? items : []);
    };

    if (isOpen) {
      refreshCart();
    }

    window.addEventListener('nexalus_plan_cart_updated', refreshCart);
    window.addEventListener('storage', refreshCart);

    return () => {
      window.removeEventListener('nexalus_plan_cart_updated', refreshCart);
      window.removeEventListener('storage', refreshCart);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckoutItem = (item: CartPlanItem) => {
    if (!isAuthenticated) {
      onClose();
      try {
        sessionStorage.setItem('nexalus_pending_order_plan', JSON.stringify({
          planId: item.planId,
          planName: item.planName,
          providerName: item.providerName,
          speed: item.speed,
          price: item.price,
          billingPeriod: item.billingPeriod,
          brandId: item.brandId
        }));
      } catch {}

      info(
        'Registration / Login Required',
        'Please register or log in first to complete your broadband booking.'
      );

      window.dispatchEvent(
        new CustomEvent('open_customer_portal', {
          detail: {
            view: 'choice',
            context: 'cart_checkout',
            prompt: `Please register a new customer account, or log in if you already have an account, to book ${item.providerName} - ${item.planName}.`
          }
        })
      );
      return;
    }

    onClose();
    onProceedToOrder({
      planId: item.planId,
      planName: item.planName,
      providerName: item.providerName,
      speed: item.speed,
      price: item.price,
      billingPeriod: item.billingPeriod,
      brandId: item.brandId
    });
  };

  const handleBrowsePlans = () => {
    onClose();
    navigate('/plans');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 text-orange-400 flex items-center justify-center shadow-inner">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Broadband Cart</span>
                {cartItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black">
                    {cartItems.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {cartItems.length} plan{cartItems.length !== 1 ? 's' : ''} saved for booking
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {cartItems.length === 0 ? (
            <div className="p-10 text-center text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">Your Broadband Cart is Empty</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Explore high-speed optical fiber plans and click &ldquo;Add to Cart&rdquo; to review or book them here.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleBrowsePlans}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Browse Broadband Plans
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {!isAuthenticated && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-950 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        Login or Registration Required to Checkout
                      </p>
                      <p className="text-[11px] font-medium text-slate-600 mt-0.5 leading-tight truncate">
                        बुकिंग पूर्ण करण्यासाठी कृपया Register किंवा Login करा.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(
                        new CustomEvent('open_customer_portal', {
                          detail: {
                            view: 'choice',
                            context: 'cart_checkout',
                            prompt: 'Please register your customer account, or log in if you already have one, to checkout your cart.'
                          }
                        })
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-transform active:scale-95 whitespace-nowrap"
                  >
                    Register / Login
                  </button>
                </div>
              )}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                        {item.providerName || 'Broadband'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.planName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-600 pt-0.5">
                      <span className="font-extrabold text-blue-700 flex items-center gap-1">
                        <Wifi className="w-3.5 h-3.5" />
                        {item.speed}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-black text-slate-900">
                        ₹{Number(item.price).toLocaleString('en-IN')}/{item.billingPeriod || 'mo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCheckoutItem(item)}
                      className="py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      title="Proceed to Book this Plan"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Book Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromPlanCart(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={clearPlanCart}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer py-1 px-2"
            >
              Clear Cart
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBrowsePlans}
              >
                Add More Plans
              </Button>

              <button
                type="button"
                onClick={() => handleCheckoutItem(cartItems[0])}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Book First Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
