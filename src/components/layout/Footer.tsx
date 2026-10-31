'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { WingsLogo } from '@/components/brand/WingsLogo';
import { Send, Phone, MapPin, Mail, ShieldCheck, RefreshCw, Truck, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Do not render storefront footer inside the admin panel
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-neutral-100 dark:bg-[#07070a] text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-[#1e1e2b] mt-auto transition-colors duration-200">
      {/* Service Highlights Bar */}
      <div className="border-b border-neutral-200 dark:border-[#181824] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-white dark:bg-[#0e0e14] border border-neutral-200 dark:border-[#1a1a26] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Tezkor Yetkazib Berish</h5>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Toshkent boʻylab 3-5 soatda, viloyatlarga 1-2 kunda</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-white dark:bg-[#0e0e14] border border-neutral-200 dark:border-[#1a1a26] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">100% Asl Sifat Kafolati</h5>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Faqat original premium materiallar va texnologiyalar</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-white dark:bg-[#0e0e14] border border-neutral-200 dark:border-[#1a1a26] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
              <RefreshCw size={20} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">14 Kunlik Qaytarish</h5>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Qulay va shaffof mahsulot almashtirish tizimi</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-white dark:bg-[#0e0e14] border border-neutral-200 dark:border-[#1a1a26] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Send size={20} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">24/7 Telegram Yordam</h5>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Har qanday savolga darhol javob beramiz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <WingsLogo size="md" showTagline />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm">
            Wings — zamonaviy shahar hayoti uchun yaratilgan premium elektronika, nozik muhandislik soatlari, texnologik kiyimlar va aksessuarlar doʻkoni.
          </p>

          <div className="space-y-2 text-xs pt-2">
            <div className="flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300">
              <MapPin size={15} className="text-rose-500 shrink-0" />
              <span>Toshkent shahri, Amir Temur shoh koʻchasi 107B</span>
            </div>
            <div className="flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300">
              <Phone size={15} className="text-rose-500 shrink-0" />
              <span>+998 71 200 45 45</span>
            </div>
            <div className="flex items-center gap-2.5 text-neutral-700 dark:text-neutral-300">
              <Mail size={15} className="text-rose-500 shrink-0" />
              <span>support@wings-store.uz</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Toʻplamlar</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/categories/audio" className="hover:text-rose-500 transition-colors">
                Audio & Acoustics
              </Link>
            </li>
            <li>
              <Link href="/categories/footwear" className="hover:text-rose-500 transition-colors">
                Minimalist Footwear
              </Link>
            </li>
            <li>
              <Link href="/categories/timepieces" className="hover:text-rose-500 transition-colors">
                Precision Watches
              </Link>
            </li>
            <li>
              <Link href="/categories/streetwear" className="hover:text-rose-500 transition-colors">
                Urban Streetwear
              </Link>
            </li>
            <li>
              <Link href="/categories/carry" className="hover:text-rose-500 transition-colors">
                Everyday Carry
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider whitespace-nowrap">Mijozlar uchun</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/about" className="hover:text-rose-500 transition-colors whitespace-nowrap">
                Biz haqimizda
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-rose-500 transition-colors whitespace-nowrap">
                Yetkazib berish shartlari
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-rose-500 transition-colors whitespace-nowrap">
                Qaytarish va kafolat
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-rose-500 transition-colors whitespace-nowrap">
                Maxfiylik siyosati
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-rose-500 transition-colors whitespace-nowrap">
                Ommaviy oferta
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Yangiliklar</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Yangi toʻplamlar va cheklangan nashrlar haqida birinchi boʻlib xabardor boʻling.
          </p>

          {subscribed ? (
            <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={16} />
              <span>Obuna boʻldingiz! Rahmat.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email manzilingiz"
                className="w-full bg-white dark:bg-[#12121c] border border-neutral-300 dark:border-[#262638] rounded text-xs px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 shadow-sm"
              />
              <button
                type="submit"
                className="w-full wings-btn-primary py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span>Aʼzo boʻlish</span>
                <Send size={12} />
              </button>
            </form>
          )}

          <div className="pt-2">
            <a
              href="https://t.me/wings_shop_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 font-medium"
            >
              <Send size={14} />
              <span>Telegram Bot: @wings_shop_bot</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-200 dark:border-[#161622] py-6 px-4 sm:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Wings Inc. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 font-semibold tracking-wider text-[11px]">
            <span className="px-2 py-0.5 bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222230] rounded shadow-xs">CLICK</span>
            <span className="px-2 py-0.5 bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222230] rounded shadow-xs">PAYME</span>
            <span className="px-2 py-0.5 bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222230] rounded shadow-xs">UZUM</span>
            <span className="px-2 py-0.5 bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222230] rounded shadow-xs">VISA / MC</span>
            <span className="px-2 py-0.5 bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222230] rounded shadow-xs">CASH ON DELIVERY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
