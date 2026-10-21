import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Cpu, Truck, Building, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { submitEnquiry } from '../../firebase/services';
import { useToast } from '../../context/ToastContext';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState('general');
  const [location, setLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      error('Incomplete Information', 'Please provide name, phone and email.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      error('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveWebsiteId = division === 'am-distributors'
        ? 'am-distributors'
        : division === 'nexalus-innovations'
        ? 'nexalus-innovations'
        : 'corporate';

      const effectiveWebsiteName = effectiveWebsiteId === 'am-distributors'
        ? 'A.M. Distributors Chiplun'
        : effectiveWebsiteId === 'nexalus-innovations'
        ? 'Nexalus Innovations'
        : 'Nexalus Innovations LLP';

      const res = await submitEnquiry({
        customerName: name,
        phone,
        email,
        brandId: division as any,
        websiteId: effectiveWebsiteId,
        websiteName: effectiveWebsiteName,
        sourcePage: 'Corporate Parent Contact Page',
        enquiryType: 'general',
        location: location || 'Not specified',
        pincode: pincode || undefined,
        message: message || 'Corporate enquiry through contact page.'
      });

      setSubmittedId(res.id);
      success('Enquiry Registered Successfully', res.message);
      setName('');
      setPhone('');
      setEmail('');
      setLocation('');
      setPincode('');
      setMessage('');
    } catch (err: any) {
      error('Submission Error', err.message);
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Direct Corporate Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Contact Nexalus Innovations LLP
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mt-4 leading-relaxed max-w-2xl mx-auto font-normal">
            Reach out to our corporate office, technical support team, or enterprise sales engineers for solutions across Maharashtra.
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Company Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/80 hover:shadow-2xl hover:shadow-blue-500/15 hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 space-y-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30 ring-4 ring-blue-500/10 group-hover:scale-105 transition-transform">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">Corporate Headquarters</h3>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">Nexalus Innovations LLP</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="leading-relaxed">
                    Nexalus Innovations LLP, Corporate Operations, Maharashtra, India
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-800">+91 9158886444 / +91 9822334455</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-800">contact@nexalusinnovations.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Monday – Saturday: 9:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>

            {/* Specialized Desks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white border border-blue-200/80 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500" />
                <div className="flex items-center gap-2.5 text-blue-700 font-bold text-xs uppercase tracking-wider">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Cpu className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Technical Support</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                  <div className="font-bold text-slate-900">+91 9158886444</div>
                  <div className="truncate text-slate-500">support@nexalusinnovations.com</div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-sky-200/80 shadow-lg shadow-sky-500/10 hover:shadow-xl hover:shadow-sky-500/20 hover:border-sky-400 hover:-translate-y-1 transition-all duration-300 space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
                <div className="flex items-center gap-2.5 text-sky-700 font-bold text-xs uppercase tracking-wider">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4 text-sky-600" />
                  </div>
                  <span>Enterprise Sales</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                  <div className="font-bold text-slate-900">+91 9822334455</div>
                  <div className="truncate text-slate-500">sales@nexalusinnovations.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-7">
            <div className="p-5 sm:p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-300/70 hover:shadow-slate-400/60 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
                Send Us an Enquiry
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                All enquiries are recorded directly into our central CRM with a trackable enquiry ID.
              </p>

              {submittedId ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-950">Enquiry #{submittedId} Recorded</h4>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Thank you for reaching out. A dedicated technical specialist from the appropriate division will review your requirements and follow up.
                  </p>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSubmittedId(null)}>
                      Submit Another Query
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name *"
                      placeholder="e.g. Vikramaditya Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Contact Number (10 digits) *"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address *"
                      type="email"
                      placeholder="vikram@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <Select
                      label="Service Requirement"
                      value={division}
                      onChange={e => setDivision(e.target.value)}
                      className="hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 focus:shadow-blue-500/15 transition-all duration-200"
                      options={[
                        { value: 'general', label: 'Nexalus Innovations LLP (General Inquiry)' },
                        { value: 'cctv', label: 'Commercial CCTV Surveillance & Security Setup' },
                        { value: 'fiber', label: 'High-Speed Optical Fiber Internet' },
                        { value: 'networking', label: 'Enterprise IT Networking & Server Infrastructure' },
                        { value: 'amc', label: 'Annual Maintenance Contract (AMC)' }
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Location / Area"
                        placeholder="e.g. Whitefield, Bengaluru"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="PIN Code"
                        placeholder="560066"
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                      />
                    </div>
                  </div>

                  <TextArea
                    label="Message / Requirements"
                    placeholder="Describe your property, camera count, broadband bandwidth required, or specific query..."
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 focus:shadow-blue-500/15 transition-all duration-200"
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 active:scale-[0.99] transition-all cursor-pointer"
                      isLoading={isSubmitting}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Submit Corporate Enquiry
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
