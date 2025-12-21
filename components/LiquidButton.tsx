
import React from 'react';
import { Priority } from '../types';

interface LiquidButtonProps {
  onClick?: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  priority?: Priority;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({ onClick, children, className = '', type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        relative w-full h-14 rounded-[1rem]
        font-bold text-[13px] tracking-widest uppercase
        active:scale-[0.98]
        transition-all duration-200 ease-out
        flex items-center justify-center gap-2.5
        overflow-hidden
        bg-zinc-900 text-white dark:bg-white dark:text-black
        hover:bg-black dark:hover:bg-gray-100
        ${className}
      `}
    >
      {children}
    </button>
  );
};
