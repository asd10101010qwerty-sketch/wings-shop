import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/i18n/translations';
import { ArrowLeft, Clock, MapPin, CreditCard, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full transition-colors duration-200">
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          <span>Barcha buyurtmalarga qaytish</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#222232]">
          <div>
            <span className="text-xs font-mono text-rose-600 dark:text-rose-500 font-bold">WINGS BUYURTMA</span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {order.order_number}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Sana: {new Date(order.created_at).toLocaleString('uz-UZ')}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Delivery Destination */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
            <MapPin size={16} className="text-rose-600 dark:text-rose-500" />
            <span>Yetkazib berish manzili</span>
          </div>
          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{order.delivery_address.recipient_name}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">{order.delivery_address.phone}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {order.delivery_address.region}, {order.delivery_address.city}, {order.delivery_address.street}
            {order.delivery_address.apartment ? `, xonadon ${order.delivery_address.apartment}` : ''}
          </p>
        </div>

        {/* Shipping Method */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
            <Truck size={16} className="text-rose-600 dark:text-rose-500" />
            <span>Yetkazish turi</span>
          </div>
          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 capitalize">
            {order.delivery_method} yetkazib berish
          </p>
          {order.tracking_number ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
              Trek-kod: {order.tracking_number}
            </p>
          ) : (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Trek-kod tayyorlanmoqda</p>
          )}
        </div>

        {/* Payment */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
            <CreditCard size={16} className="text-rose-600 dark:text-rose-500" />
            <span>Toʻlov usuli</span>
          </div>
          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase">
            {order.payment_method}
          </p>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#1e1e2c] text-neutral-700 dark:text-neutral-300">
            Holat: {order.payment_status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] overflow-hidden mb-8 shadow-xs">
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-[#20202e]">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Buyurtma tarkibi ({order.items.length})</h2>
        </div>

        <div className="divide-y divide-neutral-200 dark:divide-[#1e1e2c]">
          {order.items.map((it) => (
            <div key={it.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={it.image_url || '/placeholder.png'}
                  alt=""
                  className="w-14 h-14 rounded-lg bg-neutral-100 dark:bg-[#181822] object-cover shrink-0 border border-neutral-200 dark:border-[#262638]"
                />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">{it.product_name}</h3>
                  {it.variant_title && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{it.variant_title}</p>
                  )}
                  <p className="text-[11px] text-neutral-500">
                    {formatCurrency(it.unit_price)} × {it.quantity} dona
                  </p>
                </div>
              </div>

              <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(it.total_price)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="p-5 bg-neutral-50 dark:bg-[#0f0f16] border-t border-neutral-200 dark:border-[#20202e] space-y-2 text-xs">
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Oraliq jami</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Chegirma ({order.coupon_code || 'Kupon'})</span>
              <span className="font-semibold">-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Yetkazib berish toʻlovi</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {order.shipping_fee === 0 ? 'BEPUL' : formatCurrency(order.shipping_fee)}
            </span>
          </div>
          <div className="flex justify-between text-sm sm:text-base font-black text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-[#20202e]">
            <span>Jami toʻlov</span>
            <span className="text-rose-600 dark:text-rose-400">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
