import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Moon, Settings, LogOut, User as UserIcon, Camera, ChevronRight, Loader2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { uploadUserAvatar } from '../utils/firebase';

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onUserUpdate: () => void;
  guestPhoto?: string;
  onGuestPhotoUpdate?: (url: string) => void;
}

const MenuItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value?: string | React.ReactNode; 
  onClick?: () => void;
  isDestructive?: boolean;
}> = ({ icon, label, value, onClick, isDestructive }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-[#1c1c1e] active:bg-[#2c2c2e] transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-zinc-800 last:border-0"
  >
    <div className="flex items-center gap-4">
      <div className={`text-white ${isDestructive ? 'text-red-500' : ''}`}>
        {icon}
      </div>
      <span className={`text-[15px] font-medium ${isDestructive ? 'text-red-500' : 'text-white'}`}>
        {label}
      </span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-[15px] text-zinc-500">{value}</span>}
      {!value && onClick && !isDestructive && <ChevronRight size={18} className="text-zinc-600" />}
    </div>
  </button>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
    isOpen, onClose, user, isDark, toggleTheme, onLogout, onOpenSettings, onUserUpdate, guestPhoto, onGuestPhotoUpdate
}) => {
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const safeAreaTop = 'env(safe-area-inset-top)';

  const displayPhoto = user?.photoURL || guestPhoto;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const url = await uploadUserAvatar(file);
      if (user) {
        await onUserUpdate(); // Wait for app state to reflect change
      } else if (onGuestPhotoUpdate) {
        onGuestPhotoUpdate(url);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please check your connection.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input so same file can be selected again
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/80 z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "tween", duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden text-white"
          >
            {/* Header Area */}
            <div className="relative">
                {/* Full Black Header Background */}
                <div 
                    className="w-full bg-black h-48 relative overflow-hidden transition-colors duration-300"
                    style={{ paddingTop: safeAreaTop }}
                >
                    {/* Back Button */}
                    <button 
                        onClick={onClose}
                        className="absolute left-6 z-10 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white hover:bg-zinc-800 transition-all shadow-sm border border-zinc-800"
                        style={{ top: `calc(1.5rem + ${safeAreaTop})` }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                {/* Avatar Intersection */}
                <div className="relative px-6 -mt-16 mb-6 flex flex-col items-center text-center">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full p-[3px] bg-black shadow-2xl overflow-hidden border border-zinc-800 relative">
                            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 relative">
                                {uploading ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                       <Loader2 className="animate-spin text-white" size={24} />
                                    </div>
                                ) : null}
                                
                                {displayPhoto ? (
                                    <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white text-3xl font-bold">
                                        {user?.email?.[0].toUpperCase() || 'G'}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Camera Icon Badge */}
                        <>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                            <button 
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-1 right-1 w-9 h-9 bg-blue-600 rounded-full border-[3px] border-black flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
                            >
                                <Camera size={16} />
                            </button>
                        </>
                    </div>

                    <h2 className="text-2xl font-bold text-white mt-4">
                        {user?.displayName || (user ? 'User' : 'Guest')}
                    </h2>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-12 space-y-6">
                
                {/* Contact Info Block */}
                <div className="bg-[#1c1c1e] rounded-2xl p-4 shadow-sm space-y-4 border border-zinc-800">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-sm font-medium">Phone</span>
                        <span className="text-white font-medium">--</span>
                    </div>
                    <div className="w-full h-[1px] bg-zinc-800" />
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-sm font-medium">Mail</span>
                        <span className="text-white font-medium break-all text-right pl-4">
                            {user?.email || 'No email linked'}
                        </span>
                    </div>
                </div>

                {/* Settings Group */}
                <div className="rounded-2xl shadow-sm overflow-hidden border border-zinc-800">
                    <MenuItem 
                        icon={<Moon size={20} />} 
                        label="Dark mode" 
                        value={
                            <button 
                                onClick={toggleTheme}
                                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${isDark ? 'bg-white' : 'bg-zinc-600'} relative`}
                            >
                                <motion.div 
                                   layout 
                                   className={`w-4 h-4 rounded-full shadow-sm ${isDark ? 'bg-black' : 'bg-white'}`}
                                   animate={{ x: isDark ? 20 : 0 }}
                                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                        }
                    />
                    <MenuItem 
                        icon={<UserIcon size={20} />} 
                        label="Profile details" 
                        onClick={() => {}}
                    />
                </div>

                {/* App Settings */}
                <div className="rounded-2xl shadow-sm overflow-hidden border border-zinc-800">
                    <MenuItem 
                        icon={<Settings size={20} />} 
                        label="Settings" 
                        onClick={onOpenSettings}
                    />
                </div>

                {/* Logout */}
                <div className="rounded-2xl shadow-sm overflow-hidden border border-zinc-800">
                    <MenuItem 
                        icon={<LogOut size={20} />} 
                        label={user ? "Log out" : "Return to Sign In"} 
                        onClick={onLogout}
                        isDestructive
                    />
                </div>

                <div className="text-center pt-4">
                    <p className="text-xs text-zinc-600 font-medium">LiquidGlass v2.3</p>
                </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};