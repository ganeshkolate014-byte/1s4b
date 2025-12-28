import React, { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
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
            className="flex-1 flex flex-col min-h-[300px]"
            style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))' }}
        >
            <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1 mb-3">
                Your Tasks
            </h2>
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
                        <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
                            <ClipboardList className="text-zinc-400 dark:text-white/30" size={24} />
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