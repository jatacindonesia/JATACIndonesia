import React from 'react';

interface LogoProps {
  className?: string; // custom styling
  showText?: boolean;
  textColor?: string;
  subTextColor?: string;
}

export default function Logo({ className = "h-14", showText = true, textColor = "text-brand-blue", subTextColor = "text-gray-500" }: LogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Premium Seal Emblem */}
      <div className={`${className} aspect-square relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-sm filter"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shadow Backing */}
          <circle cx="80" cy="88" r="64" fill="black" opacity="0.05" />

          {/* Upward Arrows behind seal */}
          <path
            d="M50 45 L62 25 L74 45 M62 25 L62 80"
            stroke="#c5a059"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M75 35 L88 12 L101 35 M88 12 L88 80"
            stroke="#0b2240"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M102 48 L112 32 L122 48 M112 32 L112 80"
            stroke="#c5a059"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Scalloped badge border */}
          <path
            d="M80 20 C88 20 92 14 100 16 C108 18 112 26 118 30 C124 34 130 34 134 41 C138 48 135 56 137 64 C139 72 143 78 143 86 C143 94 139 100 137 108 C135 116 138 124 134 131 C130 138 124 138 118 142 C112 146 108 154 100 156 C92 158 88 152 80 152 C72 152 68 158 60 156 C52 154 48 146 42 142 C36 138 30 138 26 131 C22 124 25 116 23 108 C21 100 17 94 17 86 C17 78 21 72 23 64 C25 56 22 48 26 41 C30 34 36 34 42 30 C48 26 52 18 60 16 C68 14 72 20 80 20 Z"
            fill="#0b2240"
            stroke="#c5a059"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Outer Gold Ring */}
          <circle cx="80" cy="86" r="50" stroke="#c5a059" strokeWidth="3" fill="none" />

          {/* Inner Badge Split (Gold and Navy Background) */}
          <g clipPath="url(#badgeClip)">
            <rect x="25" y="31" width="55" height="110" fill="#0b2240" />
            <rect x="80" y="31" width="55" height="110" fill="#c5a059" />
          </g>

          {/* Innermost Gold Ring */}
          <circle cx="80" cy="86" r="46" stroke="#c5a059" strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* Decorative Gold Dial Segment representing a Clock/Chronometer (from corporate logo) */}
          <circle cx="118" cy="46" r="14" fill="none" stroke="#c5a059" strokeWidth="2.5" />
          <path d="M118 46 L124 38" stroke="#0b2240" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M118 32 L118 35 M132 46 L129 46 M104 46 L107 46 M118 60 L118 57" stroke="#c5a059" strokeWidth="1.5" />

          {/* "JA" Stylized Letters */}
          <text
            x="54"
            y="108"
            fill="#ffffff"
            fontFamily="Playfair Display, Georgia, serif"
            fontSize="54"
            fontWeight="bold"
            letterSpacing="-3"
          >
            J
          </text>
          <text
            x="84"
            y="108"
            fill="#0b2240"
            fontFamily="Playfair Display, Georgia, serif"
            fontSize="46"
            fontWeight="bold"
            letterSpacing="-3"
          >
            A
          </text>

          {/* Clip path definition for split card */}
          <defs>
            <clipPath id="badgeClip">
              <circle cx="80" cy="86" r="49" />
            </clipPath>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif tracking-wide leading-none text-xl sm:text-2xl font-bold uppercase ${textColor}`}>
            JOHN ANDERSEN
          </span>
          <span className={`text-[10px] sm:text-[11px] font-sans font-medium tracking-widest text-[#a18241] uppercase mt-0.5 leading-none`}>
            Training and Consulting
          </span>
          <span className={`text-[8px] sm:text-[9px] font-mono uppercase ${subTextColor} mt-0.5 opacity-70`}>
            Indonesia
          </span>
        </div>
      )}
    </div>
  );
}
export type { LogoProps };
