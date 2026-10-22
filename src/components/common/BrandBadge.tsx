import React from 'react';
import { BrandId } from '../../types';
import { Cpu, Shield, Wifi, Truck, Layers } from 'lucide-react';

interface BrandBadgeProps {
  brandId?: BrandId | 'nexalus' | 'general' | 'nexalus-innovations' | 'am-distributors' | 'corporate';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({ brandId = 'nexalus', size = 'sm', showIcon = true }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-3.5 py-1.5 gap-2'
  }[size];

  if (brandId === 'am-distributors') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200/90 ${sizeClasses}`}>
        {showIcon && <Truck className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
        A.M. Distributors Chiplun
      </span>
    );
  }

  if (brandId === 'nexalus-innovations') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/90 ${sizeClasses}`}>
        {showIcon && <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
        Nexalus Innovations
      </span>
    );
  }

  if (brandId === 'cp-plus') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-sky-50 text-sky-700 border border-sky-200/90 ${sizeClasses}`}>
        {showIcon && <Shield className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
        CP PLUS Surveillance
      </span>
    );
  }

  if (brandId === 'one-broadband') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-orange-50 text-orange-700 border border-orange-200/90 ${sizeClasses}`}>
        {showIcon && <Wifi className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
        ONE Broadband
      </span>
    );
  }

  if (brandId === 'itti-networking') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200/90 ${sizeClasses}`}>
        {showIcon && <Cpu className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
        ITTI Networking
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200/90 ${sizeClasses}`}>
      {showIcon && <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
      Nexalus Innovations LLP
    </span>
  );
};
