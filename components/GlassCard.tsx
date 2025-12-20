
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, noPadding = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        liquid-glass
        relative
        rounded-[1.5rem]
        overflow-hidden
        transition-transform
        duration-300
        active:scale-[0.99]
        ${noPadding ? '' : 'p-5 sm:p-6'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
