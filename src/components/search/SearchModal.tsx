'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, Category } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import {
  Search,
  X,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Layers,
  Flame,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_BY_LOCALE: Record<string, string[]> = {
  uz: [
    'Wings Phantom ANC',
    'Titan soat',
    'Carbon krossovka',
    '500 GSM Hoodie',
    'Ballistic Sling',
    'Apex Earbuds',
    'StormShield Parka',
  ],
  ru: [
    'Wings Phantom ANC',
    'Титановые часы',
    'Карбоновые кроссовки',
    'Худи 500 GSM',
    'Сумка-слинг Cordura',
    'Apex Earbuds',
    'Тактическая парка',
  ],
  en: [
    'Phantom ANC Headphones',
    'Titanium Chronograph',
    'Carbon Runners',
    '500 GSM Boxy Hoodie',
    'Modular Sling Bag',
    'Apex Spatial Earbuds',
    'StormShield Parka',
  ],
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { locale, formatPrice } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const popularList = POPULAR_BY_LOCALE[locale] || POPULAR_BY_LOCALE.uz;

  // Multilingual labels dictionary
  const labels = {
    placeholder:
      locale === 'ru'
        ? 'Поиск по названию, модели, SKU или категории...'
        : locale === 'en'
        ? 'Search by product name, SKU, or category...'
        : 'Mahsulot nomi, turi, SKU yoki toifa...',
    recentTitle:
      locale === 'ru' ? 'Недавние поиски' : locale === 'en' ? 'Recent searches' : 'Oxirgi qidiruvlar',
    popularTitle:
      locale === 'ru' ? 'Популярные запросы' : locale === 'en' ? 'Popular searches' : 'Ommabop qidiruvlar',
    featuredTitle:
      locale === 'ru'
        ? 'Рекомендуемые модели'
        : locale === 'en'
        ? 'Trending flagship picks'
        : 'Tavsiya etilayotgan xaridorgir modellar',
    categoriesTitle:
      locale === 'ru' ? 'Категории' : locale === 'en' ? 'Matched categories' : 'Toifalar',
    productsTitle:
      locale === 'ru' ? 'Товары' : locale === 'en' ? 'Products' : 'Mahsulotlar',
    viewAll:
      locale === 'ru' ? 'Все результаты' : locale === 'en' ? 'View all' : 'Barchasini koʻrish',
    noResults:
      locale === 'ru'
        ? 'По вашему запросу ничего не найдено'
        : locale === 'en'
        ? 'No products matched your search'
        : 'boʻyicha hech narsa topilmadi',
    noResultsTip:
      locale === 'ru'
        ? 'Попробуйте изменить запрос или выберите один из популярных вариантов:'
        : locale === 'en'
        ? 'Try different keywords or explore trending categories:'
        : 'Boshqa soʻzlar, SKU raqami yoki quyidagi ommabop qidiruvlardan birini tanlang:',
    clear:
      locale === 'ru' ? 'Очистить' : locale === 'en' ? 'Clear' : 'Tozalash',
    newBadge:
      locale === 'ru' ? 'Новинка' : locale === 'en' ? 'New' : 'Yangi',
    keySelect:
      locale === 'ru' ? 'выбрать' : locale === 'en' ? 'select' : 'tanlash',
    keyOpen:
      locale === 'ru' ? 'открыть' : locale === 'en' ? 'open' : 'ochish',
    fullSearchLink:
      locale === 'ru'
        ? 'Перейти на страницу поиска'
        : locale === 'en'
        ? 'Go to search page'
        : 'Qidiruv sahifasiga oʻtish',
  };

  // Load recent searches and featured items
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wings_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // ignore
    }

    // Load top featured products to show right away
    fetch('/api/products?featured=true&limit=4')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setFeaturedProducts(data.products);
      })
      .catch(() => {});
  }, []);

  // Save recent search
  const saveRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('wings_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== item);
    setRecentSearches(updated);
    try {
      localStorage.setItem('wings_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('wings_recent_searches');
    } catch {
      // ignore
    }
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      setSelectedIndex(-1);
    } else {
      setQuery('');
      setProducts([]);
      setCategories([]);
    }
  }, [isOpen]);

  // Debounced search fetch
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setCategories([]);
      setTotalMatches(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=6`);
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setTotalMatches(data.total || 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Submit search and navigate to full search page
  const handleFullSearch = (searchTerm?: string) => {
    const term = (searchTerm ?? query).trim();
    if (!term) return;
    saveRecentSearch(term);
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    const itemsCount = products.length;
    if (itemsCount === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleFullSearch();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < itemsCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemsCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < itemsCount) {
        const selected = products[selectedIndex];
        saveRecentSearch(selected.name);
        onClose();
        router.push(`/products/${selected.slug}`);
      } else {
        handleFullSearch();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mahsulotlarni qidirish"
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-4 bg-black/75 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111119] border border-neutral-200 dark:border-[#222234] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-[#1e1e2c] bg-neutral-50/80 dark:bg-[#141420]/80">
          <Search size={20} className="text-neutral-400 dark:text-neutral-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.placeholder}
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
          />

          {loading && (
            <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin shrink-0 mr-2" />
          )}

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 mr-2 transition-colors rounded-md cursor-pointer"
              title={labels.clear}
            >
              <X size={16} />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-200/60 dark:bg-[#1f1f2e] rounded border border-neutral-300 dark:border-[#2e2e42]">
            ESC
          </kbd>
        </div>

        {/* Content Body */}
        <div ref={listRef} className="overflow-y-auto divide-y divide-neutral-100 dark:divide-[#1a1a26] p-2 sm:p-3 space-y-3">
          {/* 1. MATCHED CATEGORIES (when searching) */}
          {categories.length > 0 && query.trim() && (
            <div className="px-2 pt-1 pb-2">
              <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                <Layers size={13} className="text-rose-500" />
                <span>{labels.categoriesTitle}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    onClick={() => {
                      saveRecentSearch(c.name);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#181824] hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-neutral-200 dark:border-[#282838] hover:border-rose-400/50 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors group"
                  >
                    <span>{c.name}</span>
                    <ChevronRight size={12} className="text-neutral-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 2. MATCHED PRODUCTS (when searching) */}
          {products.length > 0 ? (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between px-2.5 py-1 mb-1">
                <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <ShoppingBag size={13} className="text-rose-500" />
                  <span>
                    {labels.productsTitle} ({totalMatches})
                  </span>
                </p>
                <button
                  onClick={() => handleFullSearch()}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{labels.viewAll}</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {products.map((product, idx) => {
                const isSelected = selectedIndex === idx;
                const thumb = product.images?.[0]?.image_url || '/images/products/phantom-anc-headphones.jpg';
                const formattedPrice = formatPrice(product.sale_price ?? product.price);
                const oldPrice = product.sale_price ? formatPrice(product.price) : null;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      saveRecentSearch(product.name);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/60 shadow-xs'
                        : 'hover:bg-neutral-100 dark:hover:bg-[#181824] border border-transparent'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-[#1c1c28] border border-neutral-200 dark:border-[#28283a] shrink-0">
                      <img
                        src={thumb}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                          {product.name}
                        </h4>
                        {product.is_new && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 shrink-0">
                            {labels.newBadge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                          {product.sku}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          {formattedPrice}
                        </span>
                        {oldPrice && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            {oldPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-neutral-400 dark:text-neutral-600 group-hover:text-rose-500">
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : query.trim() && !loading ? (
            /* ZERO RESULTS STATE */
            <div className="text-center py-8 px-4 space-y-2">
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                "{query}" {labels.noResults}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                {labels.noResultsTip}
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-3">
                {popularList.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      handleFullSearch(item);
                    }}
                    className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-[#181824] hover:bg-neutral-200 dark:hover:bg-[#202030] text-neutral-700 dark:text-neutral-300 font-medium transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* 3. RECENT SEARCHES (when input is empty) */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="px-2 pt-2 pb-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Clock size={13} className="text-neutral-400" />
                  <span>{labels.recentTitle}</span>
                </p>
                <button
                  onClick={clearAllRecent}
                  className="text-[11px] text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  {labels.clear}
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      handleFullSearch(item);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#171724] cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock size={13} className="text-neutral-400 group-hover:text-rose-500" />
                      <span>{item}</span>
                    </div>
                    <button
                      onClick={(e) => removeRecentSearch(e, item)}
                      className="p-1 text-neutral-400 hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity"
                      title={labels.clear}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. POPULAR TRENDING SEARCHES */}
          {!query.trim() && (
            <div className="px-2 pt-2 pb-2">
              <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2.5 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-rose-500" />
                <span>{labels.popularTitle}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {popularList.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      handleFullSearch(item);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-[#181824] hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-neutral-200 dark:border-[#282838] hover:border-rose-400/50 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <Sparkles size={11} className="text-rose-500" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. FEATURED PRODUCTS PREVIEW (When search is empty, show instant picks!) */}
          {!query.trim() && featuredProducts.length > 0 && (
            <div className="px-2 pt-2 pb-1">
              <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2.5 flex items-center gap-1.5">
                <Flame size={13} className="text-amber-500" />
                <span>{labels.featuredTitle}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {featuredProducts.slice(0, 4).map((p) => {
                  const thumb = p.images?.[0]?.image_url || '/images/products/phantom-anc-headphones.jpg';
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => {
                        saveRecentSearch(p.name);
                        onClose();
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 dark:bg-[#151522] hover:bg-rose-50/70 dark:hover:bg-rose-950/30 border border-neutral-200/70 dark:border-[#222232] hover:border-rose-400/40 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-200 dark:bg-[#1c1c28] shrink-0 border border-neutral-200 dark:border-[#262638]">
                        <img
                          src={thumb}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-rose-500 transition-colors">
                          {p.name}
                        </h5>
                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                          {formatPrice(p.sale_price ?? p.price)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-[#0e0e16] border-t border-neutral-200 dark:border-[#1e1e2c] flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
          <div className="hidden sm:flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-[#1c1c28] border border-neutral-300 dark:border-[#28283a] text-[10px] font-mono mr-1">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-[#1c1c28] border border-neutral-300 dark:border-[#28283a] text-[10px] font-mono mr-1">
                ↓
              </kbd>
              {labels.keySelect}
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-[#1c1c28] border border-neutral-300 dark:border-[#28283a] text-[10px] font-mono mr-1">
                ↵
              </kbd>
              {labels.keyOpen}
            </span>
          </div>

          <button
            onClick={() => handleFullSearch()}
            disabled={!query.trim()}
            className="ml-auto flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-40 disabled:hover:no-underline cursor-pointer"
          >
            <span>{labels.fullSearchLink}</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
