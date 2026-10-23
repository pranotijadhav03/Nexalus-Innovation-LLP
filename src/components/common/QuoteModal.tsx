import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input, TextArea, Select } from './Input';
import { Button } from './Button';
import { submitEnquiry, getSolutionRequirements, getCachedSolutionRequirements } from '../../firebase/services';
import { useToast } from '../../context/ToastContext';
import { Send, CheckCircle2 } from 'lucide-react';
import { BrandId, SolutionRequirement } from '../../types';

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
  const [selectedSolution, setSelectedSolution] = useState<string>('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [solutions, setSolutions] = useState<SolutionRequirement[]>(() =>
    getCachedSolutionRequirements()
  );
  const { success, error } = useToast();

  useEffect(() => {
    getSolutionRequirements(undefined, true).then(setSolutions);
    const handleUpdate = () => {
      getSolutionRequirements(undefined, true).then(setSolutions);
    };
    window.addEventListener('nexalus_data_update', handleUpdate);
    return () => window.removeEventListener('nexalus_data_update', handleUpdate);
  }, []);

  // Filter solutions according to brand/website scope
  const relevantSolutions = solutions.filter(s => {
    if (!s.published) return false;
    if (brandId === 'am-distributors') {
      return s.brandId === 'am-distributors' || s.brandId === 'general' || s.brandId === 'all';
    }
    if (brandId === 'nexalus-innovations' || brandId === 'cp-plus' || brandId === 'one-broadband' || brandId === 'itti-networking') {
      return s.brandId === 'nexalus-innovations' || s.brandId === 'general' || s.brandId === 'all';
    }
    return true;
  });

  // Set default selection when solutions change
  useEffect(() => {
    if (relevantSolutions.length > 0 && !selectedSolution) {
      setSelectedSolution(relevantSolutions[0].value || relevantSolutions[0].id);
    }
  }, [relevantSolutions, selectedSolution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      error('Incomplete Form', 'Please provide name, phone and email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSolObj = solutions.find(
        s => s.value === selectedSolution || s.id === selectedSolution || s.label === selectedSolution
      );
      const solutionLabel = selectedSolObj ? selectedSolObj.label : selectedSolution;
      const effectiveBrandId = selectedSolObj?.brandId && selectedSolObj.brandId !== 'general' && selectedSolObj.brandId !== 'all'
        ? selectedSolObj.brandId
        : (brandId && brandId !== 'general' ? brandId : 'general');

      // Determine website info
      const effectiveWebsiteId = websiteId || (
        effectiveBrandId === 'am-distributors'
          ? 'am-distributors'
          : (effectiveBrandId === 'nexalus-innovations' || effectiveBrandId === 'cp-plus' || effectiveBrandId === 'one-broadband' || effectiveBrandId === 'itti-networking')
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
        brandId: effectiveBrandId as any,
        websiteId: effectiveWebsiteId,
        websiteName: effectiveWebsiteName,
        sourcePage: effectiveSource,
        enquiryType: itemType,
        productOrServiceName: itemName || solutionLabel,
        location: location || 'Not specified',
        message: message ? `[Solution: ${solutionLabel}] ${message}` : (itemName ? `Requesting official pricing and quotation for ${itemName} (${solutionLabel}).` : `Solution Requirement: ${solutionLabel}`)
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
              label="Phone Number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
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
              value={selectedSolution}
              onChange={e => setSelectedSolution(e.target.value)}
              options={
                relevantSolutions.length > 0
                  ? relevantSolutions.map(s => ({
                      value: s.value || s.id,
                      label: s.label
                    }))
                  : [
                      { value: 'general', label: 'Nexalus Innovations LLP (Turnkey Technology Solutions)' }
                    ]
              }
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
