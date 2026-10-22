import React, { useState, useEffect } from 'react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { PlanCard } from '../../../components/brand/PlanCard';
import { CoverageCheckerModal } from '../../../components/brand/CoverageCheckerModal';
import { Button } from '../../../components/common/Button';
import { getInternetPlans, subscribeToInternetPlans } from '../../../firebase/services';
import { InternetPlan } from '../../../types';
import { Search } from 'lucide-react';

export const OneBroadbandPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [isCoverageOpen, setIsCoverageOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getInternetPlans(true);
        setPlans(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();

    const unsub = subscribeToInternetPlans((newPlans) => {
      setPlans(newPlans);
      setIsLoading(false);
    }, true);

    const handleUpdate = () => {
      load();
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      unsub();
      window.removeEventListener('nexalus_data_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <BrandHeader
        brandId="one-broadband"
        title="High-Speed Fiber Internet Plans"
        subtitle="Symmetrical Gigabit speeds, truly unlimited data, and dual-band Wi-Fi 6 router included with all subscriptions."
        breadcrumbs={[{ label: 'Internet Plans' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2 pt-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">
            INTERNET SERVICE DATA PLANS
          </h1>
          <p className="text-sm text-slate-500">
            High-speed optical fiber data plans with symmetrical download and upload speeds.
          </p>
        </div>

        <div className="p-4 sm:p-6 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-teal-950">
              Not sure if One Broadband fiber is live in your building?
            </h3>
            <p className="text-xs text-teal-800 mt-0.5">
              Verify your locality or 6-digit postal PIN code in our live service-area database.
            </p>
          </div>
          <Button
            variant="teal"
            size="sm"
            onClick={() => setIsCoverageOpen(true)}
            icon={<Search className="w-4 h-4" />}
          >
            Check PIN Coverage
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Loading active internet tariffs...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onCheckCoverageClick={() => setIsCoverageOpen(true)}
              />
            ))}
          </div>
        )}
      </section>

      <CoverageCheckerModal
        isOpen={isCoverageOpen}
        onClose={() => setIsCoverageOpen(false)}
      />
    </div>
  );
};
