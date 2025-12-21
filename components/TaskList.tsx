
import React, { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
}

const listVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const TaskList: React.FC<TaskListProps> = memo(({ tasks, onToggle, onDelete, onEdit }) => {
    return (
        <div 
            className="flex-1 flex flex-col mt-6 sm:mt-8 px-1 min-h-[300px]"
            style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))' }}
        >
            <div className="flex justify-between items-end mb-4 px-1 flex-shrink-0">
                <h3 className="text-sm font-bold text-zinc-400 dark:text-white/50 uppercase tracking-widest transition-colors">Your Tasks</h3>
            </div>
            
            <AnimatePresence mode="popLayout" initial={false}>
                {tasks.length > 0 ? (
                    <motion.div 
                        className="space-y-3"
                        variants={listVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode='popLayout'>
                        {tasks.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={onToggle} 
                                onDelete={onDelete} 
                                onEdit={onEdit}
                            />
                        ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50 mt-10"
                    >
                        <div className="w-16 h-16 rounded-3xl liquid-glass flex items-center justify-center">
                            <SlidersHorizontal className="text-zinc-400 dark:text-white/30" size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-zinc-900 dark:text-white font-medium text-sm">No tasks found</p>
                            <p className="text-zinc-400 dark:text-white/30 text-xs">Tap the + button to create one</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
