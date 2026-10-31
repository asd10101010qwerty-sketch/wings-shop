'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { WingsLogo } from '@/components/brand/WingsLogo';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  MessageSquare,
  Boxes,
  Bell,
  Settings,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
  Lock,
  LogOut,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, isLoading, signOut, loginAsDemoAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Mahsulotlar', href: '/admin/products', icon: Package },
    { label: 'Kategoriyalar', href: '/admin/categories', icon: Layers },
    { label: 'Buyurtmalar', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Mijozlar', href: '/admin/customers', icon: Users },
    { label: 'Kuponlar', href: '/admin/coupons', icon: Tag },
    { label: 'Sharhlar', href: '/admin/reviews', icon: MessageSquare },
    { label: 'Omborxona', href: '/admin/inventory', icon: Boxes },
    { label: 'Telegram Bildirishnomalari', href: '/admin/notifications', icon: Bell },
    { label: 'Sozlamalar', href: '/admin/settings', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080c] text-neutral-400">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Administrator huquqlari tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  // Strict Admin Gate: Only verified admins can view this panel
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080c] px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0f0f16] border border-rose-900/60 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white tracking-tight">Boshqaruv Markazi</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Ushbu boʻlim faqat doʻkon administratori uchun. Tizimga rasmiy login orqali kiring yoki sinov rejimida 1-klik bilan boshqaruv panelini oching.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => loginAsDemoAdmin?.()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black tracking-wide shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>Tezkor Admin Kirish (1-klik Demo)</span>
            </button>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="flex-1 py-2 rounded-lg bg-[#161624] hover:bg-[#202032] border border-[#2c2c40] text-neutral-200 text-xs font-semibold transition-all text-center"
              >
                Login orqali kirish
              </Link>
              <Link
                href="/"
                className="py-2 px-4 rounded-lg bg-[#12121c] hover:bg-[#1a1a28] border border-[#222234] text-neutral-400 hover:text-white text-xs font-medium transition-all text-center"
              >
                Doʻkon
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-[#08080c] flex flex-col lg:flex-row text-neutral-900 dark:text-white transition-colors duration-200">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0d0d14] border-b border-neutral-200 dark:border-[#20202e] sticky top-0 z-30">
        <WingsLogo size="sm" href="/admin" />
        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1a1a28] transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-[#0d0d14] border-r border-neutral-200 dark:border-[#1f1f2e] flex flex-col justify-between p-4 transition-transform duration-300 shadow-sm ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Admin Badge */}
          <div className="px-2 py-2">
            <WingsLogo size="md" href="/admin" />
            <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase tracking-wider w-fit">
              <ShieldCheck size={12} />
              <span>Boshqaruv Markazi</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#161622]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Real Logged In Admin Profile */}
        <div className="pt-4 border-t border-neutral-200 dark:border-[#1a1a26] space-y-3">
          <div className="flex items-center justify-between px-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 py-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Doʻkonga qaytish</span>
            </Link>
            <ThemeToggle variant="icon" />
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#14141e] border border-neutral-200 dark:border-[#222230] flex items-center justify-between gap-2.5 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {(profile?.full_name || user?.email || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {profile?.full_name || 'Administrator'}
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Chiqish"
              className="p-1.5 text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-neutral-200 dark:hover:bg-[#1e1e2c] rounded-lg transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
