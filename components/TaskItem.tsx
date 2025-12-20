
import React, { memo } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Task } from '../types';
import { Calendar, Trash2 } from 'lucide-react';

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

export const TaskItem: React.FC<TaskItemProps> = memo(({ task, onToggle, onDelete, onEdit }) => {
  const dateDisplay = formatDate(task.dueDate);
  
  // Motion Values for Swipe Physics
  const x = useMotionValue(0);
  
  // Dynamic transformations based on swipe distance
  const iconOpacity = useTransform(x, [0, -40], [0, 1]);
  const iconScale = useTransform(x, [0, -80], [0.5, 1.2]);
  const iconRotate = useTransform(x, [0, -80], [0, -15]); // Slight tilt
  const bgOpacity = useTransform(x, [0, -30], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = -100;
    const velocityThreshold = -500; // Fast swipe support

    // Trigger delete if dragged far enough OR swiped fast enough
    if (info.offset.x < threshold || info.velocity.x < velocityThreshold) {
      if (navigator.vibrate) navigator.vibrate(50); // Haptic tick
      onDelete(task.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ 
        x: '-100%', 
        height: 0, 
        opacity: 0,
        marginBottom: 0,
        transition: { duration: 0.3, ease: [0.32, 0, 0.67, 0] } // Ease-in back
      }}
      className="relative mb-3 group"
      style={{ willChange: 'transform, opacity, height' }}
    >
      {/* Background Action Layer (Reveal on Swipe) */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-rose-600 rounded-[1.2rem] flex items-center justify-end pr-6 z-0"
      >
         <motion.div style={{ opacity: iconOpacity, scale: iconScale, rotate: iconRotate }}>
            <Trash2 className="text-white" size={24} strokeWidth={2.5} />
         </motion.div>
      </motion.div>

      {/* Draggable Task Card */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }} // Snaps back if released before threshold
        dragElastic={{ left: 0.8, right: 0.1 }} // Loose feeling left, stiff right
        onDragEnd={handleDragEnd}
        style={{ x, touchAction: 'pan-y' }}
        onClick={() => onEdit(task)}
        className={`
            relative z-10 overflow-hidden
            flex items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-[1.2rem]
            transition-colors duration-200 cursor-pointer
            ${task.completed 
                ? 'bg-zinc-900 border border-white/[0.05]' 
                : 'bg-[#1c1c1e] border border-white/[0.05] hover:bg-zinc-800'}
        `}
      >
        {/* Checkbox */}
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onToggle(task.id);
            }}
            className="relative cursor-pointer flex-shrink-0 z-10 p-1 -m-1" // Hitbox padding
        >
            <div 
                className={`
                    w-6 h-6 sm:w-7 sm:h-7 rounded-full 
                    flex items-center justify-center
                    transition-all duration-200 ease-out border
                    ${task.completed 
                        ? 'bg-blue-500 border-blue-500 scale-100' 
                        : 'bg-transparent border-white/20 group-hover:border-white/50'}
                `}
            >
               {task.completed && (
                   <motion.div 
                     initial={{ scale: 0 }} 
                     animate={{ scale: 1 }}
                     transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                     className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" 
                   />
               )}
            </div>
        </div>

        <div className="flex-1 min-w-0 z-10 select-none">
          <h3 className={`
            text-base sm:text-[17px] font-semibold tracking-tight transition-all duration-300 leading-snug truncate
            ${task.completed ? 'text-white/30 line-through decoration-white/20' : 'text-white'}
          `}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
             <span className={`
                text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md
                ${task.completed ? 'text-white/20 bg-white/5' : 'text-blue-200 bg-blue-500/20 border border-blue-500/20'}
             `}>
                {task.category}
             </span>
             
             {!task.completed && dateDisplay && (
                 <div className="flex items-center gap-1 text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{dateDisplay}</span>
                 </div>
             )}

             {task.priority === 'high' && !task.completed && (
                 <div className="ml-auto sm:ml-0 flex items-center gap-1">
                     <div className="h-1.5 w-1.5 rounded-full bg-rose-500"></div>
                 </div>
             )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
