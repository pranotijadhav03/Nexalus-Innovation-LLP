import React, { useState } from 'react';
import { Send, CheckCircle2, Shield, Wifi, Building2 } from 'lucide-react';
import { Input, TextArea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { submitEnquiry } from '../../firebase/services';
import { useToast } from '../../context/ToastContext';

export const QuotePage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState('general');
  const [serviceCategory, setServiceCategory] = useState('CCTV & Surveillance');
  const [location, setLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      error('Incomplete Request', 'Please fill in required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitEnquiry({
        customerName: name,
        phone,
        email,
        brandId: division as any,
        enquiryType: 'quote',
        productOrServiceName: serviceCategory,
        location: location || 'Not specified',
        pincode: pincode || undefined,
        message: message || `Quotation request for ${serviceCategory}.`
      });

      setSubmittedId(res.id);
      success('Quotation Request Registered', res.message);
      setName('');
      setPhone('');
      setEmail('');
      setLocation('');
      setPincode('');
      setMessage('');
    } catch (err: any) {
      error('Failed to register quotation', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      <section className="bg-gradient-to-b from-blue-900/10 via-slate-50 to-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Fast Proposal
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
            Get an Official Quotation
          </h1>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Specify your requirements for CCTV cameras, high-speed fiber broadband, or combined IT infrastructure. Our engineering team prepares a tailored itemized quotation with zero obligation.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          {submittedId ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Quotation Ticket #{submittedId} Generated</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you! Your quotation request has been dispatched to our technical estimates desk. You will receive an email and phone contact with official pricing within 24 hours.
              </p>
              <div className="pt-4">
                <Button variant="primary" onClick={() => setSubmittedId(null)}>
                  Request Another Quotation
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Priyadarshan Joshi"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number *"
                  placeholder="+91 98450 67890"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="priyadarshan@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <Select
                  label="Select Brand Division"
                  value={division}
                  onChange={e => setDivision(e.target.value)}
                  options={[
                    { value: 'general', label: 'Nexalus Innovations LLP (Corporate Desk)' },
                    { value: 'nexalus-innovations', label: 'Nexalus Innovations (CCTV, Fiber Internet & Networking)' },
                    { value: 'am-distributors', label: 'A.M. Distributors Chiplun (Mineral Water, Ice Cream & Dairy)' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <Select
                    label="Requirement Type"
                    value={serviceCategory}
                    onChange={e => setServiceCategory(e.target.value)}
                    options={[
                      { value: 'CCTV & Surveillance Cameras', label: 'CCTV & Surveillance Cameras' },
                      { value: 'Fiber Internet (FTTH)', label: 'Fiber Internet (FTTH)' },
                      { value: 'Enterprise Leased Line', label: 'Enterprise Leased Line' },
                      { value: 'Turnkey IT & Security Deployment', label: 'Turnkey IT & Security' },
                      { value: 'AMC Preventive Maintenance', label: 'AMC Maintenance Contract' }
                    ]}
                  />
                </div>
                <div>
                  <Input
                    label="Premises / City Location"
                    placeholder="e.g. Koramangala 4th Block"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="PIN Code"
                    placeholder="560034"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                  />
                </div>
              </div>

              <TextArea
                label="Scope Details / Property Size / Camera Count"
                placeholder="Give us an idea of your requirement (e.g., 8-camera setup for residential villa, 300 Mbps broadband connection, server rack networking...)"
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
                  Generate Official Quotation Request
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
