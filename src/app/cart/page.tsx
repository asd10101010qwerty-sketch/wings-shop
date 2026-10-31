'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/context';
import { useI18n } from '@/lib/i18n/context';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    coupon,
    couponError,
    applyCouponCode,
    removeCouponCode,
  } = useCart();

  const { t, formatPrice } = useI18n();
  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const freeShippingThreshold = 500000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCouponCode(couponInput.trim());
    setIsApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 w-full flex flex-col items-center justify-center text-center transition-colors duration-200">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-[#161622] text-neutral-400 dark:text-neutral-500 flex items-center justify-center mb-6">
          <ShoppingBag size={38} />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">{t.cart.empty_title}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">{t.cart.empty_desc}</p>
        <Link
          href="/products"
          className="mt-8 wings-btn-primary px-7 py-3 text-sm font-bold inline-flex items-center gap-2 rounded-lg"
        >
          <span>{t.cart.start_shopping}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full transition-colors duration-200">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-neutral-200 dark:border-[#222232]">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t.cart.title}
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5"
        >
          <Trash2 size={13} />
          <span>Savatni tozalash</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Cart items */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert Bar */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#14141e] border border-neutral-200 dark:border-[#242436] space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              {remainingForFreeShipping > 0 ? (
                <span className="text-neutral-600 dark:text-neutral-300">
                  Yetkazib berish bepul boʻlishi uchun yana{' '}
                  <strong className="text-rose-600 dark:text-rose-400 font-bold">{formatPrice(remainingForFreeShipping)}</strong>{' '}
                  soʻmlik xarid qiling
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Tabriklaymiz! Sizga yetkazib berish bepul
                </span>
              )}
              <span className="text-neutral-500 dark:text-neutral-400">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-[#20202e] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Line items table / cards */}
          <div className="divide-y divide-neutral-200 dark:divide-[#1e1e2c] border border-neutral-200 dark:border-[#222232] rounded-xl bg-white dark:bg-[#101018] overflow-hidden shadow-xs">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex gap-4 sm:gap-6 items-center">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-neutral-100 dark:bg-[#181824] overflow-hidden shrink-0 block border border-neutral-200 dark:border-[#262636]"
                >
                  <img
                    src={item.product.images[0]?.image_url || '/placeholder.png'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-bold text-neutral-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        Variant: <span className="text-neutral-700 dark:text-neutral-200">{item.variant.title}</span>
                      </p>
                    )}
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      {formatPrice(item.unit_price)} / dona
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-neutral-200 dark:border-[#2b2b3d] rounded-lg bg-neutral-50 dark:bg-[#0d0d12]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-3 text-xs font-bold text-neutral-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Total Price & Delete */}
                    <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 min-w-[100px] text-right">
                      {formatPrice(item.total_price)}
                    </span>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 transition-colors"
                      title={t.cart.remove_item}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#262638] space-y-5 shadow-sm">
            <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">Hisob-kitob</h2>

            {/* Coupon form */}
            {coupon ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <Tag size={15} />
                  <span>{coupon.code}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    (-{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)})
                  </span>
                </div>
                <button
                  onClick={removeCouponCode}
                  className="text-neutral-500 hover:text-rose-600 text-xs underline"
                >
                  Bekor qilish
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t.cart.coupon_placeholder}
                  className="flex-1 bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#2b2b3d] rounded-lg text-xs px-3 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 uppercase font-mono shadow-xs"
                />
                <button
                  type="submit"
                  disabled={isApplying || !couponInput.trim()}
                  className="px-4 py-2.5 bg-neutral-900 dark:bg-[#20202e] hover:bg-black dark:hover:bg-[#2c2c3e] disabled:opacity-50 text-xs font-bold rounded-lg text-white transition-colors"
                >
                  {isApplying ? '...' : t.cart.apply_coupon}
                </button>
              </form>
            )}

            {couponError && <p className="text-xs text-rose-500 dark:text-rose-400">{couponError}</p>}

            {/* Calculations breakdown */}
            <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300 pt-2 border-t border-neutral-200 dark:border-[#1e1e2c]">
              <div className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{t.cart.discount}</span>
                  <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.cart.shipping}</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">{t.cart.free_shipping}</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-neutral-900 dark:text-white pt-3 border-t border-neutral-200 dark:border-[#222232]">
                <span>{t.cart.total}</span>
                <span className="text-rose-600 dark:text-rose-400 text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full wings-btn-primary py-3.5 text-center text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              <span>{t.cart.proceed_checkout}</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
