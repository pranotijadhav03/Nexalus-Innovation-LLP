import React, { useState } from 'react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { Input, TextArea } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { submitEnquiry } from '../../../firebase/services';
import { useToast } from '../../../context/ToastContext';
import { Shield, Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const CpPlusContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [cameraCount, setCameraCount] = useState('4-8 Cameras');
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
        brandId: 'cp-plus',
        enquiryType: 'quote',
        productOrServiceName: `CCTV Requirement: ${cameraCount}`,
        location: location || 'Not specified',
        message: message || `Enquiry for ${cameraCount} CP PLUS CCTV setup.`
      });

      setSubmittedId(res.id);
      success('CCTV Enquiry Logged', res.message);
      setName('');
      setPhone('');
      setEmail('');
      setLocation('');
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
        brandId="cp-plus"
        title="CP PLUS CCTV & Security Enquiries"
        subtitle="Schedule an onsite security assessment, request itemized camera pricing, or inquire about surveillance AMC maintenance."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-sky-950 text-white shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">CP PLUS Surveillance Desk</h3>
              <p className="text-xs text-sky-200 leading-relaxed">
                Nexalus Innovations LLP is the certified engineering and installation partner for CP PLUS equipment.
              </p>

              <div className="space-y-3 pt-4 border-t border-sky-800 text-xs text-sky-100">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>+91 (0) 80 4123 4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>security@nexalusinnovations.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Nexalus Innovations LLP, Koramangala 4th Cross, Bengaluru, 560034</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block">Onsite Site Survey Process:</span>
              <p>1. Technical consultation & camera count assessment.</p>
              <p>2. Field engineer site visit to measure wiring conduits and focal lengths.</p>
              <p>3. Transparent itemized estimate with hardware specifications.</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
            {submittedId ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">CCTV Enquiry #{submittedId} Registered</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  A CP PLUS certified security engineer has been notified and will reach out with survey availability.
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
                  Request CCTV Quotation / Assessment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Anand Murthy"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number *"
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
                    placeholder="anand@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Premises Location"
                    placeholder="e.g. Indiranagar, Bengaluru"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Estimated Camera Count
                  </label>
                  <select
                    className="block w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2.5 bg-white"
                    value={cameraCount}
                    onChange={e => setCameraCount(e.target.value)}
                  >
                    <option value="1-4 Cameras (Small Office / Residence)">1-4 Cameras (Small Office / Residence)</option>
                    <option value="5-8 Cameras (Villa / Retail Showroom)">5-8 Cameras (Villa / Retail Showroom)</option>
                    <option value="9-16 Cameras (Apartment / Multi-Floor)">9-16 Cameras (Apartment / Multi-Floor)</option>
                    <option value="16+ Enterprise / Industrial Surveillance">16+ Enterprise / Industrial Surveillance</option>
                    <option value="Existing System AMC / Maintenance">Existing System AMC / Maintenance</option>
                  </select>
                </div>

                <TextArea
                  label="Specific Requirements / Property Scope"
                  placeholder="Need night vision cameras, gate entrance ANPR, audio recording, smartphone viewing..."
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="sky"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Submit CCTV Request
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
