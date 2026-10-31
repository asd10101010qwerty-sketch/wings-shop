'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import {
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  Send,
  Save,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  Printer,
} from 'lucide-react';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { formatPrice } = useI18n();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<OrderStatus>('pending');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (data.id) {
          setOrder(data);
          setStatus(data.status);
          setPaymentStatus(data.payment_status);
          setTrackingNumber(data.tracking_number || '');
          setAdminNotes(data.admin_notes || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          payment_status: paymentStatus,
          tracking_number: trackingNumber.trim() || null,
          admin_notes: adminNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendTelegram = async () => {
    setTelegramStatus('Yuborilmoqda...');
    try {
      const res = await fetch('/api/admin/telegram-test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTelegramStatus('Telegramga yuborildi!');
      } else {
        setTelegramStatus(`Xatolik: ${data.error}`);
      }
    } catch (e: any) {
      setTelegramStatus(`Xatolik: ${e.message}`);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-neutral-400">Yuklanmoqda...</div>;
  }

  if (!order) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-white">Buyurtma topilmadi</h2>
        <Link href="/admin/orders" className="text-xs text-rose-400 underline mt-2 block">
          Buyurtmalar roʻyxatiga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <Link
          href="/admin/orders"
          className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1.5 mb-2 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Barcha buyurtmalarga qaytish</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#20202e]">
          <div>
            <span className="text-xs font-mono text-rose-600 dark:text-rose-500 font-bold">BUYURTMA NAZORATI</span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {order.order_number}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Qabul qilingan vaqt: {new Date(order.created_at).toLocaleString('uz-UZ')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="px-3 py-2 rounded-lg bg-white dark:bg-[#181824] hover:bg-neutral-100 dark:hover:bg-[#222232] border border-neutral-300 dark:border-[#2c2c3e] text-neutral-700 dark:text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm dark:shadow-none"
              title="Chop etish"
            >
              <Printer size={14} />
              <span>Chop etish</span>
            </button>
            <button
              onClick={handleResendTelegram}
              className="px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 text-xs font-bold flex items-center gap-2 transition-colors shadow-sm dark:shadow-none"
            >
              <Send size={14} />
              <span>Telegramga qayta yuborish</span>
            </button>
          </div>
        </div>

        {telegramStatus && (
          <p className="text-xs text-sky-600 dark:text-sky-400 mt-2 font-medium">{telegramStatus}</p>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Buyurtma muvaffaqiyatli yangilandi va Telegramga bildirishnoma yuborildi!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Status Controller Form */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleUpdate} className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Holat va Boshqaruv
            </h2>

            {/* Lifecycle Status */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Buyurtma Holati
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3 py-2.5 text-neutral-900 dark:text-white font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
              >
                <option value="pending">🟡 Pending (Kutilmoqda)</option>
                <option value="confirmed">🔵 Confirmed (Tasdiqlandi)</option>
                <option value="processing">🟠 Processing (Tayyorlanmoqda)</option>
                <option value="shipped">🚀 Shipped (Kuryerga topshirildi)</option>
                <option value="delivered">🟢 Delivered (Yetkazib berildi)</option>
                <option value="cancelled">🔴 Cancelled (Bekor qilindi)</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Toʻlov Holati
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3 py-2.5 text-neutral-900 dark:text-white font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
              >
                <option value="unpaid">Toʻlanmagan (Unpaid)</option>
                <option value="paid">Toʻlangan (Paid)</option>
                <option value="failed">Muvaffaqiyatsiz (Failed)</option>
                <option value="refunded">Qaytarilgan (Refunded)</option>
              </select>
            </div>

            {/* Tracking Number */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Kuryer Trek-Kodi
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="TRK-UZ-984210"
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3 py-2 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Admin Internal Notes */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Ichki Administrator Qaydlari
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Kuryer tayinlandi, mijoz bilan gaplashildi..."
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full wings-btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-lg"
            >
              <Save size={15} />
              <span>{isSaving ? 'Saqlanmoqda...' : 'Holatni yangilash'}</span>
            </button>
          </form>

          {/* Delivery & Customer Info Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-3 shadow-sm dark:shadow-none">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Mijoz va Manzil
            </h3>
            <div className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5">
              <p>
                <strong className="text-neutral-900 dark:text-white">Ismi:</strong> {order.delivery_address.recipient_name}
              </p>
              <p>
                <strong className="text-neutral-900 dark:text-white">Telefon:</strong>{' '}
                <a href={`tel:${order.delivery_address.phone}`} className="text-rose-600 dark:text-rose-400 font-mono">
                  {order.delivery_address.phone}
                </a>
              </p>
              <p>
                <strong className="text-neutral-900 dark:text-white">Manzil:</strong> {order.delivery_address.region},{' '}
                {order.delivery_address.city}, {order.delivery_address.street}
                {order.delivery_address.apartment ? `, xonadon ${order.delivery_address.apartment}` : ''}
              </p>
              {order.delivery_address.notes && (
                <p className="p-2 rounded bg-neutral-50 dark:bg-[#181824] border border-neutral-200 dark:border-[#242434] text-neutral-600 dark:text-neutral-400 italic">
                  Eslatma: {order.delivery_address.notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Pricing Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Buyurtma Tarkibi ({order.items.length})
            </h2>

            <div className="divide-y divide-neutral-200 dark:divide-[#1e1e2c]">
              {order.items.map((it) => (
                <div key={it.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.image_url || '/placeholder.png'}
                      alt=""
                      className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-[#181822] object-cover shrink-0 border border-neutral-200 dark:border-[#262638]"
                    />
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white">{it.product_name}</h4>
                      {it.variant_title && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{it.variant_title}</p>
                      )}
                      <p className="text-[10px] text-neutral-500">
                        {formatPrice(it.unit_price)} × {it.quantity} dona
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {formatPrice(it.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-neutral-200 dark:border-[#1e1e2c] space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Oraliq jami</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Chegirma ({order.coupon_code || 'Kupon'})</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Yetkazib berish ({order.delivery_method})</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {order.shipping_fee === 0 ? 'BEPUL' : formatPrice(order.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-[#242436]">
                <span>Yakuniy toʻlov</span>
                <span className="text-rose-600 dark:text-rose-400 text-lg">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
