'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setPhone('');
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16 w-full space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-black tracking-widest text-rose-500 uppercase">Bogʻlanish</span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          Wings Aloqa Markazi
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
          Savollaringiz bormi? Bizga murojaat qiling yoki Telegram botimiz orqali zudlik bilan bogʻlaning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Showroom & Ofis</h2>

            <div className="space-y-3.5 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">Manzil:</p>
                  <p className="text-neutral-600 dark:text-neutral-400">Toshkent shahri, Amir Temur shoh koʻchasi 107B</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">Telefon:</p>
                  <p className="text-neutral-600 dark:text-neutral-400">+998 71 200 45 45</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">Email:</p>
                  <p className="text-neutral-600 dark:text-neutral-400">support@wings-store.uz</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Send size={18} className="text-sky-500 dark:text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">Telegram:</p>
                  <a
                    href="https://t.me/wings_shop_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                  >
                    @wings_shop_bot
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Xabar yuborish</h2>

          {sent && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>Xabaringiz qabul qilindi. Tez orada javob beramiz!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">Ismingiz</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ali Valiyev"
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">Telefon raqamingiz</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">Xabar matni</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Savol yoki taklifingizni yozing..."
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full wings-btn-primary py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <span>Yuborish</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
