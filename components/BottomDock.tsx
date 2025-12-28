import React from 'react';
import { motion } from 'framer-motion';
import { Plus, SlidersHorizontal, Command } from 'lucide-react';

interface BottomDockProps {
  onAddTask: () => void;
  onOpenSettings: () => void;
}

const IconButton: React.FC<{ children: React.ReactNode; 'aria-label': string; onClick?: () => void }> = ({ children, 'aria-label': ariaLabel, onClick }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1, transition: { duration: 0.2, ease: "easeOut" } }}
        whileTap={{ scale: 0.9, transition: { duration: 0.1 } }}
        aria-label={ariaLabel}
        className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400"
    >
        {children}
    </motion.button>
);

export const BottomDock: React.FC<BottomDockProps> = ({ onAddTask, onOpenSettings }) => {
  return (
    <motion.div
      initial={{ y: 100, x: '-50%', opacity: 0 }}
      animate={{ y: 0, x: '-50%', opacity: 1 }}
      transition={{ type: "tween", duration: 0.4, ease: "easeOut", delay: 0.2 }}
      className="fixed left-1/2 z-50 p-1 bg-zinc-200 dark:bg-[#1c1c1e] rounded-full flex items-center gap-1 shadow-2xl shadow-black/20 border border-zinc-300 dark:border-zinc-800"
      style={{
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
      }}
    >
        <IconButton aria-label="Settings" onClick={onOpenSettings}>
            <SlidersHorizontal size={20} />
        </IconButton>

        <motion.button
            onClick={onAddTask}
            whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            aria-label="Add New Task"
            className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-black dark:text-white shadow-lg relative border border-zinc-200 dark:border-zinc-700"
        >
            <Plus size={28} strokeWidth={2.5} />
        </motion.button>

        <IconButton aria-label="Commands">
            <Command size={20} />
        </IconButton>
    </motion.div>
  );
};