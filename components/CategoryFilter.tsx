
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';
import { Category } from '../types';

interface CategoryFilterProps {
    selected: Category | 'All';
    onSelect: (cat: Category | 'All') => void;
}

const FilterPill = memo(({ children, icon, active, onClick }: { children: React.ReactNode, icon?: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`
        relative px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap flex-shrink-0 border flex items-center gap-2
        ${active 
            ? 'text-white dark:text-black border-transparent z-10' 
            : 'bg-black/5 border-black/5 text-zinc-500 hover:bg-black/10 hover:text-black dark:bg-white/5 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white'}
    `}
  >
    {active && (
        <motion.div
            layoutId="activeCategory"
            className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-full"
            transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
        />
    )}
    <span className="relative z-10 flex items-center gap-1.5">
        {icon && <span className="opacity-70">{icon}</span>}
        {children}
    </span>
  </button>
));

export const CategoryFilter: React.FC<CategoryFilterProps> = memo(({ selected, onSelect }) => {
    return (
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-4 pt-1 px-1 mask-linear-fade">
            <FilterPill 
                active={selected === 'All'} 
                onClick={() => onSelect('All')}
                icon={CATEGORY_ICONS['All']}
            >
                All
            </FilterPill>
            {CATEGORIES.map(cat => (
                <FilterPill 
                    key={cat} 
                    active={selected === cat} 
                    onClick={() => onSelect(cat)}
                    icon={CATEGORY_ICONS[cat]}
                >
                    {cat}
                </FilterPill>
            ))}
        </div>
    );
});
