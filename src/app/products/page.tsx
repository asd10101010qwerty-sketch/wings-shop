'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { useI18n } from '@/lib/i18n/context';
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatPrice } = useI18n();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state from URL
  const currentCategory = searchParams.get('category') || 'all';
  const currentQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentInStock = searchParams.get('in_stock') === 'true';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(currentQuery);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Load categories once
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (currentCategory && currentCategory !== 'all') {
          queryParams.set('category', currentCategory);
        }
        if (currentQuery) {
          queryParams.set('query', currentQuery);
        }
        if (currentSort) {
          queryParams.set('sort', currentSort);
        }
        if (currentInStock) {
          queryParams.set('in_stock', 'true');
        }
        if (currentMinPrice) {
          queryParams.set('min_price', currentMinPrice);
        }
        if (currentMaxPrice) {
          queryParams.set('max_price', currentMaxPrice);
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [currentCategory, currentQuery, currentSort, currentInStock, currentMinPrice, currentMaxPrice]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '' || (key === 'category' && value === 'all')) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPriceInput) params.set('min_price', minPriceInput);
    else params.delete('min_price');
    if (maxPriceInput) params.set('max_price', maxPriceInput);
    else params.delete('max_price');
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInputValue.trim() || null);
  };

  const handleClearSearch = () => {
    setSearchInputValue('');
    updateParam('q', null);
  };

  const clearAllFilters = () => {
    setSearchInputValue('');
    setMinPriceInput('');
    setMaxPriceInput('');
    router.push('/products');
  };

  const hasActiveFilters =
    currentCategory !== 'all' ||
    Boolean(currentQuery) ||
    currentInStock ||
    Boolean(currentMinPrice) ||
    Boolean(currentMaxPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full transition-colors duration-200">
      {/* Title & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#222230]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t.products.catalog_title}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {loading ? t.common.loading : `${products.length} ta mahsulot topildi`}
          </p>
        </div>

        {/* Search, Sort and Filter Trigger */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 rounded-lg bg-white dark:bg-[#161622] border border-neutral-200 dark:border-[#2b2b3d] text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 shadow-sm"
          >
            <SlidersHorizontal size={14} className="text-rose-600 dark:text-rose-400" />
            <span>{t.common.filter}</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-rose-500" />}
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-white dark:bg-[#14141e] border border-neutral-200 dark:border-[#262638] rounded-lg text-xs font-medium text-neutral-800 dark:text-neutral-200 py-2 pl-3 pr-8 focus:outline-none focus:border-rose-500 appearance-none cursor-pointer shadow-sm"
            >
              <option value="newest">{t.products.sort_newest}</option>
              <option value="price_asc">{t.products.sort_price_asc}</option>
              <option value="price_desc">{t.products.sort_price_desc}</option>
              <option value="rating">{t.products.sort_rating}</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          {/* Active Filters Clear Button */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
              <span>Faol filtrlar mavjud</span>
              <button
                onClick={clearAllFilters}
                className="font-bold underline hover:text-rose-900 dark:hover:text-white transition-colors"
              >
                Tozalash
              </button>
            </div>
          )}

          {/* Search Filter */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder="Nomi, SKU yoki toifa boʻyicha..."
              className="w-full bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222230] rounded-lg text-xs text-neutral-900 dark:text-white pl-9 pr-7 py-2.5 focus:outline-none focus:border-rose-500 shadow-sm"
            />
            <Search size={14} className="absolute left-3 top-3 text-neutral-400 pointer-events-none" />
            {searchInputValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                title="Tozalash"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Categories */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-300">
              {t.products.filter_category}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                  currentCategory === 'all'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#161622]'
                }`}
              >
                <span>{t.common.all}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                    currentCategory === cat.slug
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#161622]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Filter */}
          <div className="pt-4 border-t border-neutral-200 dark:border-[#1e1e2c]">
            <label className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
                className="w-4 h-4 rounded bg-white dark:bg-[#161622] border-neutral-300 dark:border-[#2b2b3d] text-rose-600 focus:ring-rose-500"
              />
              <span>{t.products.filter_stock}</span>
            </label>
          </div>

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-neutral-200 dark:border-[#1e1e2c] space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-300">
              {t.products.filter_price}
            </h3>
            <form onSubmit={handleApplyPriceFilter} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  placeholder="Dan (soʻm)"
                  className="w-full bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222230] rounded text-xs px-2.5 py-1.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm"
                />
                <input
                  type="number"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  placeholder="Gacha"
                  className="w-full bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222230] rounded text-xs px-2.5 py-1.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded bg-neutral-100 dark:bg-[#1a1a26] hover:bg-neutral-200 dark:hover:bg-[#242436] text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors border border-neutral-200 dark:border-transparent"
              >
                Qoʻllash
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 rounded-xl bg-neutral-100 dark:bg-[#12121a] animate-pulse border border-neutral-200 dark:border-[#1e1e2b]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#0e0e14] border border-neutral-200 dark:border-[#1e1e2b] rounded-2xl p-8 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-[#181824] text-neutral-500 flex items-center justify-center mx-auto">
                <Search size={28} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-200">{t.products.no_products}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Tanlangan filtrlar yoki soʻrov boʻyicha hech qanday mahsulot topilmadi. Filtr parametrlarini oʻzgartiring.
              </p>
              <button
                onClick={clearAllFilters}
                className="wings-btn-primary px-5 py-2 text-xs font-bold"
              >
                Filtrlarni tozalash
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white dark:bg-[#101017] border-l border-neutral-200 dark:border-[#242436] p-5 flex flex-col justify-between text-neutral-900 dark:text-white shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#222232]">
                  <h3 className="text-base font-bold">{t.common.filter}</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    {t.products.filter_category}
                  </h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        updateParam('category', 'all');
                        setMobileFilterOpen(false);
                      }}
                      className="w-full text-left py-1 text-xs text-neutral-600 dark:text-neutral-300"
                    >
                      Barchasi
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          updateParam('category', c.slug);
                          setMobileFilterOpen(false);
                        }}
                        className="w-full text-left py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-rose-500"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full wings-btn-primary py-2.5 text-xs font-bold"
              >
                Natijalarni koʻrish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-neutral-400">Yuklanmoqda...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
