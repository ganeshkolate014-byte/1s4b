import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Task } from '../types';
import { Calendar, Trash2, Clock } from 'lucide-react';
import { CATEGORY_ICONS } from '../constants';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00'); 
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "tween", duration: 0.2, ease: "easeOut" }
    },
    exit: { 
        opacity: 0, 
        scale: 0.95, 
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.2, ease: "easeInOut" } 
    }
};

export const TaskItem: React.FC<TaskItemProps> = memo(({ task, onToggle, onDelete, onEdit }) => {
  const dateDisplay = formatDate(task.dueDate);

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative mb-3 group transform-gpu"
      style={{ willChange: 'transform, opacity, height' }}
    >
      <motion.div 
        onClick={() => onEdit(task)}
        whileTap={{ scale: 0.98, transition: { duration: 0.05 } }}
        className={`
            relative z-10 overflow-hidden
            flex items-center gap-3 sm:gap-5 p-3.5 sm:p-5 rounded-[1.2rem]
            transition-colors duration-200 cursor-pointer transform-gpu
            ${task.completed 
                ? 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800' 
                : 'bg-white dark:bg-[#1c1c1e] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm'}
        `}
      >
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onToggle(task.id);
            }}
            className="relative cursor-pointer flex-shrink-0 z-10 p-1 -m-1"
        >
            <div 
                className={`
                    w-6 h-6 sm:w-7 sm:h-7 rounded-full 
                    flex items-center justify-center
                    transition-all duration-200 ease-out border
                    ${task.completed 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-transparent border-zinc-300 dark:border-zinc-700 group-hover:border-blue-400 dark:group-hover:border-blue-500'}
                `}
            >
               <motion.div 
                 initial={false}
                 animate={{ scale: task.completed ? 1 : 0, opacity: task.completed ? 1 : 0 }}
                 transition={{ duration: 0.2 }}
                 className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" 
               />
            </div>
        </div>

        <div className="flex-1 min-w-0 z-10 select-none">
          <h3 className={`
            text-[16px] sm:text-[17px] font-semibold tracking-tight transition-all duration-300 leading-snug truncate
            ${task.completed ? 'text-zinc-400 dark:text-zinc-600 line-through decoration-zinc-300 dark:decoration-zinc-700' : 'text-zinc-900 dark:text-white'}
          `}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
             <span className={`
                text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1
                ${task.completed 
                    ? 'text-zinc-400 bg-zinc-200 dark:text-zinc-600 dark:bg-zinc-800' 
                    : 'text-blue-600 bg-blue-100 dark:text-blue-200 dark:bg-blue-900 border border-blue-200 dark:border-blue-800'}
             `}>
                {CATEGORY_ICONS[task.category] && React.cloneElement(CATEGORY_ICONS[task.category] as React.ReactElement<{ size: number | string }>, { size: 10 })}
                {task.category}
             </span>
             
             {!task.completed && dateDisplay && (
                 <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-1 border-r border-zinc-300 dark:border-zinc-700 pr-1.5">
                        <Calendar size={12} />
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{dateDisplay}</span>
                    </div>
                    {task.dueTime && (
                         <div className="flex items-center gap-1">
                             <Clock size={12} />
                             <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{task.dueTime}</span>
                         </div>
                    )}
                 </div>
             )}

             {task.priority === 'high' && !task.completed && (
                 <div className="ml-auto sm:ml-0 flex items-center gap-1">
                     <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-sm dark:shadow-none"></div>
                 </div>
             )}
          </div>
        </div>

        <button
            onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
            }}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors z-20 active:scale-90"
        >
            <Trash2 size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
});