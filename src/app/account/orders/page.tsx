'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { ShoppingBag, ChevronRight, ArrowLeft, Clock, CheckCircle2, Package, Truck, XCircle } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { formatPrice } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={12} /> YETKAZIB BERILDI
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
            <Truck size={12} /> KURYERDA
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Package size={12} /> TAYYORLANMOQDA
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Clock size={12} /> TASDIQLANDI
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle size={12} /> BEKOR QILINDI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            <Clock size={12} /> KUTILMOQDA
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full transition-colors duration-200">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-neutral-200 dark:border-[#222232]">
        <div>
          <Link
            href="/account"
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={13} />
            <span>Profilga qaytish</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Buyurtmalarim tarixi
          </h1>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{orders.length} ta buyurtma</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-neutral-100 dark:bg-[#12121a] animate-pulse border border-neutral-200 dark:border-[#1e1e2b]" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#0e0e14] border border-neutral-200 dark:border-[#20202e] rounded-2xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-[#181824] text-neutral-500 flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-200">Sizda hali buyurtmalar yoʻq</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Wings premium toʻplamidan birinchi xaridingizni amalga oshiring.
          </p>
          <Link href="/products" className="wings-btn-primary px-6 py-2.5 text-xs font-bold inline-block rounded-lg">
            Xaridni boshlash
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] hover:border-neutral-300 dark:hover:border-[#2f2f45] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-black font-mono text-neutral-900 dark:text-white">
                    {order.order_number}
                  </span>
                  {getStatusBadge(order.status)}
                  <span className="text-xs text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>

                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  {order.items.map((it) => it.product_name).join(', ')}
                </div>

                <p className="text-[11px] text-neutral-500">
                  Yetkazish manzili: {order.delivery_address.region}, {order.delivery_address.street}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-200 dark:border-[#1c1c28]">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 block">Jami summa:</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>

                <Link
                  href={`/account/orders/${order.id}`}
                  className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-[#1a1a26] dark:hover:bg-rose-600 dark:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>Batafsil</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
