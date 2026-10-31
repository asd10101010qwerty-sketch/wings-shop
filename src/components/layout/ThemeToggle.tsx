'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/context';
import { useI18n } from '@/lib/i18n/context';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'mobile';
}

export function ThemeToggle({ className = '', variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const { locale } = useI18n();

  const isDark = mounted ? theme === 'dark' : true;

  const tooltipText = {
    uz: isDark ? 'Yorugʻ rejimga oʻtish' : 'Qorongʻi rejimga oʻtish',
    ru: isDark ? 'Включить светлую тему' : 'Включить тёмную тему',
    en: isDark ? 'Switch to light mode' : 'Switch to dark mode',
  }[locale] || (isDark ? 'Switch to light mode' : 'Switch to dark mode');

  // Mobile drawer 1-click toggle row
  if (variant === 'mobile') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#14141e] hover:bg-neutral-200 dark:hover:bg-[#1e1e2c] border border-neutral-200 dark:border-[#28283a] text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all select-none ${className}`}
        aria-label={tooltipText}
        title={tooltipText}
        suppressHydrationWarning
      >
        <span className="flex items-center gap-2">
          {isDark ? (
            <Moon size={16} className="text-neutral-200" />
          ) : (
            <Sun size={16} className="text-neutral-800" />
          )}
          <span>{isDark ? 'Qorongʻi rejim (Faol)' : 'Yorugʻ rejim (Faol)'}</span>
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-200 dark:bg-[#202030] text-neutral-600 dark:text-neutral-400">
          Oʻzgartirish
        </span>
      </button>
    );
  }

  // Desktop / Header direct 1-click icon toggle
  // Strictly monochrome & high-contrast: crisp border and visible icon in both modes
  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-2 rounded-full border transition-all duration-200 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 select-none group ${
        isDark
          ? 'border-neutral-800 bg-[#161622] text-neutral-300 hover:text-white hover:bg-[#1f1f2e] hover:border-neutral-700'
          : 'border-neutral-200 bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 hover:border-neutral-300 shadow-xs'
      } ${className}`}
      title={tooltipText}
      aria-label={tooltipText}
      suppressHydrationWarning
    >
      {isDark ? (
        <Moon
          size={18}
          className="text-neutral-300 group-hover:text-white transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-105"
        />
      ) : (
        <Sun
          size={18}
          className="text-neutral-700 group-hover:text-black transition-transform duration-300 group-hover:rotate-45 group-hover:scale-105"
        />
      )}
    </button>
  );
}
