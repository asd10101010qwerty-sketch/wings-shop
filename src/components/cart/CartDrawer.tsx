'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart/context';
import { useI18n } from '@/lib/i18n/context';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, ShieldCheck } from 'lucide-react';

export function CartDrawer() {
  const pathname = usePathname();
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    coupon,
    couponError,
    applyCouponCode,
    removeCouponCode,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  const { t, formatPrice } = useI18n();
  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartDrawerOpen || pathname?.startsWith('/admin')) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0f0f15] border-l border-neutral-200 dark:border-[#262638] flex flex-col shadow-2xl text-neutral-900 dark:text-white transition-colors duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-[#222232] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-rose-500" />
              <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">{t.cart.title}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1e1e2c] text-neutral-600 dark:text-neutral-400 font-semibold">
                {items.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1e1e2c] rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {items.length > 0 && (
            <div className="bg-neutral-50 dark:bg-[#14141e] px-5 py-3 border-b border-neutral-200 dark:border-[#222232]">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                {remainingForFreeShipping > 0 ? (
                  <span className="text-neutral-600 dark:text-neutral-300">
                    Bepul yetkazish uchun yana{' '}
                    <strong className="text-rose-600 dark:text-rose-400">{formatPrice(remainingForFreeShipping)}</strong>
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck size={14} /> Bepul yetkazib berish faollashdi!
                  </span>
                )}
                <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-[#252536] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-[#181822] flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag size={30} />
                </div>
                <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">{t.cart.empty_title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">{t.cart.empty_desc}</p>
                <Link
                  href="/products"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-5 wings-btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2"
                >
                  <span>{t.cart.start_shopping}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-lg bg-neutral-50 dark:bg-[#14141c] border border-neutral-200 dark:border-[#222230] hover:border-neutral-300 dark:hover:border-[#2f2f42] transition-colors shadow-xs"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded bg-white dark:bg-[#1c1c28] border border-neutral-200 dark:border-transparent overflow-hidden shrink-0">
                    <img
                      src={item.product.images[0]?.image_url || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-rose-500 p-0.5 transition-colors"
                          title={t.cart.remove_item}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.variant && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {item.variant.title}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-200 dark:border-[#2b2b3d] rounded bg-white dark:bg-[#0d0d12]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#20202e] rounded-l transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#20202e] rounded-r transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-[#222232] bg-neutral-50 dark:bg-[#111118] space-y-3.5">
              {/* Coupon Form */}
              {coupon ? (
                <div className="flex items-center justify-between p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <Tag size={14} />
                    <span>{coupon.code}</span>
                    <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                      (-{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)})
                    </span>
                  </div>
                  <button
                    onClick={removeCouponCode}
                    className="text-neutral-500 hover:text-rose-600 text-[11px] underline"
                  >
                    Oʻchirish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={t.cart.coupon_placeholder}
                    className="flex-1 bg-white dark:bg-[#181822] border border-neutral-300 dark:border-[#2b2b3d] rounded text-xs px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 uppercase font-mono shadow-xs"
                  />
                  <button
                    type="submit"
                    disabled={isApplying || !couponInput.trim()}
                    className="px-3.5 py-2 bg-neutral-900 dark:bg-[#20202e] hover:bg-black dark:hover:bg-[#2a2a3c] disabled:opacity-50 text-xs font-semibold rounded text-white transition-colors"
                  >
                    {isApplying ? '...' : t.cart.apply_coupon}
                  </button>
                </form>
              )}

              {couponError && <p className="text-[11px] text-rose-500 dark:text-rose-400">{couponError}</p>}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
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
                <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-[#242436]">
                  <span>{t.cart.total}</span>
                  <span className="text-rose-600 dark:text-rose-400 text-base">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full wings-btn-primary py-3 text-center text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>{t.cart.proceed_checkout}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
