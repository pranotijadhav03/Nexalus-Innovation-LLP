import React, { useState } from 'react';
import {
  Truck,
  Mail,
  PhoneCall,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Droplets,
  IceCream,
  Milk,
  Building2,
  Sparkles
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { submitEnquiry } from '../../../firebase/services';

export const AmDistributorsContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    establishmentName: '',
    location: '',
    productLine: 'mineral_water_20l',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitEnquiry({
        brandId: 'am-distributors',
        websiteId: 'am-distributors',
        websiteName: 'A.M. Distributors Chiplun',
        sourcePage: 'AM Distributors Depot Contact',
        customerName: formData.name,
        phone: formData.phone,
        email: formData.email,
        enquiryType: 'general',
        location: formData.location || 'Chiplun',
        message: `[Chiplun Depot Wholesale - ${formData.productLine} for ${formData.establishmentName} in ${formData.location}]: ${formData.message}`
      });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Header */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-950 via-[#061e24] to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-400/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <Truck className="w-3.5 h-3.5 text-teal-300" />
            <span>Depot Booking Desk • A.M. Distributors Chiplun</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Chiplun Wholesale &amp; Depot Orders Desk
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Contact our Chiplun depot directly for wholesale supply rates, regular 20L water subscriptions, ice cream banquet supply, or early morning milk delivery routes.
          </p>
        </div>
      </section>

      {/* Content Form & Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Depot Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/80 hover:shadow-2xl hover:shadow-teal-500/15 hover:border-teal-300 hover:-translate-y-1 transition-all duration-300 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400" />

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/30 ring-4 ring-teal-500/10 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    A.M. Distributors Chiplun Depot
                  </h3>
                  <p className="text-xs font-semibold text-teal-600 mt-0.5">Nexalus Innovations LLP Division</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Operating directly from the central commercial zone in Chiplun, serving retail networks, resorts, caterers, and corporate facilities.
              </p>

              <div className="space-y-4 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Central Warehouse &amp; Cold Rooms</div>
                    <div className="text-slate-500 text-xs mt-0.5">Kherdi MIDC Road, Chiplun 415605, Ratnagiri District, Maharashtra</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Chiplun Depot Wholesale Desk</div>
                    <div className="text-slate-700 font-semibold text-xs mt-0.5">+91 94220 00000 / Depot Booking</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Wholesale Proposals Email</div>
                    <div className="text-slate-700 font-semibold text-xs mt-0.5">distributors@amchiplun.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Daily Route Timings</div>
                    <div className="text-slate-500 text-xs mt-0.5">4:00 AM – 7:00 AM (Morning Route) | 8:00 AM – 8:00 PM (Depot Open)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-5 sm:p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-300/70 hover:shadow-slate-400/60 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400" />
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Depot Inquiry Received</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you. Our Chiplun route dispatch manager will call you shortly to confirm wholesale pricing, crate quantities, and delivery slot.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        establishmentName: '',
                        location: '',
                        productLine: 'mineral_water_20l',
                        message: ''
                      });
                    }}
                  >
                    Place Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Inquire Wholesale Rates &amp; Distribution Route
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Anand More"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-teal-500 hover:shadow-md hover:shadow-teal-500/10 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-teal-500 hover:shadow-md hover:shadow-teal-500/10 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Shop / Hotel / Society Name
                      </label>
                      <input
                        type="text"
                        value={formData.establishmentName}
                        onChange={e => setFormData({ ...formData, establishmentName: e.target.value })}
                        placeholder="e.g. Hotel Green Park / Chiplun Grocers"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-teal-500 hover:shadow-md hover:shadow-teal-500/10 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Delivery Address / Area in Chiplun *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Bahadur Shaikh Naka, Chiplun"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-teal-500 hover:shadow-md hover:shadow-teal-500/10 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Required Distribution Category
                    </label>
                    <select
                      value={formData.productLine}
                      onChange={e => setFormData({ ...formData, productLine: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-teal-500 hover:shadow-md hover:shadow-teal-500/10 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 bg-white"
                    >
                      <option value="mineral_water_20l">Packaged Mineral Water (20-Litre Dispensers)</option>
                      <option value="water_retail_bottles">Bottled Water Cases (500ml / 1L Retail Cartons)</option>
                      <option value="icecream_commercial">Commercial Ice Cream (Bulk Tubs &amp; Freezers)</option>
                      <option value="daily_milk_pouches">Daily 4:00 AM Fresh Milk Pouches &amp; Crates</option>
                      <option value="butter_ghee_dairy">Pure Cow Ghee &amp; Table Butter Commercial Tins</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Required Daily / Weekly Quantity
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify required quantity (e.g. 10 jars daily, 5 ice cream tubs weekly, or milk crates)..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-teal-500 hover:shadow-md hover:shadow-teal-500/10 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="teal"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full font-bold shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Sending Request...' : 'Submit Wholesale Inquiry'}</span>
                    {!isSubmitting && <Send className="w-4 h-4 ml-1" />}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
