'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WingsLogo } from '@/components/brand/WingsLogo';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {}
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 w-full">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#111118] border border-neutral-200 dark:border-[#242436] shadow-xl dark:shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <WingsLogo size="md" className="justify-center mb-2" />
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Parolni tiklash</h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Roʻyxatdan oʻtgan elektron pochta manzilingizni kiriting. Biz tiklash havolasini yuboramiz.
          </p>
        </div>

        {sent ? (
          <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle size={36} className="text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Havola yuborildi!</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Pochtangizni ({email}) tekshiring va koʻrsatmalarga rioya qiling.
            </p>
            <Link href="/login" className="wings-btn-primary px-5 py-2 text-xs font-bold inline-block mt-3 rounded-lg">
              Kirish sahifasiga qaytish
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Elektron pochta
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ali@example.com"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs pl-9 pr-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-[#181824]"
                />
                <Mail size={15} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full wings-btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-lg"
            >
              <span>{loading ? 'Yuborilmoqda...' : 'Tiklash havolasini olish'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Kirish sahifasiga qaytish</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
