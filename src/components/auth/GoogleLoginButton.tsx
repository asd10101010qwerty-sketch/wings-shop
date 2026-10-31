'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useI18n } from '@/lib/i18n/context';
import { AlertCircle, ExternalLink, HelpCircle, X, Check } from 'lucide-react';

interface GoogleLoginButtonProps {
  redirectTo?: string;
  className?: string;
}

export function GoogleLoginButton({
  redirectTo = '/account',
  className = '',
}: GoogleLoginButtonProps) {
  const { signInWithGoogle } = useAuth();
  const { locale } = useI18n();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlhzaalkeymydemzrnww.supabase.co';
  const callbackUrl = `${supabaseUrl}/auth/v1/callback`;

  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoogleClick = async () => {
    setErrorMsg(null);
    setLoading(true);

    const res = await signInWithGoogle(redirectTo);
    if (!res.success) {
      setLoading(false);
      const err = res.error || '';
      if (
        err.toLowerCase().includes('not enabled') ||
        err.toLowerCase().includes('unsupported provider') ||
        err.toLowerCase().includes('provider is disabled') ||
        err.toLowerCase().includes('invalid_request')
      ) {
        setErrorMsg(
          locale === 'ru'
            ? 'Google OAuth провайдер еще не включен в панели управления Supabase.'
            : locale === 'en'
            ? 'Google OAuth provider is not yet enabled in your Supabase project dashboard.'
            : 'Google OAuth provayderi hali Supabase loyihangizda yoqilmagan.'
        );
        setShowSetupGuide(true);
      } else {
        setErrorMsg(err);
      }
    }
  };

  const labels = {
    uz: {
      button: 'Google orqali davom etish',
      loading: 'Google tizimiga ulanmoqda...',
      help: 'Sozlash yoʻriqnomasi',
      guideTitle: 'Supabase-da Google OAuth-ni yoqish boʻyicha yoʻriqnoma',
      step1: '1. Google Cloud Console (console.cloud.google.com) sahifasida OAuth 2.0 Web Client ID yarating.',
      step2: '2. "Authorized redirect URIs" qatoriga quyidagi manzilni qoʻshing:',
      step3: '3. Supabase Dashboard -> Authentication -> Providers -> Google boʻlimiga kiring, Client ID va Client Secret ni kiritib "Save" tugmasini bosing.',
      copy: 'Nusxa olish',
      copied: 'Nusxa olindi!',
      close: 'Yopish',
      openSupabase: 'Supabase Dashboard ochish',
      openGoogleConsole: 'Google Cloud Console ochish',
    },
    ru: {
      button: 'Продолжить с Google',
      loading: 'Подключение к Google...',
      help: 'Инструкция по настройке',
      guideTitle: 'Как включить вход через Google в Supabase',
      step1: '1. В Google Cloud Console (console.cloud.google.com) создайте OAuth 2.0 Web Client ID.',
      step2: '2. В поле "Authorized redirect URIs" добавьте этот URL:',
      step3: '3. В Supabase Dashboard перейдите в Authentication -> Providers -> Google, вставьте Client ID и Client Secret и нажмите "Save".',
      copy: 'Скопировать',
      copied: 'Скопировано!',
      close: 'Закрыть',
      openSupabase: 'Открыть Supabase',
      openGoogleConsole: 'Открыть Google Console',
    },
    en: {
      button: 'Continue with Google',
      loading: 'Connecting to Google...',
      help: 'Setup guide',
      guideTitle: 'How to enable Google OAuth in Supabase',
      step1: '1. In Google Cloud Console (console.cloud.google.com), create an OAuth 2.0 Web Client ID.',
      step2: '2. Add the following to "Authorized redirect URIs":',
      step3: '3. In Supabase Dashboard -> Authentication -> Providers -> Google, paste Client ID and Secret and click "Save".',
      copy: 'Copy',
      copied: 'Copied!',
      close: 'Close',
      openSupabase: 'Open Supabase Dashboard',
      openGoogleConsole: 'Open Google Console',
    },
  }[locale] || {
    button: 'Google orqali davom etish',
    loading: 'Google tizimiga ulanmoqda...',
    help: 'Sozlash yoʻriqnomasi',
    guideTitle: 'Supabase-da Google OAuth-ni yoqish boʻyicha yoʻriqnoma',
    step1: '1. Google Cloud Console (console.cloud.google.com) sahifasida OAuth 2.0 Web Client ID yarating.',
    step2: '2. "Authorized redirect URIs" qatoriga quyidagi manzilni qoʻshing:',
    step3: '3. Supabase Dashboard -> Authentication -> Providers -> Google boʻlimiga kiring, Client ID va Client Secret ni kiritib "Save" tugmasini bosing.',
    copy: 'Nusxa olish',
    copied: 'Nusxa olindi!',
    close: 'Yopish',
    openSupabase: 'Supabase Dashboard ochish',
    openGoogleConsole: 'Google Cloud Console ochish',
  };

  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      {/* Official styled Google Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="w-full relative flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg bg-white dark:bg-[#161622] hover:bg-neutral-50 dark:hover:bg-[#1e1e2d] border border-neutral-300 dark:border-[#2a2a3e] text-neutral-800 dark:text-neutral-100 font-semibold text-xs transition-all shadow-xs hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
      >
        {/* Google 4-Color Flat SVG Icon */}
        {loading ? (
          <div className="w-4 h-4 border-2 border-neutral-400 border-t-rose-600 rounded-full animate-spin shrink-0" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}

        <span className="truncate">
          {loading ? labels.loading : labels.button}
        </span>
      </button>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setShowSetupGuide(true)}
            className="text-[11px] font-bold underline shrink-0 hover:text-rose-600 dark:hover:text-rose-200"
          >
            {labels.help}
          </button>
        </div>
      )}

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12121b] border border-neutral-200 dark:border-[#2a2a3e] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-[#202030]">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-rose-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {labels.guideTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowSetupGuide(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <p>{labels.step1}</p>

              <div>
                <p className="font-semibold mb-1">{labels.step2}</p>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-[#1a1a26] border border-neutral-200 dark:border-[#2a2a3c] font-mono text-[11px] break-all">
                  <span className="select-all flex-1 text-rose-600 dark:text-rose-400">
                    {callbackUrl}
                  </span>
                  <button
                    onClick={copyCallbackUrl}
                    className="p-1.5 rounded-md bg-white dark:bg-[#252538] border border-neutral-300 dark:border-[#333348] hover:bg-neutral-50 dark:hover:bg-[#2e2e44] text-neutral-700 dark:text-neutral-200 shrink-0 font-sans text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">{labels.copied}</span>
                      </>
                    ) : (
                      labels.copy
                    )}
                  </button>
                </div>
              </div>

              <p>{labels.step3}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-200 dark:border-[#202030]">
              <div className="flex items-center gap-2">
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <span>{labels.openGoogleConsole}</span>
                  <ExternalLink size={11} />
                </a>
                <span>•</span>
                <a
                  href="https://supabase.com/dashboard/project/vlhzaalkeymydemzrnww/auth/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <span>{labels.openSupabase}</span>
                  <ExternalLink size={11} />
                </a>
              </div>

              <button
                onClick={() => setShowSetupGuide(false)}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#1e1e2d] text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-[#28283a] transition-colors"
              >
                {labels.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
