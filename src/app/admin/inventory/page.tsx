'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Boxes, AlertTriangle, Plus, Minus, Check, Search, Filter, CheckCircle2, AlertCircle, Save, Package } from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editing state for direct inputs
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [editingThreshold, setEditingThreshold] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      const prods = data.products || [];
      setProducts(prods);

      const stockMap: Record<string, number> = {};
      const threshMap: Record<string, number> = {};
      prods.forEach((p: Product) => {
        stockMap[p.id] = p.stock_quantity;
        threshMap[p.id] = p.low_stock_threshold;
      });
      setEditingStock(stockMap);
      setEditingThreshold(threshMap);
    } catch (e) {
      console.error(e);
      notify('Ombor maʼlumotlarini yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdjustDelta = async (id: string, delta: number) => {
    const currentQty = editingStock[id] ?? 0;
    const newQty = Math.max(0, currentQty + delta);

    setEditingStock((prev) => ({ ...prev, [id]: newQty }));
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock_quantity: newQty } : p))
    );

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: newQty }),
      });
      if (!res.ok) throw new Error();
      notify(`Qoldiq yangilandi: ${newQty} dona`);
    } catch {
      notify('Qoldiqni saqlashda xatolik', 'error');
    }
  };

  const handleSaveRow = async (id: string) => {
    setSavingId(id);
    const newQty = editingStock[id] ?? 0;
    const newThreshold = editingThreshold[id] ?? 5;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_quantity: newQty,
          low_stock_threshold: newThreshold,
        }),
      });

      if (!res.ok) throw new Error();

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, stock_quantity: newQty, low_stock_threshold: newThreshold }
            : p
        )
      );

      notify('Ombor parametrlari saqlandi');
    } catch {
      notify('Saqlashda xatolik', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = products
    .filter((p) => {
      const isOut = p.stock_quantity === 0;
      const isLow = p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0;
      if (filter === 'out') return isOut;
      if (filter === 'low') return isLow;
      if (filter === 'normal') return !isOut && !isLow;
      return true;
    })
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

  const lowStockCount = products.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
  ).length;
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
              : 'bg-rose-950 border-rose-700 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#20202e]">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Omborxona va Zaxiralar</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Mahsulotlar qoldigʻini tezkor nazorat qilish, kam qolgan tovarlarni toʻldirish va kritik chegaralarni belgilash
          </p>
        </div>

        <div className="flex items-center gap-2">
          {outOfStockCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 shadow-sm dark:shadow-none">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{outOfStockCount} ta tugagan</span>
            </span>
          )}
          {lowStockCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/70 dark:border-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm dark:shadow-none">
              <AlertTriangle size={14} className="text-amber-500 dark:text-amber-400" />
              <span>{lowStockCount} ta kam qolgan</span>
            </span>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi yoki artikul boʻyicha qidirish..."
            className="w-full bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs text-neutral-900 dark:text-white pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors shadow-sm dark:shadow-none"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'all', label: `Barchasi (${products.length})` },
              { key: 'low', label: `Kam qolgan (${lowStockCount})` },
              { key: 'out', label: `Tugagan (${outOfStockCount})` },
              { key: 'normal', label: `Yetarli (${products.length - lowStockCount - outOfStockCount})` },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === t.key
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#14141e] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-[#242436]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-[#161622] text-neutral-600 dark:text-neutral-400 font-bold border-b border-neutral-200 dark:border-[#222232]">
              <tr>
                <th className="py-3.5 px-4">Mahsulot</th>
                <th className="py-3.5 px-4">Artikul</th>
                <th className="py-3.5 px-4">Hozirgi Qoldiq</th>
                <th className="py-3.5 px-4">Kritik Chegara</th>
                <th className="py-3.5 px-4">Holat</th>
                <th className="py-3.5 px-4">Tezkor Toʻldirish</th>
                <th className="py-3.5 px-4 text-right">Saqlash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#1e1e2c]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Yuklanmoqda...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Mahsulotlar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const stock = editingStock[p.id] ?? p.stock_quantity;
                  const threshold = editingThreshold[p.id] ?? p.low_stock_threshold;
                  const isOut = stock === 0;
                  const isLow = stock <= threshold && stock > 0;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-[#161622] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]?.image_url || '/placeholder.png'}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-neutral-100 dark:bg-[#1c1c28] border border-neutral-200 dark:border-[#28283a] shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-neutral-900 dark:text-white truncate max-w-xs block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                              {p.category?.name || 'Kategoriyasiz'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400 font-mono">{p.sku || '—'}</td>

                      {/* Direct Editable Stock Quantity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={(e) =>
                              setEditingStock({
                                ...editingStock,
                                [p.id]: Math.max(0, parseInt(e.target.value) || 0),
                              })
                            }
                            className="w-20 bg-neutral-50 dark:bg-[#161624] border border-neutral-300 dark:border-[#2a2a3e] rounded-lg px-2.5 py-1 text-neutral-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                          />
                          <span className="text-neutral-500 dark:text-neutral-400 font-medium">ta</span>
                        </div>
                      </td>

                      {/* Editable Threshold */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={threshold}
                            onChange={(e) =>
                              setEditingThreshold({
                                ...editingThreshold,
                                [p.id]: Math.max(1, parseInt(e.target.value) || 1),
                              })
                            }
                            className="w-16 bg-neutral-50 dark:bg-[#161624] border border-neutral-300 dark:border-[#2a2a3e] rounded-lg px-2 py-1 text-neutral-800 dark:text-neutral-300 font-mono text-xs focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                          />
                          <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">min</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            TUGAGAN
                          </span>
                        ) : isLow ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
                            <AlertTriangle size={12} /> KAM QOLDI
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            YETARLI
                          </span>
                        )}
                      </td>

                      {/* Quick Adjust Delta Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center border border-neutral-300 dark:border-[#2b2b3d] rounded-lg bg-neutral-100 dark:bg-[#0e0e14] overflow-hidden shadow-sm dark:shadow-none">
                          <button
                            onClick={() => handleAdjustDelta(p.id, -1)}
                            className="px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#1a1a26] transition-colors"
                            title="-1 dona"
                          >
                            <Minus size={12} />
                          </button>
                          <button
                            onClick={() => handleAdjustDelta(p.id, 1)}
                            className="px-2 py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#1a1a26] transition-colors border-l border-r border-neutral-300 dark:border-[#2b2b3d]"
                            title="+1 dona"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => handleAdjustDelta(p.id, 10)}
                            className="px-2 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#1f1f2e] transition-colors"
                            title="+10 dona tezkor toʻldirish"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleAdjustDelta(p.id, 50)}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#1f1f2e] transition-colors border-l border-neutral-300 dark:border-[#2b2b3d]"
                            title="+50 dona partiya"
                          >
                            +50
                          </button>
                        </div>
                      </td>

                      {/* Save Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSaveRow(p.id)}
                          disabled={savingId === p.id}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-sm disabled:opacity-50"
                        >
                          <Save size={13} />
                          <span>{savingId === p.id ? '...' : 'Saqlash'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
