'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { Save, CheckCircle2, AlertCircle, Store, Truck, Send, ShieldCheck, Mail, Phone, MapPin, Plus, Trash2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'Wings',
    tagline: 'Elevate Your Style. Precision & Elegance.',
    phone: '+998 71 200 45 45',
    email: 'support@wings-store.uz',
    telegram_channel: '@wings_official',
    telegram_bot: '@wings_shop_bot',
    address: 'Tashkent, Amir Temur avenue 107B',
    free_shipping_threshold: 500000,
    standard_shipping_fee: 25000,
    express_shipping_fee: 45000,
    currency: 'UZS',
    default_locale: 'uz',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'store' | 'shipping' | 'telegram' | 'admins'>('store');

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data) setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Sozlamalarni saqlashda xatolik');
      notify('Barcha sozlamalar muvaffaqiyatli saqlandi!');
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
              : 'bg-rose-950 border-rose-700 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-[#20202e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Doʻkon Sozlamalari</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Wings platformasi parametrlari, yetkazib berish tariflari va integratsiyalar
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="wings-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 rounded-xl shrink-0"
        >
          <Save size={15} />
          <span>{saving ? 'Saqlanmoqda...' : 'Oʻzgarishlarni Saqlash'}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-[#20202e] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'store'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#12121a] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-[#20202e]'
          }`}
        >
          <Store size={14} />
          <span>Umumiy Doʻkon</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'shipping'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#12121a] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-[#20202e]'
          }`}
        >
          <Truck size={14} />
          <span>Yetkazib Berish</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'telegram'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#12121a] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-[#20202e]'
          }`}
        >
          <Send size={14} />
          <span>Telegram Integratsiyasi</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'admins'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#12121a] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-[#20202e]'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Administratorlar</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: Store Information */}
        {activeTab === 'store' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-5 animate-in fade-in duration-200 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Store size={16} className="text-rose-500" />
              <span>Doʻkon va Brand Parametrlari</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Doʻkon Nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Shior (Brand Tagline)
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Aloqa Telefoni (Call-markaz)
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Mijozlarni Qoʻllab-quvvatlash Emaili
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Showroom va Doʻkon Asosiy Manzili
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Shipping Rates */}
        {activeTab === 'shipping' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-5 animate-in fade-in duration-200 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Truck size={16} className="text-rose-500" />
              <span>Yetkazib Berish Narxlari va Chegaralari</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#262638] space-y-2">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
                  Bepul Yetkazish Chegarasi (soʻm)
                </label>
                <input
                  type="number"
                  value={settings.free_shipping_threshold}
                  onChange={(e) =>
                    setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })
                  }
                  className="w-full bg-white dark:bg-[#12121a] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3 py-2 text-neutral-900 dark:text-white font-mono font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Ushbu summadan ortiq buyurtmalar avtomatik bepul kuryer qilinadi.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#262638] space-y-2">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
                  Standart Yetkazish Tarifi (soʻm)
                </label>
                <input
                  type="number"
                  value={settings.standard_shipping_fee}
                  onChange={(e) =>
                    setSettings({ ...settings, standard_shipping_fee: Number(e.target.value) })
                  }
                  className="w-full bg-white dark:bg-[#12121a] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3 py-2 text-neutral-900 dark:text-white font-mono font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Oddiy yetkazish (1-3 ish kuni) uchun toʻlov summasi.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#262638] space-y-2">
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
                  Ekspress Tezkor Yetkazish (soʻm)
                </label>
                <input
                  type="number"
                  value={settings.express_shipping_fee}
                  onChange={(e) =>
                    setSettings({ ...settings, express_shipping_fee: Number(e.target.value) })
                  }
                  className="w-full bg-white dark:bg-[#12121a] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3 py-2 text-neutral-900 dark:text-white font-mono font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Shoshilinch (oʻsha kunning oʻzida) yetkazish narxi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Telegram Integration */}
        {activeTab === 'telegram' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-5 animate-in fade-in duration-200 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Send size={16} className="text-sky-500 dark:text-sky-400" />
              <span>Telegram Bot va Xabarnomalar</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Telegram Bot Foydalanuvchi Nomi
                </label>
                <input
                  type="text"
                  value={settings.telegram_bot || '@wings_shop_bot'}
                  onChange={(e) => setSettings({ ...settings, telegram_bot: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Telegram Rasmiy Kanal
                </label>
                <input
                  type="text"
                  value={settings.telegram_channel || '@wings_official'}
                  onChange={(e) => setSettings({ ...settings, telegram_channel: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-400">
                <Send size={14} />
                <span>Telegram Bot Xizmati</span>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Yangi buyurtmalar va toʻlovlar avtomatik ravishda belgilangan administrator Telegram guruhiga va xaridordan kelgan buyurtma raqamiga yuboriladi. Botni sozlash yoki sinov xabari yuborish uchun <b>Telegram Bildirishnomalari</b> boʻlimiga oʻting.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Admins List */}
        {activeTab === 'admins' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-5 animate-in fade-in duration-200 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-rose-500" />
              <span>Administrator Hisoblari (Gmail / Email)</span>
            </h2>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#2a2a3e] space-y-3">
              <p className="text-xs text-neutral-700 dark:text-neutral-300">
                Admin paneliga ruxsat berilgan rasmiy Gmail va email manzillari:
              </p>
              <div className="flex flex-wrap gap-2">
                {(process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'asd10101010qwerty@gmail.com')
                  .split(',')
                  .map((em, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm dark:shadow-none"
                    >
                      <Mail size={12} />
                      <span>{em.trim()}</span>
                    </span>
                  ))}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed pt-2 border-t border-neutral-200 dark:border-[#222232]">
                Qoʻshimcha administratorlarni qoʻshish uchun <code className="text-neutral-800 dark:text-neutral-200 bg-neutral-200 dark:bg-[#20202e] px-1 py-0.5 rounded">.env.local</code> faylida <code className="text-rose-600 dark:text-rose-300 bg-neutral-200 dark:bg-[#20202e] px-1 py-0.5 rounded">NEXT_PUBLIC_ADMIN_EMAILS</code> qatoriga vergul bilan yangi email yozing yoki Supabase SQL muharririda profile rolini <code className="text-rose-600 dark:text-rose-300 bg-neutral-200 dark:bg-[#20202e] px-1 py-0.5 rounded">admin</code> qilib belgilang.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="wings-btn-primary px-8 py-3 text-xs font-bold inline-flex items-center gap-2 rounded-xl shadow-lg shadow-rose-950/50"
          >
            <Save size={16} />
            <span>{saving ? 'Saqlanmoqda...' : 'Barcha Parametrlarni Saqlash'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
