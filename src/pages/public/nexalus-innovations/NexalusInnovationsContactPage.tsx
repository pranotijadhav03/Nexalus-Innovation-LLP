import React, { useState } from 'react';
import {
  Cpu,
  Mail,
  PhoneCall,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building,
  Sparkles
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { submitEnquiry } from '../../../firebase/services';

export const NexalusInnovationsContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    serviceType: 'cctv_surveillance',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitEnquiry({
        brandId: 'nexalus-innovations',
        websiteId: 'nexalus-innovations',
        websiteName: 'Nexalus Innovations',
        sourcePage: 'Nexalus Innovations Contact Desk',
        customerName: formData.name,
        phone: formData.phone,
        email: formData.email,
        enquiryType: 'general',
        location: formData.location || 'Maharashtra',
        message: `[Technical Desk - ${formData.serviceType} in ${formData.location}]: ${formData.message}`
      });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Header (Nexalus Dark Tech Brand Theme) */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 text-white py-16 sm:py-24 border-b border-slate-800">
        {/* Subtle background tech accents */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] opacity-15 [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Direct Technical Desk • Nexalus Innovations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Contact Engineering &amp; Sales Desk
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Get in touch with our certified field engineers for CCTV project surveys, optical fiber leased lines, or enterprise switching proposals.
          </p>
        </div>
      </section>

      {/* Content Form & Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/80 hover:shadow-2xl hover:shadow-blue-500/15 hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30 ring-4 ring-blue-500/10 group-hover:scale-105 transition-transform">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    Engineering Headquarters
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">Nexalus Innovations LLP</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Operating across Maharashtra with specialized deployment hubs in Konkan, Ratnagiri, and Mumbai industrial belts.
              </p>

              <div className="space-y-4 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Regional Technology Hub</div>
                    <div className="text-slate-500 text-xs mt-0.5">Nexalus Innovations LLP Operations, Maharashtra</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Direct Sales &amp; Dispatch</div>
                    <div className="text-slate-700 font-semibold text-xs mt-0.5">+91 94220 00000 / +91 98230 00000</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Technical Proposals Email</div>
                    <div className="text-slate-700 font-semibold text-xs mt-0.5">tech@nexalusinnovations.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Emergency AMC Support</div>
                    <div className="text-slate-500 text-xs mt-0.5">24/7 Enterprise SLA for contracted clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-5 sm:p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-300/70 hover:shadow-slate-400/60 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Proposal Request Received</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you. Our senior network engineer will contact you within 2 business hours with technical specifications and site audit details.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        location: '',
                        serviceType: 'cctv_surveillance',
                        message: ''
                      });
                    }}
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Request Site Survey or Technical Quotation
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@company.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Project Location / City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Chiplun / Ratnagiri / Mumbai"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Required Technology Scope
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white"
                    >
                      <option value="cctv_surveillance">4K Commercial CCTV Surveillance System</option>
                      <option value="fiber_leased_line">Optical Fiber High-Speed Internet Leased Line</option>
                      <option value="managed_switching">Enterprise Layer-2/3 Managed Switches &amp; Racks</option>
                      <option value="cctv_network_amc">Preventive CCTV &amp; Network AMC Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Project Details / Camera Count / Bandwidth
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify number of cameras, premises square footage, or required internet bandwidth..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Submitting Proposal...' : 'Submit Technical Request'}</span>
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
