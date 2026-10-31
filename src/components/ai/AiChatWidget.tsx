'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export function AiChatWidget() {
  const pathname = usePathname();
  const { locale } = useI18n();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Localization labels
  const labels = {
    title:
      locale === 'ru'
        ? 'Wings AI Консультант'
        : locale === 'en'
        ? 'Wings AI Stylist'
        : 'Wings AI Maslahatchi',
    subtitle:
      locale === 'ru'
        ? 'Персональный помощник по покупкам'
        : locale === 'en'
        ? 'Personal Shopping & Style Assistant'
        : 'Shaxsiy xarid va uslub yordamchisi',
    online: locale === 'ru' ? 'Онлайн' : locale === 'en' ? 'Online' : 'Onlayn',
    welcome:
      locale === 'ru'
        ? 'Здравствуйте! Я ваш персональный ИИ-ассистент Wings. Могу подобрать идеальные наушники, обувь, часы или рассказать о доставке и скидках. О чем хотите узнать?'
        : locale === 'en'
        ? 'Hello! I am your Wings personal AI shopping stylist. Ask me anything about our audio gear, sneakers, titanium watches, sizing, or delivery!'
        : 'Assalomu alaykum! Men Wings doʻkonining sunʼiy intellekt maslahatchisiman. Sizga mos naushnik, krossovka, soat tanlashda yordam bera olaman yoki chegirma va yetkazib berish haqida aytib beraman. Nimadan boshlaymiz?',
    placeholder:
      locale === 'ru'
        ? 'Задайте вопрос о товаре или доставке...'
        : locale === 'en'
        ? 'Ask about products, sizing, delivery...'
        : 'Mahsulot, oʻlcham yoki narx haqida soʻrang...',
    clearChat:
      locale === 'ru'
        ? 'Очистить историю'
        : locale === 'en'
        ? 'Reset conversation'
        : 'Suhbatni tozalash',
    fabTooltip:
      locale === 'ru'
        ? 'Чат с ИИ-помощником Wings'
        : locale === 'en'
        ? 'Chat with Wings AI Assistant'
        : 'Wings AI Yordamchi bilan suhbat',
    typing:
      locale === 'ru'
        ? 'Wings AI печатает ответ...'
        : locale === 'en'
        ? 'Wings AI is thinking...'
        : 'Wings AI javob tayyorlamoqda...',
  };

  const starterSuggestions = {
    uz: [
      '🎧 Shovqin bosuvchi naushnik bormi?',
      '👟 Yugurish uchun qaysi krossovka qulay?',
      '⌚ Titan korpusli soat haqida ayting',
      '🎟 Chegirma promo kodi bormi?',
      '🚚 Yetkazib berish shartlari qanday?',
    ],
    ru: [
      '🎧 Какие есть наушники с шумоподавлением?',
      '👟 Посоветуйте удобные кроссовки для бега',
      '⌚ Расскажите о титановых часах',
      '🎟 Есть ли скидочный промокод?',
      '🚚 Какие условия доставки?',
    ],
    en: [
      '🎧 Which ANC headphones do you recommend?',
      '👟 What are the best running shoes?',
      '⌚ Tell me about titanium watches',
      '🎟 Is there any promo discount code?',
      '🚚 What are the shipping terms?',
    ],
  }[locale] || [
    '🎧 Shovqin bosuvchi naushnik bormi?',
    '👟 Yugurish uchun qaysi krossovka qulay?',
    '⌚ Titan korpusli soat haqida ayting',
    '🎟 Chegirma promo kodi bormi?',
  ];

  // Initialize welcome message once
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: labels.welcome,
          timestamp: new Date(),
        },
      ]);
    }
  }, [locale]);

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Escape key closes the widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Do not render on admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    setInput('');

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build previous history payload
      const historyPayload = newMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-8)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: historyPayload,
          locale,
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        (locale === 'ru'
          ? 'Спасибо за ваш вопрос. Чем еще я могу вам помочь?'
          : locale === 'en'
          ? 'Thank you for your question. How else may I assist you?'
          : 'Savolingiz uchun rahmat. Yana qanday yordam bera olaman?');

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'model',
          text: replyText,
          timestamp: new Date(),
        },
      ]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text:
            locale === 'ru'
              ? 'Произошла ошибка связи. Пожалуйста, повторите попытку.'
              : locale === 'en'
              ? 'A connection error occurred. Please try again.'
              : 'Xatolik yuz berdi. Iltimos, qayta urinib koʻring.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: labels.welcome,
        timestamp: new Date(),
      },
    ]);
  };

  // Helper to parse markdown links and bold formatting safely
  const renderFormattedText = (rawText: string) => {
    // Replace [label](url) with clickable Links
    const parts: React.ReactNode[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          renderBoldAndLines(rawText.substring(lastIndex, match.index), lastIndex)
        );
      }

      const linkLabel = match[1];
      const linkUrl = match[2];

      parts.push(
        <Link
          key={`link-${match.index}`}
          href={linkUrl}
          onClick={() => {
            if (window.innerWidth < 640) {
              setIsOpen(false);
            }
          }}
          className="inline-flex items-center gap-1 font-bold text-rose-500 hover:text-rose-400 underline underline-offset-2 transition-colors mx-0.5"
        >
          <span>{linkLabel}</span>
          <ExternalLink size={11} className="inline opacity-80" />
        </Link>
      );

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      parts.push(
        renderBoldAndLines(rawText.substring(lastIndex), lastIndex)
      );
    }

    return parts;
  };

  // Helper for bold and bullet lines
  const renderBoldAndLines = (text: string, keyPrefix: number) => {
    return (
      <span key={`text-${keyPrefix}`}>
        {text.split('\n').map((line, lIdx) => {
          // Parse **bold**
          const segments = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <React.Fragment key={`line-${lIdx}`}>
              {lIdx > 0 && <br />}
              {segments.map((seg, sIdx) => {
                if (seg.startsWith('**') && seg.endsWith('**')) {
                  return (
                    <strong key={`b-${sIdx}`} className="font-bold text-neutral-900 dark:text-white">
                      {seg.slice(2, -2)}
                    </strong>
                  );
                }
                return seg;
              })}
            </React.Fragment>
          );
        })}
      </span>
    );
  };

  return (
    <div ref={widgetRef} className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none">
      {/* Floating Action Button (FAB) */}
      <div className="relative">
        {/* Subtle glow effect */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 opacity-60 blur-md animate-pulse pointer-events-none" />
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={labels.fabTooltip}
          title={labels.fabTooltip}
          className={`relative flex items-center justify-center rounded-full transition-all duration-300 shadow-2xl cursor-pointer ${
            isOpen
              ? 'w-12 h-12 bg-neutral-900 dark:bg-[#1a1a26] text-neutral-300 hover:text-white border border-neutral-700'
              : 'w-14 h-14 bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white hover:scale-105 active:scale-95 shadow-rose-500/30'
          }`}
        >
          {isOpen ? (
            <X size={22} className="transition-transform duration-200 rotate-0 hover:rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Sparkles size={24} className="animate-spin-slow text-white" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white dark:border-[#0e0e16] rounded-full" />
              )}
            </div>
          )}
        </button>

        {/* Small desktop bubble prompt when closed */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden md:flex absolute right-16 top-1/2 -translate-y-1/2 items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#151522] border border-neutral-200 dark:border-[#2a2a3e] shadow-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 whitespace-nowrap cursor-pointer hover:border-rose-500/50 transition-all hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Wings AI</span>
          </div>
        )}
      </div>

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="fixed sm:absolute bottom-20 right-0 sm:right-0 w-[calc(100vw-2rem)] sm:w-[390px] md:w-[410px] h-[520px] max-h-[82vh] bg-white/95 dark:bg-[#0e0e16]/95 backdrop-blur-xl border border-neutral-200 dark:border-[#262638] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 z-50">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-neutral-50 via-rose-50/40 to-neutral-50 dark:from-[#13131e] dark:via-[#1c1522] dark:to-[#13131e] border-b border-neutral-200 dark:border-[#222232] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
                <Sparkles size={16} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                    {labels.title}
                  </h3>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {labels.online}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                  {labels.subtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-[#1e1e2c] rounded-lg transition-colors cursor-pointer"
                title={labels.clearChat}
                aria-label={labels.clearChat}
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-[#1e1e2c] rounded-lg transition-colors cursor-pointer"
                aria-label="Yopish"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  {!isUser ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles size={12} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={12} />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-rose-600 text-white rounded-tr-none'
                        : 'bg-neutral-100 dark:bg-[#161622] text-neutral-800 dark:text-neutral-200 border border-neutral-200/70 dark:border-[#222232] rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                        {renderFormattedText(m.text)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={12} />
                </div>
                <div className="bg-neutral-100 dark:bg-[#161622] border border-neutral-200/70 dark:border-[#222232] rounded-2xl rounded-tl-none px-3.5 py-2.5 text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] ml-1 font-medium">{labels.typing}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Shown if conversation has only 1-2 messages) */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-3 pb-2 pt-1 border-t border-neutral-100 dark:border-[#1a1a28] bg-neutral-50/50 dark:bg-[#0e0e16]/50">
              <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
                {locale === 'ru' ? 'Быстрые вопросы:' : locale === 'en' ? 'Quick suggestions:' : 'Tezkor savollar:'}
              </p>
              <div className="flex flex-wrap gap-1">
                {starterSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-[#181826] border border-neutral-200 dark:border-[#2a2a3e] text-neutral-700 dark:text-neutral-300 hover:border-rose-500/50 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-left cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-2.5 bg-neutral-50/80 dark:bg-[#12121c]/90 border-t border-neutral-200 dark:border-[#202030]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={labels.placeholder}
                disabled={isLoading}
                className="flex-1 bg-white dark:bg-[#181826] text-neutral-900 dark:text-white placeholder:text-neutral-400 text-xs px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#2c2c3e] focus:outline-none focus:border-rose-500 transition-colors"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Yuborish"
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  input.trim() && !isLoading
                    ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-neutral-200 dark:bg-[#202030] text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
