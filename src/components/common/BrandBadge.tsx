import React from 'react';
import { BrandId } from '../../types';
import { Shield, Wifi, Building, Cpu, Server, Truck } from 'lucide-react';

interface BrandBadgeProps {
  brandId: BrandId | 'nexalus' | 'general' | 'nexalus-innovations' | 'am-distributors';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({ brandId, size = 'sm', showIcon = true }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-3.5 py-1.5 gap-2'
  }[size];

  if (
    brandId === 'nexalus-innovations' ||
    brandId === 'cp-plus' ||
    brandId === 'one-broadband' ||
    brandId === 'itti-networking'
  ) {
    return (
      <span className={`inline-flex items-center font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
        {showIcon && <Cpu className="w-3.5 h-3.5 text-blue-600" />}
        Nexalus Innovations
      </span>
    );
  }

  if (brandId === 'am-distributors') {
    return (
      <span className={`inline-flex items-center font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}>
        {showIcon && <Truck className="w-3.5 h-3.5 text-teal-600" />}
        A.M. Distributors Chiplun
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-800 border border-slate-200 ${sizeClasses}`}>
      {showIcon && <Building className="w-3.5 h-3.5 text-slate-600" />}
      Nexalus Innovations LLP
    </span>
  );
};
