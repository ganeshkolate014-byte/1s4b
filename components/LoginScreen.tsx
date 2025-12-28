import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Loader2, ArrowRight, AlertCircle, Mail, Lock, UserPlus, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser, loginWithGoogle, sendVerificationEmailToUser } from '../utils/firebase';
import { AnimationType } from '../types';

interface LoginScreenProps {
    onContinueAsGuest: () => void;
    animationType?: AnimationType;
}

type AuthMode = 'signin' | 'signup';

// Staggered Container Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            staggerChildren: 0.1,
            delayChildren: 0.1,
            when: "beforeChildren"
        }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

// Child Item Variants
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 } 
    }
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsGuest, animationType = 'flow' }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
        setError("Please fill in all fields");
        return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    
    setLoading(true);

    try {
        if (mode === 'signin') {
            await loginUser(email, password);
        } else {
            const user = await registerUser(email, password);
            if (user && !user.emailVerified) {
                // Send verification email immediately after signup
                await sendVerificationEmailToUser();
            }
        }
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            setError('Email is already registered.');
        } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
             setError('Invalid email or password.');
        } else if (err.code === 'auth/weak-password') {
             setError('Password should be at least 6 characters.');
        } else {
            setError(err.message || "Authentication failed.");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setLoading(true);
      setError(null);
      try {
          await loginWithGoogle();
      } catch (err: any) {
          setError("Google Sign-In failed.");
      } finally {
          setLoading(false);
      }
  };

  const toggleMode = (newMode: AuthMode) => {
      setMode(newMode);
      setError(null);
      setConfirmPassword('');
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black font-['Plus_Jakarta_Sans'] overflow-hidden text-white bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-purple-900/20"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 w-full max-w-[400px] p-8 flex flex-col justify-center min-h-screen transform-gpu"
      >
        <div className="w-full">
            {/* 1. Header Section */}
            <motion.div variants={itemVariants} className="mb-10 h-[100px] flex flex-col justify-center relative">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={mode}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-0 left-0 w-full"
                    >
                        <h1 className="text-5xl font-bold tracking-tighter leading-[1.1] mb-3 text-white">
                            {mode === 'signin' ? <>Welcome<br/>Back.</> : <>Create<br/>Account.</>}
                        </h1>
                        <p className="text-zinc-400 font-medium text-[15px]">
                            {mode === 'signin' ? 'Sign in to continue your flow.' : 'Join us and start organizing.'}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* 2. Feedback Messages */}
            <motion.div variants={itemVariants} layout className="mb-4 relative min-h-[10px]">
                <AnimatePresence mode="popLayout">
                    {error && (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex flex-col gap-3 mb-4"
                        >
                             <div className="flex items-center gap-2 text-rose-400 text-sm font-medium px-1">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4 relative">
                {/* 3. Input Fields */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                            <Mail size={20} />
                        </div>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 h-14 rounded-2xl pl-12 pr-4 outline-none text-white placeholder-zinc-600 font-medium border border-white/5 focus:border-white/20 focus:bg-white/10 transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                            <Lock size={20} />
                        </div>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 h-14 rounded-2xl pl-12 pr-4 outline-none text-white placeholder-zinc-600 font-medium border border-white/5 focus:border-white/20 focus:bg-white/10 transition-all"
                        />
                    </div>

                    <AnimatePresence initial={false}>
                        {mode === 'signup' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <input 
                                        type="password" 
                                        placeholder="Confirm Password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/5 h-14 rounded-2xl pl-12 pr-4 outline-none text-white placeholder-zinc-600 font-medium border border-white/5 focus:border-white/20 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* 4. Action Buttons */}
                <motion.div variants={itemVariants} className="pt-4 space-y-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-white text-black rounded-full font-bold text-[16px] tracking-wide hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin text-black" size={20} />
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                                {mode === 'signin' ? <ArrowRight size={18} /> : <UserPlus size={18} />}
                            </div>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full h-14 bg-white text-zinc-800 border border-zinc-200 rounded-full font-bold text-[15px] tracking-wide hover:bg-zinc-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                </motion.div>
            </form>

            {/* 5. Footer Links */}
            <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center gap-6">
                <button 
                    onClick={() => toggleMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                    {mode === 'signin' ? (
                        <span>New user? <span className="text-white font-bold">Create account</span></span>
                    ) : (
                        <span>Has account? <span className="text-white font-bold">Log in</span></span>
                    )}
                </button>
                
                <button 
                    onClick={onContinueAsGuest}
                    className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-[0.2em]"
                >
                    Continue as Guest
                </button>
            </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};