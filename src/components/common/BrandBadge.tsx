import React from 'react';
import { BrandId } from '../../types';
import { Building, Cpu } from 'lucide-react';

interface BrandBadgeProps {
  brandId: BrandId | 'nexalus' | 'general' | 'nexalus-innovations' | 'am-distributors';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({ size = 'sm', showIcon = true }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-3.5 py-1.5 gap-2'
  }[size];

  return (
    <span className={`inline-flex items-center font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
      {showIcon && <Cpu className="w-3.5 h-3.5 text-blue-600" />}
      Nexalus Innovations LLP
    </span>
  );
};
