import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  MapPin,
  CheckCircle2,
  ExternalLink,
  X
} from 'lucide-react';
import { Project } from '../../types';
import { getProjects, getProjectCategories } from '../../firebase/services';
import { BlurZoomReveal } from './BlurZoomReveal';
import { Button } from './Button';

interface ProjectGallerySectionProps {
  division?: 'corporate' | 'nexalus-innovations' | 'am-distributors';
  title?: string;
  subtitle?: string;
  maxProjects?: number;
  theme?: 'light' | 'dark';
}

export const ProjectGallerySection: React.FC<ProjectGallerySectionProps> = ({
  division = 'corporate',
  title,
  subtitle,
  maxProjects = 6,
  theme = 'light'
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [categories, setCategories] = useState<string[]>(() => getProjectCategories());

  const isLight = theme === 'light';

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getProjects(undefined, true);
        if (isMounted) {
          // If child division, filter initially to that brand or related
          let filtered = data;
          if (division === 'am-distributors') {
            filtered = data.filter(p => p.brandId === 'am-distributors');
          } else if (division === 'nexalus-innovations') {
            const techBrands = ['nexalus-innovations', 'cp-plus', 'one-broadband', 'itti-networking'];
            filtered = data.filter(p => techBrands.includes(p.brandId));
          } else {
            // Corporate (Nexalus parent site): strictly display only parent company records
            filtered = data.filter(p => p.brandId === 'nexalus');
          }
          setProjects(filtered);
        }
      } catch (e) {
        console.error('Failed to load projects for gallery:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    const handleCatUpdate = (e: any) => {
      if (Array.isArray(e.detail)) setCategories(e.detail);
      else setCategories(getProjectCategories());
    };
    window.addEventListener('nexalus_project_categories_updated', handleCatUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('nexalus_data_update', handleUpdate);
      window.removeEventListener('nexalus_project_categories_updated', handleCatUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [division]);

  // Dynamic filter tabs
  const getFilterTabs = () => {
    const isAm = division === 'am-distributors';
    const allLabel = isAm ? 'All Fleet & Depot Hubs' : 'All Completed Projects';
    const relevantCategories = isAm
      ? categories.filter(c => ['Mineral Water Jars', 'Refrigerated Ice Cream', 'Morning Milk & Dairy', 'Cold-Chain Logistics', 'Fleet & Depot Hubs'].some(k => c.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(c.toLowerCase())))
      : categories.filter(c => !['Mineral Water Jars', 'Refrigerated Ice Cream', 'Morning Milk & Dairy', 'Cold-Chain Logistics'].includes(c));

    return [
      { id: 'all', label: allLabel },
      ...relevantCategories.map(cat => ({ id: cat, label: cat }))
    ];
  };

  const filteredProjects = projects.filter(p => {
    if (activeFilter === 'all') return true;
    if (p.category && p.category.toLowerCase() === activeFilter.toLowerCase()) return true;
    const text = `${p.title} ${p.description} ${p.solutionProvided || ''} ${(p.scope || []).join(' ')}`.toLowerCase();
    const filterLower = activeFilter.toLowerCase();
    if (filterLower.includes('cctv') || filterLower.includes('surveillance')) {
      return text.includes('cctv') || text.includes('camera') || p.brandId === 'cp-plus';
    }
    if (filterLower.includes('fiber') || filterLower.includes('ftth')) {
      return text.includes('fiber') || text.includes('broadband') || p.brandId === 'one-broadband';
    }
    if (filterLower.includes('switching') || filterLower.includes('network')) {
      return text.includes('switch') || text.includes('network') || text.includes('cabling') || text.includes('server') || text.includes('gpon');
    }
    if (filterLower.includes('water')) {
      return text.includes('water') || text.includes('jar') || text.includes('bottle');
    }
    if (filterLower.includes('ice cream')) {
      return text.includes('ice cream') || text.includes('refrigerat');
    }
    if (filterLower.includes('dairy')) {
      return text.includes('dairy') || text.includes('milk') || text.includes('butter');
    }
    return text.includes(filterLower);
  });

  const displayedProjects = filteredProjects.slice(0, maxProjects);

  const defaultTitle =
    division === 'am-distributors'
      ? 'Chiplun Depot Logistics & Supply Portfolio'
      : division === 'nexalus-innovations'
      ? 'Featured Engineering & Surveillance Case Studies'
      : 'Proven Client Projects & Turnkey Deployments';

  const defaultSubtitle =
    division === 'am-distributors'
      ? 'Explore our regional cold-chain operations, daily automated mineral water delivery, and commercial dairy distribution routes across Chiplun and Maharashtra.'
      : division === 'nexalus-innovations'
      ? 'Real turnkey projects delivered by our certified field engineers — covering commercial 4K CCTV grids, optical fiber leased lines, and corporate server networks.'
      : 'Explore real-world engineering deployments completed by Nexalus Innovations LLP — verified installations across industrial zones, enterprise tech parks, and residential communities.';

  return (
    <section className={`w-full ${isLight ? 'bg-white text-slate-900 border-slate-200/90' : 'bg-slate-900 text-white border-slate-800'} py-16 sm:py-24 border-b relative overflow-hidden`}>
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Section Header */}
        <BlurZoomReveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${
              isLight
                ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                : 'bg-blue-500/10 text-cyan-400 border-blue-400/20'
            } text-xs font-bold uppercase tracking-wider`}>
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Verified Project Gallery</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${isLight ? 'text-slate-900' : 'text-white'} tracking-tight`}>
              {title || defaultTitle}
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed max-w-2xl mx-auto`}>
              {subtitle || defaultSubtitle}
            </p>
          </div>
        </BlurZoomReveal>

        {/* Filter Navigation Tabs */}
        <BlurZoomReveal direction="up" delay={80}>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {getFilterTabs().map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold scale-[1.02]'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </BlurZoomReveal>

        {/* Projects Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-96 rounded-3xl ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/50 border-slate-700/50'} animate-pulse border`} />
            ))}
          </div>
        ) : displayedProjects.length === 0 ? (
          <div className={`text-center py-16 px-4 rounded-3xl ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-800/40 border-slate-700/50 text-slate-300'} border max-w-md mx-auto space-y-3`}>
            <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold">No projects found in this category</p>
            <button
              onClick={() => setActiveFilter('all')}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Reset to all projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
            {displayedProjects.map((proj, idx) => {
              // Direction effect: left for col 0, center for col 1, right for col 2
              const colPos = idx % 3;
              const direction = colPos === 0 ? 'left' : colPos === 1 ? 'center' : 'right';
              const delay = (idx % 3) * 120;

              const isAm = proj.brandId === 'am-distributors';
              const isCctv = proj.brandId === 'cp-plus';
              const isFiber = proj.brandId === 'one-broadband';

              return (
                <BlurZoomReveal
                  key={proj.id}
                  direction={direction}
                  delay={delay}
                  duration={800}
                  blur={10}
                  scale={0.93}
                  className="h-full flex flex-col"
                >
                  <div className={`rounded-3xl ${
                    isLight
                      ? 'bg-white border-slate-200/90 shadow-lg hover:shadow-xl hover:border-blue-500/50'
                      : 'bg-slate-800/90 border-slate-700/80 shadow-xl hover:shadow-2xl hover:border-cyan-400/60'
                  } border transition-all duration-300 overflow-hidden flex flex-col justify-between group h-full`}>
                    <div>
                      {/* Image Preview Container */}
                      <div className="relative h-56 bg-slate-950 overflow-hidden">
                        <img
                          src={proj.images?.[0] || '/images/projects/tech-park.jpg'}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                        {/* Badges on Image */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-xs ${
                            isAm
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : isCctv
                              ? 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                              : isFiber
                              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
                              : 'bg-blue-950/80 text-cyan-300 border-blue-500/40'
                          }`}>
                            {isAm ? 'A.M. Distributors' : isCctv ? 'CP PLUS Security' : isFiber ? 'One Broadband FTTH' : 'Nexalus Innovations'}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-200 border border-slate-700 backdrop-blur-sm">
                            {proj.clientType}
                          </span>
                        </div>

                        {/* Location Badge */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-slate-300 font-semibold drop-shadow-md">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-[240px]">{proj.location}</span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6 space-y-3">
                        <h3 className={`text-base sm:text-lg font-bold ${
                          isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-cyan-300'
                        } transition-colors line-clamp-2 leading-snug`}>
                          {proj.title}
                        </h3>

                        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed line-clamp-3`}>
                          {proj.description}
                        </p>

                        {/* Scope Highlights Preview */}
                        {proj.scope && proj.scope.length > 0 && (
                          <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-700/60'}`}>
                            {proj.scope.slice(0, 3).map((item, i) => (
                              <div key={i} className={`flex items-center gap-2 text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-blue-600' : 'text-cyan-400'} shrink-0`} />
                                <span className="truncate">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="p-6 pt-0">
                      <Button
                        variant={isAm ? 'teal' : 'primary'}
                        size="sm"
                        onClick={() => setSelectedProject(proj)}
                        className="w-full justify-center font-bold text-xs shadow-md"
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Inspect Case Study
                      </Button>
                    </div>
                  </div>
                </BlurZoomReveal>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-white relative">
            {/* Header Image */}
            <div className="relative h-64 sm:h-80 bg-slate-950 overflow-hidden rounded-t-3xl">
              <img
                src={selectedProject.images?.[0] || '/images/projects/tech-park.jpg'}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {selectedProject.clientType}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedProject.location}</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedProject.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  Project Overview & Problem Statement
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {selectedProject.solutionProvided && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    Turnkey Engineering Solution
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                    {selectedProject.solutionProvided}
                  </p>
                </div>
              )}

              {selectedProject.scope && selectedProject.scope.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                    Project Scope & Deployed Hardware
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedProject.scope.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  Operated under Nexalus Innovations LLP
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setSelectedProject(null)}
                >
                  Close Case Study
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
