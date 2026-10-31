'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, Category } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, AlertTriangle, Filter, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const { formatPrice } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?limit=200'),
        fetch('/api/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData.products || []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (e) {
      console.error(e);
      notify('Maʼlumotlarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}" mahsulotini oʻchirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        notify(`"${name}" mahsuloti oʻchirildi`);
      } else {
        throw new Error();
      }
    } catch (e) {
      notify('Mahsulotni oʻchirishda xatolik yuz berdi', 'error');
    }
  };

  const handleTogglePublish = async (prod: Product) => {
    const updatedStatus = !prod.is_published;
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_published: updatedStatus } : p))
    );

    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: updatedStatus }),
      });
      if (!res.ok) throw new Error();
      notify(`"${prod.name}" ${updatedStatus ? 'faollashtirildi' : 'nofaol qilindi'}`);
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, is_published: prod.is_published } : p))
      );
      notify('Holatni oʻzgartirib boʻlmadi', 'error');
    }
  };

  const filtered = products
    .filter((p) => {
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory && p.category?.slug !== selectedCategory) {
        return false;
      }
      if (publishFilter === 'published' && !p.is_published) return false;
      if (publishFilter === 'draft' && p.is_published) return false;

      if (stockFilter === 'out_of_stock' && p.stock_quantity > 0) return false;
      if (stockFilter === 'low_stock' && (p.stock_quantity > p.low_stock_threshold || p.stock_quantity === 0)) return false;
      if (stockFilter === 'in_stock' && p.stock_quantity === 0) return false;

      return true;
    })
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#20202e]">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Mahsulotlar Boshqaruvi</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Katalogdagi barcha tovarlarni tahrirlash, qoʻshish, narxlar va qoldiqlarni nazorat qilish
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="wings-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 rounded-xl shrink-0"
        >
          <Plus size={16} />
          <span>Yangi Mahsulot Qoʻshish</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi yoki artikul..."
            className="w-full bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs text-neutral-900 dark:text-white pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors shadow-xs"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs px-3.5 py-2.5 text-neutral-800 dark:text-neutral-300 focus:outline-none focus:border-rose-500 font-semibold shadow-xs"
        >
          <option value="all">Barcha Kategoriyalar</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as any)}
          className="bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs px-3.5 py-2.5 text-neutral-800 dark:text-neutral-300 focus:outline-none focus:border-rose-500 font-semibold shadow-xs"
        >
          <option value="all">Barcha Zaxira Holatlari</option>
          <option value="in_stock">Mavjud (In stock)</option>
          <option value="low_stock">Kam qolgan (Low stock)</option>
          <option value="out_of_stock">Tugagan (Out of stock)</option>
        </select>

        {/* Publish Filter */}
        <select
          value={publishFilter}
          onChange={(e) => setPublishFilter(e.target.value as any)}
          className="bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs px-3.5 py-2.5 text-neutral-800 dark:text-neutral-300 focus:outline-none focus:border-rose-500 font-semibold shadow-xs"
        >
          <option value="all">Barcha Holatlar</option>
          <option value="published">Faol (Published)</option>
          <option value="draft">Qoralama (Draft)</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-[#161622] text-neutral-600 dark:text-neutral-400 font-bold border-b border-neutral-200 dark:border-[#222232]">
              <tr>
                <th className="py-3.5 px-4">Tovar</th>
                <th className="py-3.5 px-4">Kategoriya</th>
                <th className="py-3.5 px-4">Narxi</th>
                <th className="py-3.5 px-4">Qoldiq</th>
                <th className="py-3.5 px-4">Holat</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#1e1e2c]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Yuklanmoqda...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    Mahsulotlar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-50 dark:hover:bg-[#161622] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0]?.image_url || '/placeholder.png'}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover bg-neutral-100 dark:bg-[#1c1c28] border border-neutral-200 dark:border-[#2b2b3d] shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 dark:text-white truncate max-w-xs">{prod.name}</p>
                          <p className="text-[10px] text-neutral-500 font-mono">{prod.sku || 'SKU yoʻq'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 font-medium">
                      {prod.category?.name || 'Kategoriyasiz'}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      <div>
                        <span className="text-rose-600 dark:text-rose-400">
                          {formatPrice(prod.sale_price ?? prod.price)}
                        </span>
                        {prod.sale_price && (
                          <span className="block text-[10px] text-neutral-500 line-through">
                            {formatPrice(prod.price)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        {prod.stock_quantity === 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 text-[11px] font-bold">Tugagan (0)</span>
                        ) : prod.stock_quantity <= prod.low_stock_threshold ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                            <AlertTriangle size={12} />
                            {prod.stock_quantity} ta (oz)
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">{prod.stock_quantity} ta</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePublish(prod)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                          prod.is_published
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                        title="Saytda koʻrinishini oʻzgartirish"
                      >
                        {prod.is_published ? 'Faol' : 'Qoralama'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1f1f2e] transition-colors"
                          title="Doʻkonda koʻrish"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/admin/products/${prod.id}`}
                          className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-[#1f1f2e] transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#1f1f2e] transition-colors"
                          title="Oʻchirish"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
