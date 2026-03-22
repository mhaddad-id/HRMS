'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  text?: string;
}

export function Logo({ className, size = 32, showText = true, text = "HRMS" }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3 select-none group focus:outline-none', className)}>
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
      >
        <LogoIcon size={size + 8} />
      </div>
      {showText && (
        <span className={cn(
          "font-bold tracking-tight text-foreground transition-all duration-300",
          size > 24 ? "text-xl" : "text-lg"
        )}>
          <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
            {text}
          </span>
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('drop-shadow-md', className)}
    >
      {/* Background with vibrant emerald gradient */}
      <rect width="40" height="40" rx="12" fill="url(#logo_bg_gradient)" />

      {/* Decorative glassmorphism elements */}
      <circle cx="40" cy="0" r="20" fill="white" fillOpacity="0.12" />
      <circle cx="0" cy="40" r="15" fill="white" fillOpacity="0.08" />

      {/* Abstract Organizational/Growth Icon */}
      <g filter="url(#logo_inner_shadow)">
        {/* Main Leadership Node */}
        <circle cx="20" cy="13" r="4.5" fill="white" />
        <path
          d="M13 26C13 23.2386 15.2386 21 18 21H22C24.7614 21 27 23.2386 27 26V29H13V26Z"
          fill="white"
        />

        {/* Supporting Nodes (Team) */}
        <circle cx="10" cy="19" r="3" fill="white" fillOpacity="0.75" />
        <path
          d="M5 26.5C5 25.1193 6.11929 24 7.5 24H12.5C13.8807 24 15 25.1193 15 26.5V29H5V26.5Z"
          fill="white"
          fillOpacity="0.75"
        />

        <circle cx="30" cy="19" r="3" fill="white" fillOpacity="0.75" />
        <path
          d="M25 26.5C25 25.1193 26.1193 24 27.5 24H32.5C33.8807 24 35 25.1193 35 26.5V29H25V26.5Z"
          fill="white"
          fillOpacity="0.75"
        />

        {/* Growth/Connection Lines */}
        <rect x="19" y="29" width="2" height="4" rx="1" fill="white" fillOpacity="0.5" />
        <rect x="9" y="29" width="2" height="3" rx="1" fill="white" fillOpacity="0.3" />
        <rect x="29" y="29" width="2" height="3" rx="1" fill="white" fillOpacity="0.3" />
      </g>

      <defs>
        <linearGradient
          id="logo_bg_gradient"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>

        <filter
          id="logo_inner_shadow"
          x="3"
          y="8"
          width="34"
          height="28"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
