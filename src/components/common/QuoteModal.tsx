import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input, TextArea, Select } from './Input';
import { Button } from './Button';
import { submitEnquiry } from '../../firebase/services';
import { useToast } from '../../context/ToastContext';
import { Send, CheckCircle2 } from 'lucide-react';
import { BrandId } from '../../types';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId?: BrandId | 'general';
  websiteId?: 'corporate' | 'nexalus-innovations' | 'am-distributors' | string;
  websiteName?: string;
  sourcePage?: string;
  itemName?: string;
  itemType?: 'product' | 'service' | 'plan' | 'quote' | 'general';
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  brandId = 'general',
  websiteId,
  websiteName,
  sourcePage,
  itemName,
  itemType = 'quote'
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>(brandId);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      error('Incomplete Form', 'Please provide name, phone and email address.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      error('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine website info
      const effectiveWebsiteId = websiteId || (
        selectedBrand === 'am-distributors'
          ? 'am-distributors'
          : (selectedBrand === 'nexalus-innovations' || selectedBrand === 'cp-plus' || selectedBrand === 'one-broadband' || selectedBrand === 'itti-networking')
          ? 'nexalus-innovations'
          : 'corporate'
      );

      const effectiveWebsiteName = websiteName || (
        effectiveWebsiteId === 'am-distributors'
          ? 'A.M. Distributors Chiplun'
          : effectiveWebsiteId === 'nexalus-innovations'
          ? 'Nexalus Innovations'
          : 'Nexalus Innovations LLP'
      );

      const effectiveSource = sourcePage || (itemName ? `Quote Modal (${itemName})` : 'Quick Quote Modal');

      await submitEnquiry({
        customerName: name,
        phone,
        email,
        brandId: selectedBrand as any,
        websiteId: effectiveWebsiteId,
        websiteName: effectiveWebsiteName,
        sourcePage: effectiveSource,
        enquiryType: itemType,
        productOrServiceName: itemName,
        location: location || 'Not specified',
        message: message || (itemName ? `Requesting official pricing and quotation for ${itemName}.` : 'General corporate inquiry.')
      });

      setIsSuccess(true);
      success('Quotation Request Sent', 'Our technical sales team will contact you with an official proposal.');
      setTimeout(() => {
        setIsSuccess(false);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
        onClose();
      }, 2500);
    } catch (err: any) {
      error('Failed to submit', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemName ? `Get a Quote — ${itemName}` : 'Request a Corporate Quotation'}
      subtitle="Nexalus Innovations LLP delivers custom enterprise solutions, commercial deployments, and residential packages."
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Quotation Request Received!</h4>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            A reference enquiry ID has been registered in our CRM. A Nexalus solution specialist will review your requirements and reach out promptly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {itemName && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 font-medium">
              Inquiring for: <span className="font-bold">{itemName}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Anand Murthy"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <Input
              label="Phone Number (10 digits)"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="anand@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Select
              label="Solution Requirement"
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              options={[
                { value: 'general', label: 'Nexalus Innovations LLP (Turnkey Technology Solutions)' },
                { value: 'cctv', label: 'Commercial CCTV Surveillance & Security Setup' },
                { value: 'fiber', label: 'High-Speed Optical Fiber Internet' },
                { value: 'networking', label: 'Enterprise IT Networking & Server Infrastructure' }
              ]}
            />
          </div>

          <Input
            label="Premises / City Location"
            placeholder="e.g. Koramangala 5th Block, Bengaluru"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />

          <TextArea
            label="Specific Requirements / Camera Counts / Speeds"
            placeholder="Tell us about the scope of your property, number of cameras or internet speed required..."
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              icon={<Send className="w-4 h-4" />}
            >
              Submit Quotation Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
