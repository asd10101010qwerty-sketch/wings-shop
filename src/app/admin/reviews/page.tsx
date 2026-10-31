'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '@/types';
import { MessageSquare, Star, CheckCircle, XCircle, Trash2, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      notify('Sharhlarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    const updated = !currentStatus;

    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_approved: updated } : r))
    );

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: updated }),
      });

      if (!res.ok) throw new Error();
      notify(`Sharh ${updated ? 'tasdiqlandi va saytda faollashtirildi' : 'moderatsiyaga qaytarildi'}`);
    } catch {
      // Revert on error
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: currentStatus } : r))
      );
      notify('Holatni oʻzgartirishda xatolik yuz berdi', 'error');
    }
  };

  const handleDelete = async (id: string, author: string) => {
    if (!confirm(`Haqiqatan ham "${author}" tomonidan qoldirilgan ushbu sharhni oʻchirmoqchimisiz?`)) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        notify('Sharh muvaffaqiyatli oʻchirildi');
      } else {
        throw new Error();
      }
    } catch {
      notify('Sharhni oʻchirish imkoni boʻlmadi', 'error');
    }
  };

  const filtered = reviews
    .filter((r) => {
      if (statusFilter === 'approved') return r.is_approved;
      if (statusFilter === 'pending') return !r.is_approved;
      return true;
    })
    .filter(
      (r) =>
        r.user_name.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase()) ||
        (r.title && r.title.toLowerCase().includes(search.toLowerCase()))
    );

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

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
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Sharhlar Moderatsiyasi</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Xaridorlar tomonidan qoldirilgan fikr-mulohazalar, reytinglar va doʻkonda koʻrsatilish nazorati
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2 w-fit shadow-sm dark:shadow-none">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingCount} ta yangi sharh tasdiqlashni kutmoqda</span>
          </span>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mijoz ismi yoki sharh matni boʻyicha qidirish..."
            className="w-full bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs text-neutral-900 dark:text-white pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors shadow-sm dark:shadow-none"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#14141e] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-[#242436]'
              }`}
            >
              {filter === 'all'
                ? `Barchasi (${reviews.length})`
                : filter === 'pending'
                ? `Kutilmoqda (${pendingCount})`
                : `Tasdiqlangan (${reviews.length - pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-[#161622] text-neutral-600 dark:text-neutral-400 font-bold border-b border-neutral-200 dark:border-[#222232]">
              <tr>
                <th className="py-3 px-4">Mijoz</th>
                <th className="py-3 px-4">Baho</th>
                <th className="py-3 px-4">Sharh & Fikr</th>
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4 text-right">Moderatsiya</th>
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
                    Hech qanday sharh topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((rev) => (
                  <tr key={rev.id} className="hover:bg-neutral-50 dark:hover:bg-[#161622] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-rose-600/10 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {rev.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 dark:text-white truncate">{rev.user_name}</p>
                          {rev.is_verified_purchase && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              ✓ Xarid tasdiqlangan
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            className={i < rev.rating ? 'text-amber-500 dark:text-amber-400' : 'text-neutral-300 dark:text-neutral-700'}
                          />
                        ))}
                        <span className="ml-1 text-[11px] font-mono font-bold text-neutral-900 dark:text-white">
                          {rev.rating}.0
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      {rev.title && <p className="font-bold text-neutral-900 dark:text-neutral-200 text-xs mb-0.5">{rev.title}</p>}
                      <p className="text-neutral-700 dark:text-neutral-300 italic line-clamp-2 text-xs">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {new Date(rev.created_at).toLocaleDateString('uz-UZ')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rev.is_approved
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {rev.is_approved ? 'TASDIQLANGAN' : 'KUTILMOQDA'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleApproval(rev.id, rev.is_approved)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            rev.is_approved
                              ? 'bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1e1e2c] dark:hover:bg-[#28283a] text-neutral-700 dark:text-neutral-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                        >
                          {rev.is_approved ? 'Bekor qilish' : 'Tasdiqlash'}
                        </button>

                        <button
                          onClick={() => handleDelete(rev.id, rev.user_name)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#1f1f2e] transition-colors"
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
