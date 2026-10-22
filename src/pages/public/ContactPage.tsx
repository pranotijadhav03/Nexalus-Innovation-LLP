import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Cpu, Truck, Building, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
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
      {/* Header */}
      <section className="bg-gradient-to-b from-blue-900/10 via-slate-50 to-white py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Direct Corporate Desk
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
            Contact Nexalus Innovations LLP
          </h1>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Reach out to our corporate office, technical support team, or enterprise sales engineers for solutions across Maharashtra.
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Company Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Corporate Headquarters</h3>
                  <p className="text-xs text-slate-500">Nexalus Innovations LLP</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Shop No.5, NEXALUS INNOVATIONS, Sankalp Enclave, Chowk, 100 Feet Rd, near Dhamani Road, opposite of Kokitkar Garden, Vishrambag, Sangli Miraj Kupwad, Maharashtra 416415
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>+91 9158886444 / +91 9822334455</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>contact@nexalusinnovations.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Monday – Saturday: 9:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>

            {/* Specialized Desks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/70 space-y-2">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  Technical Support Desk
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                  <div>+91 9158886444</div>
                  <div className="truncate">support@nexalusinnovations.com</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/70 space-y-2">
                <div className="flex items-center gap-2 text-sky-800 font-bold text-xs">
                  <Mail className="w-4 h-4 text-sky-600" />
                  Enterprise Sales Desk
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                  <div>+91 9822334455</div>
                  <div className="truncate">sales@nexalusinnovations.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
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
                      label="Contact Number *"
                      placeholder="+91 98450 12345"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
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
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
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
      {/* Interactive Google Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Visit Corporate Headquarters</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Find Us on Google Maps
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Shop No.5, Sankalp Enclave Chowk, 100 Feet Rd, near Dhamani Road, Vishrambag, Sangli-Miraj-Kupwad, Maharashtra 416415
              </p>
            </div>
            <a
              href="https://maps.app.goo.gl/Tat1sb8HKBcjtEMC8?g_st=awb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-blue-600/30 shrink-0 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>
          <div className="w-full h-80 sm:h-96 bg-slate-100 relative">
            <iframe
              title="Nexalus Innovations Corporate Headquarters Map"
              src="https://maps.google.com/maps?q=Shop+No.5,+NEXALUS+INNOVATIONS,+Sankalp+Enclave,+Chowk,+100+Feet+Rd,+near+Dhamani+Road,+opposite+of+Kokitkar+Garden,+Vishrambag,+Sangli+Miraj+Kupwad,+Maharashtra+416415&amp;t=&amp;z=16&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
