import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Plus, Command, SlidersHorizontal, Bell } from 'lucide-react';
import { Task, Category, Priority } from './types';
import { TaskModal } from './components/TaskModal';
import { DynamicDashboard } from './components/DynamicDashboard';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { TaskList } from './components/TaskList';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('liquid_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Streak State
  const [streak, setStreak] = useState(() => {
      const saved = localStorage.getItem('liquid_streak');
      return saved ? parseInt(saved) : 0;
  });

  const [lastStreakDate, setLastStreakDate] = useState(() => {
      return localStorage.getItem('liquid_last_streak_date') || '';
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    }
    return true;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('liquid_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('liquid_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
      localStorage.setItem('liquid_last_streak_date', lastStreakDate);
  }, [lastStreakDate]);

  // STREAK LOGIC
  useEffect(() => {
      const checkStreakContinuity = () => {
          const todayStr = new Date().toISOString().split('T')[0];
          if (lastStreakDate) {
              const lastDate = new Date(lastStreakDate);
              const todayDate = new Date(todayStr);
              const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays > 1) {
                  setStreak(0);
              }
          }
      };
      checkStreakContinuity();
  }, []);

  // SYSTEM NOTIFICATION TRIGGER
  const triggerNotification = useCallback((opts: { title: string, body: string }) => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
        return;
    }

    if (Notification.permission === "granted") {
        try {
            // Using ServiceWorker registration if available for mobile support, or fallback to new Notification
            if (navigator.serviceWorker && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(opts.title, {
                        body: opts.body,
                        icon: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
                    });
                });
            } else {
                new Notification(opts.title, {
                    body: opts.body,
                    icon: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
                });
            }
        } catch(e) { console.error("Notification trigger failed", e); }
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                new Notification(opts.title, {
                    body: opts.body,
                    icon: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
                });
            }
        });
    }
  }, []);

  // STREAK UPDATE LOGIC
  useEffect(() => {
      const updateDailyStreak = () => {
          if (tasks.length === 0) return;

          const allCompleted = tasks.every(t => t.completed);
          const todayStr = new Date().toISOString().split('T')[0];

          if (allCompleted) {
              if (lastStreakDate !== todayStr) {
                  setStreak(prev => prev + 1);
                  setLastStreakDate(todayStr);
                  triggerNotification({ title: "🔥 Streak Increased!", body: "All tasks done! Keep the fire burning!" });
              }
          } else {
              if (lastStreakDate === todayStr) {
                  setStreak(prev => Math.max(0, prev - 1));
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setLastStreakDate(yesterday.toISOString().split('T')[0]);
              }
          }
      };
      updateDailyStreak();
  }, [tasks, lastStreakDate, triggerNotification]); 

  // DEADLINE LOGIC
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      let updated = false;

      const newTasks = tasks.map(task => {
        if (!task.dueDate || !task.dueTime || task.completed) return task;

        // PRECISE DATE PARSING (Local Time)
        const [year, month, day] = task.dueDate.split('-').map(Number);
        const [hours, minutes] = task.dueTime.split(':').map(Number);
        
        // Create date object for the deadline in LOCAL time
        const deadline = new Date(year, month - 1, day, hours, minutes, 0);

        const diffMs = deadline.getTime() - now.getTime();
        const diffMins = diffMs / (1000 * 60);

        // CASE 1: 5-Minute Warning (0 < remaining <= 5)
        if (diffMins > 0 && diffMins <= 5 && !task.notificationSent) {
            triggerNotification({ 
                title: "⏳ Hurry Up!", 
                body: `"${task.title}" is due in 5 minutes!`
            });
            updated = true;
            return { ...task, notificationSent: true };
        }

        // CASE 2: Overdue (Time Passed)
        if (diffMs < 0 && !task.overdueNotificationSent) {
             triggerNotification({ 
                title: "⏰ Time's Up!", 
                body: `You missed the deadline for "${task.title}".`
            });
            updated = true;
            return { ...task, overdueNotificationSent: true };
        }

        return task;
      });

      if (updated) {
        setTasks(newTasks);
      }
    };

    const interval = setInterval(checkDeadlines, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [tasks, triggerNotification]);

  const handleTestNotification = useCallback(async () => {
      if (!("Notification" in window)) {
          alert("This browser does not support system notifications.");
          return;
      }

      let permission = Notification.permission;
      if (permission === "default") {
          permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
          triggerNotification({ title: "🔔 Test Notification", body: "System notifications are active and working!" });
      } else {
          alert("Notifications are blocked. Please enable them in your browser settings.");
      }
  }, [triggerNotification]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
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
    setTasks(prev => prev.map(t => {
        if (t.id === id) {
            return { ...t, completed: !t.completed };
        }
        return t;
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSave = useCallback((taskData: Partial<Task>) => {
      setTasks(prevTasks => {
          if (editingTask) {
              return prevTasks.map(t => t.id === editingTask.id ? { ...t, ...taskData, notificationSent: false, overdueNotificationSent: false } as Task : t);
          } else {
              const newTask: Task = {
                id: Math.random().toString(36).substr(2, 9),
                title: taskData.title || '',
                description: taskData.description || '',
                category: taskData.category as Category,
                priority: taskData.priority as Priority,
                completed: false,
                dueDate: taskData.dueDate,
                dueTime: taskData.dueTime,
                notificationSent: false,
                overdueNotificationSent: false,
                streakPenalized: false,
                createdAt: Date.now(),
              };
              return [newTask, ...prevTasks];
          }
      });
      setEditingTask(null);

      // Request permission on first task creation if needed
      if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
      }
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
      <Header 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onTestNotification={handleTestNotification}
      />

      <div className="space-y-5 sm:space-y-8 flex-shrink-0">
        <DynamicDashboard stats={stats} streak={streak} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <CategoryFilter selected={filterCategory} onSelect={setFilterCategory} />
      </div>

      <TaskList 
        tasks={filteredTasks} 
        onToggle={toggleTask} 
        onDelete={deleteTask} 
        onEdit={setEditingTask} 
      />

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