import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Power, RefreshCw, Save, Image as ImageIcon, Link as LinkIcon, Send, Sparkles, Check, Upload, ExternalLink, Eye } from 'lucide-react';
import { db, doc, setDoc } from '../firebase';
import { toast } from 'react-hot-toast';

interface AnnouncementBannerAdminSectionProps {
  appConfig: any;
  setAppConfig: React.Dispatch<React.SetStateAction<any>>;
}

export function AnnouncementBannerAdminSection({ appConfig, setAppConfig }: AnnouncementBannerAdminSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Extract banner state or fallback defaults
  const banner = appConfig?.announcementBanner || {
    enabled: true,
    version: Date.now(),
    title: 'Join Our Official Telegram Channel! 🚀',
    description: 'Get the latest updates, news, and exclusive offers — all in one place!',
    imageUrl: 'https://i.postimg.cc/FHYff3bQ/59ccd73e-cacb-477b-956a-045a348ff838.png',
    buttonText: 'Join Now',
    buttonUrl: 'https://t.me/Bivaax_Official',
    actionType: 'external_link',
    allowClose: true,
    theme: 'blue'
  };

  const updateBannerState = (updates: Partial<typeof banner>) => {
    const newBanner = { ...banner, ...updates };
    setAppConfig((prev: any) => ({
      ...prev,
      announcementBanner: newBanner
    }));
    return newBanner;
  };

  const saveToDatabase = async (bannerObj: any, alertMessage?: string) => {
    setIsSaving(true);
    try {
      const updatedConfig = {
        ...appConfig,
        announcementBanner: bannerObj
      };

      // 1. Save to PostgreSQL app_settings via API
      try {
        await fetch('/api/app_config/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ announcementBanner: bannerObj })
        });
      } catch (apiErr) {
        console.warn('API save for announcementBanner failed:', apiErr);
      }

      // 2. Save directly to Firestore doc app_config/settings
      await setDoc(doc(db, 'app_config', 'settings'), { announcementBanner: bannerObj }, { merge: true });

      setAppConfig(updatedConfig);
      toast.success(alertMessage || 'Announcement banner settings updated!');
    } catch (err: any) {
      console.error('Failed to save announcement banner:', err);
      toast.error('Failed to save banner settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    const newStatus = !banner.enabled;
    const updates: any = { enabled: newStatus };
    
    // If turning ON, generate a new version timestamp so ALL users will see it ONCE during this ON session
    if (newStatus) {
      updates.version = Date.now();
    }

    const updated = updateBannerState(updates);
    await saveToDatabase(
      updated,
      newStatus
        ? '📢 Announcement Banner turned ON! All users will see this banner ONCE.'
        : '🔴 Announcement Banner turned OFF!'
    );
  };

  const handleForceResetForUsers = async () => {
    const newVersion = Date.now();
    const updated = updateBannerState({ version: newVersion });
    await saveToDatabase(
      updated,
      '🔄 Reset successful! Banner version updated. All users will see the banner ONCE again.'
    );
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            folder: 'announcement_banners',
            publicIdPrefix: 'banner_' + Date.now()
          })
        });

        const data = await res.json();
        if (data.url) {
          updateBannerState({ imageUrl: data.url });
          toast.success('Banner image uploaded successfully!');
        } else if (data.secure_url) {
          updateBannerState({ imageUrl: data.secure_url });
          toast.success('Banner image uploaded successfully!');
        } else {
          toast.error('Failed to upload image');
        }
      } catch (err: any) {
        toast.error('Error uploading file: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const themes = [
    { id: 'gold', name: 'Luxury Gold', color: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black' },
    { id: 'blue', name: 'Cyber Blue', color: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' },
    { id: 'emerald', name: 'Emerald Green', color: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black' },
    { id: 'purple', name: 'Neon Purple', color: 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white' },
    { id: 'red', name: 'Crimson Red', color: 'bg-gradient-to-r from-red-600 to-rose-500 text-white' }
  ];

  return (
    <div className="bg-[#0a0a0f] border border-[#1a1a24] p-6 lg:p-10 rounded-[40px] space-y-8 relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1a1a24] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Megaphone size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-wide">
              GLOBAL ANNOUNCEMENT POPUP BANNER
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              অ্যাডমিন থেকে অন করলে সব ইউজারকে ১ বার করে ব্যানার পপআপ দেখাবে। অফ করে অন করলে আবার দেখাবে।
            </p>
          </div>
        </div>

        {/* Live / Offline Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 border ${
            banner.enabled 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${banner.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {banner.enabled ? 'STATUS: LIVE (সক্রিয়)' : 'STATUS: OFFLINE (বন্ধ)'}
          </div>
        </div>
      </div>

      {/* Primary Action Controls (ON/OFF & Reset) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#12131b] p-6 rounded-3xl border border-[#1f202e]">
        {/* Toggle ON / OFF */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">1. BANNER STATUS (অন/অফ সুইচ)</span>
          <button
            onClick={handleToggleActive}
            disabled={isSaving}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] ${
              banner.enabled
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
            }`}
          >
            <Power size={18} />
            <span>{banner.enabled ? 'TURN OFF BANNER (বন্ধ করুন)' : 'TURN ON BANNER (অন করুন)'}</span>
          </button>
          <p className="text-[11px] text-gray-400 text-center">
            {banner.enabled 
              ? 'অন আছে: ইউজাররা সাইটে আসলে ১ বার ব্যানারটি দেখতে পাবে।' 
              : 'অফ করা থাকলে কোনো ইউজার ব্যানারটি দেখতে পাবে না।'}
          </p>
        </div>

        {/* Force Reset / Re-trigger for All Users */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">2. RE-TRIGGER FOR ALL USERS (পুনরায় দেখান)</span>
          <button
            onClick={handleForceResetForUsers}
            disabled={isSaving}
            className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
          >
            <RefreshCw size={18} className={isSaving ? 'animate-spin' : ''} />
            <span>RESET & SHOW AGAIN TO ALL USERS</span>
          </button>
          <p className="text-[11px] text-gray-400 text-center">
            অফ না করেও ব্যানার আবার সব ইউজারকে নতুন করে ১ বার দেখাতে চাইলে এই বাটনে চাপ দিন।
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Fields */}
        <div className="space-y-5">
          {/* Banner Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Banner Title (শিরোনাম)</span>
            </label>
            <input
              type="text"
              value={banner.title || ''}
              onChange={(e) => updateBannerState({ title: e.target.value })}
              placeholder="e.g. Join Our Official Telegram Channel! 🚀"
              className="w-full bg-[#13141d] border border-[#1f202e] rounded-2xl px-5 py-3.5 text-sm font-medium text-white focus:border-amber-500 outline-none transition-all"
            />
          </div>

          {/* Banner Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Banner Message / Description (মেসেজ বা বিবরণ)
            </label>
            <textarea
              rows={3}
              value={banner.description || ''}
              onChange={(e) => updateBannerState({ description: e.target.value })}
              placeholder="e.g. আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করে দৈনন্দিন ফ্রি সিগন্যাল ও প্রফেশনাল আপডেট পান।"
              className="w-full bg-[#13141d] border border-[#1f202e] rounded-2xl px-5 py-3.5 text-sm font-medium text-white focus:border-amber-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Banner Image URL & File Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
              <span>Banner Image URL (ছবি লিংক বা আপলোড)</span>
              {isUploading && <span className="text-amber-400 text-[11px] animate-pulse">Uploading...</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={banner.imageUrl || ''}
                onChange={(e) => updateBannerState({ imageUrl: e.target.value })}
                placeholder="https://i.postimg.cc/your_image.jpg"
                className="w-full bg-[#13141d] border border-[#1f202e] rounded-2xl px-5 py-3.5 text-sm font-medium text-white focus:border-amber-500 outline-none transition-all"
              />
              <label className="px-5 py-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap">
                <Upload size={16} />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Action Button Text & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Button Text (বাটনের নাম)
              </label>
              <input
                type="text"
                value={banner.buttonText || ''}
                onChange={(e) => updateBannerState({ buttonText: e.target.value })}
                placeholder="e.g. Join Telegram Channel"
                className="w-full bg-[#13141d] border border-[#1f202e] rounded-2xl px-5 py-3.5 text-sm font-medium text-white focus:border-amber-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Action Link URL (বাটন লিংক)
              </label>
              <input
                type="text"
                value={banner.buttonUrl || ''}
                onChange={(e) => updateBannerState({ buttonUrl: e.target.value })}
                placeholder="e.g. https://t.me/bivaax_official"
                className="w-full bg-[#13141d] border border-[#1f202e] rounded-2xl px-5 py-3.5 text-sm font-medium text-white focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Theme Accent Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Theme Style (পপআপ ডিজাইন থিম)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updateBannerState({ theme: t.id as any })}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                    banner.theme === t.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-[#1f202e] bg-[#13141d] text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{t.name}</span>
                  {banner.theme === t.id && <Check size={14} className="text-amber-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Close Button Setting */}
          <div className="flex items-center justify-between bg-[#13141d] p-4 rounded-2xl border border-[#1f202e]">
            <span className="text-xs font-bold text-gray-300">Allow User to Close / Dismiss Popup</span>
            <button
              type="button"
              onClick={() => updateBannerState({ allowClose: banner.allowClose === false ? true : false })}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                banner.allowClose !== false ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
              }`}
            >
              {banner.allowClose !== false ? 'ENABLED (অন)' : 'DISABLED (অফ)'}
            </button>
          </div>
        </div>

        {/* Live Admin Preview */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Eye size={16} className="text-amber-400" />
            <span>LIVE USER PREVIEW (ইউজাররা যেভাবে দেখতে পাবে)</span>
          </label>

          <div className="bg-[#08080c] border border-[#1f202e] p-6 rounded-[32px] flex items-center justify-center min-h-[420px] relative overflow-hidden">
            <div className="w-full max-w-sm bg-[#0d0e12] border border-amber-500/30 rounded-[28px] overflow-hidden shadow-2xl relative">
              {/* Header Image */}
              {banner.imageUrl ? (
                <div className="w-full h-40 overflow-hidden bg-[#151720] relative">
                  <img
                    src={banner.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-transparent to-transparent" />
                </div>
              ) : (
                <div className="pt-6 px-4 flex justify-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Megaphone size={20} />
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-5 space-y-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Sparkles size={11} />
                  ANNOUNCEMENT
                </span>
                <h4 className="text-base font-black text-white leading-tight">
                  {banner.title || 'Banner Title'}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {banner.description || 'Banner Description text goes here...'}
                </p>
                {banner.buttonText && (
                  <div className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg ${
                    themes.find(t => t.id === banner.theme)?.color || themes[0].color
                  }`}>
                    <span>{banner.buttonText}</span>
                    <ExternalLink size={14} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-[#1a1a24]">
        <button
          onClick={() => saveToDatabase(banner, '✅ All banner settings saved and published successfully!')}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Save size={18} />
          <span>{isSaving ? 'SAVING CHANGES...' : 'SAVE & PUBLISH ALL BANNER SETTINGS'}</span>
        </button>
      </div>
    </div>
  );
}
