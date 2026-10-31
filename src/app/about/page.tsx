import React from 'react';
import Link from 'next/link';
import { WingsLogo } from '@/components/brand/WingsLogo';
import { ShieldCheck, Sparkles, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16 w-full space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-black tracking-widest text-rose-500 uppercase">Wings Falsafasi</span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          Biz haqimizda — Wings
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Wings — shahar dinamikasi, yuqori darajadagi texnologik materiallar va murosasiz estetika birlashgan Oʻzbekistondagi premium platforma.
        </p>
      </div>

      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#14141e] border border-neutral-200 dark:border-[#242436] relative shadow-md">
        <img
          src="/images/categories/cat-streetwear.jpg"
          alt="Wings Editorial"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <WingsLogo size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-2.5 shadow-sm">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
            <Sparkles size={20} />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Aniq Muhandislik</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Titan, 500 GSM paxta, Cordura neylon va safir shisha — har bir detal uzoq yillik xizmat uchun tanlangan.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-2.5 shadow-sm">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
            <Award size={20} />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">100% Asl Sifat</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Faqat rasmiy sertifikatlangan, kafolatlangan original tovarlar va professional xizmat.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-2.5 shadow-sm">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Mijoz Ishonchi</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Telegram bot orqali tezkor buyurtma nazorati, kuryerlik yetkazib berish va doimiy qoʻllab-quvvatlash.
          </p>
        </div>
      </div>

      <div className="text-center pt-6">
        <Link
          href="/products"
          className="wings-btn-primary px-8 py-3 text-xs font-bold inline-flex items-center gap-2 rounded-xl"
        >
          <span>Toʻplam bilan tanishish</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
