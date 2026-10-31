'use client';

import React, { useState, useEffect } from 'react';
import { Coupon } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { Tag, Plus, CheckCircle2, AlertCircle, Edit2, Trash2, Eye, EyeOff, Search, X } from 'lucide-react';

export default function AdminCouponsPage() {
  const { formatPrice } = useI18n();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrder, setMinOrder] = useState('200000');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('100');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      notify('Kuponlarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('15');
    setMinOrder('300000');
    setMaxDiscount('200000');
    setUsageLimit('100');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDescription(coupon.description || '');
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value.toString());
    setMinOrder((coupon.min_order_value || 0).toString());
    setMaxDiscount(coupon.max_discount ? coupon.max_discount.toString() : '');
    setUsageLimit((coupon.usage_limit || 100).toString());
    setIsActive(coupon.is_active ?? true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSaving(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: parseFloat(discountValue) || 10,
        min_order_value: parseFloat(minOrder) || 0,
        max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
        usage_limit: parseInt(usageLimit) || 100,
        is_active: isActive,
      };

      const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Kuponni saqlashda xatolik');

      notify(editingId ? 'Kupon yangilandi' : 'Yangi promo-kod yaratildi');
      setIsModalOpen(false);
      await loadCoupons();
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Haqiqatan ham "${couponCode}" promo-kodini oʻchirmoqchimisiz?`)) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        notify(`"${couponCode}" kuponi oʻchirildi`);
      } else {
        throw new Error('Oʻchirish imkoni boʻlmadi');
      }
    } catch (e: any) {
      notify(e.message, 'error');
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const updatedStatus = !coupon.is_active;
    // Optimistic UI
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: updatedStatus } : c))
    );

    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...coupon, is_active: updatedStatus }),
      });
      if (!res.ok) throw new Error();
      notify(`"${coupon.code}" ${updatedStatus ? 'faollashtirildi' : 'toʻxtatildi'}`);
    } catch {
      // Revert on failure
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c))
      );
      notify('Holatni oʻzgartirib boʻlmadi', 'error');
    }
  };

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Kuponlar va Chegirmalar</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Promo kodlar, chegirma qoidalari, sarflangan limitlar va aksiya nazorati
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="wings-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 rounded-xl shrink-0"
        >
          <Plus size={16} />
          <span>Yangi Kupon Yaratish</span>
        </button>
      </div>

      {/* Filter and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kupon kodi yoki tavsif boʻyicha qidirish..."
            className="w-full bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs text-neutral-900 dark:text-white pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors shadow-sm dark:shadow-none"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          <span>Jami: <b className="text-neutral-900 dark:text-white">{coupons.length} ta</b> kupon</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {coupons.filter((c) => c.is_active).length} ta faol
          </span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-[#161622] text-neutral-600 dark:text-neutral-400 font-bold border-b border-neutral-200 dark:border-[#222232]">
              <tr>
                <th className="py-3 px-4">Kupon Kodi</th>
                <th className="py-3 px-4">Tavsifi</th>
                <th className="py-3 px-4">Chegirma Miqdori</th>
                <th className="py-3 px-4">Min. Buyurtma</th>
                <th className="py-3 px-4">Ishlatilgan</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4 text-right">Amallar</th>
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
                    Kuponlar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const percentUsed = c.usage_limit ? Math.min(100, Math.round((c.times_used / c.usage_limit) * 100)) : 0;

                  return (
                    <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-[#161622] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Tag size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
                          <span className="font-mono font-bold text-neutral-900 dark:text-white text-xs tracking-wider">
                            {c.code}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 max-w-xs truncate">
                        {c.description || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">
                          {c.discount_type === 'percentage'
                            ? `${c.discount_value}%`
                            : formatPrice(c.discount_value)}
                        </span>
                        {c.max_discount && c.discount_type === 'percentage' && (
                          <span className="block text-[10px] text-neutral-500 dark:text-neutral-400">
                            Max: {formatPrice(c.max_discount)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300">
                        {c.min_order_value ? formatPrice(c.min_order_value) : 'Cheklovsiz'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono text-neutral-900 dark:text-white">
                            {c.times_used} / {c.usage_limit || '∞'}
                          </span>
                          {c.usage_limit && (
                            <div className="w-20 h-1.5 rounded-full bg-neutral-200 dark:bg-[#20202e] overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${percentUsed}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                            c.is_active
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {c.is_active ? 'FAOL' : 'NOFAOL'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-600 dark:text-neutral-400 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-[#1f1f2e] transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#1f1f2e] transition-colors"
                            title="Oʻchirish"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#2a2a3e] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#202030]">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-base">
                <Tag size={18} className="text-rose-500" />
                <span>{editingId ? 'Promo-kodni Tahrirlash' : 'Yangi Kupon Yaratish'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1a1a28]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Kupon Kodi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="WINGS20"
                    className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono uppercase focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Chegirma turi
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="percentage">Foizda (%)</option>
                    <option value="fixed">Aniq summa (soʻm)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Kupon tavsifi (Aksiya maqsadi)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Masalan: Yangi mijozlar uchun 15% chegirma"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Miqdor {discountType === 'percentage' ? '(%)' : '(soʻm)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Min. Buyurtma (soʻm)
                  </label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Maks. Chegirma (soʻm)
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Cheksiz"
                    className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Ishlatilish Limiti (jami soni)
                </label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="100"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="couponActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-0 bg-white dark:bg-[#181824] border-neutral-300 dark:border-[#2a2a3c]"
                />
                <label htmlFor="couponActiveToggle" className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold cursor-pointer">
                  Kuponni darhol faollashtirish
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-[#202030]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1c1c2a] dark:hover:bg-[#252538] text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="wings-btn-primary px-6 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {saving ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : 'Kuponni Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
