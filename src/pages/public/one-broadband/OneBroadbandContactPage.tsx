import React, { useState } from 'react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { Input, TextArea } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { submitEnquiry } from '../../../firebase/services';
import { useToast } from '../../../context/ToastContext';
import { Wifi, Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const OneBroadbandContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [planPreference, setPlanPreference] = useState('300 Mbps Stream Pro');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      error('Incomplete Details', 'Please provide name, phone and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitEnquiry({
        customerName: name,
        phone,
        email,
        brandId: 'one-broadband',
        enquiryType: 'plan',
        productOrServiceName: `Plan Preference: ${planPreference}`,
        location: location || 'Not specified',
        pincode: pincode || undefined,
        message: message || `Enquiry for ${planPreference} fiber connection.`
      });

      setSubmittedId(res.id);
      success('Broadband Enquiry Logged', res.message);
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
    <div className="space-y-12 pb-20">
      <BrandHeader
        brandId="one-broadband"
        title="One Broadband Enquiries & Connection Requests"
        subtitle="Book a new fiber connection, request enterprise leased line pricing, or speak with our network engineers."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-teal-950 text-white shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">One Broadband Network Desk</h3>
              <p className="text-xs text-teal-200 leading-relaxed">
                Optical fiber distribution and network infrastructure managed by Nexalus Innovations LLP.
              </p>

              <div className="space-y-3 pt-4 border-t border-teal-800 text-xs text-teal-100">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>+91 (0) 80 4123 4568</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>broadband@nexalusinnovations.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>Nexalus Innovations LLP, Koramangala 4th Cross, Bengaluru, 560034</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block">Installation Guarantee:</span>
              <p>• 24-to-48 hour turnaround in fully active fiber nodes.</p>
              <p>• Free dual-band Wi-Fi 6 router installation on quarterly plans.</p>
              <p>• Precision optical power test report provided upon activation.</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
            {submittedId ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Enquiry #{submittedId} Registered</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  A broadband provisioning representative will verify your feeder line and contact you to schedule router setup.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSubmittedId(null)}>
                    Submit Another Query
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  New Broadband Connection Enquiry
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number *"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="ramesh@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Speed Plan
                    </label>
                    <select
                      className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2.5 bg-white"
                      value={planPreference}
                      onChange={e => setPlanPreference(e.target.value)}
                    >
                      <option value="100 Mbps Home Fiber (₹699/mo)">100 Mbps Home Fiber (₹699/mo)</option>
                      <option value="300 Mbps Stream Pro (₹999/mo)">300 Mbps Stream Pro (₹999/mo)</option>
                      <option value="500 Mbps Ultra Gig (₹1,499/mo)">500 Mbps Ultra Gig (₹1,499/mo)</option>
                      <option value="1 Gbps Enterprise Fiber (₹2,999/mo)">1 Gbps Enterprise Fiber (₹2,999/mo)</option>
                      <option value="Custom Leased Line Circuit">Custom Leased Line Circuit</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Installation Locality / Street Address"
                      placeholder="e.g. 100ft Road, Indiranagar"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="PIN Code"
                      placeholder="560038"
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                    />
                  </div>
                </div>

                <TextArea
                  label="Remarks or Building Details"
                  placeholder="Apartment name, flat number, commercial floor, requirement timeline..."
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="teal"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Submit Fiber Connection Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
