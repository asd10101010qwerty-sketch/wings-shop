'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { useCart } from '@/lib/cart/context';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const { t, formatPrice } = useI18n();
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const [added, setAdded] = useState(false);

  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const currentPrice = product.sale_price ?? product.price;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative wings-card rounded-xl overflow-hidden flex flex-col justify-between">
      {/* Top Media Container */}
      <div className="relative aspect-square w-full bg-neutral-100 dark:bg-[#161622] overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[0]?.image_url || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="wings-badge-red text-[11px] font-extrabold px-2 py-0.5 rounded shadow">
              -{discountPercent}%
            </span>
          )}
          {product.is_new && (
            <span className="wings-badge-emerald text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
              {t.common.new_badge}
            </span>
          )}
          {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
            <span className="wings-badge-amber text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
              {t.common.low_stock} ({product.stock_quantity})
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? t.products.removed_from_wishlist : t.products.added_to_wishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWishlisted
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-white/90 dark:bg-black/45 hover:bg-white dark:hover:bg-black/70 text-neutral-700 dark:text-white border border-neutral-200/80 dark:border-white/10 shadow-xs hover:text-rose-600 dark:hover:text-rose-400'
          }`}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Add Overlay on Hover for Desktop */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 px-3 bg-neutral-900/90 hover:bg-rose-600 border border-neutral-700 hover:border-rose-500 text-white rounded-lg text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-xl transition-all"
          >
            {added ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>{t.products.added_to_cart}</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>{t.products.add_to_cart}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="uppercase tracking-wider font-medium text-rose-600 dark:text-rose-400/90 truncate max-w-[140px]">
              {product.category?.name || 'Wings Premium'}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={12} fill="currentColor" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.rating}</span>
              <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">({product.reviews_count})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          {product.short_description && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-1">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Price & Mobile Add Button */}
        <div className="pt-2 border-t border-neutral-200 dark:border-[#1e1e2c] flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Mobile direct add icon button */}
          <button
            onClick={handleAddToCart}
            aria-label={t.products.add_to_cart}
            className="sm:hidden p-2 rounded-lg bg-neutral-100 dark:bg-[#20202e] hover:bg-rose-600 hover:text-white text-neutral-800 dark:text-white transition-colors"
          >
            {added ? <Check size={16} className="text-emerald-400" /> : <ShoppingBag size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
