import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Sparkles, Minus, AlertTriangle, ArrowUp, Calendar as CalendarIcon, Hash, Flag } from 'lucide-react';
import { Task, Category, Priority } from '../types';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';
import { LiquidButton } from './LiquidButton';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  editingTask: Task | null;
}

const PRIORITY_COLORS = {
    low: 'bg-blue-500',
    medium: 'bg-amber-400',
    high: 'bg-rose-500'
};

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

// --- Sub Components ---

const DateItem = memo(({ date, isSelected, onSelect }: any) => (
    <button
        type="button"
        onClick={() => onSelect(date.full)}
        className={`
            relative flex flex-col items-center justify-center min-w-[3.5rem] h-[4.5rem] rounded-2xl transition-all duration-300
            ${isSelected 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg scale-105 z-10' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'}
        `}
    >
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">
            {date.isToday ? 'Today' : date.dayName}
        </span>
        <span className="text-xl font-bold leading-none">
            {date.dayNum}
        </span>
        {isSelected && (
            <motion.div 
                layoutId="active-date-dot"
                className="absolute -bottom-2 w-1 h-1 rounded-full bg-zinc-900 dark:bg-white"
                transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            />
        )}
    </button>
));

const DateScroll = memo(({ selectedDate, onSelect, days, isCustomDate }: any) => (
    <div className="w-full overflow-hidden">
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1 mask-linear-fade">
             {/* Custom Date Picker Trigger */}
            <div className="relative flex-shrink-0">
                <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                        if(e.target.value) onSelect(e.target.value);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                />
                <button
                    type="button"
                    className={`
                        flex flex-col items-center justify-center w-[3.5rem] h-[4.5rem] rounded-2xl transition-all duration-300 border-2 border-dashed
                        ${isCustomDate 
                            ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white bg-transparent' 
                            : 'border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'}
                    `}
                >
                    <CalendarIcon size={20} />
                </button>
            </div>

            {days.map((date: any) => (
                <DateItem 
                    key={date.full} 
                    date={date} 
                    isSelected={selectedDate === date.full} 
                    onSelect={onSelect} 
                />
            ))}
        </div>
    </div>
));

const PrioritySelector = memo(({ priority, onSelect }: { priority: Priority, onSelect: (p: Priority) => void }) => (
    <div className="flex items-center bg-zinc-200 dark:bg-zinc-900 p-1 rounded-xl h-14 w-full">
        {(['low', 'medium', 'high'] as Priority[]).map((p) => {
             const isActive = priority === p;
             return (
                 <button
                    key={p}
                    type="button"
                    onClick={() => onSelect(p)}
                    className={`
                        flex-1 h-full rounded-lg flex items-center justify-center gap-2 relative transition-all duration-300
                        ${isActive ? 'text-black dark:text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}
                    `}
                 >
                    {isActive && (
                        <motion.div
                            layoutId="priority-bg"
                            className="absolute inset-0 bg-white dark:bg-zinc-700 shadow-sm rounded-lg"
                            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                         {p === 'low' && <ArrowUp className="rotate-180" size={14} />}
                         {p === 'medium' && <Minus size={14} />}
                         {p === 'high' && <AlertTriangle size={14} />}
                         <span className="capitalize text-xs tracking-wide">{p}</span>
                    </span>
                 </button>
             )
        })}
     </div>
));

const CategorySelector = memo(({ category, onSelect }: { category: Category, onSelect: (c: Category) => void }) => (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
         {CATEGORIES.map(cat => {
            const isActive = category === cat;
            return (
                <button
                    key={cat}
                    type="button"
                    onClick={() => onSelect(cat)}
                    className={`
                        relative px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 shrink-0 flex items-center gap-2 border
                        ${isActive 
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-md transform scale-105' 
                            : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}
                    `}
                >
                    {CATEGORY_ICONS[cat] && React.cloneElement(CATEGORY_ICONS[cat] as React.ReactElement, { size: 14 })}
                    {cat}
                </button>
            )
         })}
    </div>
));

// --- Main Modal ---

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, editingTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate days
  const nextDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push({
            full: d.toISOString().split('T')[0],
            dayName: weekdayFormatter.format(d),
            dayNum: d.getDate(),
            isToday: i === 0
        });
    }
    return days;
  }, []);

  const isCustomDate = useMemo(() => {
      if (!selectedDate) return false;
      return !nextDays.some(d => d.full === selectedDate);
  }, [selectedDate, nextDays]);

  const handleDateSelect = useCallback((date: string) => setSelectedDate(date), []);
  const handlePrioritySelect = useCallback((p: Priority) => setPriority(p), []);
  const handleCategorySelect = useCallback((c: Category) => setCategory(c), []);

  useEffect(() => {
    if (isOpen) {
        if (editingTask) {
          setTitle(editingTask.title);
          setDescription(editingTask.description);
          setCategory(editingTask.category);
          setPriority(editingTask.priority);
          setSelectedDate(editingTask.dueDate || nextDays[0].full);
          setSelectedTime(editingTask.dueTime || '12:00');
        } else {
          setTitle('');
          setDescription('');
          setCategory('Personal');
          setPriority('medium');
          setSelectedDate(nextDays[0].full);
          setSelectedTime('12:00');
        }
        
        requestAnimationFrame(() => {
            if(textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                if (editingTask || title) {
                     textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
                }
            }
        });
    }
  }, [editingTask, isOpen, nextDays]);

  // Textarea Auto-grow
  useEffect(() => {
      if (textareaRef.current && isOpen) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
  }, [title, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ 
      title, 
      description, 
      category, 
      priority, 
      dueDate: selectedDate,
      dueTime: selectedTime
    });
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
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center justify-end pointer-events-none"
          >
             <div className="w-full max-w-lg mx-auto pointer-events-auto">
                 {/* Main Sheet */}
                 <div className="bg-[#f2f2f7] dark:bg-[#000000] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <form onSubmit={handleSubmit} className="flex flex-col min-h-full">
                            
                            {/* Input Section - Clean & Large */}
                            <div className="px-8 pt-6 pb-8 bg-white dark:bg-[#1c1c1e] rounded-b-[2.5rem] shadow-sm z-10 space-y-4">
                                <div className="flex justify-between items-start">
                                    <textarea
                                        ref={textareaRef}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="New Task"
                                        rows={1}
                                        className="w-full bg-transparent text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 outline-none border-none p-0 resize-none leading-tight tracking-tight"
                                        style={{ minHeight: '44px' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={onClose}
                                        className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a note..."
                                    className="w-full bg-transparent text-lg text-zinc-500 dark:text-zinc-400 placeholder-zinc-300 dark:placeholder-zinc-700 outline-none border-none p-0"
                                />
                            </div>

                            {/* Controls "Deck" */}
                            <div className="p-6 space-y-6">
                                
                                {/* Date Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 px-1">
                                        <CalendarIcon size={14} />
                                        <span className="text-xs font-bold uppercase tracking-widest">When</span>
                                    </div>
                                    <DateScroll 
                                        selectedDate={selectedDate}
                                        onSelect={handleDateSelect}
                                        days={nextDays}
                                        isCustomDate={isCustomDate}
                                    />
                                </div>

                                {/* Context Grid */}
                                <div className="grid grid-cols-5 gap-4">
                                    {/* Time - Spans 2 cols */}
                                    <div className="col-span-2 space-y-3">
                                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 px-1">
                                            <Clock size={14} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Time</span>
                                        </div>
                                        <div className="relative h-14 bg-white dark:bg-[#1c1c1e] rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 overflow-hidden group">
                                            <input 
                                                type="time" 
                                                value={selectedTime}
                                                onChange={(e) => setSelectedTime(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <span className="text-lg font-bold text-zinc-900 dark:text-white group-hover:scale-110 transition-transform">
                                                {selectedTime}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Priority - Spans 3 cols */}
                                    <div className="col-span-3 space-y-3">
                                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 px-1">
                                            <Flag size={14} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Priority</span>
                                        </div>
                                        <PrioritySelector priority={priority} onSelect={handlePrioritySelect} />
                                    </div>
                                </div>

                                {/* Category Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 px-1">
                                        <Hash size={14} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Category</span>
                                    </div>
                                    <CategorySelector category={category} onSelect={handleCategorySelect} />
                                </div>

                                {/* Action Button */}
                                <div className="pt-2">
                                    <LiquidButton type="submit" priority={priority}>
                                        <Sparkles size={18} className="text-white dark:text-black/60" />
                                        <span className="text-white dark:text-black text-sm">{editingTask ? 'Save Changes' : 'Create Task'}</span>
                                    </LiquidButton>
                                </div>

                                {/* Safety Padding for Home Bar */}
                                <div className="h-6" />
                            </div>
                        </form>
                    </div>
                 </div>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};