import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16 w-full space-y-6 text-neutral-600 dark:text-neutral-300">
      <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Maxfiylik siyosati (Privacy Policy)</h1>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Oxirgi yangilanish: 2026-yil 27-oktabr</p>

      <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
        <p>
          Ushbu Maxfiylik siyosati Wings (bundan buyon matnda "Wings" yoki "Doʻkon") foydalanuvchilarining shaxsiy maʼlumotlarini yigʻish, ulardan foydalanish va himoya qilish tartibini belgilaydi.
        </p>

        <h2 className="text-base font-bold text-neutral-900 dark:text-white pt-2">1. Toʻplanadigan maʼlumotlar</h2>
        <p>
          Buyurtmani rasmiylashtirish yoki roʻyxatdan oʻtishda quyidagi maʼlumotlar soʻralishi mumkin: ism-sharif, telefon raqami, yetkazib berish manzili va elektron pochta. Ushbu maʼlumotlar faqatgina buyurtmani yetkazib berish va sifatli xizmat koʻrsatish maqsadida ishlatiladi.
        </p>

        <h2 className="text-base font-bold text-neutral-900 dark:text-white pt-2">2. Toʻlov xavfsizligi</h2>
        <p>
          Wings foydalanuvchilarning toʻliq bank karta raqamlarini yoki CVV kodlarini oʻz serverlarida saqlamaydi. Barcha toʻlov jarayonlari litsenziyaga ega toʻlov tizimlari orqali xavfsiz amalga oshiriladi.
        </p>
      </div>
    </div>
  );
}
