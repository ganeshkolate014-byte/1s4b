
import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Sparkles, Zap, AlertCircle, ArrowUp, Calendar as CalendarIcon } from 'lucide-react';
import { Task, Category, Priority } from '../types';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';
import { LiquidButton } from './LiquidButton';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  editingTask: Task | null;
}

// --- MEMOIZED COMPONENTS FOR PERFORMANCE ---

const PRIORITY_THEME = {
    low: { bg: 'bg-sky-500', text: 'text-white', icon: 'text-white' },
    medium: { bg: 'bg-amber-500', text: 'text-black', icon: 'text-black' },
    high: { bg: 'bg-rose-500', text: 'text-white', icon: 'text-white' }
};

const priorityConfig = {
    low: { label: 'Low', icon: <ArrowUp className="rotate-180" size={14} /> },
    medium: { label: 'Medium', icon: <Zap size={14} /> },
    high: { label: 'Critical', icon: <AlertCircle size={14} /> }
};

const DateScroll = memo(({ selectedDate, onSelect, days, isCustomDate, customDateDisplay }: any) => (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-fade px-1">
        {/* Native Picker Button */}
        <div className="relative flex-shrink-0">
            <input 
                type="date"
                value={selectedDate}
                onChange={(e) => {
                    if(e.target.value) onSelect(e.target.value);
                }}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                aria-label="Pick a date"
            />
            <button
                type="button"
                className={`
                    flex flex-col items-center justify-center w-[56px] h-[72px] rounded-2xl border transition-all duration-200
                    ${isCustomDate 
                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white scale-100 z-10' 
                        : 'bg-black/5 text-zinc-400 border-transparent hover:bg-black/10 hover:text-zinc-900 dark:bg-white/[0.05] dark:text-white/40 dark:hover:bg-white/[0.1] dark:hover:text-white'}
                `}
            >
                {isCustomDate && customDateDisplay ? (
                    <>
                        <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-60">
                            {customDateDisplay.month}
                        </span>
                        <span className="text-lg font-bold leading-none">
                            {customDateDisplay.day}
                        </span>
                    </>
                ) : (
                    <>
                        <CalendarIcon size={20} className="mb-1 opacity-80" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pick</span>
                    </>
                )}
            </button>
        </div>

        {/* Quick Select List */}
        {days.map((date: any) => {
            const isSelected = selectedDate === date.full;
            return (
                <button
                    key={date.full}
                    type="button"
                    onClick={() => onSelect(date.full)}
                    className={`
                        flex flex-col items-center justify-center min-w-[56px] h-[72px] rounded-2xl border transition-all duration-200 relative overflow-hidden flex-shrink-0
                        ${isSelected 
                            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white scale-100 z-10' 
                            : 'bg-black/5 text-zinc-400 border-transparent hover:bg-black/10 dark:bg-white/[0.05] dark:text-white/40 dark:hover:bg-white/[0.1]'}
                    `}
                >
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-60">
                        {date.isToday ? 'TDY' : date.dayName}
                    </span>
                    <span className="text-lg font-bold leading-none">
                        {date.dayNum}
                    </span>
                </button>
            );
        })}
    </div>
));

const PrioritySelector = memo(({ priority, onSelect }: { priority: Priority, onSelect: (p: Priority) => void }) => (
    <div className="h-14 bg-black/5 dark:bg-white/[0.03] rounded-xl p-1 flex relative border border-black/5 dark:border-white/5">
        {(['low', 'medium', 'high'] as Priority[]).map((p) => {
             const isActive = priority === p;
             const config = priorityConfig[p];
             const theme = PRIORITY_THEME[p];
             
             return (
                 <button
                    key={p}
                    type="button"
                    onClick={() => onSelect(p)}
                    className={`flex-1 relative z-10 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${isActive ? theme.text : 'text-zinc-400 hover:text-zinc-600 dark:text-white/30 dark:hover:text-white/50'}`}
                 >
                    {isActive && (
                        <motion.div
                            layoutId="priority-pill"
                            className={`absolute inset-0 rounded-[9px] shadow-sm ${theme.bg}`}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    
                    <span className="relative z-10 flex items-center gap-1.5">
                        <span className={isActive ? theme.icon : ''}>
                            {config.icon}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">{config.label}</span>
                    </span>
                 </button>
             )
        })}
     </div>
));

const CategorySelector = memo(({ category, onSelect }: { category: Category, onSelect: (c: Category) => void }) => (
    <div className="flex flex-wrap gap-2 pt-2">
         {CATEGORIES.map(cat => {
            const isActive = category === cat;
            return (
                <button
                    key={cat}
                    type="button"
                    onClick={() => onSelect(cat)}
                    className={`
                        relative px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border flex items-center gap-2
                        ${isActive 
                            ? 'text-white border-transparent z-10 dark:text-black' 
                            : 'bg-transparent text-zinc-400 border-zinc-200 dark:text-white/20 dark:border-white/5 dark:hover:border-white/10'}
                    `}
                >
                    {isActive && (
                        <motion.div
                            layoutId="category-pill-modal"
                            className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-xl"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        {CATEGORY_ICONS[cat]}
                        {cat}
                    </span>
                </button>
            )
         })}
     </div>
));

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, editingTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const nextDays = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0
    };
  }), []);

  const isCustomDate = useMemo(() => {
      if (!selectedDate) return false;
      return !nextDays.some(d => d.full === selectedDate);
  }, [selectedDate, nextDays]);

  const customDateDisplay = useMemo(() => {
      if (!selectedDate || !isCustomDate) return null;
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return {
          month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
          day: d
      };
  }, [selectedDate, isCustomDate]);

  const handleDateSelect = useCallback((date: string) => setSelectedDate(date), []);
  const handlePrioritySelect = useCallback((p: Priority) => setPriority(p), []);
  const handleCategorySelect = useCallback((c: Category) => setCategory(c), []);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setSelectedDate(editingTask.dueDate || nextDays[0].full);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setPriority('medium');
      setSelectedDate(nextDays[0].full);
    }
    
    // Reset height on open
    if(textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  }, [editingTask, isOpen, nextDays]);

  // Auto-resize textarea
  useEffect(() => {
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
  }, [title, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description, category, priority, dueDate: selectedDate });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] z-[60]"
            style={{ willChange: 'opacity' }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:top-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:w-[460px] w-full z-[70] flex flex-col justify-end"
            style={{ willChange: 'transform' }}
          >
             {/* CONTAINER */}
             <div className="liquid-glass-heavy md:rounded-[2.5rem] rounded-t-[2.5rem] p-0 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                
                {/* Header Actions - Fixed at top of modal */}
                <div className="flex justify-between items-center p-5 pb-2 shrink-0 z-20 bg-inherit relative">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 border border-black/5 dark:border-white/5"
                    >
                        <X size={20} />
                    </button>
                    <div className="px-5 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                         <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/60">
                            {editingTask ? 'Edit Task' : 'New Task'}
                         </span>
                    </div>
                </div>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="overflow-y-auto overscroll-contain flex-1 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="flex flex-col min-h-full">
                        
                        {/* Main Input Area */}
                        <div className="px-5 sm:px-6 py-4 space-y-3 shrink-0">
                            <textarea
                                ref={textareaRef}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                rows={1}
                                className="w-full bg-transparent text-[22px] sm:text-3xl font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/40 outline-none border-none p-0 resize-none leading-tight"
                                style={{ minHeight: '32px' }}
                            />
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add details (optional)"
                                className="w-full bg-transparent text-[15px] sm:text-[17px] text-zinc-500 dark:text-white/50 placeholder-zinc-300 dark:placeholder-white/20 outline-none border-none p-0"
                            />
                        </div>

                        {/* Controls Container - Pushes to bottom if space permits */}
                        <div 
                            className="bg-zinc-50 dark:bg-[#18181b] p-6 space-y-8 mt-auto border-t border-black/5 dark:border-white/5 relative"
                            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
                        >
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/30 pl-1 flex items-center gap-2">
                                    <Clock size={14} /> Schedule
                                </label>
                                
                                <DateScroll 
                                    selectedDate={selectedDate}
                                    onSelect={handleDateSelect}
                                    days={nextDays}
                                    isCustomDate={isCustomDate}
                                    customDateDisplay={customDateDisplay}
                                />
                            </div>

                            <div className="space-y-3 relative">
                                 <div className="flex justify-between items-center px-1">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/30">Impact Level</label>
                                 </div>
                                 
                                 <PrioritySelector priority={priority} onSelect={handlePrioritySelect} />
                            </div>

                            <CategorySelector category={category} onSelect={handleCategorySelect} />

                            <LiquidButton type="submit" priority={priority}>
                               <Sparkles size={16} className="text-white dark:text-black/60" />
                               <span className="text-white dark:text-black">{editingTask ? 'Save Changes' : 'Create Task'}</span>
                            </LiquidButton>
                        </div>
                    </form>
                </div>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
