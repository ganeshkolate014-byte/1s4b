import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';
import { Category } from '../types';

interface CategoryFilterProps {
    selected: Category | 'All';
    onSelect: (cat: Category | 'All') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = memo(({ selected, onSelect }) => {
    const allCategories: (Category | 'All')[] = ['All', ...CATEGORIES];

    return (
        <div className="w-full">
            <div 
                className="relative flex items-center overflow-x-auto no-scrollbar py-2"
            >
                {allCategories.map((cat) => {
                    const isActive = selected === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat)}
                            className={`
                                relative min-w-[fit-content] px-4 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-colors duration-300 z-10 shrink-0 flex items-center justify-center gap-2
                                ${isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}
                            `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeFilter"
                                    className="absolute inset-0 bg-zinc-800 dark:bg-zinc-700 rounded-full"
                                    transition={{ 
                                        type: "tween", 
                                        duration: 0.3,
                                        ease: "easeInOut"
                                    }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {CATEGORY_ICONS[cat] && React.cloneElement(CATEGORY_ICONS[cat] as React.ReactElement, { size: 16 })}
                                {cat}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});