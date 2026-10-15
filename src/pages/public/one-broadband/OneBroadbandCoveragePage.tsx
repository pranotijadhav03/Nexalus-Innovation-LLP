import React, { useState, useEffect } from 'react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { getServiceAreas, checkCoverage, submitEnquiry } from '../../../firebase/services';
import { ServiceArea } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { MapPin, Search, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export const OneBroadbandCoveragePage: React.FC = () => {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [query, setQuery] = useState('');
  const [checkResult, setCheckResult] = useState<{
    isServiceable: boolean;
    status?: 'fully_operational' | 'expanding_soon' | 'planned';
    matchedArea?: ServiceArea;
    message: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Booking details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    async function load() {
      const data = await getServiceAreas();
      setAreas(data);
    }
    load();
  }, []);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsChecking(true);
    setCheckResult(null);
    try {
      const res = await checkCoverage(query);
      setCheckResult(res);
    } catch (err: any) {
      error('Verification Failed', err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      error('Incomplete Details', 'Please complete your contact information.');
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
        location: query || 'Specified Area',
        pincode: checkResult?.matchedArea?.pincode,
        message: `Coverage booking for: ${query}. (Result: ${checkResult?.status || 'unlisted'})`
      });

      success('Request Received', 'Our fiber planning engineers have received your inquiry.');
      setName('');
      setPhone('');
      setEmail('');
    } catch (err: any) {
      error('Failed to submit', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <BrandHeader
        brandId="one-broadband"
        title="Check Optical Fiber Coverage"
        subtitle="Verify genuine fiber-optic availability in your locality or 6-digit postal PIN code."
        breadcrumbs={[{ label: 'Coverage' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Verification Box */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Enter Your Locality or PIN Code
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We check our verified optical distribution nodes to confirm real-time serviceability.
            </p>
          </div>

          <form onSubmit={handleCheck} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="e.g. 560034, Koramangala, Indiranagar, Whitefield..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button type="submit" variant="teal" isLoading={isChecking}>
              Verify
            </Button>
          </form>

          {checkResult && (
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                checkResult.status === 'fully_operational'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : checkResult.status === 'expanding_soon'
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {checkResult.isServiceable ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold text-sm">
                  {checkResult.status === 'fully_operational'
                    ? '100% Fiber Active in this Zone'
                    : checkResult.status === 'expanding_soon'
                    ? 'Rollout Expanding Soon'
                    : 'Feeder Verification Required'}
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {checkResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Action booking */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              {checkResult?.isServiceable ? 'Schedule Fiber Installation' : 'Request Network Expansion to Your Building'}
            </h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Phone Number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="teal" className="w-full" isLoading={isSubmitting} icon={<Send className="w-4 h-4" />}>
                Submit Request
              </Button>
            </form>
          </div>
        </div>

        {/* Directory of Verified Service Areas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Directory of Active One Broadband Fiber Nodes
              </h3>
              <p className="text-xs text-slate-500">
                Managed strictly from our approved service-area registry.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              {areas.length} Verified Areas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {areas.map(area => (
              <div
                key={area.id}
                className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    PIN {area.pincode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      area.status === 'fully_operational'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-cyan-50 text-cyan-700'
                    }`}
                  >
                    {area.status === 'fully_operational' ? 'Active' : 'Expanding'}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900">{area.locality}</div>
                <div className="text-xs text-slate-500">{area.city}, {area.state}</div>
                {area.notes && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 leading-tight">
                    {area.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
