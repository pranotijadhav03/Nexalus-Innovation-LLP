import React from 'react';
import { Link } from 'react-router-dom';
import { BrandId } from '../../types';
import { Shield, Wifi, Server, ChevronRight } from 'lucide-react';

interface BrandHeaderProps {
  brandId: BrandId;
  title: string;
  subtitle: string;
  breadcrumbs?: { label: string; path?: string }[];
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  brandId,
  title,
  subtitle,
  breadcrumbs = []
}) => {
  const isCpPlus = brandId === 'cp-plus';
  const isNetworking = brandId === 'itti-networking';

  const brandHomePath = isCpPlus
    ? '/brands/cp-plus'
    : isNetworking
    ? '/brands/itti-networking'
    : '/brands/one-broadband';

  const brandDisplayName = isCpPlus
    ? 'CP PLUS'
    : isNetworking
    ? 'ITTI Networking'
    : 'One Broadband';

  const getGradientClass = () => {
    if (isCpPlus) return 'bg-gradient-to-b from-sky-900/10 via-slate-50 to-white border-sky-100';
    if (isNetworking) return 'bg-gradient-to-b from-indigo-900/10 via-slate-50 to-white border-indigo-100';
    return 'bg-gradient-to-b from-teal-900/10 via-slate-50 to-white border-teal-100';
  };

  const getBadgeColor = () => {
    if (isCpPlus) return 'text-sky-700 bg-sky-50 border-sky-200';
    if (isNetworking) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    return 'text-teal-700 bg-teal-50 border-teal-200';
  };

  const getIconContainerClass = () => {
    if (isCpPlus) return 'bg-sky-600 text-white shadow-sky-600/20';
    if (isNetworking) return 'bg-indigo-600 text-white shadow-indigo-600/20';
    return 'bg-teal-600 text-white shadow-teal-600/20';
  };

  return (
    <div className={`border-b ${getGradientClass()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        {/* Brand-Specific Breadcrumb Bar */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 flex-wrap">
          <Link
            to={brandHomePath}
            className="hover:text-slate-900 transition-colors font-bold text-slate-700"
          >
            {brandDisplayName} Home
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-slate-900 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Brand Banner Title */}
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${getIconContainerClass()}`}>
            {isCpPlus ? (
              <Shield className="w-8 h-8" />
            ) : isNetworking ? (
              <Server className="w-8 h-8" />
            ) : (
              <Wifi className="w-8 h-8" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getBadgeColor()}`}>
                {isCpPlus ? 'CCTV & Security' : isNetworking ? 'Enterprise Infrastructure' : 'Fiber Internet'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              {title}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
