import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16 w-full space-y-6 text-neutral-600 dark:text-neutral-300">
      <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Ommaviy oferta (Foydalanish shartlari)</h1>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Oxirgi yangilanish: 2026-yil 27-oktabr</p>

      <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
        <p>
          Ushbu hujjat "Wings" onlayn doʻkoni orqali tovarlarni sotib olish boʻyicha jismoniy va yuridik shaxslar uchun rasmiy ommaviy ofertadir.
        </p>

        <h2 className="text-base font-bold text-neutral-900 dark:text-white pt-2">1. Buyurtmani rasmiylashtirish</h2>
        <p>
          Xaridor sayt orqali tovarlarni tanlaydi, yetkazib berish maʼlumotlarini kiritadi va buyurtmani tasdiqlaydi. Buyurtma tasdiqlangach, Telegram va SMS orqali bildirishnoma yuboriladi.
        </p>

        <h2 className="text-base font-bold text-neutral-900 dark:text-white pt-2">2. Narxlar va toʻlov</h2>
        <p>
          Barcha narxlar Oʻzbekiston soʻmida (UZS) koʻrsatilgan. Toʻlov naqd, Click, Payme yoki bank kartasi orqali amalga oshirilishi mumkin.
        </p>
      </div>
    </div>
  );
}
