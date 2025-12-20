
import React, { useState, useEffect, memo } from 'react';
import { Sparkles, CloudSun, Sun, Flame, Moon } from 'lucide-react';
import { GlassCard } from './GlassCard';

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
    <GlassCard className="w-full mb-6 !p-0">
        <div className="relative p-5 sm:p-7 overflow-hidden group">
            
            <div className="relative z-10 flex justify-between items-end mb-6 sm:mb-8">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                        <span className="text-white">Good</span> {timeOfDay}.
                    </h2>
                    <p className="text-sm font-medium text-white/50">
                        {stats.pending === 0 && stats.total > 0 ? "You're all caught up." : "Let's make it happen."}
                    </p>
                </div>

                {/* Minimal Percentage Display */}
                <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter block">{completionRate}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Done</span>
                </div>
            </div>

            {/* Widgets Row */}
            <div className="grid grid-cols-2 gap-3">
                
                {/* Widget 1: Daily Streak */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-colors h-24">
                   <div className="flex items-center gap-2 relative z-10">
                        <Flame size={14} className="text-orange-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Streak</span>
                   </div>
                   
                   <div className="relative z-10">
                       <span className="text-lg font-bold text-white block flex items-center gap-2">
                           {streakDays} Days
                       </span>
                       <span className="text-[10px] text-white/40 font-medium block mt-0.5 truncate">
                           Keep the fire burning.
                       </span>
                   </div>
                </div>

                {/* Widget 2: Weather */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-colors h-24">
                    <div className="flex items-center gap-2 relative z-10">
                        <CloudSun size={14} className="text-yellow-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                            Now
                        </span>
                    </div>
                    
                    <div className="flex items-end justify-between relative z-10">
                       <div>
                           <span className="text-lg font-bold text-white block">24°</span>
                           <span className="text-[10px] text-white/40 font-medium">Clear Sky</span>
                       </div>
                       <Sun size={18} className="text-yellow-400 mb-0.5" />
                    </div>
                </div>

            </div>
        </div>
    </GlassCard>
  );
});
