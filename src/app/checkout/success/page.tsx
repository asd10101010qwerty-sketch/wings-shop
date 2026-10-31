'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Send, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_number') || 'WNG-2026-8492';
  const orderId = searchParams.get('order_id');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-24 w-full text-center">
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#262638] shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-emerald-400 to-rose-500" />

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={42} />
        </div>

        <span className="text-xs font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
          Muvaffaqiyatli Rasmiylashtirildi
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mt-2 mb-3">
          Buyurtmangiz qabul qilindi!
        </h1>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-lg mx-auto leading-relaxed">
          Wings jamoasi buyurtmangizni tayyorlashni boshladi. Xaridingiz uchun minnatdorchilik bildiramiz.
        </p>

        {/* Order Reference Box */}
        <div className="my-8 p-4 rounded-xl bg-neutral-50 dark:bg-[#181824] border border-neutral-200 dark:border-[#2c2c40] inline-block">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Buyurtma raqami:</p>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-wider font-mono mt-0.5">
            {orderNumber}
          </p>
        </div>

        {/* Delivery & Alert highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left my-8 max-w-xl mx-auto">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#14141e] border border-neutral-200 dark:border-[#222232] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
              <Clock size={16} className="text-rose-600 dark:text-rose-400" />
              <span>Yetkazib berish vaqti</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Toshkent boʻyicha kun davomida, viloyatlarga 1-2 ish kunida yetkaziladi.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#14141e] border border-neutral-200 dark:border-[#222232] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
              <Send size={16} className="text-sky-500 dark:text-sky-400" />
              <span>Telegram bildirishnoma</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Buyurtma tafsilotlari Telegram botimizga yuborildi. Holatni kuzatib boring.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/products"
            className="wings-btn-primary px-7 py-3 text-xs font-bold inline-flex items-center gap-2 rounded-xl"
          >
            <span>Xaridni davom ettirish</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            href="/account/orders"
            className="px-6 py-3 bg-neutral-100 dark:bg-[#181824] hover:bg-neutral-200 dark:hover:bg-[#222232] border border-neutral-200 dark:border-[#2c2c40] text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-xl transition-colors"
          >
            Buyurtmalarim roʻyxati
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-neutral-400">Yuklanmoqda...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
