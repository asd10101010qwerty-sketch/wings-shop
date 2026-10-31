'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart/context';
import { useI18n } from '@/lib/i18n/context';
import { useAuth } from '@/lib/auth/context';
import { DeliveryMethod, PaymentMethod } from '@/types';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Send,
  ArrowRight,
  AlertCircle,
  MapPin,
  Lock,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, shippingFee, total, coupon, clearCart } = useCart();
  const { t, formatPrice } = useI18n();
  const { user, profile } = useAuth();

  // Form states
  const [recipientName, setRecipientName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '+998 ');
  const [email, setEmail] = useState(user?.email || '');
  const [region, setRegion] = useState('Toshkent shahri');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [notes, setNotes] = useState('');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recalculate shipping based on chosen delivery method
  let currentShipping = shippingFee;
  if (deliveryMethod === 'express') {
    currentShipping = 45000;
  } else if (deliveryMethod === 'pickup') {
    currentShipping = 0;
  } else {
    currentShipping = subtotal >= 500000 ? 0 : 25000;
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + currentShipping);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Savatda mahsulotlar mavjud emas');
      return;
    }

    if (!recipientName.trim()) {
      setErrorMessage('Iltimos, ismingizni kiriting');
      return;
    }

    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('Iltimos, telefon raqamingizni toʻliq kiriting');
      return;
    }

    if (!street.trim()) {
      setErrorMessage('Iltimos, yetkazib berish koʻchasi va uy raqamini kiriting');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        user_id: user?.id || null,
        items: items.map((it) => ({
          product_id: it.product_id,
          variant_id: it.variant_id,
          quantity: it.quantity,
        })),
        coupon_code: coupon?.code,
        delivery_address: {
          recipient_name: recipientName.trim(),
          phone: phone.trim(),
          region: region.trim(),
          city: city.trim() || region.trim(),
          street: street.trim(),
          apartment: apartment.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        customer_notes: notes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Buyurtma rasmiylashtirishda xatolik yuz berdi');
      }

      // Clear cart
      clearCart();

      // Navigate to success page
      router.push(`/checkout/success?order_number=${data.order.order_number}&order_id=${data.order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Xatolik yuz berdi. Qayta urinib koʻring.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{t.cart.empty_title}</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">{t.cart.empty_desc}</p>
        <Link href="/products" className="wings-btn-primary px-6 py-2.5 text-xs font-bold rounded-lg">
          {t.cart.start_shopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full">
      <div className="flex items-center gap-2 mb-8">
        <Lock size={18} className="text-rose-500" />
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
          {t.checkout.title}
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Checkout Steps */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Contact Details */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4">
            <h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>{t.checkout.contact_info}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">
                  {t.checkout.full_name} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ali Valiyev"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">
                  {t.checkout.phone} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">
                  {t.checkout.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ali@example.com"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Destination */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4">
            <h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>{t.checkout.shipping_address}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">
                  {t.checkout.region} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Toshkent shahri">Toshkent shahri</option>
                  <option value="Toshkent viloyati">Toshkent viloyati</option>
                  <option value="Samarqand viloyati">Samarqand viloyati</option>
                  <option value="Buxoro viloyati">Buxoro viloyati</option>
                  <option value="Fargʻona viloyati">Fargʻona viloyati</option>
                  <option value="Andijon viloyati">Andijon viloyati</option>
                  <option value="Namangan viloyati">Namangan viloyati</option>
                  <option value="Qashqadaryo viloyati">Qashqadaryo viloyati</option>
                  <option value="Surxondaryo viloyati">Surxondaryo viloyati</option>
                  <option value="Xorazm viloyati">Xorazm viloyati</option>
                  <option value="Navoiy viloyati">Navoiy viloyati</option>
                  <option value="Jizzax viloyati">Jizzax viloyati</option>
                  <option value="Sirdaryo viloyati">Sirdaryo viloyati</option>
                  <option value="Qoraqalpogʻiston">Qoraqalpogʻiston Respublikasi</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">
                  {t.checkout.city}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Tuman yoki shahar nomi"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">
                  {t.checkout.street} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Koʻcha nomi va uy raqami"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">
                  {t.checkout.apartment}
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Masalan: 12-xonadon"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">
                  {t.checkout.notes}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kuryer uchun maxsus koʻrsatma"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-lg text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Delivery Options */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4">
            <h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>{t.checkout.delivery_method}</span>
            </h2>

            <div className="space-y-2.5">
              <label
                onClick={() => setDeliveryMethod('standard')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'standard'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-[#242436] bg-neutral-50/70 dark:bg-[#161622] text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === 'standard'}
                  onChange={() => setDeliveryMethod('standard')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Standart kuryer (1-2 kun)</span>
                    <span className="text-rose-600 dark:text-rose-400">
                      {subtotal >= 500000 ? 'BEPUL' : '25 000 soʻm'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Toshkent shahri va barcha viloyatlar boʻylab eshikkacha yetkazib berish.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setDeliveryMethod('express')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'express'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-[#242436] bg-neutral-50/70 dark:bg-[#161622] text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === 'express'}
                  onChange={() => setDeliveryMethod('express')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Ekspress tezkor yetkazib berish (3-5 soat)</span>
                    <span className="text-rose-600 dark:text-rose-400">45 000 soʻm</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Toshkent shahri boʻyicha kun davomida zudlik bilan topshirish.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setDeliveryMethod('pickup')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'pickup'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-[#242436] bg-neutral-50/70 dark:bg-[#161622] text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === 'pickup'}
                  onChange={() => setDeliveryMethod('pickup')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Showroomdan olib ketish</span>
                    <span className="text-emerald-600 dark:text-emerald-400">BEPUL</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Toshkent, Amir Temur 107B (Wings Showroom, 10:00 - 21:00).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Step 4: Payment Options */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] space-y-4">
            <h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                4
              </span>
              <span>{t.checkout.payment_method}</span>
            </h2>

            <div className="space-y-2.5">
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-[#242436] bg-neutral-50/70 dark:bg-[#161622] text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Banknote size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{t.checkout.cod}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {t.checkout.cod_desc}
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-[#242436] bg-neutral-50/70 dark:bg-[#161622] text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <CreditCard size={16} className="text-rose-500 dark:text-rose-400" />
                    <span>{t.checkout.bank_transfer}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {t.checkout.bank_transfer_desc}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#262638] space-y-5 sticky top-24 shadow-sm">
            <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
              {t.checkout.order_summary} ({items.length})
            </h2>

            {/* Items list */}
            <div className="divide-y divide-neutral-200 dark:divide-[#1e1e2b] max-h-64 overflow-y-auto space-y-2 pr-1">
              {items.map((it) => (
                <div key={it.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={it.product.images[0]?.image_url || '/placeholder.png'}
                      alt=""
                      className="w-10 h-10 rounded bg-neutral-100 dark:bg-[#181822] object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">{it.product.name}</p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {it.quantity} dona {it.variant ? `(${it.variant.title})` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-200 shrink-0">
                    {formatPrice(it.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations breakdown */}
            <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300 pt-3 border-t border-neutral-200 dark:border-[#1e1e2b]">
              <div className="flex justify-between">
                <span>Oraliq jami</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Kupon chegirmasi</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Yetkazib berish</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {currentShipping === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">BEPUL</span>
                  ) : (
                    formatPrice(currentShipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-neutral-900 dark:text-white pt-3 border-t border-neutral-200 dark:border-[#242436]">
                <span>{t.cart.total}</span>
                <span className="text-rose-600 dark:text-rose-400 text-lg">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full wings-btn-primary py-3.5 text-center text-sm font-bold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{t.checkout.processing}</span>
              ) : (
                <>
                  <span>{t.checkout.place_order}</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <Send size={13} className="text-sky-500 dark:text-sky-400" />
              <span>Telegram orqali darhol tasdiqnoma olasiz</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
