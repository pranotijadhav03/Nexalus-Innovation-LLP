import React, { useState, useEffect } from 'react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { ServiceCard } from '../../../components/brand/ServiceCard';
import { getServices } from '../../../firebase/services';
import { Service } from '../../../types';

export const CpPlusServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getServices('cp-plus', true);
      setServices(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <BrandHeader
        brandId="cp-plus"
        title="CP PLUS Surveillance Services"
        subtitle="Professional turnkey CCTV installation, surveillance layout optimization, automated video analytics setup, and annual maintenance contracts (AMC)."
        breadcrumbs={[{ label: 'Services' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </div>
  );
};
