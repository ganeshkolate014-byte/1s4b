
import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { Zap, Shield, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-sm w-full"
      >
        <GlassCard className="p-8 text-center bg-white/10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center">
              <Sparkles size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">LiquidGlass</h1>
          <p className="text-white/60 mb-8">Minimalist, fluid, and powerful task management for your daily flow.</p>
          
          <div className="space-y-6 text-left mb-10">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Zap size={20} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Swift Actions</h3>
                <p className="text-white/40 text-sm">Swipe left on tasks to instantly delete them from your list.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Shield size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Prioritize Life</h3>
                <p className="text-white/40 text-sm">Set priorities and categories to focus on what truly matters.</p>
              </div>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-transform active:scale-95"
          >
            Get Started
          </button>
        </GlassCard>
      </motion.div>
    </div>
  );
};
