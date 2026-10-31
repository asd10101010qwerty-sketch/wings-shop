'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useI18n } from '@/lib/i18n/context';
import { WingsLogo } from '@/components/brand/WingsLogo';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || searchParams.get('next') || '/account';
  const errorParam = searchParams.get('error');

  const { signIn } = useAuth();
  const { t, locale } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam) {
      if (errorParam === 'oauth_exchange_failed') {
        setErrorMsg(
          locale === 'ru'
            ? 'Не удалось подтвердить вход через Google. Попробуйте снова.'
            : locale === 'en'
            ? 'Failed to verify Google sign-in session. Please try again.'
            : 'Google orqali autentifikatsiya tasdiqlanmadi. Qayta urinib koʻring.'
        );
      } else {
        setErrorMsg(decodeURIComponent(errorParam));
      }
    }
  }, [errorParam, locale]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await signIn(email, password);
    if (res.success) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/account');
      }
    } else {
      setErrorMsg(
        res.error ||
          (locale === 'ru'
            ? 'Ошибка входа. Неверный email или пароль.'
            : locale === 'en'
            ? 'Login failed. Invalid email or password.'
            : 'Kirishda xatolik yuz berdi. Email yoki parol notoʻgʻri.')
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16 w-full">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#0f0f16] border border-neutral-200 dark:border-[#222234] shadow-xl dark:shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <WingsLogo size="md" className="justify-center mb-2" />
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t.auth.login_title}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {t.auth.login_desc}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Fast Google One-Click Login */}
        <div className="space-y-3">
          <GoogleLoginButton redirectTo={redirectTo} />

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-neutral-200 dark:border-[#222234] w-full" />
            <span className="bg-white dark:bg-[#0f0f16] px-3 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest whitespace-nowrap">
              {locale === 'ru' ? 'Или через email' : locale === 'en' ? 'Or with email' : 'Yoki email orqali'}
            </span>
            <div className="border-t border-neutral-200 dark:border-[#222234] w-full" />
          </div>
        </div>

        {/* 2. Email & Password Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Elektron pochta (Gmail / Email)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="misol@gmail.com"
                className="w-full bg-neutral-50 dark:bg-[#161622] border border-neutral-300 dark:border-[#28283a] rounded-lg text-xs pl-9 pr-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-[#161622] transition-colors"
              />
              <Mail size={15} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                {t.auth.password}
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 transition-colors font-medium"
              >
                {t.auth.forgot_password}
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50 dark:bg-[#161622] border border-neutral-300 dark:border-[#28283a] rounded-lg text-xs pl-9 pr-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-[#161622] transition-colors"
              />
              <Lock size={15} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full wings-btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-lg transition-all shadow-md cursor-pointer"
          >
            <span>{loading ? 'Tekshirilmoqda...' : t.auth.sign_in}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-200 dark:border-[#1a1a26]">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {t.auth.no_account}{' '}
            <Link
              href="/registration"
              className="text-rose-600 dark:text-rose-400 font-bold hover:text-rose-500 dark:hover:text-rose-300 hover:underline transition-colors"
            >
              {t.auth.sign_up}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
