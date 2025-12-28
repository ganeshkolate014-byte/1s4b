import React, { memo } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
    isDark: boolean;
    toggleTheme: () => void;
    onOpenProfile: () => void;
    userPhoto?: string | null;
    userInitial?: string;
}

const IconButton: React.FC<{ children: React.ReactNode, 'aria-label': string, onClick?: () => void }> = ({ children, 'aria-label': ariaLabel, onClick }) => (
    <motion.button 
        onClick={onClick}
        className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95 border border-zinc-300 dark:border-zinc-700 overflow-hidden"
        aria-label={ariaLabel}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
    >
        {children}
    </motion.button>
);

export const Header: React.FC<HeaderProps> = memo(({ onOpenProfile, userPhoto, userInitial }) => {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  return (
    <header className="flex justify-between items-center z-50 relative px-1 flex-shrink-0">
        <div>
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">TODAY</p>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white/90 tracking-wider transition-colors">
                {dateString}
            </h1>
        </div>
        <div className="flex items-center gap-3">
            <IconButton aria-label="Notifications">
                <Bell size={18} />
            </IconButton>
            
            <motion.button 
                onClick={onOpenProfile}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-white p-[2px] shadow-md"
            >
                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                    {userPhoto ? (
                        <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold text-zinc-700 dark:text-white">
                            {userInitial ? userInitial.toUpperCase() : 'G'}
                        </span>
                    )}
                </div>
            </motion.button>
        </div>
    </header>
  );
});