import React, { useState, useEffect, memo, useCallback } from 'react';
import { Sun, Moon, Flame, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicDashboardProps {
  stats: {
    total: number;
    completed: number;
  };
  streak?: number;
  isDark: boolean;
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning.";
    if (hour < 18) return "Good Afternoon.";
    return "Good Night.";
};

const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Heavy Rain";
    if (code >= 95) return "Thunderstorm";
    return "Clear";
};

const Widget: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-zinc-200 dark:bg-zinc-900 rounded-2xl p-4 flex-1 ${className}`}>
        {children}
    </div>
);

// Restored Complex Flame Animation
const RealisticFlame: React.FC = () => (
    <div className="relative w-5 h-5 flex items-center justify-center">
        <motion.div
            className="absolute inset-0 bg-orange-500 rounded-full"
            animate={{ scale: [1.2, 1.5, 1.3, 1.6, 1.2], opacity: [0.2, 0.3, 0.25, 0.35, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'blur(6px)' }}
        />
        <motion.div className="absolute" animate={{ y: [0, -1.5, 0.5, -1, 0], x: [0, 0.5, -0.5, 0.5, 0], scale: [1, 1.1, 0.95, 1.15, 1], opacity: [0.7, 0.9, 0.8, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}>
            <Flame className="text-transparent fill-red-500/80" size={16} />
        </motion.div>
        <motion.div className="absolute" animate={{ y: [0, -2, 1, -1.5, 0], scaleX: [1, 1.1, 0.9, 1.1, 1], scaleY: [1, 0.95, 1.05, 0.9, 1], skewX: [0, 2, -2, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
            <Flame className="text-transparent fill-orange-500" size={16} />
        </motion.div>
        <motion.div className="absolute" animate={{ scale: [1, 0.8, 1.1, 0.9, 1] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}>
            <Flame className="text-transparent fill-yellow-400" size={12} style={{ transform: 'translateY(1px)' }}/>
        </motion.div>
    </div>
);

const SkeletonLoader: React.FC = () => (
    <div className="space-y-1.5 opacity-50">
        <div className="h-6 w-12 bg-zinc-300 dark:bg-zinc-800 rounded-md animate-pulse" />
        <div className="h-3 w-20 bg-zinc-300 dark:bg-zinc-800 rounded-md animate-pulse" />
    </div>
);

const WEATHER_CACHE_KEY = 'liquid_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; 

export const DynamicDashboard: React.FC<DynamicDashboardProps> = memo(({ stats, streak = 0, isDark }) => {
  const completionRate = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  const fetchWeather = useCallback(async (force = false) => {
    if (!force) {
        try {
            const cached = localStorage.getItem(WEATHER_CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setWeather(data);
                    setLoadingWeather(false);
                    return;
                }
            }
        } catch (e) {
            console.warn("Cache read failed", e);
        }
    }

    setLoadingWeather(true);
    setWeatherError(false);

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);

                if (!weatherRes.ok) throw new Error('API request failed');

                const weatherDataRaw = await weatherRes.json();

                if (weatherDataRaw.current_weather) {
                    const finalData = {
                        temp: Math.round(weatherDataRaw.current_weather.temperature),
                        code: weatherDataRaw.current_weather.weathercode
                    };
                    setWeather(finalData);
                    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
                        data: finalData,
                        timestamp: Date.now()
                    }));
                } else {
                    throw new Error('Invalid weather data');
                }
            } catch (error) {
                console.error(error);
                setWeatherError(true);
            } finally {
                setLoadingWeather(false);
            }
        }, (error) => {
            setLoadingWeather(false);
            setWeatherError(true);
        }, { 
            timeout: 10000,
            maximumAge: 600000,
            enableHighAccuracy: false 
        });
    } else {
        setLoadingWeather(false);
        setWeatherError(true);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;

  return (
    <div className="w-full bg-zinc-100 dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 transition-colors duration-300">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">{getGreeting()}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Let's make it happen.</p>
            </div>
            <div className="text-right">
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{completionRate}%</p>
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">DONE</p>
            </div>
        </div>
        <div className="mt-4 flex gap-3 sm:gap-4">
            <Widget>
                <div className="flex items-center gap-2 mb-1">
                    <RealisticFlame />
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">STREAK</span>
                </div>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{streak} Days</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Keep it burning.</p>
            </Widget>
            <Widget>
                 <div className="flex items-center gap-2 mb-1">
                    {isNight ? <Moon className="text-zinc-900 dark:text-white" size={14} /> : <Sun className="text-amber-500" size={14} />}
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">NOW</span>
                </div>
                <div className="h-12 flex flex-col justify-center relative">
                 <AnimatePresence mode="wait">
                 {loadingWeather ? (
                    <motion.div 
                        key="loader"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <SkeletonLoader />
                    </motion.div>
                 ) : weatherError || !weather ? (
                     <motion.div 
                        key="error"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-start justify-center"
                     >
                         <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Unavailable</p>
                         <button onClick={() => fetchWeather(true)} className="flex items-center gap-1.5 text-blue-500 text-xs font-bold hover:underline">
                             <RefreshCw size={12} />
                             Retry
                         </button>
                     </motion.div>
                 ) : (
                    <motion.div
                        key="weather"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col justify-end"
                    >
                        <p className="text-xl font-bold text-zinc-900 dark:text-white leading-none">{weather.temp}°</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{getWeatherDescription(weather.code)}</p>
                    </motion.div>
                 )}
                 </AnimatePresence>
                </div>
            </Widget>
        </div>
    </div>
  );
});