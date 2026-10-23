import React, { useState, useEffect } from 'react';
import { Sparkles, Users } from 'lucide-react';
import { TeamMember } from '../../types';
import { getTeamMembers } from '../../firebase/services';
import { initialTeamMembers } from '../../data/initialData';
import { BlurZoomReveal } from './BlurZoomReveal';

interface OurTeamSectionProps {
  division?: 'all' | 'corporate' | 'nexalus-innovations' | 'am-distributors';
  bgClassName?: string;
  theme?: 'light' | 'dark';
}

export const OurTeamSection: React.FC<OurTeamSectionProps> = ({
  division = 'all',
  bgClassName,
  theme = 'light',
}) => {
  const [members, setMembers] = useState<TeamMember[]>(initialTeamMembers);

  // Load team members from Firebase or fallback to initial data
  useEffect(() => {
    let isMounted = true;

    async function loadMembers() {
      try {
        const data = await getTeamMembers(division);
        if (isMounted && data) {
          setMembers(data);
        }
      } catch (err) {
        console.error('Failed to load team members:', err);
      }
    }

    loadMembers();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail?.key || customEvent.detail?.key === 'team') {
        loadMembers();
      }
    };

    window.addEventListener('nexalus_data_update', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('nexalus_data_update', handleUpdate);
    };
  }, [division]);

  const displayMembers = members.length > 0 ? members : initialTeamMembers;

  // Ensure enough items so there is never an empty gap on wide screens during the 50% marquee translation
  const minBaseCount = 8;
  const multiplier = Math.max(1, Math.ceil(minBaseCount / (displayMembers.length || 1)));
  const baseList = Array.from({ length: multiplier }, () => displayMembers).flat();
  const marqueeMembers = [...baseList, ...baseList];

  const isAm = division === 'am-distributors';
  const isNex = division === 'nexalus-innovations';
  const isCorp = division === 'corporate';

  const subtitle = isAm
    ? 'Chiplun Cold-Chain Leadership, Depot Specialists & Logistics Fleet'
    : isNex
    ? 'Certified Network Engineers, CCTV Specialists & Technical Architects'
    : isCorp
    ? 'Enterprise Leadership, Operations Directorate & Strategic Core'
    : 'Enterprise Leadership, Technical Specialists & Cold-Chain Operations';

  const badgeText = isAm
    ? 'Chiplun Depot Team'
    : isNex
    ? 'Engineering Team'
    : isCorp
    ? 'Corporate Leadership'
    : 'Our Team';

  const badgeClass = isAm
    ? 'bg-teal-100 text-teal-800 border-teal-200'
    : isNex
    ? 'bg-blue-100 text-blue-800 border-blue-200'
    : 'bg-blue-100 text-blue-800 border-blue-200';

  const isDark = theme === 'dark';
  const defaultBg = isDark
    ? 'bg-gradient-to-b from-[#0a1628] via-[#0f2444] to-[#0a1628] border-b border-blue-900/40 text-white'
    : 'bg-slate-50 border-b border-slate-200/90';
  const resolvedBg = bgClassName || defaultBg;

  const resolvedBadgeClass = isDark
    ? 'bg-blue-500/15 text-cyan-300 border-blue-400/30'
    : badgeClass;

  const cardHoverBorder = isDark
    ? 'hover:border-cyan-400'
    : isAm
    ? 'hover:border-teal-400'
    : 'hover:border-blue-400';

  const cardHoverShadow = isDark
    ? 'hover:shadow-cyan-500/20'
    : isAm
    ? 'hover:shadow-teal-500/20'
    : 'hover:shadow-blue-500/20';

  const cardRoleColor = isDark
    ? 'text-cyan-400'
    : isAm
    ? 'text-teal-600'
    : 'text-blue-600';

  const cardHoverTextColor = isDark
    ? 'group-hover:text-cyan-300'
    : isAm
    ? 'group-hover:text-teal-600'
    : 'group-hover:text-blue-600';

  return (
    <section
      id="our-team"
      className={`w-full ${resolvedBg} py-16 sm:py-24 overflow-hidden relative select-none scroll-mt-20`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurZoomReveal direction="up" delay={50}>
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${resolvedBadgeClass}`}>
              <Users className="w-3.5 h-3.5" />
              <span>{badgeText}</span>
            </div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Our Team
            </h2>
            <p className={`text-xs sm:text-sm font-medium max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          </div>
        </BlurZoomReveal>
      </div>

      {/* Infinite Auto-Scrolling Marquee Container */}
      <div className="relative mt-10 w-full overflow-hidden py-4">
        {/* Subtle Edge Gradients for Smooth Peeking */}
        <div className={`absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r ${
          isDark
            ? 'from-[#0a1628] via-[#0a1628]/85 to-transparent'
            : resolvedBg.includes('bg-white')
            ? 'from-white via-white/80 to-transparent'
            : 'from-slate-50 via-slate-50/80 to-transparent'
        } z-20 pointer-events-none`} />
        <div className={`absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l ${
          isDark
            ? 'from-[#0a1628] via-[#0a1628]/85 to-transparent'
            : resolvedBg.includes('bg-white')
            ? 'from-white via-white/80 to-transparent'
            : 'from-slate-50 via-slate-50/80 to-transparent'
        } z-20 pointer-events-none`} />

        {/* Sliding Flex Track with GPU-accelerated Infinite Auto-Scroll */}
        <div className="animate-team-scroll flex items-stretch gap-6 sm:gap-7">
          {marqueeMembers.map((member, idx) => (
            <div
              key={`${member.id}-${idx}`}
              className={`w-[285px] sm:w-[320px] shrink-0 rounded-3xl ${
                isDark
                  ? 'bg-slate-900/95 border border-slate-700/80 shadow-2xl text-white'
                  : 'bg-white border border-slate-200/90 shadow-md text-slate-900'
              } hover:shadow-2xl ${cardHoverShadow} ${cardHoverBorder} hover:-translate-y-2 hover:scale-[1.02] p-6 sm:p-7 flex flex-col items-center text-center transition-all duration-300 group cursor-pointer relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isAm ? 'from-teal-500 via-teal-400 to-emerald-400' : 'from-blue-600 via-blue-500 to-cyan-500'}`} />
              {/* Category Tag Indicator */}
              <div className="w-full flex justify-between items-center mb-3 h-5">
                <span className="text-[10px] font-bold text-slate-400">
                  #{String((idx % displayMembers.length) + 1).padStart(2, '0')}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                    member.division === 'am-distributors' || isAm
                      ? 'text-teal-700 bg-teal-50 border-teal-200'
                      : 'text-blue-600 bg-blue-50 border-blue-100'
                  }`}
                >
                  {member.division === 'am-distributors'
                    ? 'Distribution'
                    : member.division === 'nexalus-innovations'
                    ? 'Technology'
                    : 'Corporate'}
                </span>
              </div>

              {/* Round Shape Circle Photo with Matching Colored Ring */}
              <div className="relative mb-5">
                <div
                  className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1.5 border-4 transition-all duration-500 overflow-hidden bg-slate-100 flex items-center justify-center ${
                    member.circleBorder || (isAm ? 'border-teal-400' : 'border-blue-500')
                  } ${member.circleShadow || 'shadow-lg'} group-hover:scale-105`}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Matching Color Tag Pill Attached to Bottom of Circle */}
                {member.tag && (
                  <span
                    className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md whitespace-nowrap transition-transform duration-300 ${
                      member.badgeBg || (isAm ? 'bg-teal-600' : 'bg-blue-600')
                    } group-hover:scale-105 ring-2 ring-white`}
                  >
                    {member.tag}
                  </span>
                )}
              </div>

              {/* Team Member Details */}
              <div className="space-y-1.5 w-full flex-1 flex flex-col justify-between pt-2">
                <div>
                  <h3 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} ${cardHoverTextColor} transition-colors`}>
                    {member.name}
                  </h3>
                  <p className={`text-xs font-bold ${cardRoleColor} uppercase tracking-wide mt-1`}>
                    {member.role}
                  </p>
                  <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
                    {member.department}
                  </p>
                </div>

                <div className={`pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} w-full mt-3`}>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed font-medium`}>
                    {member.specialty}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
