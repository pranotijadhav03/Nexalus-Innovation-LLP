import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { checkCoverage, submitEnquiry } from '../../firebase/services';
import { useToast } from '../../context/ToastContext';
import { Search, CheckCircle, AlertTriangle, MapPin, Send } from 'lucide-react';
import { ServiceArea } from '../../types';

interface CoverageCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const CoverageCheckerModal: React.FC<CoverageCheckerModalProps> = ({
  isOpen,
  onClose,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    isServiceable: boolean;
    status?: 'fully_operational' | 'expanding_soon' | 'planned';
    matchedArea?: ServiceArea;
    message: string;
  } | null>(null);

  // Form for booking
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsChecking(true);
    setResult(null);
    try {
      const res = await checkCoverage(query);
      setResult(res);
    } catch (err: any) {
      error('Coverage Check Failed', err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleBookConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      error('Missing Details', 'Please complete all fields to request a connection.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEnquiry({
        customerName: name,
        phone,
        email,
        brandId: 'one-broadband',
        enquiryType: 'coverage',
        location: query,
        pincode: result?.matchedArea?.pincode,
        message: `Coverage verification request for: ${query}. (Result: ${result?.status || 'unlisted area'})`
      });

      success('Request Submitted', 'Our field engineering team has received your location request and will connect with you within 2 hours.');
      setName('');
      setPhone('');
      setEmail('');
      onClose();
    } catch (err: any) {
      error('Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Check Fiber Coverage & Availability"
      subtitle="Verify One Broadband optical fiber availability in your locality or PIN code"
      maxWidth="lg"
    >
      <div className="space-y-6">
        <form onSubmit={handleCheck} className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter PIN Code or Locality (e.g. 560034, Koramangala)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="teal" isLoading={isChecking}>
            Check Now
          </Button>
        </form>

        {result && (
          <div
            className={`p-4.5 rounded-xl border flex items-start gap-3.5 ${
              result.status === 'fully_operational'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : result.status === 'expanding_soon'
                ? 'bg-cyan-50/70 border-cyan-200 text-cyan-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}
          >
            {result.isServiceable ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {result.status === 'fully_operational'
                    ? 'Fiber Active & Ready!'
                    : result.status === 'expanding_soon'
                    ? 'Rollout in Progress'
                    : 'Feeder Verification Required'}
                </span>
                {result.matchedArea && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/80 font-mono">
                    <MapPin className="w-3 h-3" />
                    PIN {result.matchedArea.pincode}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{result.message}</p>
            </div>
          </div>
        )}

        {/* Action Form */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {result?.isServiceable ? 'Book Your Installation Now' : 'Request Network Expansion to Your Building'}
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Provide your contact details to schedule an engineer survey or get priority notification when fiber lights up.
          </p>

          <form onSubmit={handleBookConnection} className="space-y-3">
            <Input
              label="Full Name"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mobile Number"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="ramesh@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant="teal" className="w-full" isLoading={isSubmitting} icon={<Send className="w-4 h-4" />}>
                {result?.isServiceable ? 'Schedule Fiber Setup' : 'Submit Feeder Expansion Request'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
