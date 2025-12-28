
import React, { useState, useEffect, useMemo, useCallback, memo, Suspense } from 'react';
import { Task, Category, AnimationType } from './types';
import { Header } from './components/Header';
import { DynamicDashboard } from './components/DynamicDashboard';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { TaskList } from './components/TaskList';
import { sendLocalNotification, ensureServiceWorker } from './utils/notificationManager';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { BottomDock } from './components/BottomDock';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { subscribeToTasks, addTaskToCloud, updateTaskInCloud, deleteTaskFromCloud, batchUploadTasks, auth, logoutUser, reloadUser } from './utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LoginScreen } from './components/LoginScreen';
import { ProfilePage } from './components/ProfilePage';
import { VerificationScreen } from './components/VerificationScreen';

// Lazy load heavy modals to improve TTI (Time to Interactive)
const TaskModal = React.lazy(() => import('./components/TaskModal').then(module => ({ default: module.TaskModal })));
const SettingsModal = React.lazy(() => import('./components/SettingsModal').then(module => ({ default: module.SettingsModal })));

// --- Animation Factory ---
const getContainerVariants = (): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
      when: "beforeChildren",
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(10px)",
    transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
  }
});

const getItemVariants = (type: AnimationType): Variants => {
    switch (type) {
        case 'pop':
            return {
                hidden: { opacity: 0, scale: 0.8 },
                visible: { 
                    opacity: 1, 
                    scale: 1, 
                    transition: { type: 'spring', damping: 15, stiffness: 200 } 
                }
            };
        case 'slide':
            return {
                hidden: { opacity: 0, x: -30 },
                visible: { 
                    opacity: 1, 
                    x: 0, 
                    transition: { type: 'spring', damping: 20, stiffness: 150 } 
                }
            };
        case 'blur':
            return {
                hidden: { opacity: 0, filter: 'blur(8px)', scale: 1.05 },
                visible: { 
                    opacity: 1, 
                    filter: 'blur(0px)', 
                    scale: 1,
                    transition: { duration: 0.5, ease: 'easeOut' } 
                }
            };
        case 'flow':
        default:
            return {
                hidden: { opacity: 0, y: 20 },
                visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { duration: 0.5, ease: 'easeOut' } 
                }
            };
    }
};

export const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Guest Profile State (Local Storage)
  const [guestPhoto, setGuestPhoto] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('liquid_guest_photo') || undefined;
    return undefined;
  });

  // App State - Local Storage Initializer (Kept for Instant Load fallback)
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('liquid_tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load tasks from local storage", e);
            return [];
        }
    }
    return [];
  });

  const [streak, setStreak] = useState(0);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    }
    return true;
  });

  // Settings State
  const [animationType, setAnimationType] = useState<AnimationType>(() => {
      const saved = localStorage.getItem('liquid_animation');
      return (saved as AnimationType) || 'flow';
  });
  const [hapticsEnabled, setHapticsEnabled] = useState(() => localStorage.getItem('liquid_haptics') !== 'false');
  const [soundsEnabled, setSoundsEnabled] = useState(() => localStorage.getItem('liquid_sounds') !== 'false');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Computed Variants based on Settings
  const itemVariants = useMemo(() => getItemVariants(animationType), [animationType]);
  const containerVariants = useMemo(() => getContainerVariants(), []);

  const addToast = useCallback((title: string, message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, title, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initialize Service Worker
  useEffect(() => {
      ensureServiceWorker();
  }, []);

  // --- AUTH LISTENER & MIGRATION LOGIC ---
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
              // MIGRATION: Check for local tasks that belong to Guest (no userId or mismatch)
              const localTasksString = localStorage.getItem('liquid_tasks');
              if (localTasksString) {
                  try {
                      const localTasks: Task[] = JSON.parse(localTasksString);
                      // Tasks that don't have this user's ID are considered guest/local tasks
                      const tasksToMigrate = localTasks.filter(t => t.userId !== currentUser.uid);
                      
                      if (tasksToMigrate.length > 0) {
                          console.log(`Migrating ${tasksToMigrate.length} guest tasks to cloud...`);
                          await batchUploadTasks(currentUser.uid, tasksToMigrate);
                      }
                  } catch (e) {
                      console.error("Migration failed:", e);
                  }
              }

              // Create a fresh user object to ensure state updates if properties change (like emailVerified)
              setUser(currentUser ? { ...currentUser } : null);
              setIsGuest(false);
          } else {
              setUser(null);
          }
          setAuthLoading(false);
      });
      return () => unsubscribe();
  }, []);

  // --- FIRESTORE SYNC ---
  useEffect(() => {
      // Logic: If user is logged in, sync with Firestore.
      // If Guest, stay on local storage (handled by other effect).
      // Also require email verification before syncing if not guest
      if (!user || (!user.emailVerified && !isGuest)) return;

      // When switching to a user, rely on Firestore as source of truth.
      // We don't clear tasks immediately to avoid flash, but the subscription will overwrite them.
      
      const unsubscribe = subscribeToTasks(user.uid, (cloudTasks) => {
          setTasks(cloudTasks);
          // Update local cache so it's available if they refresh offline
          localStorage.setItem('liquid_tasks', JSON.stringify(cloudTasks));
      });
      return () => unsubscribe();
  }, [user]);

  // Persist Settings
  useEffect(() => localStorage.setItem('liquid_haptics', String(hapticsEnabled)), [hapticsEnabled]);
  useEffect(() => localStorage.setItem('liquid_sounds', String(soundsEnabled)), [soundsEnabled]);

  // Save tasks to local storage whenever they change (Critical for Guest Mode)
  useEffect(() => {
      // Only persist to local storage if we are in Guest mode OR as a cache for Auth user.
      localStorage.setItem('liquid_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // DAILY CHECK & STREAK LOGIC
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastCheckStr = localStorage.getItem('liquid_last_daily_check');
    const savedStreak = localStorage.getItem('liquid_streak_local');
    let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;
    if (lastCheckStr !== todayStr) {
       localStorage.setItem('liquid_last_daily_check', todayStr);
    }
    setStreak(currentStreak);
  }, []); 

  // DEADLINE NOTIFICATION LOGIC
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.dueDate || !task.dueTime || task.completed) return;
        const [year, month, day] = task.dueDate.split('-').map(Number);
        const [hours, minutes] = task.dueTime.split(':').map(Number);
        const deadline = new Date(year, month - 1, day, hours, minutes, 0);
        const diffMs = deadline.getTime() - now.getTime();
        const diffMins = diffMs / (1000 * 60);
        const notifKey5Min = `notif_5min_${task.id}`;
        const notifKeyOverdue = `notif_over_${task.id}`;

        if (diffMins > 0 && diffMins <= 5 && !sessionStorage.getItem(notifKey5Min)) {
            sendLocalNotification("⏳ Hurry Up!", `"${task.title}" is due in 5 minutes!`);
            sessionStorage.setItem(notifKey5Min, 'true');
        }
        if (diffMs < 0 && !sessionStorage.getItem(notifKeyOverdue)) {
            sendLocalNotification("⏰ Time's Up!", `You missed the deadline for "${task.title}".`);
            sessionStorage.setItem(notifKeyOverdue, 'true');
        }
      });
    };
    const interval = setInterval(checkDeadlines, 10000); 
    return () => clearInterval(interval);
  }, [tasks]);

  // THEME LOGIC
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

  const handleLogout = useCallback(async () => {
      setIsProfileOpen(false);
      await new Promise(resolve => setTimeout(resolve, 300));

      if (user) await logoutUser();
      
      setIsGuest(false);
      setUser(null);
      setTasks([]);
      localStorage.removeItem('liquid_tasks');
      
      const savedAnim = localStorage.getItem('liquid_animation') as AnimationType;
      if (savedAnim) setAnimationType(savedAnim);

  }, [user]);

  const handleUserUpdate = useCallback(async () => {
      if (auth.currentUser) {
          await auth.currentUser.reload();
          setUser({...auth.currentUser}); 
      }
  }, []);

  const handleGuestPhotoUpdate = useCallback((url: string) => {
    setGuestPhoto(url);
    localStorage.setItem('liquid_guest_photo', url);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
  }, [tasks, searchQuery, filterCategory]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    return { total, completed, pending, highPriority };
  }, [tasks]);

  const toggleTask = useCallback((id: string) => {
    if (hapticsEnabled && navigator.vibrate) navigator.vibrate(10);
    
    // Optimistic Update
    setTasks(prevTasks => {
        const task = prevTasks.find(t => t.id === id);
        if (task) {
            const newState = !task.completed;
            // Only update cloud if authenticated
            if (user) {
                updateTaskInCloud(id, { completed: newState });
            }
            return prevTasks.map(t => t.id === id ? { ...t, completed: newState } : t);
        }
        return prevTasks;
    });
  }, [hapticsEnabled, user]);

  const deleteTask = useCallback((id: string) => {
    if (hapticsEnabled && navigator.vibrate) navigator.vibrate(20);
    
    setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
    
    // Only delete from cloud if authenticated
    if (user) {
        deleteTaskFromCloud(id);
    }
    
    addToast("Deleted", "Task removed successfully", "info");
  }, [addToast, hapticsEnabled, user]);

  const handleSave = useCallback((taskData: Partial<Task>) => {
    if (hapticsEnabled && navigator.vibrate) navigator.vibrate(10);
    
    if (editingTask) {
        // Edit Task
        const updatedTask = { ...editingTask, ...taskData };
        setTasks(prevTasks => prevTasks.map(t => t.id === editingTask.id ? updatedTask : t));
        addToast('Task Updated', `"${taskData.title}" has been saved.`, 'success');
        
        if (user) {
            updateTaskInCloud(editingTask.id, taskData);
        }
    } else {
        // Create Task
        const newTask: Task = {
            id: crypto.randomUUID(),
            title: taskData.title || '',
            description: taskData.description || '',
            category: taskData.category || 'Personal',
            priority: taskData.priority || 'medium',
            completed: false,
            dueDate: taskData.dueDate,
            dueTime: taskData.dueTime,
            createdAt: Date.now(),
            userId: user ? user.uid : undefined // Attach User ID if logged in
        };
        
        setTasks(prevTasks => [newTask, ...prevTasks]);
        addToast('Task Created', `"${taskData.title}" added to list.`, 'success');
        
        if (user) {
            addTaskToCloud(user.uid, newTask);
        }
    }
    setEditingTask(null);
    setIsModalOpen(false);
  }, [editingTask, addToast, hapticsEnabled, user]);

  const handleAddTask = useCallback(() => {
    if (hapticsEnabled && navigator.vibrate) navigator.vibrate(10);
    setEditingTask(null);
    setIsModalOpen(true);
  }, [hapticsEnabled]);

  // --- RENDER LOGIC ---

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Profile Page Overlay */}
      <ProfilePage 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        user={user}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
        onOpenSettings={() => {
            setIsProfileOpen(false);
            setTimeout(() => setIsSettingsOpen(true), 300);
        }}
        guestPhoto={guestPhoto}
        onGuestPhotoUpdate={handleGuestPhotoUpdate}
      />

      <AnimatePresence mode="wait">
        {authLoading ? (
            <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-screen items-center justify-center bg-[#f2f2f7] dark:bg-black fixed inset-0 z-[200]"
            >
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                   className="w-10 h-10 border-4 border-zinc-300 dark:border-zinc-800 border-t-blue-500 rounded-full"
                />
            </motion.div>
        ) : (!user && !isGuest) ? (
            <LoginScreen 
                key="login" 
                onContinueAsGuest={() => setIsGuest(true)} 
                animationType={animationType} 
            />
        ) : (user && !user.emailVerified && !isGuest) ? (
            <VerificationScreen 
                key="verification" 
                user={user} 
                onVerified={() => {
                   // Force a local update to immediately show dashboard
                   setUser({ ...user, emailVerified: true });
                   // Also trigger a real reload to sync state
                   reloadUser(); 
                }}
            />
        ) : (
            <motion.main 
                key="dashboard"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col min-h-screen relative z-0" 
                style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}
            >
                <motion.div variants={itemVariants}>
                    <Header 
                        isDark={isDark} 
                        toggleTheme={toggleTheme} 
                        onOpenProfile={() => setIsProfileOpen(true)}
                        userPhoto={user?.photoURL || guestPhoto}
                        userInitial={user?.email?.[0] || 'G'}
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="my-6">
                   <DynamicDashboard stats={stats} streak={streak} isDark={isDark} />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4 mb-6">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                  <CategoryFilter selected={filterCategory} onSelect={setFilterCategory} />
                </motion.div>

                <motion.div variants={itemVariants} className="flex-1">
                    <TaskList 
                      tasks={filteredTasks} 
                      onToggle={toggleTask} 
                      onDelete={deleteTask}
                      onEdit={(task) => {
                          setEditingTask(task);
                          setIsModalOpen(true);
                      }}
                    />
                </motion.div>

                <Suspense fallback={null}>
                    <TaskModal 
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setEditingTask(null);
                        }}
                        onSave={handleSave}
                        editingTask={editingTask}
                    />

                    <SettingsModal 
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        animationType={animationType}
                        setAnimationType={setAnimationType}
                        hapticsEnabled={hapticsEnabled}
                        setHapticsEnabled={setHapticsEnabled}
                        soundsEnabled={soundsEnabled}
                        setSoundsEnabled={setSoundsEnabled}
                    />
                </Suspense>

                <BottomDock 
                    onAddTask={handleAddTask} 
                    onOpenSettings={() => setIsSettingsOpen(true)}
                />
            </motion.main>
        )}
      </AnimatePresence>
    </>
  );
};
