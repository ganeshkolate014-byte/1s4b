import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Plus, Command, SlidersHorizontal } from 'lucide-react';
import { Task, Category, Priority } from './types';
import { TaskModal } from './components/TaskModal';
import { DynamicDashboard } from './components/DynamicDashboard';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { TaskList } from './components/TaskList';
import { motion } from 'framer-motion';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('liquid_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Theme State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true; // Default to dark
    }
    return true;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    localStorage.setItem('liquid_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Apply Theme Class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        // Update meta theme color for mobile browsers
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#000000');
    } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f2f2f7');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, searchQuery, filterCategory]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    return { total, completed, pending, highPriority };
  }, [tasks]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSave = useCallback((taskData: Partial<Task>) => {
      setTasks(prevTasks => {
          if (editingTask) {
              return prevTasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t);
          } else {
              const newTask: Task = {
                id: Math.random().toString(36).substr(2, 9),
                title: taskData.title || '',
                description: taskData.description || '',
                category: taskData.category as Category,
                priority: taskData.priority as Priority,
                completed: false,
                dueDate: taskData.dueDate,
                createdAt: Date.now(),
              };
              return [newTask, ...prevTasks];
          }
      });
      setEditingTask(null);
  }, [editingTask]);

  const handleCreateOpen = useCallback(() => {
      setEditingTask(null);
      setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
      setIsModalOpen(false);
      setEditingTask(null);
  }, []);

  return (
    <div 
        className="relative min-h-screen px-3 sm:px-6 w-full max-w-[500px] mx-auto flex flex-col"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
    >
      
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      <div className="space-y-5 sm:space-y-8 flex-shrink-0">
        <DynamicDashboard stats={stats} />

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <CategoryFilter selected={filterCategory} onSelect={setFilterCategory} />
      </div>

      <TaskList 
        tasks={filteredTasks} 
        onToggle={toggleTask} 
        onDelete={deleteTask} 
        onEdit={setEditingTask} 
      />

      {/* Floating Dock */}
      <div 
        className="fixed left-0 right-0 flex justify-center z-50 pointer-events-none"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="pointer-events-auto flex items-center gap-2 p-2 liquid-glass-heavy rounded-[2rem] shadow-xl shadow-black/10 dark:shadow-black/50 backdrop-blur-2xl transition-colors duration-300">
            <DockIcon icon={<SlidersHorizontal size={20} />} />
            
            <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.2 }}
                onClick={handleCreateOpen}
                className="w-14 h-14 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-[1.6rem] flex items-center justify-center mx-1 relative overflow-hidden group shadow-lg shadow-black/10 dark:shadow-white/10 transition-colors duration-300"
            >
                <Plus size={28} strokeWidth={2.5} className="relative z-10" />
            </motion.button>
            
            <DockIcon icon={<Command size={20} />} />
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen || !!editingTask}
        onClose={handleModalClose}
        onSave={handleSave}
        editingTask={editingTask}
      />
    </div>
  );
};

const DockIcon = memo(({ icon }: any) => (
    <button className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
        {icon}
    </button>
));