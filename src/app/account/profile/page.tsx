'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { ArrowLeft, User, Mail, Phone, CheckCircle, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || 'Sardor Rahimiy');
  const [phone, setPhone] = useState(profile?.phone || '+998 90 123 45 67');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full transition-colors duration-200">
      <Link
        href="/account"
        className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 mb-4"
      >
        <ArrowLeft size={13} />
        <span>Kabinetingizga qaytish</span>
      </Link>

      <div className="p-8 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Shaxsiy profil maʼlumotlari
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Ism-familiyangiz va aloqa maʼlumotlaringizni yangilang
          </p>
        </div>

        {saved && (
          <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={16} />
            <span>Maʼlumotlar saqlandi!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Toʻliq ism</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs pl-9 pr-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
              <User size={15} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Elektron pochta</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={user?.email || 'customer@example.com'}
                className="w-full bg-neutral-100 dark:bg-[#14141e] border border-neutral-200 dark:border-[#222230] rounded-lg text-xs pl-9 pr-3.5 py-2.5 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
              />
              <Mail size={15} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-600" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Telefon raqam</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs pl-9 pr-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <Phone size={15} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
            </div>
          </div>

          <button
            type="submit"
            className="wings-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 rounded-lg"
          >
            <Save size={14} />
            <span>Saqlash</span>
          </button>
        </form>
      </div>
    </div>
  );
}
