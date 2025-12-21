
import React, { useState, useEffect, memo } from 'react';
import { CloudSun, Sun, Flame } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { motion } from 'framer-motion';

interface DynamicDashboardProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
  };
}

export const DynamicDashboard: React.FC<DynamicDashboardProps> = memo(({ stats }) => {
  const completionRate = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  // Time State for Clock and Greeting
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  let timeOfDay = 'Morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
  else if (hour >= 17 && hour < 22) timeOfDay = 'Evening';
  else if (hour >= 22 || hour < 5) timeOfDay = 'Night';

  // Mock Streak Data
  const streakDays = 5;

  return (
    <GlassCard className="w-full mb-5 !p-0">
        <div className="relative p-5 sm:p-7 overflow-hidden group">
            
            <div className="relative z-10 flex justify-between items-end mb-6 sm:mb-8 gap-2">
                <div className="flex flex-col gap-1">
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none transition-colors"
                    >
                        <span className="text-zinc-500 dark:text-white/60">Good</span> {timeOfDay}.
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[13px] font-medium text-zinc-500 dark:text-white/50 transition-colors"
                    >
                        {stats.pending === 0 && stats.total > 0 ? "You're all caught up." : "Let's make it happen."}
                    </motion.p>
                </div>

                {/* Minimal Percentage Display */}
                <div className="text-right shrink-0">
                    <motion.span 
                        key={completionRate}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter block transition-colors"
                    >
                        {completionRate}%
                    </motion.span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40 transition-colors">Done</span>
                </div>
            </div>

            {/* Widgets Row */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                
                {/* Widget 1: Streak */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden transition-colors h-20 sm:h-24"
                >
                   <div className="flex items-center gap-2 relative z-10">
                        <Flame size={14} className="text-orange-500 dark:text-orange-400 sm:w-4 sm:h-4" />
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/50">Streak</span>
                   </div>
                   
                   <div className="relative z-10">
                       <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white block flex items-center gap-2">
                           {streakDays} Days
                       </span>
                       <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-white/40 font-medium block mt-0.5 truncate">
                           Keep it up.
                       </span>
                   </div>
                </motion.div>

                {/* Widget 2: Weather */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden transition-colors h-20 sm:h-24"
                >
                    <div className="flex items-center gap-2 relative z-10">
                        <CloudSun size={14} className="text-amber-500 dark:text-yellow-400 sm:w-4 sm:h-4" />
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/50">
                            Now
                        </span>
                    </div>
                    
                    <div className="flex items-end justify-between relative z-10">
                       <div>
                           <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white block">24°</span>
                           <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-white/40 font-medium">Clear Sky</span>
                       </div>
                       <Sun size={18} className="text-amber-500 dark:text-yellow-400 mb-0.5 sm:w-5 sm:h-5" />
                    </div>
                </motion.div>

            </div>
        </div>
    </GlassCard>
  );
});
