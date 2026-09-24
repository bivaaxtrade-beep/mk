import React, { useState } from 'react';
import { ShieldCheck, Smartphone, QrCode, KeyRound, CheckCircle2, ArrowRight, ExternalLink, Shield, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface TwoFaTutorialProps {
  onClose?: () => void;
}

export function TwoFaTutorial({ onClose }: TwoFaTutorialProps) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: "Download Authenticator App",
      desc: "Install Google Authenticator, Authy, or Microsoft Authenticator on your mobile device from the App Store or Google Play Store.",
      icon: Smartphone,
      diagram: (
        <div className="bg-[#0b0e14] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f0b90b]/10 text-[#f0b90b] flex items-center justify-center shadow-lg">
            <Smartphone size={32} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Google Authenticator / Authy</div>
            <div className="text-[10px] text-gray-400 mt-1">Available for iOS & Android</div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-gray-300">App Store</span>
            <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-gray-300">Google Play</span>
          </div>
        </div>
      )
    },
    {
      num: 2,
      title: "Navigate to Profile Security",
      desc: "Go to your Account Settings -> Security tab. Locate the 'Google Authenticator (2FA)' section to initiate setup.",
      icon: Shield,
      diagram: (
        <div className="bg-[#0b0e14] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Profile &gt; Security Settings</div>
            <div className="text-[10px] text-emerald-400 mt-1">Two-Factor Authentication (2FA)</div>
          </div>
          <button 
            onClick={() => navigate('/profile/info')}
            className="px-4 py-2 bg-emerald-500 text-black font-black text-[11px] uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5"
          >
            <span>Open Profile Settings</span> <ExternalLink size={12} />
          </button>
        </div>
      )
    },
    {
      num: 3,
      title: "Scan the Secret QR Code",
      desc: "Open your authenticator app and tap '+' or 'Add Account'. Scan the QR code displayed on your screen or enter the setup key manually.",
      icon: QrCode,
      diagram: (
        <div className="bg-[#0b0e14] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-24 h-24 bg-white p-3 rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-full h-full border-4 border-black border-dashed rounded-lg flex items-center justify-center bg-gray-50">
              <QrCode size={48} className="text-black" />
            </div>
          </div>
          <div className="text-[10px] font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-lg">
            JBSWY3DPEHPK3PXP
          </div>
        </div>
      )
    },
    {
      num: 4,
      title: "Enter 6-Digit Verification Code",
      desc: "Type the rotating 6-digit verification code from your authenticator app into the confirmation box to complete activation.",
      icon: KeyRound,
      diagram: (
        <div className="bg-[#0b0e14] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex gap-2">
            {['4', '8', '2', '9', '1', '5'].map((digit, idx) => (
              <div key={idx} className="w-10 h-12 bg-white/5 border border-[#f0b90b]/40 rounded-xl flex items-center justify-center text-lg font-black text-[#f0b90b] shadow-md">
                {digit}
              </div>
            ))}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 size={14} /> 2FA Protection Enabled Successfully
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-[#12161c] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0b90b]/10 border border-[#f0b90b]/30 text-[#f0b90b] text-[10px] font-black uppercase tracking-widest mb-2">
            <Lock size={12} /> Security Tutorial
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Two-Factor Authentication (2FA) Guide</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Protect your trading account and withdrawals with bank-grade 2FA security.</p>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="self-start sm:self-auto p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {/* Steps Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => setActiveStep(s.num)}
            className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
              activeStep === s.num 
                ? 'bg-[#f0b90b]/10 border-[#f0b90b] shadow-[0_0_15px_rgba(240,185,11,0.15)]' 
                : 'bg-[#0b0e14] border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                activeStep === s.num ? 'bg-[#f0b90b] text-black' : 'bg-white/5 text-gray-400'
              }`}>
                0{s.num}
              </span>
              <s.icon size={18} className={activeStep === s.num ? 'text-[#f0b90b]' : 'text-gray-500'} />
            </div>
            <div className="text-xs font-black text-white line-clamp-1">{s.title}</div>
          </button>
        ))}
      </div>

      {/* Active Step Content & Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#0b0e14]/50 border border-white/5 rounded-3xl p-6 sm:p-8">
        <div className="md:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase text-gray-400 tracking-wider">
            Step {activeStep} of 4
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">{steps[activeStep - 1].title}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {steps[activeStep - 1].desc}
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button 
              onClick={() => navigate('/profile/info')}
              className="px-6 py-3.5 bg-[#f0b90b] hover:bg-[#d9a508] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#f0b90b]/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Setup 2FA in Profile</span> <ExternalLink size={14} />
            </button>
            {activeStep < 4 ? (
              <button 
                onClick={() => setActiveStep(prev => prev + 1)}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all flex items-center gap-2"
              >
                <span>Next Step</span> <ArrowRight size={14} />
              </button>
            ) : (
              <button 
                onClick={() => setActiveStep(1)}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-gray-400 font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all"
              >
                Restart Guide
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-5">
          {steps[activeStep - 1].diagram}
        </div>
      </div>

      {/* Bottom Security Note */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
        <ShieldCheck size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="font-black text-amber-300 uppercase tracking-wide">Security Tip:</strong> Always save your 16-digit backup recovery key on paper in a safe place. If you lose your phone, the backup key is the only way to recover access to your trading funds.
        </div>
      </div>

    </div>
  );
}
