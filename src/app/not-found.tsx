import React from 'react';
import Link from 'next/link';
import { WingsLogo } from '@/components/brand/WingsLogo';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <WingsLogo size="lg" className="mb-6" />

      <span className="text-sm font-black font-mono text-rose-600 dark:text-rose-500 tracking-widest uppercase">
        404 XATOLIK
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mt-2 mb-3">
        Sahifa topilmadi
      </h1>

      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed mb-8">
        Siz qidirayotgan sahifa koʻchirilgan, oʻchirilgan yoki manzili notoʻgʻri kiritilgan boʻlishi mumkin.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="wings-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 rounded-lg"
        >
          <Home size={15} />
          <span>Bosh sahifaga qaytish</span>
        </Link>
        <Link
          href="/products"
          className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-[#161622] dark:hover:bg-[#202030] border border-neutral-200 dark:border-[#2b2b3d] dark:text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Search size={14} />
          <span>Katalogga oʻtish</span>
        </Link>
      </div>
    </div>
  );
}
