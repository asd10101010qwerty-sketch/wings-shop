'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import {
  Search,
  ChevronDown,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  ArrowRight,
  Send,
  AlertCircle,
  Filter,
  Check,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { formatPrice } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadOrders = async () => {
    try {
      const url = statusFilter !== 'all' ? `/api/orders?status=${statusFilter}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error(e);
      notify('Buyurtmalarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error();
      notify(`Buyurtma holati "${newStatus.toUpperCase()}" ga oʻzgartirildi`);
    } catch {
      notify('Holatni yangilashda xatolik yuz berdi', 'error');
      loadOrders();
    }
  };

  const filtered = orders
    .filter((o) => {
      if (paymentFilter === 'paid' && o.payment_status !== 'paid') return false;
      if (paymentFilter === 'unpaid' && o.payment_status === 'paid') return false;
      return true;
    })
    .filter(
      (o) =>
        o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        o.delivery_address.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
        o.delivery_address.phone.toLowerCase().includes(search.toLowerCase()) ||
        o.delivery_address.region.toLowerCase().includes(search.toLowerCase())
    );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">YETKAZILDI</span>;
      case 'shipped':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">KURYERDA</span>;
      case 'processing':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">TAYYORLANMOQDA</span>;
      case 'confirmed':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">TASDIQLANDI</span>;
      case 'cancelled':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">BEKOR QILINDI</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">KUTILMOQDA</span>;
    }
  };

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
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Buyurtmalar Boshqaruvi</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Barcha qabul qilingan xaridlar, yetkazib berish va toʻlov holatlarini boshqarish
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
          <span>Jami: <b className="text-neutral-900 dark:text-white">{orders.length} ta</b> buyurtma</span>
          <span>•</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">
            {orders.filter((o) => o.status === 'pending').length} ta kutilmoqda
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buyurtma raqami, ism, telefon yoki viloyat..."
            className="w-full bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs text-neutral-900 dark:text-white pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors shadow-sm dark:shadow-none"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'pending', label: 'Kutilmoqda' },
              { id: 'confirmed', label: 'Tasdiqlandi' },
              { id: 'processing', label: 'Tayyorlanmoqda' },
              { id: 'shipped', label: 'Kuryerda' },
              { id: 'delivered', label: 'Yetkazildi' },
              { id: 'cancelled', label: 'Bekor' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#14141e] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-[#242436]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs px-3 py-1.5 text-neutral-800 dark:text-neutral-300 font-semibold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
          >
            <option value="all">Barcha toʻlovlar</option>
            <option value="paid">Faqat Toʻlangan</option>
            <option value="unpaid">Toʻlanmagan</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-[#161622] text-neutral-600 dark:text-neutral-400 font-bold border-b border-neutral-200 dark:border-[#222232]">
              <tr>
                <th className="py-3.5 px-4">Buyurtma</th>
                <th className="py-3.5 px-4">Mijoz va Manzil</th>
                <th className="py-3.5 px-4">Summa</th>
                <th className="py-3.5 px-4">Tezkor Holat</th>
                <th className="py-3.5 px-4">Toʻlov</th>
                <th className="py-3.5 px-4">Sana</th>
                <th className="py-3.5 px-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#1e1e2c]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Buyurtmalar yuklanmoqda...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Buyurtmalar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50 dark:hover:bg-[#161622] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-neutral-900 dark:text-white block">{o.order_number}</span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                        {o.items.length} ta tovar • {o.delivery_method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-900 dark:text-white">{o.delivery_address.recipient_name}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">{o.delivery_address.phone}</p>
                      <p className="text-[10px] text-neutral-500 truncate max-w-xs">
                        {o.delivery_address.region}, {o.delivery_address.city}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-black text-rose-600 dark:text-rose-400 text-xs">
                      {formatPrice(o.total_amount)}
                    </td>

                    {/* Fast Status Selector */}
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleQuickStatusChange(o.id, e.target.value as OrderStatus)}
                        className="bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3e] rounded-lg text-[11px] font-bold px-2.5 py-1 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 cursor-pointer shadow-sm dark:shadow-none"
                      >
                        <option value="pending">🟡 Kutilmoqda</option>
                        <option value="confirmed">🔵 Tasdiqlandi</option>
                        <option value="processing">🟠 Tayyorlanmoqda</option>
                        <option value="shipped">🚀 Kuryerda</option>
                        <option value="delivered">🟢 Yetkazildi</option>
                        <option value="cancelled">🔴 Bekor qilindi</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          o.payment_status === 'paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('uz-UZ')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-rose-600 dark:bg-[#1a1a26] dark:hover:bg-rose-600 text-neutral-800 hover:text-white dark:text-white font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Boshqarish</span>
                        <ArrowRight size={13} />
                      </Link>
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
