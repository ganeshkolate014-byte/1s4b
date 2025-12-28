import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Volume2, MoveVertical, Maximize, Wind, Eye } from 'lucide-react';
import { AnimationType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  animationType: AnimationType; // Current effective type
  setAnimationType: (type: AnimationType) => void; // NOT USED for immediate visual update anymore, passed for API compatibility if needed, but we will ignore it for this feature
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
}

const ANIMATION_OPTIONS: { id: AnimationType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'flow', label: 'Flow', icon: <MoveVertical size={18} />, desc: 'Smooth vertical fade' },
    { id: 'pop', label: 'Pop', icon: <Maximize size={18} />, desc: 'Bouncy scale effect' },
    { id: 'slide', label: 'Slide', icon: <Wind size={18} />, desc: 'Lateral entry' },
    { id: 'blur', label: 'Mist', icon: <Eye size={18} />, desc: 'Soft focus reveal' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    animationType: initialAnimationType, 
    setAnimationType, // We won't use this to trigger app re-render
    hapticsEnabled,
    setHapticsEnabled,
    soundsEnabled,
    setSoundsEnabled
}) => {

  // Local state to manage the UI selection without triggering parent re-render
  const [selectedAnim, setSelectedAnim] = useState<AnimationType>(initialAnimationType);

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
        // Read directly from storage to get the most persistent "saved" value
        const saved = localStorage.getItem('liquid_animation') as AnimationType;
        if (saved) setSelectedAnim(saved);
        else setSelectedAnim(initialAnimationType);
    }
  }, [isOpen, initialAnimationType]);

  const handleAnimSelect = (type: AnimationType) => {
      setSelectedAnim(type);
      localStorage.setItem('liquid_animation', type);
      // NOTE: We do NOT call setAnimationType(type) here. 
      // This prevents the background App from re-rendering and re-animating immediately.
      // The change will apply on next app reload or login.
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[80]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            // Smooth bezier tween instead of spring
            transition={{ type: "tween", duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center justify-end pointer-events-none"
          >
             <div className="w-full max-w-lg mx-auto pointer-events-auto">
                 <div className="bg-[#f2f2f7] dark:bg-[#000000] rounded-t-[2rem] shadow-2xl overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
                    
                    {/* Header */}
                    <div className="px-6 py-4 bg-white dark:bg-[#1c1c1e] flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">App Settings</h2>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 bg-[#f2f2f7] dark:bg-black/50">
                        
                        {/* Animation Section */}
                        <div className="space-y-3">
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">Opening Animation</span>
                            <div className="grid grid-cols-2 gap-3">
                                {ANIMATION_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleAnimSelect(opt.id)}
                                        className={`
                                            relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left
                                            ${selectedAnim === opt.id 
                                                ? 'bg-white dark:bg-[#1c1c1e] border-blue-500 ring-1 ring-blue-500 shadow-md' 
                                                : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800'}
                                        `}
                                    >
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center
                                            ${selectedAnim === opt.id ? 'bg-blue-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}
                                        `}>
                                            {opt.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{opt.label}</div>
                                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-none">{opt.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggles Section */}
                        <div className="space-y-3">
                             <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">Preferences</span>
                             <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                 
                                 {/* Haptics Toggle */}
                                 <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                             <Smartphone size={18} />
                                         </div>
                                         <span className="text-sm font-bold text-zinc-900 dark:text-white">Haptic Feedback</span>
                                     </div>
                                     <button 
                                        onClick={() => setHapticsEnabled(!hapticsEnabled)}
                                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${hapticsEnabled ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                     >
                                         <motion.div 
                                            layout 
                                            className="w-4 h-4 rounded-full bg-white shadow-sm"
                                            animate={{ x: hapticsEnabled ? 20 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                         />
                                     </button>
                                 </div>

                                 {/* Sounds Toggle */}
                                 <div className="flex items-center justify-between p-4">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                             <Volume2 size={18} />
                                         </div>
                                         <span className="text-sm font-bold text-zinc-900 dark:text-white">In-App Sounds</span>
                                     </div>
                                     <button 
                                        onClick={() => setSoundsEnabled(!soundsEnabled)}
                                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${soundsEnabled ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                     >
                                         <motion.div 
                                            layout 
                                            className="w-4 h-4 rounded-full bg-white shadow-sm"
                                            animate={{ x: soundsEnabled ? 20 : 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                         />
                                     </button>
                                 </div>
                             </div>
                        </div>

                        {/* Info Footer */}
                        <div className="text-center pb-6">
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
                                LiquidGlass v1.3 • Seamless Design
                            </p>
                        </div>
                    </div>
                 </div>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};