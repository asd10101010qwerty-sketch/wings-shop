import React from 'react';
import { RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16 w-full space-y-8 text-neutral-600 dark:text-neutral-300">
      <div>
        <span className="text-xs font-black tracking-widest text-rose-500 uppercase">Kafolat</span>
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
          Mahsulotni qaytarish va almashtirish siyosati
        </h1>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-base">
            <RotateCcw className="text-rose-500" size={20} />
            <h2>14 kunlik qaytarish kafolati</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Xaridor mahsulot topshirilgan kundan boshlab 14 kun ichida uni almashtirish yoki qaytarish huquqiga ega, agar mahsulot ishlatilmagan boʻlsa, uning tovar koʻrinishi, isteʼmol xususiyatlari, plombalari, yorliqlari va zavod qadogʻi saqlangan boʻlsa.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-base">
            <CheckCircle className="text-rose-500" size={20} />
            <h2>Mablagʻni qaytarish tartibi</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Qaytarilgan mahsulot ekspertizadan oʻtkazilgach, toʻlangan pul mablagʻi 1-3 bank kuni ichida xaridorning bank kartasiga yoki naqd shaklda toʻliq qaytariladi.
          </p>
        </div>
      </div>
    </div>
  );
}
