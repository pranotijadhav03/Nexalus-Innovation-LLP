import React from 'react';
import { CustomSection, BrandId } from '../../types';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CustomSectionsRendererProps {
  sections?: CustomSection[];
  brandId: BrandId | 'nexalus' | 'am-distributors' | 'nexalus-innovations';
}

export const CustomSectionsRenderer: React.FC<CustomSectionsRendererProps> = ({
  sections,
  brandId
}) => {
  if (!sections || sections.length === 0) return null;

  const activeSections = sections
    .filter(s => s.active !== false && s.title && s.title.trim().length > 0)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (activeSections.length === 0) return null;

  const isAm = brandId === 'am-distributors';
  const isTech = brandId === 'nexalus-innovations';

  return (
    <div className="w-full space-y-12 my-12">
      {activeSections.map((sec, idx) => {
        const isReversed = idx % 2 === 1;

        return (
          <section
            key={sec.id || idx}
            className={`relative overflow-hidden rounded-3xl border ${
              isAm
                ? 'bg-gradient-to-br from-teal-950 via-slate-950 to-emerald-950 text-white border-teal-500/30 shadow-xl shadow-teal-950/20'
                : isTech
                ? 'bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 text-white border-blue-500/30 shadow-xl shadow-indigo-950/20'
                : 'bg-gradient-to-br from-slate-950 via-[#0d1e38] to-slate-950 text-white border-slate-800 shadow-xl shadow-slate-950/30'
            } p-6 sm:p-10 lg:p-12`}
          >
            {/* Ambient Background Glow */}
            <div
              className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
                isAm ? 'bg-teal-400' : isTech ? 'bg-cyan-400' : 'bg-blue-400'
              }`}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
              <div
                className={`grid grid-cols-1 ${
                  sec.imageUrl ? 'lg:grid-cols-12 gap-8 lg:gap-12 items-center' : 'gap-6'
                }`}
              >
                {/* Content Column */}
                <div className={sec.imageUrl ? (isReversed ? 'lg:col-span-7 lg:order-2' : 'lg:col-span-7') : 'max-w-4xl'}>
                  {sec.badge && (
                    <div
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border ${
                        isAm
                          ? 'bg-teal-500/15 text-teal-300 border-teal-400/30'
                          : isTech
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-400/30'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{sec.badge}</span>
                    </div>
                  )}

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                    {sec.title}
                  </h2>

                  {sec.subtitle && (
                    <p
                      className={`text-sm sm:text-base font-semibold mt-2 ${
                        isAm ? 'text-teal-200' : isTech ? 'text-cyan-200' : 'text-blue-200'
                      }`}
                    >
                      {sec.subtitle}
                    </p>
                  )}

                  <div className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
                    {sec.content}
                  </div>

                  {sec.ctaText && (
                    <div className="pt-6">
                      {sec.ctaLink && (sec.ctaLink.startsWith('http://') || sec.ctaLink.startsWith('https://')) ? (
                        <a
                          href={sec.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                            isAm
                              ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black shadow-teal-500/20'
                              : isTech
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-cyan-500/20'
                              : 'bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-blue-500/30'
                          }`}
                        >
                          <span>{sec.ctaText}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <Link
                          to={sec.ctaLink || '/contact'}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                            isAm
                              ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black shadow-teal-500/20'
                              : isTech
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-cyan-500/20'
                              : 'bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-blue-500/30'
                          }`}
                        >
                          <span>{sec.ctaText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Optional Image Column */}
                {sec.imageUrl && (
                  <div className={isReversed ? 'lg:col-span-5 lg:order-1' : 'lg:col-span-5'}>
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 group">
                      <img
                        src={sec.imageUrl}
                        alt={sec.title}
                        className="w-full h-64 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
