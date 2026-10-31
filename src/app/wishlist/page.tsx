'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/context';
import { useI18n } from '@/lib/i18n/context';
import { ProductCard } from '@/components/product/ProductCard';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, wishlistCount } = useCart();
  const { t } = useI18n();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full transition-colors duration-200">
      <div className="flex items-center gap-3 pb-6 mb-8 border-b border-neutral-200 dark:border-[#222232]">
        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
          <Heart size={22} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t.nav.wishlist}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {wishlistCount} ta saqlangan mahsulot
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#0e0e14] border border-neutral-200 dark:border-[#20202e] rounded-2xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-[#181824] text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto">
            <Heart size={28} />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-200">Saralanganlar roʻyxati boʻsh</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Sizga yoqqan mahsulotlarning yurakchasini bosib, ularni keyinchalik xarid qilish uchun bu yerga saqlashingiz mumkin.
          </p>
          <Link
            href="/products"
            className="wings-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 rounded-lg"
          >
            <span>Katalogga oʻtish</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
