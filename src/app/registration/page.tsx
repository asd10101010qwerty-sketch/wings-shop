'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useI18n } from '@/lib/i18n/context';
import { WingsLogo } from '@/components/brand/WingsLogo';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle, MailCheck } from 'lucide-react';

export default function RegistrationPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t } = useI18n();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Parollar bir-biriga mos kelmadi');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Parol kamida 6 belgidan iborat boʻlishi kerak');
      return;
    }

    setLoading(true);

    const res = await signUp(email, password, fullName, phone);
    if (res.success) {
      if (res.requiresEmailConfirmation) {
        setRequiresConfirmation(true);
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/account');
        }, 1500);
      }
    } else {
      setErrorMsg(res.error || 'Roʻyxatdan oʻtishda xatolik yuz berdi');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:py-16 w-full">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#0f0f16] border border-neutral-200 dark:border-[#222234] shadow-xl dark:shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <WingsLogo size="md" className="justify-center mb-2" />
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t.auth.register_title}
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {t.auth.register_desc}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Fast Google One-Click Registration */}
        {!requiresConfirmation && !success && (
          <div className="space-y-3">
            <GoogleLoginButton redirectTo="/account" />

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-neutral-200 dark:border-[#222234] w-full" />
              <span className="bg-white dark:bg-[#0f0f16] px-3 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest whitespace-nowrap">
                Yoki maʼlumotlarni toʻldiring
              </span>
              <div className="border-t border-neutral-200 dark:border-[#222234] w-full" />
            </div>
          </div>
        )}

        {requiresConfirmation ? (
          <div className="p-6 rounded-xl bg-sky-50 dark:bg-[#141d28] border border-sky-200 dark:border-sky-800 text-center space-y-3">
            <MailCheck size={40} className="text-sky-600 dark:text-sky-400 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Tasdiqlash xati yuborildi!</h3>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Biz <span className="text-sky-600 dark:text-sky-300 font-semibold">{email}</span> manziliga tasdiqlash xatini yubordik. Roʻyxatdan oʻtishni yakunlash uchun xatdagi havolani bosing.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block py-2 px-5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
              >
                Kirish sahifasiga oʻtish
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle size={36} className="text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Hisob muvaffaqiyatli yaratildi!</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">Shaxsiy kabinetingizga yoʻnaltirilmoqdasiz...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Toʻliq ismingiz
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ali Valiyev"
                  className="w-full bg-neutral-50 dark:bg-[#161622] border border-neutral-300 dark:border-[#28283a] rounded-lg text-xs pl-9 pr-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-[#161622] transition-colors"
                />
                <User size={15} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
              </div>
            </div>

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
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Telefon raqamingiz
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-neutral-50 dark:bg-[#161622] border border-neutral-300 dark:border-[#28283a] rounded-lg text-xs pl-9 pr-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-[#161622] font-mono transition-colors"
                />
                <Phone size={15} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                {t.auth.password}
              </label>
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

            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                {t.auth.confirm_password}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 dark:bg-[#161622] border border-neutral-300 dark:border-[#28283a] rounded-lg text-xs pl-9 pr-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-[#161622] transition-colors"
                />
                <Lock size={15} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full wings-btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-lg transition-all"
            >
              <span>{loading ? 'Yaratilmoqda...' : t.auth.sign_up}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-neutral-200 dark:border-[#1a1a26]">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {t.auth.have_account}{' '}
            <Link href="/login" className="text-rose-600 dark:text-rose-400 font-bold hover:text-rose-500 dark:hover:text-rose-300 hover:underline transition-colors">
              {t.auth.sign_in}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
