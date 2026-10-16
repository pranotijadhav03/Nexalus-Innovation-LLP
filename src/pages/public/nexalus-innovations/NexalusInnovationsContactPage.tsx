import React, { useState } from 'react';
import {
  Cpu,
  Mail,
  PhoneCall,
  MapPin,
  Clock,
  Send,
  CheckCircle2
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
      {/* Header */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-900/60 text-sky-400 text-xs font-semibold border border-blue-700/50">
            <Cpu className="w-3.5 h-3.5" />
            <span>Direct Technical Desk • Nexalus Innovations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Contact Engineering &amp; Sales Desk
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Get in touch with our certified field engineers for CCTV project surveys, optical fiber leased lines, or enterprise switching proposals.
          </p>
        </div>
      </section>

      {/* Content Form & Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-xl font-bold text-slate-900">
                Engineering Headquarters
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operating across Maharashtra with specialized deployment hubs in Konkan, Ratnagiri, and Mumbai industrial belts.
              </p>

              <div className="space-y-4 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Regional Technology Hub</div>
                    <div className="text-slate-500">Nexalus Innovations LLP Operations, Maharashtra</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Direct Sales &amp; Dispatch</div>
                    <div className="text-slate-500">+91 94220 00000 / +91 98230 00000</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Technical Proposals Email</div>
                    <div className="text-slate-500">tech@nexalusinnovations.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Emergency AMC Support</div>
                    <div className="text-slate-500">24/7 Enterprise SLA for contracted clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs">
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
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
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
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
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
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
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
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600 bg-white"
                    >
                      <option value="cctv_surveillance">4K Commercial AI CCTV Surveillance System</option>
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full font-bold shadow-md"
                  >
                    {isSubmitting ? 'Submitting Proposal...' : 'Submit Technical Request'}
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
