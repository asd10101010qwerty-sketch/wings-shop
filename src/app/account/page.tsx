'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useCart } from '@/lib/cart/context';
import { useI18n } from '@/lib/i18n/context';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Phone,
  Mail,
} from 'lucide-react';

export default function AccountOverviewPage() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { wishlistCount } = useCart();
  const { formatPrice } = useI18n();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-200 dark:border-[#222232]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center font-black text-xl shadow-lg">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'W'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              {profile?.full_name || 'Wings Xaridori'}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.email || 'Mehmon foydalanuvchi'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck size={16} />
              <span>Boshqaruv Paneli (Admin)</span>
            </Link>
          )}

          <button
            onClick={signOut}
            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 dark:bg-[#181824] dark:hover:bg-[#242436] dark:text-neutral-400 dark:hover:text-white transition-colors"
            title="Chiqish"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <Link
          href="/account/orders"
          className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] hover:border-rose-500/60 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Buyurtmalar
            </span>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">Buyurtmalar tarixi</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold group-hover:underline">
              Barcha buyurtmalarni koʻrish →
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <ShoppingBag size={24} />
          </div>
        </Link>

        <Link
          href="/wishlist"
          className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] hover:border-rose-500/60 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Saralanganlar
            </span>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{wishlistCount} ta mahsulot</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold group-hover:underline">
              Roʻyxatni ochish →
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <Heart size={24} />
          </div>
        </Link>

        <Link
          href="/account/profile"
          className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] hover:border-rose-500/60 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Profil sozlamalari
            </span>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">Shaxsiy maʼlumotlar</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold group-hover:underline">
              Tahrirlash →
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <User size={24} />
          </div>
        </Link>
      </div>

      {/* Recent Orders Snapshot */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#20202e]">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Soʻnggi buyurtmalar</h2>
          <Link
            href="/account/orders"
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
          >
            Barchasini koʻrish
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black font-mono text-neutral-900 dark:text-white">WNG-2026-8492</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                YETKAZIB BERILDI
              </span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300">
              Wings Phantom ANC Studio Headphones (Obsidian Black)
            </p>
            <span className="text-[11px] text-neutral-500">2026-10-25 • Standart yetkazish</span>
          </div>

          <div className="text-right">
            <span className="text-sm font-black text-rose-600 dark:text-rose-400 block">
              {formatPrice(1305000)}
            </span>
            <Link
              href="/account/orders/ord-demo-101"
              className="text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white underline mt-1 inline-block"
            >
              Tafsilotlar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
