import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Send, Bell, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { db, doc, onSnapshot, getDoc } from '../firebase';
import { auth } from '../firebase';

export interface AnnouncementBannerData {
  enabled?: boolean;
  version?: string | number;
  title?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  actionType?: 'external_link' | 'internal_link' | 'dismiss_only';
  allowClose?: boolean;
  theme?: 'gold' | 'blue' | 'emerald' | 'purple' | 'red';
}

export function AnnouncementBannerModal() {
  const [bannerConfig, setBannerConfig] = useState<AnnouncementBannerData | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [userUid, setUserUid] = useState<string | null>(null);

  // Monitor Auth User
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUserUid(u ? u.uid : 'guest');
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time app_config/settings
  useEffect(() => {
    let unsubSnap: (() => void) | null = null;
    try {
      const docRef = doc(db, 'app_config', 'settings');
      unsubSnap = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.announcementBanner) {
              setBannerConfig(data.announcementBanner);
            } else {
              setBannerConfig(null);
            }
          }
        },
        async () => {
          // Fallback via API if Firestore snapshot fails
          try {
            const res = await fetch('/api/app_config/settings');
            if (res.ok) {
              const data = await res.json();
              if (data?.announcementBanner) {
                setBannerConfig(data.announcementBanner);
              }
            }
          } catch (err) {
            console.warn('Failed to fetch fallback settings for banner:', err);
          }
        }
      );
    } catch (e) {
      console.warn('Error setting up banner listener:', e);
    }

    return () => {
      if (unsubSnap) unsubSnap();
    };
  }, []);

  // Determine visibility based on enabled status & version seen check
  useEffect(() => {
    if (!bannerConfig || !bannerConfig.enabled || !bannerConfig.version) {
      setIsOpen(false);
      return;
    }

    const versionStr = String(bannerConfig.version);
    const uid = userUid || 'guest';
    const storageKeyUser = `bivaax_announcement_seen_${uid}_${versionStr}`;
    const storageKeyGlobal = `bivaax_announcement_seen_${versionStr}`;

    const isSeenUser = localStorage.getItem(storageKeyUser) === 'true';
    const isSeenGlobal = localStorage.getItem(storageKeyGlobal) === 'true';

    if (!isSeenUser && !isSeenGlobal) {
      // Instant display - zero lag delay
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [bannerConfig, userUid]);

  const handleDismiss = () => {
    if (!bannerConfig?.version) return;
    const versionStr = String(bannerConfig.version);
    const uid = userUid || 'guest';

    localStorage.setItem(`bivaax_announcement_seen_${uid}_${versionStr}`, 'true');
    localStorage.setItem(`bivaax_announcement_seen_${versionStr}`, 'true');
    setIsOpen(false);
  };

  const handleActionClick = () => {
    if (bannerConfig?.buttonUrl) {
      if (bannerConfig.buttonUrl.startsWith('http://') || bannerConfig.buttonUrl.startsWith('https://')) {
        window.open(bannerConfig.buttonUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = bannerConfig.buttonUrl;
      }
    }
    handleDismiss();
  };

  if (!isOpen || !bannerConfig || !bannerConfig.enabled) return null;

  const themeGradients = {
    gold: {
      border: 'border-amber-500/30 shadow-amber-500/10',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      btnBg: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300',
      accentGlow: 'from-amber-500/20 via-yellow-500/5 to-transparent'
    },
    blue: {
      border: 'border-blue-500/30 shadow-blue-500/10',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      btnBg: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400',
      accentGlow: 'from-blue-500/20 via-cyan-500/5 to-transparent'
    },
    emerald: {
      border: 'border-emerald-500/30 shadow-emerald-500/10',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-300',
      accentGlow: 'from-emerald-500/20 via-teal-500/5 to-transparent'
    },
    purple: {
      border: 'border-purple-500/30 shadow-purple-500/10',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      btnBg: 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-400',
      accentGlow: 'from-purple-500/20 via-indigo-500/5 to-transparent'
    },
    red: {
      border: 'border-red-500/30 shadow-red-500/10',
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
      btnBg: 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-red-500/20 hover:from-red-500 hover:to-rose-400',
      accentGlow: 'from-red-500/20 via-rose-500/5 to-transparent'
    }
  };

  const selectedTheme = themeGradients[bannerConfig.theme || 'gold'] || themeGradients.gold;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
        {/* Backdrop overlay click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => {
            if (bannerConfig.allowClose !== false) {
              handleDismiss();
            }
          }}
          className="fixed inset-0 bg-transparent"
        />

        {/* Full Viewport / Binomo Style Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-md md:max-w-lg bg-[#12131c] sm:rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col justify-between"
        >
          {/* Top Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-blue-500/20 via-cyan-500/5 to-transparent pointer-events-none blur-2xl" />

          {/* Floating Close Cross Button (Top Right) */}
          {bannerConfig.allowClose !== false && (
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/60 hover:bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-md active:scale-90 shadow-xl"
              title="Close"
            >
              <X size={20} />
            </button>
          )}

          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Top Banner Image Section */}
            {bannerConfig.imageUrl ? (
              <div 
                onClick={handleActionClick}
                className="relative w-full bg-[#08090f] cursor-pointer group flex-shrink-0"
              >
                <img
                  src={bannerConfig.imageUrl}
                  alt={bannerConfig.title || 'Announcement'}
                  className="w-full h-auto max-h-[55vh] sm:max-h-[48vh] object-cover sm:object-contain w-full transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12131c] via-transparent to-transparent opacity-90 pointer-events-none" />
              </div>
            ) : (
              <div className="pt-10 px-6 flex justify-center flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg">
                  <Bell size={28} />
                </div>
              </div>
            )}

            {/* Bottom Content Area (Text & Join Button) */}
            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between bg-[#12131c] relative z-10">
              <div className="space-y-3">
                {/* Title */}
                {bannerConfig.title && (
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                    {bannerConfig.title}
                  </h2>
                )}

                {/* Description */}
                {bannerConfig.description && (
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line">
                    {bannerConfig.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                {bannerConfig.buttonText && (
                  <button
                    onClick={handleActionClick}
                    className="w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider bg-[#FFE24C] hover:bg-[#ffd91a] text-black shadow-lg shadow-[#FFE24C]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                  >
                    {bannerConfig.buttonUrl?.includes('t.me') ? <Send size={20} className="fill-current text-black" /> : <ExternalLink size={20} />}
                    <span>{bannerConfig.buttonText}</span>
                    <ArrowRight size={18} />
                  </button>
                )}

                {bannerConfig.allowClose !== false && (
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-center"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
