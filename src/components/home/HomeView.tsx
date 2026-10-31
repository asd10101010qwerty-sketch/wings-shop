'use client';

import React from 'react';
import Link from 'next/link';
import { Category, Product, Review } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { useI18n } from '@/lib/i18n/context';
import {
  ArrowRight,
  Sparkles,
  ChevronRight,
  Flame,
  Star,
} from 'lucide-react';

interface HomeViewProps {
  categories: Category[];
  featuredProducts: Product[];
  newArrivals: Product[];
  allProducts: Product[];
  reviews: Review[];
}

export function HomeView({
  categories,
  featuredProducts,
  newArrivals,
  reviews,
}: HomeViewProps) {
  const { locale, formatPrice } = useI18n();

  // Category name localization lookup
  const getCategoryName = (cat: Category) => {
    const slug = cat.slug?.toLowerCase();
    if (slug === 'audio') {
      return locale === 'ru' ? 'Аудио и акустика' : locale === 'en' ? 'Audio & Acoustics' : 'Audio va Akustika';
    }
    if (slug === 'footwear') {
      return locale === 'ru' ? 'Обувь' : locale === 'en' ? 'Technical Footwear' : 'Poyabzal';
    }
    if (slug === 'timepieces') {
      return locale === 'ru' ? 'Часы' : locale === 'en' ? 'Precision Watches' : 'Soatlar';
    }
    if (slug === 'streetwear') {
      return locale === 'ru' ? 'Городская одежда' : locale === 'en' ? 'Urban Streetwear' : 'Kiyim-kechak';
    }
    if (slug === 'carry') {
      return locale === 'ru' ? 'Сумки и рюкзаки' : locale === 'en' ? 'Everyday Carry' : 'Sumka & Aksessuarlar';
    }
    return cat.name;
  };

  const copy = {
    uz: {
      heroTag: 'Wings 2026 Yangi Toʻplam',
      heroTitle1: 'Uslubingizni yangi ',
      heroTitleHighlight: 'choʻqqiga',
      heroTitle2: ' koʻtaring.',
      heroDesc: 'Wings — zamonaviy shahar dinamikasi, harbiy sifatdagi texnologik materiallar, titan muhandisligi va sof akustika uygʻunligi.',
      ctaPrimary: 'Xaridni boshlash',
      ctaSecondary: 'Audio Katalog',
      badge1Title: 'Butun Oʻzbekiston',
      badge1Sub: 'Tezkor yetkazish',
      badge2Title: '100% Original',
      badge2Sub: 'Rasmiy kafolat',
      badge3Title: 'Telegram 24/7',
      badge3Sub: '@wings_shop_bot',
      featuredBadge: 'Tavsiya etiladi',
      catTag: 'Boʻlimlar',
      catTitle: 'Asosiy Kategoriyalar',
      catAll: 'Barchasi',
      catCardLink: 'Toʻplamni koʻrish',
      trendingTitle: 'Ommabop Mahsulotlar',
      trendingSub: 'Ushbu haftada eng koʻp xarid qilingan tanlovlar',
      trendingAll: 'Katalogda koʻrish',
      promoBadge: 'Cheklangan Taklif • Promo kod: WINGS10',
      promoTitle: '300 000 soʻmdan yuqori birinchi xaridingizga 10% chegirma',
      promoDesc: 'Buyurtmani rasmiylashtirishda WINGS10 promo kodini kiriting va eksklyuziv chegirmaga ega boʻling.',
      promoCta: 'Promo kod bilan xarid qilish',
      newTag: 'Yangi Kirimlar',
      newTitle: 'Eng Soʻnggi Wings Modellari',
      newAll: 'Barchasi',
      revTag: 'Mijozlarimiz Bahosi',
      revTitle: 'Wings Haqiqiy Sharhlar',
      revSub: 'Tasdiqlangan xaridorlarning samimiy fikrlari',
      revVerified: '✓ Tasdiqlangan xarid',
    },
    ru: {
      heroTag: 'Новая Коллекция Wings 2026',
      heroTitle1: 'Поднимите свой стиль на новую ',
      heroTitleHighlight: 'высоту',
      heroTitle2: '.',
      heroDesc: 'Wings — синергия урбанистической динамики, материалов армейской прочности, титановой инженерии и безупречной акустики.',
      ctaPrimary: 'Начать покупки',
      ctaSecondary: 'Каталог аудио',
      badge1Title: 'По всему Узбекистану',
      badge1Sub: 'Быстрая доставка',
      badge2Title: '100% Оригинал',
      badge2Sub: 'Официальная гарантия',
      badge3Title: 'Telegram 24/7',
      badge3Sub: '@wings_shop_bot',
      featuredBadge: 'Рекомендуем',
      catTag: 'Разделы',
      catTitle: 'Основные категории',
      catAll: 'Все категории',
      catCardLink: 'Смотреть коллекцию',
      trendingTitle: 'Популярные товары',
      trendingSub: 'Хиты продаж и выбор покупателей этой недели',
      trendingAll: 'В каталог',
      promoBadge: 'Специальное предложение • Промокод: WINGS10',
      promoTitle: 'Скидка 10% на первый заказ от 300 000 сум',
      promoDesc: 'Введите промокод WINGS10 при оформлении заказа и получите эксклюзивную скидку.',
      promoCta: 'Применить промокод',
      newTag: 'Новые поступления',
      newTitle: 'Новейшие релизы Wings',
      newAll: 'Смотреть все',
      revTag: 'Отзывы клиентов',
      revTitle: 'Честные отзывы о Wings',
      revSub: 'Мнения реальных подтвержденных покупателей',
      revVerified: '✓ Проверенная покупка',
    },
    en: {
      heroTag: 'Wings 2026 New Collection',
      heroTitle1: 'Elevate your style to the next ',
      heroTitleHighlight: 'peak',
      heroTitle2: '.',
      heroDesc: 'Wings — modern urban dynamics, military-grade technical materials, titanium engineering, and pristine acoustics.',
      ctaPrimary: 'Start Shopping',
      ctaSecondary: 'Audio Catalog',
      badge1Title: 'All Uzbekistan',
      badge1Sub: 'Express Delivery',
      badge2Title: '100% Authentic',
      badge2Sub: 'Official Warranty',
      badge3Title: 'Telegram 24/7',
      badge3Sub: '@wings_shop_bot',
      featuredBadge: 'Featured Pick',
      catTag: 'Departments',
      catTitle: 'Featured Categories',
      catAll: 'View All',
      catCardLink: 'Explore Collection',
      trendingTitle: 'Trending Products',
      trendingSub: 'Most sought-after choices of the week',
      trendingAll: 'View Catalog',
      promoBadge: 'Limited Drop • Promo Code: WINGS10',
      promoTitle: '10% off your first order over 300,000 UZS',
      promoDesc: 'Enter promo code WINGS10 at checkout to unlock your exclusive discount.',
      promoCta: 'Shop with Promo Code',
      newTag: 'New Arrivals',
      newTitle: 'Latest Wings Releases',
      newAll: 'View All',
      revTag: 'Customer Reviews',
      revTitle: 'Verified Wings Feedback',
      revSub: 'Genuine opinions from verified purchasers',
      revVerified: '✓ Verified Purchase',
    },
  }[locale] || {
    heroTag: 'Wings 2026 Yangi Toʻplam',
    heroTitle1: 'Uslubingizni yangi ',
    heroTitleHighlight: 'choʻqqiga',
    heroTitle2: ' koʻtaring.',
    heroDesc: 'Wings — zamonaviy shahar dinamikasi, harbiy sifatdagi texnologik materiallar, titan muhandisligi va sof akustika uygʻunligi.',
    ctaPrimary: 'Xaridni boshlash',
    ctaSecondary: 'Audio Katalog',
    badge1Title: 'Butun Oʻzbekiston',
    badge1Sub: 'Tezkor yetkazish',
    badge2Title: '100% Original',
    badge2Sub: 'Rasmiy kafolat',
    badge3Title: 'Telegram 24/7',
    badge3Sub: '@wings_shop_bot',
    featuredBadge: 'Tavsiya etiladi',
    catTag: 'Boʻlimlar',
    catTitle: 'Asosiy Kategoriyalar',
    catAll: 'Barchasi',
    catCardLink: 'Toʻplamni koʻrish',
    trendingTitle: 'Ommabop Mahsulotlar',
    trendingSub: 'Ushbu haftada eng koʻp xarid qilingan tanlovlar',
    trendingAll: 'Katalogda koʻrish',
    promoBadge: 'Cheklangan Taklif • Promo kod: WINGS10',
    promoTitle: '300 000 soʻmdan yuqori birinchi xaridingizga 10% chegirma',
    promoDesc: 'Buyurtmani rasmiylashtirishda WINGS10 promo kodini kiriting va eksklyuziv chegirmaga ega boʻling.',
    promoCta: 'Promo kod bilan xarid qilish',
    newTag: 'Yangi Kirimlar',
    newTitle: 'Eng Soʻnggi Wings Modellari',
    newAll: 'Barchasi',
    revTag: 'Mijozlarimiz Bahosi',
    revTitle: 'Wings Haqiqiy Sharhlar',
    revSub: 'Tasdiqlangan xaridorlarning samimiy fikrlari',
    revVerified: '✓ Tasdiqlangan xarid',
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-neutral-50 dark:bg-[#0a0a0e] border-b border-neutral-200 dark:border-[#1c1c28] py-16 sm:py-24 lg:py-28 transition-colors duration-200">
        {/* Subtle architectural background grid & radial crimson glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(225,29,72,0.12),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e10_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e10_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles size={14} />
              <span>{copy.heroTag}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.08] font-sans">
              {copy.heroTitle1}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400">
                {copy.heroTitleHighlight}
              </span>
              {copy.heroTitle2}
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl font-normal leading-relaxed">
              {copy.heroDesc}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/products"
                className="wings-btn-primary px-7 py-3.5 text-sm font-bold flex items-center gap-2.5 rounded-lg group shadow-lg hover:shadow-rose-500/20"
              >
                <span>{copy.ctaPrimary}</span>
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/categories/audio"
                className="px-6 py-3.5 bg-white dark:bg-[#161622] hover:bg-neutral-100 dark:hover:bg-[#1f1f2e] border border-neutral-300 dark:border-[#2b2b3d] text-neutral-900 dark:text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
              >
                {copy.ctaSecondary}
              </Link>
            </div>

            {/* Benefit badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200 dark:border-[#1a1a28] w-full max-w-lg">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">{copy.badge1Title}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{copy.badge1Sub}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">{copy.badge2Title}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{copy.badge2Sub}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">{copy.badge3Title}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{copy.badge3Sub}</p>
              </div>
            </div>
          </div>

          {/* Hero Editorial Card Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#262638] bg-white dark:bg-[#12121a] shadow-2xl group">
              <div className="aspect-[4/5] w-full overflow-hidden relative">
                <img
                  src="/images/products/phantom-anc-headphones.jpg"
                  alt="Wings Flagship Phantom ANC"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              {/* Float badge */}
              <div className="absolute bottom-5 inset-x-5 p-4 rounded-xl bg-white/95 dark:bg-[#14141ee6] backdrop-blur-md border border-neutral-200 dark:border-[#2a2a3e] flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-rose-500 dark:text-rose-400 font-bold">
                    {copy.featuredBadge}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Wings Phantom ANC</h4>
                  <p className="text-xs font-extrabold text-neutral-700 dark:text-neutral-200 mt-0.5">
                    {formatPrice(1290000)}
                  </p>
                </div>
                <Link
                  href="/products/wings-phantom-anc-headphones"
                  className="p-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">{copy.catTag}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
              {copy.catTitle}
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <span>{copy.catAll}</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#12121a] border border-neutral-200/90 dark:border-[#222230] hover:border-rose-500/50 transition-all duration-300 aspect-[4/5] flex flex-col justify-end p-4 shadow-sm hover:shadow-md"
            >
              <img
                src={cat.image_url || '/placeholder.png'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="relative z-10">
                <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors drop-shadow-md">
                  {getCategoryName(cat)}
                </h3>
                <p className="text-[11px] text-white/80 mt-0.5 line-clamp-1 font-medium drop-shadow-sm flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>{copy.catCardLink}</span>
                  <span>→</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING PRODUCTS */}
      <section className="py-12 bg-neutral-100/70 dark:bg-[#0c0c12] border-y border-neutral-200 dark:border-[#1c1c28] px-4 sm:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <Flame size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                  {copy.trendingTitle}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {copy.trendingSub}
                </p>
              </div>
            </div>

            <Link
              href="/products?sort=popularity"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-500 transition-colors"
            >
              <span>{copy.trendingAll}</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROMOTIONAL EDITORIAL BANNER */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-[#171722] dark:to-[#111119] border border-neutral-200 dark:border-[#2b2b3d] p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors duration-200">
          <div className="space-y-4 max-w-xl z-10">
            <span className="text-xs font-extrabold tracking-widest text-rose-500 uppercase">
              {copy.promoBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
              {copy.promoTitle}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {copy.promoDesc}
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="wings-btn-primary px-6 py-3 text-xs font-bold inline-flex items-center gap-2 rounded-lg shadow-md"
              >
                <span>{copy.promoCta}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="relative w-full md:w-1/3 aspect-video md:aspect-square rounded-xl overflow-hidden border border-neutral-300 dark:border-[#2f2f42] shrink-0">
            <img
              src="/images/products/wings-chrono-watch.jpg"
              alt="Wings Chronograph Promo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              {copy.newTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
              {copy.newTitle}
            </h2>
          </div>
          <Link
            href="/products?new=true"
            className="text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <span>{copy.newAll}</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. REAL CUSTOMER REVIEWS */}
      <section className="py-14 sm:py-20 bg-neutral-100/70 dark:bg-[#0c0c12] border-t border-neutral-200 dark:border-[#1c1c28] px-4 sm:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">
              {copy.revTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">
              {copy.revTitle}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {copy.revSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  {rev.title && (
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{rev.title}</h4>
                  )}
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-[#1c1c28] text-xs">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    {rev.user_name}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {copy.revVerified}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
