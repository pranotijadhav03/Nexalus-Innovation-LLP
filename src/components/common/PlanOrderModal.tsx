import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Zap,
  CheckCircle2,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Loader2,
  Clock,
  Sparkles,
  PhoneCall,
  Lock,
  UserPlus,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { submitPlanOrder } from '../../firebase/services';
import { PlanOrder, BrandId } from '../../types';
import { Button } from './Button';

export interface PlanOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    planId?: string;
    planName: string;
    providerName: string;
    speed: string;
    price: number | string;
    billingPeriod?: string;
    brandId?: BrandId | 'one-broadband' | 'nexalus-innovations';
  } | null;
  onOrderSuccess?: (orderId: string) => void;
}

export const PlanOrderModal: React.FC<PlanOrderModalProps> = ({
  isOpen,
  onClose,
  plan,
  onOrderSuccess
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Immediate / Next Working Day');
  const [paymentMethod, setPaymentMethod] = useState<PlanOrder['paymentMethod']>('pay_on_installation');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PlanOrder | null>(null);

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName) setCustomerName(currentUser.displayName);
      if (currentUser.phone) setPhone(currentUser.phone.replace(/\D/g, '').slice(0, 10));
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.deliveryAddress) {
        if (currentUser.deliveryAddress.address) setAddress(currentUser.deliveryAddress.address);
        if (currentUser.deliveryAddress.city) setCity(currentUser.deliveryAddress.city);
        if (currentUser.deliveryAddress.postcode) setPincode(currentUser.deliveryAddress.postcode.replace(/\D/g, '').slice(0, 6));
      }
    }
  }, [currentUser, isOpen]);

  // Reset state on open if guest
  useEffect(() => {
    if (isOpen) {
      setCompletedOrder(null);
      if (!currentUser) {
        setCustomerName('');
        setPhone('');
        setEmail('');
        setAddress('');
        setCity('');
        setPincode('');
        setNotes('');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !plan) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      error('Login Required', 'Please register or log in first to submit your broadband order.');
      onClose();
      window.dispatchEvent(
        new CustomEvent('open_customer_portal', {
          detail: {
            view: 'choice',
            prompt: 'Please register your account, or log in if you already have an account, to complete your booking.'
          }
        })
      );
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const cleanPin = pincode.replace(/\D/g, '');

    if (!customerName.trim()) {
      error('Validation Error', 'Please enter your full name.');
      return;
    }

    if (cleanPhone.length !== 10) {
      error('Validation Error', 'Mobile number must be exactly 10 digits.');
      return;
    }

    if (!address.trim() || !city.trim()) {
      error('Validation Error', 'Please provide complete installation address and city.');
      return;
    }

    const emailToSave = email.trim() ? email.trim().toLowerCase() : `${cleanPhone}@customer.nexalus.com`;
    const pinToSave = cleanPin || '415605';

    setIsSubmitting(true);
    try {
      const res = await submitPlanOrder({
        planId: plan.planId,
        planName: plan.planName,
        providerName: plan.providerName,
        speed: plan.speed,
        price: plan.price,
        billingPeriod: plan.billingPeriod || 'monthly',
        brandId: plan.brandId || 'one-broadband',
        customerName: customerName.trim(),
        phone: cleanPhone,
        email: emailToSave,
        address: address.trim(),
        city: city.trim(),
        pincode: pinToSave,
        preferredSlot,
        paymentMethod,
        notes: notes.trim()
      });

      if (res.success) {
        setCompletedOrder(res.order);
        success('Order Confirmed!', `Broadband Order #${res.id} placed successfully.`);
        if (onOrderSuccess) onOrderSuccess(res.id);
      } else {
        error('Order Error', 'Could not record plan order. Please try again.');
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to submit plan booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 px-6 py-5 text-white flex items-center justify-between border-b border-blue-900/40 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-teal-300">
                Official Broadband Provisioning
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                {completedOrder ? 'Order Confirmed' : 'Instant Plan Booking & Checkout'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER SUCCESS VIEW */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Booking ID: {completedOrder.id}
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Plan Order Received!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{completedOrder.customerName}</strong>. Your connection order has been recorded in Firebase and dispatched to our regional optical engineering desk.
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200/80 pb-2 font-bold text-slate-900">
                <span>Selected Plan:</span>
                <span className="text-teal-700">{completedOrder.providerName} - {completedOrder.planName} ({completedOrder.speed})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Monthly Tariff:</span>
                <span className="font-extrabold text-slate-900">₹{completedOrder.price} / {completedOrder.billingPeriod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Installation City:</span>
                <span className="font-semibold text-slate-800">{completedOrder.city} ({completedOrder.pincode})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode:</span>
                <span className="font-semibold text-slate-800">{completedOrder.paymentMethod.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Scheduled Slot:</span>
                <span className="font-semibold text-slate-800">{completedOrder.preferredSlot}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/919158886444?text=Hello%20Nexalus,%20I%20just%20placed%20Broadband%20Plan%20Order%20${completedOrder.id}%20for%20${encodeURIComponent(completedOrder.planName)}.%20Please%20confirm%20my%20installation.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Track on WhatsApp</span>
              </a>
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Close Window
              </Button>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* AUTHENTICATION REQUIRED VIEW */
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Customer Account Required</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Please Register or Login to Buy
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                To proceed with ordering <strong>{plan.providerName} - {plan.planName} ({plan.speed})</strong>, you need to sign in. If you are a new customer, please register your verified customer profile.
              </p>
              <p className="text-xs font-semibold text-amber-800">
                लॉगिन नसेल तर लॉगिन करा, किंवा नवीन ग्राहक असल्यास आधी रजिस्टर (Register) करा.
              </p>
            </div>

            {/* Plan preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between items-center text-slate-800 font-bold">
                <span>Selected Plan:</span>
                <span className="text-blue-700">{plan.providerName} - {plan.planName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Speed &amp; Tariff:</span>
                <span className="font-extrabold text-slate-900">{plan.speed} • ₹{plan.price}/{plan.billingPeriod || 'mo'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.setItem('nexalus_pending_order_plan', JSON.stringify(plan));
                  } catch {}
                  onClose();
                  window.dispatchEvent(
                    new CustomEvent('open_customer_portal', {
                      detail: {
                        view: 'register',
                        context: 'buy_now',
                        prompt: `Please register your customer account to complete booking for ${plan.providerName} - ${plan.planName}.`
                      }
                    })
                  );
                }}
                className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Account</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.setItem('nexalus_pending_order_plan', JSON.stringify(plan));
                  } catch {}
                  onClose();
                  window.dispatchEvent(
                    new CustomEvent('open_customer_portal', {
                      detail: {
                        view: 'login',
                        context: 'buy_now',
                        prompt: `Please log in to your account to complete booking for ${plan.providerName} - ${plan.planName}.`
                      }
                    })
                  );
                }}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Login to Existing Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* ORDER CHECKOUT FORM */
          <form onSubmit={handleSubmitOrder} noValidate className="p-6 sm:p-8 space-y-4">
            {/* Plan Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200/80 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                  {plan.providerName}
                </span>
                <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                  {plan.planName}
                </h4>
                <div className="text-xs font-extrabold text-teal-700 mt-0.5">
                  {plan.speed} Symmetrical Fiber
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-slate-900">
                  ₹{typeof plan.price === 'number' ? plan.price.toLocaleString('en-IN') : plan.price}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  / {plan.billingPeriod || 'month'}
                </div>
                <div className="text-[10px] font-black text-emerald-700 mt-0.5">
                  ✓ Free Standard Setup
                </div>
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Anand Shinde"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mobile / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-bold ${
                      phone.length === 10
                        ? 'text-emerald-600'
                        : phone.length > 0
                        ? 'text-amber-600'
                        : 'text-slate-400'
                    }`}>
                      {phone.length === 10
                        ? '✓ 10 digits valid'
                        : `${phone.length}/10 digits`}
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                      phone.length === 10 ? 'text-emerald-500' : 'text-slate-400'
                    }`} />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={e => {
                        let digits = e.target.value.replace(/\D/g, '');
                        if (digits.length === 12 && digits.startsWith('91')) {
                          digits = digits.slice(2);
                        } else if (digits.length === 11 && digits.startsWith('0')) {
                          digits = digits.slice(1);
                        }
                        setPhone(digits.slice(0, 10));
                      }}
                      onKeyDown={e => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) &&
                          !e.ctrlKey &&
                          !e.metaKey
                        ) {
                          e.preventDefault();
                        }
                      }}
                      maxLength={10}
                      required
                      className={`w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none transition-colors ${
                        phone.length === 10
                          ? 'border-emerald-500 bg-emerald-50/20 focus:border-emerald-600 focus:bg-white'
                          : phone.length > 0
                          ? 'border-amber-400 bg-amber-50/20 focus:border-amber-500 focus:bg-white'
                          : 'border-slate-200 focus:border-blue-600 focus:bg-white'
                      }`}
                    />
                  </div>
                  {phone.length > 0 && phone.length < 10 && (
                    <p className="text-[10px] text-amber-600 font-medium mt-1">
                      Must be exactly 10 digits ({10 - phone.length} more needed)
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@example.com (optional)"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Installation Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Installation Address / Flat / Building <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Royal Palms, Chiplun MIDC Road"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city (e.g. Chiplun)"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PIN Code <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 415605"
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Slot & Payment Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Preferred Setup Slot
                  </label>
                  <select
                    value={preferredSlot}
                    onChange={e => setPreferredSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors font-medium text-slate-700"
                  >
                    <option value="Immediate / Next Working Day">Immediate / Next Working Day</option>
                    <option value="Weekend Priority Installation">Weekend Priority Installation</option>
                    <option value="Within 3 Working Days">Within 3 Working Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payment Preference
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-colors font-medium text-slate-700"
                  >
                    <option value="pay_on_installation">Pay on Installation (Tested)</option>
                    <option value="online_upi">UPI / Online QR on Setup</option>
                    <option value="corporate_invoice">Corporate / GST Invoicing</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Advance Risk • Pay After Optical Feasibility</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md shadow-blue-600/20"
                icon={<Zap className="w-4 h-4 text-cyan-300" />}
              >
                Confirm &amp; Place Order
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
