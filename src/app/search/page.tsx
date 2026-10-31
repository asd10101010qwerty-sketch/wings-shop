'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import {
  Search as SearchIcon,
  X,
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  ArrowUpDown,
  Check,
  PackageX,
  Layers,
  ChevronRight,
} from 'lucide-react';

const POPULAR_SEARCHES = [
  'Wings Phantom ANC',
  'Titan soat',
  'Carbon krossovka',
  '500 GSM Hoodie',
  'Ballistic Sling',
  'Apex Earbuds',
  'StormShield Parka',
  'MagSafe Cardholder',
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('category') || 'all';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialInStock = searchParams.get('in_stock') === 'true';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [sortOption, setSortOption] = useState(initialSort);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSortOption(searchParams.get('sort') || 'newest');
    setInStockOnly(searchParams.get('in_stock') === 'true');
  }, [searchParams]);

  // Load categories and fallback featured products
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?featured=true&limit=8'),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        setCategories(catData || []);
        setFeaturedProducts(prodData.products || []);
      } catch (err) {
        console.error('Initial search data fetch error:', err);
      }
    }
    loadInitialData();
  }, []);

  // Update URL helper
  const updateUrl = (newQuery: string, newCat: string, newSort: string, newInStock: boolean) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set('q', newQuery.trim());
    if (newCat && newCat !== 'all') params.set('category', newCat);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);
    if (newInStock) params.set('in_stock', 'true');

    const str = params.toString();
    router.replace(`/search${str ? `?${str}` : ''}`, { scroll: false });
  };

  // Perform search
  useEffect(() => {
    async function doSearch() {
      if (!initialQuery.trim() && initialCat === 'all' && !initialInStock) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (initialQuery.trim()) queryParams.set('query', initialQuery.trim());
        if (initialCat && initialCat !== 'all') queryParams.set('category', initialCat);
        if (initialSort) queryParams.set('sort', initialSort);
        if (initialInStock) queryParams.set('in_stock', 'true');

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }

    doSearch();
  }, [initialQuery, initialCat, initialSort, initialInStock]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query, selectedCategory, sortOption, inStockOnly);
  };

  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategory(catSlug);
    updateUrl(query, catSlug, sortOption, inStockOnly);
  };

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    updateUrl(query, selectedCategory, newSort, inStockOnly);
  };

  const handleInStockToggle = () => {
    const nextVal = !inStockOnly;
    setInStockOnly(nextVal);
    updateUrl(query, selectedCategory, sortOption, nextVal);
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSortOption('newest');
    setInStockOnly(false);
    router.push('/search');
  };

  const hasActiveFilters = Boolean(
    initialQuery.trim() || initialCat !== 'all' || initialSort !== 'newest' || initialInStock
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full transition-colors duration-200">
      {/* Search Header Banner */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
        <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">
          Intellektual Qidiruv
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          Wings Qidiruv Markazi
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
          Mahsulot nomi, SKU kodi, toifasi yoki xususiyatlari orqali tezkor va aniq qidiring
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mt-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masalan: Phantom ANC, titan soat, runners, sling..."
            className="w-full bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#282838] rounded-2xl text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 pl-12 pr-28 py-3.5 focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-xl transition-all"
          />
          <SearchIcon size={20} className="absolute left-4 top-4 text-neutral-400" />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                updateUrl('', selectedCategory, sortOption, inStockOnly);
              }}
              className="absolute right-24 top-3.5 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              title="Tozalash"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 wings-btn-primary text-xs font-bold rounded-xl shadow-xs"
          >
            Qidirish
          </button>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1 mr-1">
            <TrendingUp size={12} className="text-rose-500" />
            <span>Ommabop:</span>
          </span>
          {POPULAR_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => {
                setQuery(item);
                updateUrl(item, selectedCategory, sortOption, inStockOnly);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-[#181824] hover:bg-neutral-200/80 dark:hover:bg-[#202030] text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs & Sort Controls */}
      <div className="bg-white dark:bg-[#101018] border border-neutral-200 dark:border-[#222232] rounded-2xl p-3 sm:p-4 mb-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-[#181824] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#222232]'
              }`}
            >
              Barcha toifalar
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-[#181824] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#222232]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Sort & In-Stock Toggles */}
          <div className="flex items-center gap-3 shrink-0">
            {/* In-Stock Toggle */}
            <button
              onClick={handleInStockToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                inStockOnly
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-neutral-100 dark:bg-[#181824] text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-[#282838]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                  inStockOnly ? 'bg-emerald-600 text-white' : 'border border-neutral-400 dark:border-neutral-500'
                }`}
              >
                {inStockOnly && <Check size={10} />}
              </div>
              <span>Faqat mavjudlari</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-[#181824] border border-neutral-200 dark:border-[#282838] rounded-xl px-2.5 py-1.5">
              <ArrowUpDown size={13} className="text-neutral-400 shrink-0" />
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value="newest">Eng yangilari</option>
                <option value="price_asc">Narx: arzondan qimmatga</option>
                <option value="price_desc">Narx: qimmatdan arzonga</option>
                <option value="rating">Reyting boʻyicha</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Summary Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-neutral-100 dark:border-[#1a1a24]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Topilgan mahsulotlar: <b className="text-neutral-900 dark:text-white">{products.length} ta</b>
              </span>

              {initialQuery && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  <span>"{initialQuery}"</span>
                  <button
                    onClick={() => {
                      setQuery('');
                      updateUrl('', selectedCategory, sortOption, inStockOnly);
                    }}
                    className="hover:text-rose-950 dark:hover:text-white"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#1e1e2c] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-[#2c2c3c]">
                  <span>{categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</span>
                  <button onClick={() => handleCategorySelect('all')} className="hover:text-rose-500">
                    <X size={11} />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  <span>Faqat mavjud</span>
                  <button onClick={handleInStockToggle} className="hover:text-emerald-900">
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>

      {/* Results Presentation */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-neutral-100 dark:bg-[#12121a] animate-pulse border border-neutral-200 dark:border-[#1e1e2b]"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : hasActiveFilters ? (
          /* ZERO RESULTS STATE WITH SUGGESTIONS & FEATURED */
          <div className="space-y-12">
            <div className="text-center py-12 px-6 rounded-2xl bg-white dark:bg-[#101018] border border-neutral-200 dark:border-[#20202e] max-w-xl mx-auto space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
                <PackageX size={24} />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Hech qanday mahsulot topilmadi
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Qidiruv soʻzini toʻgʻri yozilganligini tekshiring yoki filtrlarni tozalab qaytadan urinib koʻring.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 wings-btn-primary text-xs font-bold rounded-xl mt-2 inline-flex items-center gap-1.5"
              >
                <span>Barcha filtrlarni tozalash</span>
              </button>
            </div>

            {/* Featured items so user doesn't leave empty-handed */}
            {featuredProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-500 tracking-wider uppercase">Tavsiya</span>
                    <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                      Sizga yoqishi mumkin boʻlgan modellar
                    </h3>
                  </div>
                  <Link
                    href="/products"
                    className="text-xs font-bold text-neutral-500 hover:text-rose-500 flex items-center gap-1"
                  >
                    <span>Katalogga oʻtish</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* EMPTY QUERY EXPLORATION STATE */
          <div className="space-y-12">
            {/* Category Cards Showcase */}
            {categories.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">
                  Toifalar boʻyicha saralash
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className="p-4 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] hover:border-rose-400/60 dark:hover:border-rose-500/60 text-left transition-all duration-200 group flex flex-col justify-between h-32 shadow-xs"
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#1c1c28] border border-neutral-200 dark:border-[#28283a]">
                        <img
                          src={cat.image_url || '/images/categories/cat-audio.jpg'}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-rose-500 transition-colors">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-0.5 mt-0.5">
                          <span>Batafsil</span>
                          <ChevronRight size={10} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Catalog Grid */}
            {featuredProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">
                    Ommabop Wings Modellar
                  </h3>
                  <Link
                    href="/products"
                    className="text-xs font-bold text-neutral-500 hover:text-rose-500 flex items-center gap-1"
                  >
                    <span>Barchasini koʻrish</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-neutral-400">Yuklanmoqda...</div>}>
      <SearchContent />
    </Suspense>
  );
}
