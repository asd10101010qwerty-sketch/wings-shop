'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Info, RefreshCw, ShieldCheck, Globe, Zap, Check } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    chatId?: string;
  } | null>(null);

  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [customVercelUrl, setCustomVercelUrl] = useState('');
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  const fetchWebhookInfo = async () => {
    try {
      const res = await fetch('/api/admin/telegram-webhook');
      const data = await res.json();
      if (data.success) {
        setWebhookInfo(data.webhookInfo?.result || null);
        if (data.effectiveSiteUrl && data.effectiveSiteUrl.startsWith('https://')) {
          setCustomVercelUrl(data.effectiveSiteUrl);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchWebhookInfo();
    if (typeof window !== 'undefined' && window.location.origin.startsWith('https://')) {
      setCustomVercelUrl(window.location.origin);
    }
  }, []);

  const handleTestNotification = async () => {
    setTesting(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/telegram-test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResult({
          success: true,
          message: `Xabar muvaffaqiyatli yetkazildi! (Message ID: ${data.messageId})`,
          chatId: data.chatId,
        });
      } else {
        setResult({
          success: false,
          error: data.error,
          chatId: data.chatId,
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSetWebhook = async () => {
    setWebhookLoading(true);
    setWebhookStatus(null);

    try {
      const res = await fetch('/api/admin/telegram-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl: customVercelUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhookStatus(`Webhook muvaffaqiyatli ulandi: ${data.webhookUrl}`);
        await fetchWebhookInfo();
      } else {
        setWebhookStatus(`Xatolik: ${data.result?.description || data.error}`);
      }
    } catch (err: any) {
      setWebhookStatus('Xatolik: ' + err.message);
    } finally {
      setWebhookLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-neutral-200 dark:border-[#20202e]">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
          Telegram Integratsiyasi & Vercel Webhook
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Yangi buyurtmalar va doʻkon hodisalarini Telegram bot (@wings_shop_bot) orqali zudlik bilan qabul qilish
        </p>
      </div>

      {/* Bot Status Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#20202e]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Send size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Wings Telegram Boti</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">@wings_shop_bot (ID: 8953227132)</p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <ShieldCheck size={13} />
            <span>BOT FAOL</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436] space-y-1">
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">Belgilangan Admin Chat ID:</span>
            <p className="font-mono font-bold text-neutral-900 dark:text-white">7234943242</p>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436] space-y-1">
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">Aloqa kanali:</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400">Buyurtmalar va xabarlarni qabul qilmoqda</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleTestNotification}
            disabled={testing}
            className="wings-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 rounded-lg disabled:opacity-50"
          >
            <Send size={14} />
            <span>{testing ? 'Sinov xabari yuborilmoqda...' : 'Telegramga Sinov Xabari Yuborish'}</span>
          </button>
        </div>

        {result && (
          <div
            className={`p-4 rounded-xl border text-xs font-medium space-y-1 ${
              result.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {result.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{result.success ? 'Muvaffaqiyatli yetkazildi!' : 'Yetkazish xatosi'}</span>
            </div>
            <p>{result.message || result.error}</p>
          </div>
        )}
      </div>

      {/* Vercel Webhook Deployment Configuration Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-5 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#20202e]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Vercel Serverless Webhook Sozlamasi</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Vercel deploymentingizga Telegram webhookini ulash</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#1e1e2c] text-neutral-700 dark:text-neutral-300 font-mono">
            /api/telegram/webhook
          </span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#28283a] space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-neutral-500 dark:text-neutral-400">Hozirgi Telegram Webhook holati:</span>
            <span className="font-mono text-neutral-800 dark:text-neutral-200">
              {webhookInfo?.url ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold break-all">{webhookInfo.url}</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Ulanmagan (Polling rejimida)</span>
              )}
            </span>
          </div>

          {webhookInfo?.last_error_message && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px]">
              Oxirgi xatolik: {webhookInfo.last_error_message}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block">
            Vercel Domeningiz (HTTPS):
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="url"
              value={customVercelUrl}
              onChange={(e) => setCustomVercelUrl(e.target.value)}
              placeholder="https://wings-store.vercel.app"
              className="w-full bg-neutral-50 dark:bg-[#161622] border border-neutral-300 dark:border-[#2a2a3e] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 font-mono shadow-sm dark:shadow-none"
            />
            <button
              onClick={handleSetWebhook}
              disabled={webhookLoading || !customVercelUrl.startsWith('https://')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 shadow-sm"
            >
              <Zap size={14} />
              <span>{webhookLoading ? 'Ulanmoqda...' : 'Webhookni Faollashtirish'}</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Loyihani Vercel ga yuklaganingizdan soʻng, berilgan Vercel URL (masalan, <code className="text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-[#1e1e2c] px-1 py-0.5 rounded">https://your-wings-app.vercel.app</code>) ni kiriting va <b>Webhookni Faollashtirish</b> tugmasini bosing. Shundan soʻng bot Vercel Serverless API orqali 24/7 ishlaydi.
          </p>
        </div>

        {webhookStatus && (
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#2a2a3e] text-xs text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
            <Info size={15} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <span>{webhookStatus}</span>
          </div>
        )}
      </div>

      {/* Events Configuration */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4 shadow-sm dark:shadow-none">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
          Avtomatik Yuboriladigan Hodisalar
        </h2>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#222232]">
            <div>
              <p className="font-bold text-neutral-900 dark:text-white">Yangi Buyurtma (New Order)</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">Xaridor toʻliq buyurtma bergan paytda darhol xarid tarkibi bilan</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              YOQILGAN
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#222232]">
            <div>
              <p className="font-bold text-neutral-900 dark:text-white">Buyurtma Holati Oʻzgarishi (Status Change)</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">Admin buyurtmani tasdiqlaganda, kuryerga berganda yoki yetkazilganda</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              YOQILGAN
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#222232]">
            <div>
              <p className="font-bold text-neutral-900 dark:text-white">Ombor Zaxirasi Tugashi (Low Stock Warning)</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">Mahsulot qoldigʻi chegara qiymatidan pastga tushganda</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              YOQILGAN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
