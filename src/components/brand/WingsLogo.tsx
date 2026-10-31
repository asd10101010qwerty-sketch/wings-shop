import React from 'react';
import Link from 'next/link';

interface WingsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  href?: string;
}

export function WingsLogo({ className = '', size = 'md', showTagline = false, href = '/' }: WingsLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 42,
  };

  const iconSize = iconSizes[size];

  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Sleek Wings Emblem SVG */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer glow aura */}
          <circle cx="24" cy="24" r="22" fill="#e11d48" fillOpacity="0.12" />

          {/* Left Wing Feather Tier 1 */}
          <path
            d="M24 10L6 20L14 26L24 18Z"
            fill="url(#wingsRedGrad)"
            className="transition-all duration-300 group-hover:translate-x-[-1px]"
          />
          {/* Right Wing Feather Tier 1 */}
          <path
            d="M24 10L42 20L34 26L24 18Z"
            fill="url(#wingsRedGrad)"
            className="transition-all duration-300 group-hover:translate-x-[1px]"
          />

          {/* Left Wing Feather Tier 2 */}
          <path
            d="M24 20L10 27L16 32L24 26Z"
            fill="currentColor"
            className="text-neutral-900 dark:text-white opacity-80 transition-all duration-300 group-hover:translate-x-[-0.5px]"
          />
          {/* Right Wing Feather Tier 2 */}
          <path
            d="M24 20L38 27L32 32L24 26Z"
            fill="currentColor"
            className="text-neutral-900 dark:text-white opacity-80 transition-all duration-300 group-hover:translate-x-[0.5px]"
          />

          {/* Center Diamond Blade */}
          <path
            d="M24 14L27 24L24 38L21 24Z"
            fill="#e11d48"
          />
          <path
            d="M24 14L25.5 24L24 38Z"
            fill="currentColor"
            className="text-white opacity-50"
          />

          <defs>
            <linearGradient id="wingsRedGrad" x1="6" y1="10" x2="42" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f43f5e" />
              <stop offset="1" stopColor="#be123c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-[0.22em] text-neutral-900 dark:text-white font-sans ${sizeClasses[size]} leading-none`}>
            WINGS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        </div>
        {showTagline && (
          <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 font-medium">
            Elevate Style
          </span>
        )}
      </div>
    </Link>
  );
}
