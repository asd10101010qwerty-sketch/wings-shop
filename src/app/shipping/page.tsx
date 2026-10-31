import React from 'react';
import Link from 'next/link';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16 w-full space-y-8 text-neutral-600 dark:text-neutral-300">
      <div>
        <span className="text-xs font-black tracking-widest text-rose-500 uppercase">Yetkazib Berish</span>
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
          Yetkazib berish shartlari va tariflari
        </h1>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-base">
            <Truck className="text-rose-500" size={20} />
            <h2>Tariflar va muddatlar</h2>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>
              <strong className="text-neutral-900 dark:text-white">Standart yetkazib berish (1-2 kun):</strong> 25 000 soʻm. Agar buyurtma summasi <b>500 000 soʻmdan</b> oshsa — <b>MUTLAQO BEPUL</b>.
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-white">Ekspress yetkazib berish (3-5 soat):</strong> 45 000 soʻm (faqat Toshkent shahri boʻyicha kun davomida).
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-white">Doʻkondan olib ketish (Showroom):</strong> Bepul. Manzil: Toshkent, Amir Temur 107B.
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-base">
            <ShieldCheck className="text-rose-500" size={20} />
            <h2>Qabul qilish va tekshirish</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Buyurtmangiz kuryer tomonidan yetkazib berilganda, paketni ochib koʻrish, mahsulotning butunligi va sifatini tekshirish huquqiga egasiz. Naqd yoki Click/Payme orqali faqat tekshiruvdan soʻng toʻlov qilishingiz mumkin.
          </p>
        </div>
      </div>
    </div>
  );
}
