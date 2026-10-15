import React, { useState, useEffect } from 'react';
import { BrandHeader } from '../../../components/brand/BrandHeader';
import { getProjects } from '../../../firebase/services';
import { Project } from '../../../types';
import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export const CpPlusProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getProjects('cp-plus', true);
      setProjects(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <BrandHeader
        brandId="cp-plus"
        title="CP PLUS Surveillance Case Studies & Projects"
        subtitle="Completed security deployments across residential societies, enterprise campuses, retail stores, and commercial facilities."
        breadcrumbs={[{ label: 'Projects' }]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {projects.map(proj => (
          <div
            key={proj.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-5 relative min-h-[240px]">
              <img
                src={proj.images[0] || '/images/projects/luxury-residency.jpg'}
                alt={proj.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-md">
                {proj.clientType}
              </div>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {proj.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {proj.completionDate}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{proj.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {proj.description}
                </p>

                <div className="mt-4 p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-xs">
                  <span className="font-bold text-sky-900 block mb-1">CCTV Solution Engineered:</span>
                  <p className="text-slate-700">{proj.solutionProvided}</p>
                </div>
              </div>

              {proj.scope && (
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Equipment Deployed:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {proj.scope.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
