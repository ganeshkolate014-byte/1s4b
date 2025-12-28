import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, LogOut, CheckCircle, Send, ShieldCheck, ChevronRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { reloadUser, sendVerificationEmailToUser, logoutUser } from '../utils/firebase';

interface VerificationScreenProps {
  user: User;
  onVerified: () => void;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({ user, onVerified }) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-check every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedUser = await reloadUser();
      if (updatedUser?.emailVerified) {
        onVerified();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [onVerified]);

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      const updatedUser = await reloadUser();
      if (updatedUser?.emailVerified) {
        onVerified();
      } else {
        setError("Not verified yet. Check your inbox.");
      }
    } catch (e) {
      setError("Unable to verify status.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendVerificationEmailToUser();
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (e: any) {
      if (e.code === 'auth/too-many-requests') {
        setError("Please wait before resending.");
      } else {
        setError("Failed to send email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black font-['Plus_Jakarta_Sans'] overflow-hidden text-white"
    >
      <div className="relative z-10 w-full max-w-[380px] p-6 flex flex-col justify-center min-h-screen">
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 180, damping: 24 }}
          className="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          {/* Monochrome Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-zinc-500/10 blur-[60px] pointer-events-none" />

          {/* Icon */}
          <div className="flex justify-center mb-8 relative z-10">
            <div className="relative group">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-black shadow-[0_10px_40px_-10px_rgba(255,255,255,0.2)] rotate-3 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105">
                <Mail size={42} strokeWidth={1.5} />
                </div>
            </div>
          </div>

          <div className="text-center mb-8 relative z-10">
            <h1 className="text-2xl font-bold mb-3 tracking-tight text-white">Verify Email</h1>
            <p className="text-zinc-400 text-[15px] leading-relaxed">
              We sent a secure link to
              <br />
              <span className="text-white font-semibold mt-1 inline-block border-b border-zinc-700 pb-0.5">
                {user.email}
              </span>
            </p>
          </div>

          <div className="space-y-3 relative z-10">
            <button
              onClick={handleCheckVerification}
              disabled={loading}
              className="w-full h-14 bg-white text-black rounded-2xl font-bold text-[15px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <>I've Verified <ChevronRight size={18} /></>
              )}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={loading || emailSent}
              className="w-full h-14 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 text-white rounded-2xl font-semibold text-[15px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {emailSent ? (
                <><CheckCircle size={18} className="text-green-400" /> Sent</>
              ) : (
                <>Resend Email <Send size={16} /></>
              )}
            </button>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-400 text-xs font-medium mt-6 bg-red-500/10 py-2 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.p>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button 
                onClick={() => logoutUser()}
                className="text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
            >
                <LogOut size={12} /> Use different account
            </button>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
};