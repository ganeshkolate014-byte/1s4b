import React, { useState, useEffect, memo, useCallback } from 'react';
import { Sun, Moon, Flame, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrbDashboardProps {
  stats: {
    total: number;
    completed: number;
  };
  streak?: number;
  isDark: boolean;
}

// --- Greeting Helper ---
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

// --- Weather Helpers ---
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
    <div className="space-y-1.5">
        <motion.div 
            className="h-6 w-12 bg-zinc-300 dark:bg-zinc-800 rounded-md"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
            className="h-3 w-20 bg-zinc-300 dark:bg-zinc-800 rounded-md"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
    </div>
);

const WEATHER_CACHE_KEY = 'liquid_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000;

export const OrbDashboard: React.FC<OrbDashboardProps> = memo(({ stats, streak = 0, isDark }) => {
  const completionRate = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
  const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;

  const [weather, setWeather] = useState<{ temp: number; code: number; city: string } | null>(null);
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
        } catch (e) { console.warn(e); }
    }

    setLoadingWeather(true);
    setWeatherError(false);
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                
                // Parallel fetch for speed
                const [weatherRes, cityRes] = await Promise.all([
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`),
                    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                ]);

                if (!weatherRes.ok || !cityRes.ok) throw new Error('API request failed');
                
                const weatherData = await weatherRes.json();
                const cityData = await cityRes.json();

                if (weatherData.current_weather) {
                    const finalData = { 
                        temp: Math.round(weatherData.current_weather.temperature), 
                        code: weatherData.current_weather.weathercode,
                        city: cityData.city || cityData.locality || "Your Location"
                    };
                    setWeather(finalData);
                    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ data: finalData, timestamp: Date.now() }));
                }
                else throw new Error('Invalid weather data');
            } catch (error) { 
                console.error("Weather error:", error);
                setWeatherError(true); 
            } 
            finally { setLoadingWeather(false); }
        }, (error) => { 
            console.error("Geolocation error:", error.message);
            setLoadingWeather(false); 
            setWeatherError(true); 
        }, { 
            timeout: 15000, 
            maximumAge: 600000,
            enableHighAccuracy: false
        });
    } else { setLoadingWeather(false); setWeatherError(true); }
  }, []);

  useEffect(() => { fetchWeather() }, [fetchWeather]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 200 } }
  };
  const CIRCLE_RADIUS = 40;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full bg-zinc-100 dark:bg-[#1c1c1e] rounded-3xl p-5 sm:p-6 transition-colors duration-300 flex flex-col gap-5"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">{getGreeting()}</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Let's make it happen.</p>
      </motion.div>
      
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <motion.div variants={itemVariants} className="col-span-2 bg-zinc-200 dark:bg-zinc-900 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">PROGRESS</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{stats.completed} / {stats.total} Tasks</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">Keep up the good work!</span>
            </div>
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={CIRCLE_RADIUS} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-zinc-300 dark:text-zinc-800" />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r={CIRCLE_RADIUS}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={CIRCLE_CIRCUMFERENCE}
                        initial={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE }}
                        animate={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - completionRate / 100) }}
                        transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                        className="text-blue-500"
                    />
                </svg>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{completionRate}%</span>
            </div>
        </motion.div>

        <div className="col-span-1 flex flex-col gap-3 sm:gap-4">
            <motion.div variants={itemVariants} className="bg-zinc-200 dark:bg-zinc-900 rounded-2xl p-3 flex-1 flex flex-col items-center justify-center text-center">
                <RealisticFlame />
                <span className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{streak}</span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">DAY STREAK</span>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-zinc-200 dark:bg-zinc-900 rounded-2xl p-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                    {isNight ? <Moon className="text-zinc-900 dark:text-white" size={16} /> : <Sun className="text-amber-500" size={16} />}
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">NOW</span>
                </div>
                 <AnimatePresence mode="wait">
                    {loadingWeather ? (
                        <motion.div key="loader" exit={{ opacity: 0 }}><SkeletonLoader /></motion.div>
                    ) : weatherError || !weather ? (
                         <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start">
                             <span className="text-xs text-zinc-500 dark:text-zinc-400">Failed</span>
                             <button onClick={() => fetchWeather(true)} className="text-blue-500 text-xs font-bold hover:underline">
                                 Retry
                             </button>
                         </motion.div>
                    ) : (
                        <motion.div 
                            key="data" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="text-left flex flex-col justify-end h-full pt-2"
                        >
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5 truncate w-full block">
                                {weather.city}
                            </span>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white leading-none">{weather.temp}°</p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{getWeatherDescription(weather.code)}</p>
                        </motion.div>
                    )}
                 </AnimatePresence>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
});