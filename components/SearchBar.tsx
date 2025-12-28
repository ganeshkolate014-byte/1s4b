import React, { memo } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = memo(({ value, onChange }) => {
    return (
        <div className="bg-zinc-100 dark:bg-[#1c1c1e] rounded-2xl p-1 flex items-center gap-2 pl-4 transition-all focus-within:ring-2 focus-within:ring-blue-500 group h-12">
            <Search size={20} className="text-zinc-400 dark:text-white/30 group-focus-within:text-blue-500 transition-colors" />
            <input 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search..." 
                className="bg-transparent w-full h-full outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 text-[16px] font-medium"
            />
            {value && (
                <button onClick={() => onChange('')} className="w-9 h-9 flex items-center justify-center text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white bg-black/5 dark:bg-white/5 rounded-xl mr-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                   <span className="text-xs font-bold">✕</span>
                </button>
            )}
        </div>
    );
});