'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { useCart } from '@/lib/cart/context';
import { useAuth } from '@/lib/auth/context';
import { WingsLogo } from '@/components/brand/WingsLogo';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Globe,
  ShieldCheck,
  Send,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Locale } from '@/types';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { SearchModal } from '@/components/search/SearchModal';

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t, formatPrice } = useI18n();
  const { itemCount, subtotal, setIsCartDrawerOpen, wishlistCount } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Do not render storefront header inside the admin panel
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: 'uz', label: "Oʻzbekcha", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full flex flex-col border-b border-neutral-200 dark:border-[#20202e] bg-white/95 dark:bg-[#09090c]/95 backdrop-blur-md transition-colors duration-200">
      {/* Top Announcement Bar */}
      <div className="w-full bg-neutral-100 dark:bg-[#0d0d12] text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-[#1b1b26] text-xs py-1.5 px-4 sm:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-neutral-600 dark:text-neutral-300 text-[11px] sm:text-xs truncate">
              {locale === 'ru'
                ? 'Бесплатная доставка при заказе от 500 000 сум'
                : locale === 'en'
                ? 'Free express shipping on orders over 500,000 UZS'
                : '500 000 soʻmdan yuqori buyurtmalarga bepul yetkazib berish'}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Telegram Support Link */}
            <a
              href="https://t.me/wings_shop_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors text-xs"
            >
              <Send size={12} className="text-sky-500 dark:text-sky-400" />
              <span className="font-medium">Telegram: @wings_shop_bot</span>
            </a>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-neutral-200/70 dark:hover:bg-[#1a1a24] text-xs font-semibold"
              >
                <Globe size={13} className="text-rose-500" />
                <span className="uppercase tracking-wider">{locale}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#14141e] border border-neutral-200 dark:border-[#2a2a3c] rounded-lg shadow-2xl py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-[#1f1f2e] transition-colors ${
                        locale === lang.code
                          ? 'text-rose-600 dark:text-rose-400 font-bold bg-neutral-100 dark:bg-[#1a1a28]'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span>{lang.label}</span>
                      <span>{lang.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-4 xl:gap-6">
        {/* Brand Logo */}
        <div className="shrink-0">
          <WingsLogo size="md" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 2xl:gap-6 text-xs xl:text-sm font-semibold whitespace-nowrap shrink-0">
          <Link
            href="/"
            className="text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors tracking-wide whitespace-nowrap shrink-0"
          >
            {t.nav.home}
          </Link>
          <Link
            href="/products"
            className="text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors tracking-wide whitespace-nowrap shrink-0"
          >
            {t.nav.products}
          </Link>
          <Link
            href="/categories/audio"
            className="text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors tracking-wide whitespace-nowrap shrink-0"
          >
            {locale === 'ru' ? 'Аудио' : locale === 'en' ? 'Audio' : 'Audio'}
          </Link>
          <Link
            href="/categories/footwear"
            className="text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors tracking-wide whitespace-nowrap shrink-0"
          >
            {locale === 'ru' ? 'Обувь' : locale === 'en' ? 'Footwear' : 'Poyabzal'}
          </Link>
          <Link
            href="/categories/timepieces"
            className="text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors tracking-wide whitespace-nowrap shrink-0"
          >
            {locale === 'ru' ? 'Часы' : locale === 'en' ? 'Timepieces' : 'Soatlar'}
          </Link>
          <Link
            href="/about"
            className="text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors tracking-wide whitespace-nowrap shrink-0"
          >
            {t.nav.about}
          </Link>
          <Link
            href="/contact"
            className="text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors tracking-wide whitespace-nowrap shrink-0"
          >
            {t.nav.contact}
          </Link>
        </nav>

        {/* Desktop Search Trigger Bar */}
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="hidden xl:flex relative items-center w-40 2xl:w-60 ml-auto bg-neutral-100 dark:bg-[#13131c] text-xs text-neutral-400 dark:text-neutral-500 rounded-full pl-8 pr-2 py-1.5 border border-neutral-200 dark:border-[#242434] hover:border-rose-500/60 dark:hover:border-rose-500/60 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all text-left group shadow-xs cursor-pointer shrink-0"
        >
          <Search size={13} className="absolute left-2.5 text-neutral-400 group-hover:text-rose-500 transition-colors" />
          <span className="truncate pr-1 text-[11px] 2xl:text-xs">{t.common.search_placeholder}</span>
          <span className="ml-auto inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-mono font-bold bg-white dark:bg-[#1f1f2e] text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-[#2e2e42] shrink-0">
            ⌘K
          </span>
        </button>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Search Button (visible on mobile and tablet below xl) */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="xl:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#171722] rounded-full transition-all"
            title={`${t.nav.search} (Ctrl+K)`}
            aria-label={t.nav.search}
          >
            <Search size={18} />
          </button>
          {/* Wishlist Icon */}
          <Link
            href="/wishlist"
            className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#171722] rounded-full transition-all"
            title={t.nav.wishlist}
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon / Drawer Toggle */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 bg-neutral-100 dark:bg-[#13131c] hover:bg-neutral-200/70 dark:hover:bg-[#1a1a26] border border-neutral-200 dark:border-[#242434] hover:border-rose-500/40 rounded-full transition-all group shrink-0"
            title={t.nav.cart}
          >
            <div className="relative">
              <ShoppingBag size={17} className="text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden 2xl:inline text-xs font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
              {itemCount > 0 ? formatPrice(subtotal) : t.nav.cart}
            </span>
          </button>

          {/* Admin shortcut button */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1 px-2 py-1.5 2xl:px-2.5 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-colors shrink-0 shadow-xs"
              title="Admin Panel"
            >
              <ShieldCheck size={14} />
              <span className="hidden 2xl:inline">Admin</span>
            </Link>
          )}

          {/* Theme Switcher Toggle (1-click direct toggle) */}
          <ThemeToggle />

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#171722] rounded-full transition-all"
              title={t.nav.account}
            >
              <User size={19} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#13131c] border border-neutral-200 dark:border-[#242436] rounded-xl shadow-2xl py-2 z-50 divide-y divide-neutral-100 dark:divide-[#202030]">
                <div className="px-3.5 py-2">
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Hisob</p>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {profile?.full_name || user?.email || 'Mehmon'}
                  </p>
                  {user?.email && (
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-mono">
                      {user.email}
                    </p>
                  )}
                  {isAdmin && (
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-850">
                      Administrator
                    </span>
                  )}
                </div>

                <div className="py-1">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#1c1c2a] font-bold transition-colors"
                    >
                      <ShieldCheck size={15} />
                      <span>{t.nav.admin}</span>
                    </Link>
                  )}

                  <Link
                    href="/account/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1c1c2a] transition-colors"
                  >
                    <ShoppingBag size={15} />
                    <span>{t.nav.orders}</span>
                  </Link>
                  <Link
                    href="/account/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1c1c2a] transition-colors"
                  >
                    <User size={15} />
                    <span>{t.nav.account}</span>
                  </Link>
                </div>

                <div className="py-1">
                  {user ? (
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-xs text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#1c1c2a] transition-colors"
                    >
                      <LogOut size={15} />
                      <span>{t.nav.logout}</span>
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-[#1c1c2a] transition-colors"
                      >
                        <LogIn size={14} className="text-rose-500 dark:text-rose-400" />
                        <span>{t.nav.login}</span>
                      </Link>
                      <Link
                        href="/registration"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#1c1c2a] font-semibold transition-colors"
                      >
                        <UserPlus size={14} />
                        <span>{t.nav.register}</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-white dark:bg-[#0d0d14] border-b border-neutral-200 dark:border-[#20202e] px-5 py-4 flex flex-col gap-4 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setIsSearchModalOpen(true);
            }}
            className="relative w-full flex items-center bg-neutral-100 dark:bg-[#14141e] text-xs text-neutral-500 dark:text-neutral-400 rounded-lg pl-9 pr-3 py-2.5 border border-neutral-200 dark:border-[#28283a] text-left"
          >
            <Search size={15} className="absolute left-3 text-neutral-400" />
            <span>{t.common.search_placeholder}</span>
          </button>

          {/* Mobile Theme Switcher */}
          <ThemeToggle variant="mobile" />

          <nav className="flex flex-col gap-2 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-neutral-800 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 whitespace-nowrap"
            >
              {t.nav.home}
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-neutral-800 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 whitespace-nowrap"
            >
              {t.nav.products}
            </Link>
            <Link
              href="/categories/audio"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-neutral-800 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 whitespace-nowrap"
            >
              {locale === 'ru' ? 'Аудио и акустика' : locale === 'en' ? 'Audio & Acoustics' : 'Audio va Akustika'}
            </Link>
            <Link
              href="/categories/footwear"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-neutral-800 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 whitespace-nowrap"
            >
              {locale === 'ru' ? 'Премиальная обувь' : locale === 'en' ? 'Technical Footwear' : 'Poyabzal'}
            </Link>
            <Link
              href="/categories/timepieces"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-neutral-800 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 whitespace-nowrap"
            >
              {locale === 'ru' ? 'Швейцарские часы' : locale === 'en' ? 'Precision Watches' : 'Soatlar'}
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-neutral-800 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 whitespace-nowrap"
            >
              {t.nav.about}
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-neutral-800 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 whitespace-nowrap"
            >
              {t.nav.contact}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-rose-600 dark:text-rose-400 font-bold whitespace-nowrap"
              >
                {t.nav.admin}
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Global Omnisearch Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </header>
  );
}
