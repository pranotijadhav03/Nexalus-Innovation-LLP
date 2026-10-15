import React, { useState, useEffect } from 'react';
import { getProjects } from '../../firebase/services';
import { Project } from '../../types';
import { BrandBadge } from '../../components/common/BrandBadge';
import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const data = await getProjects(undefined, true);
      setProjects(data);
    }
    load();
  }, []);

  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.brandId === filter);

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-blue-900/10 via-slate-50 to-white py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
            Portfolio & Track Record
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
            Completed Projects
          </h1>
          <p className="text-base text-slate-600 mt-4 leading-relaxed">
            Explore our real-world deployments across tech parks, residential societies, corporate campuses, and logistics hubs.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setFilter('nexalus')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'nexalus'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Nexalus Integrated
            </button>
            <button
              onClick={() => setFilter('cp-plus')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'cp-plus'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              CCTV Surveillance
            </button>
            <button
              onClick={() => setFilter('one-broadband')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'one-broadband'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Fiber Internet
            </button>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {filtered.map(proj => (
            <div
              key={proj.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
            >
              <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
                <img
                  src={proj.images[0] || '/images/projects/tech-park.jpg'}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <BrandBadge brandId={proj.brandId} size="md" />
                </div>
              </div>

              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                      {proj.clientType} Sector
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {proj.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Completed {proj.completionDate}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Engineering Solution Provided:
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {proj.solutionProvided}
                    </p>
                  </div>
                </div>

                {proj.scope && proj.scope.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Project Scope & Hardware Deployed:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {proj.scope.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
