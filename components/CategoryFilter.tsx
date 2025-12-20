
import React, { memo } from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface CategoryFilterProps {
    selected: Category | 'All';
    onSelect: (cat: Category | 'All') => void;
}

const FilterPill = memo(({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`
        px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 border
        ${active 
            ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.4)] scale-105 z-10' 
            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/30 backdrop-blur-md'}
    `}
  >
    {children}
  </button>
));

export const CategoryFilter: React.FC<CategoryFilterProps> = memo(({ selected, onSelect }) => {
    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 pt-1 px-1 mask-linear-fade">
            <FilterPill active={selected === 'All'} onClick={() => onSelect('All')}>All</FilterPill>
            {CATEGORIES.map(cat => (
                <FilterPill key={cat} active={selected === cat} onClick={() => onSelect(cat)}>
                    {cat}
                </FilterPill>
            ))}
        </div>
    );
});
