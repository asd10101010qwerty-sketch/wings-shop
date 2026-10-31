'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  redirectTo?: string;
}

export function TelegramLoginButton({ redirectTo = '/account' }: Props) {
  const router = useRouter();
  const { setTelegramUser } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Expose global callback for Telegram Login Widget
    (window as any).onTelegramAuth = async (user: any) => {
      setLoading(true);
      setErrorMsg(null);
      setStatusMsg('Telegram orqali tasdiqlanmoqda...');

      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        const data = await res.json();
        if (data.success) {
          await setTelegramUser(data.user);
          setStatusMsg('Muvaffaqiyatli kirdingiz!');
          setTimeout(() => {
            router.push(redirectTo);
          }, 800);
        } else {
          setErrorMsg(data.error || 'Telegram orqali kirishda xatolik yuz berdi');
          setLoading(false);
        }
      } catch (err: any) {
        setErrorMsg('Tarmoq xatosi: ' + err.message);
        setLoading(false);
      }
    };

    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // Inject official Telegram Widget only on non-localhost domains (Telegram rejects localhost)
    if (!isLocalhost && containerRef.current && !containerRef.current.hasChildNodes()) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', 'wings_shop_bot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '8');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      containerRef.current.appendChild(script);
    }
  }, [redirectTo, router, setTelegramUser]);

  return (
    <div className="w-full space-y-3 pt-2">
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-neutral-200 dark:border-[#222234] w-full" />
        <span className="bg-white dark:bg-[#0f0f16] px-3 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">
          Yoki Telegram orqali
        </span>
        <div className="border-t border-neutral-200 dark:border-[#222234] w-full" />
      </div>

      {statusMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-center gap-2">
          <CheckCircle2 size={15} />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-center gap-2">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Widget Container */}
      <div className="flex flex-col items-center justify-center gap-3">
        <div ref={containerRef} className="flex justify-center min-h-[40px]" />

        {/* Alternative direct bot link button */}
        <a
          href="https://t.me/wings_shop_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-[#182332] dark:hover:bg-[#1f2e42] border border-sky-200 dark:border-[#2b3d56] text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs group"
        >
          <Send size={15} className="text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
          <span>Telegram Bot (@wings_shop_bot) orqali kirish</span>
        </a>
      </div>
    </div>
  );
}
