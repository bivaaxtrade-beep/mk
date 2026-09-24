import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  withBackground?: boolean;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 28, withBackground = false, color }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [triedLocal, setTriedLocal] = useState(false);

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-lg shrink-0 bg-[#121316] ${withBackground ? 'p-1 border border-white/10 shadow-sm' : ''} ${className}`} 
      style={{ width: size, height: size }}
    >
      {!imgFailed ? (
        <img 
          src={triedLocal ? "/logo.png" : "https://i.postimg.cc/6p1dmLjB/IMG-20260822-005000-661.jpg"} 
          alt="Bivaax Trade Logo" 
          className="w-full h-full object-cover scale-[1.68] select-none pointer-events-none"
          referrerPolicy="no-referrer"
          loading="eager"
          onError={() => {
            if (!triedLocal) {
              setTriedLocal(true);
            } else {
              setImgFailed(true);
            }
          }}
        />
      ) : (
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full p-1"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="22" fill="#121316" />
          <defs>
            <linearGradient id="bivaax-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE033" />
              <stop offset="100%" stopColor="#FF9900" />
            </linearGradient>
          </defs>
          <path 
            d="M26 22H54C64 22 72 29 72 38C72 45 67 50 60 52C69 54 75 61 75 70C75 80 66 88 54 88H26V22Z" 
            fill="url(#bivaax-gold-grad)" 
          />
          <path 
            d="M38 33H52C56.5 33 60 36 60 40C60 44 56.5 47 52 47H38V33ZM38 58H54C59 58 63 61.5 63 66C63 70.5 59 74 54 74H38V58Z" 
            fill="#121316" 
          />
          <circle cx="78" cy="22" r="7" fill="#FFE033" />
        </svg>
      )}
    </div>
  );
};


