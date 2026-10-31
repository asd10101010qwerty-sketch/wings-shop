'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ProductVariant } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { useCart } from '@/lib/cart/context';
import { ProductCard } from './ProductCard';
import {
  Star,
  Heart,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { t, formatPrice } = useI18n();
  const { addItem, toggleWishlist, isInWishlist } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews'>('desc');

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewsList, setReviewsList] = useState(
    product.reviews_count > 0
      ? [
          {
            id: 'rev-sample-1',
            user_name: 'Farrux T.',
            rating: 5,
            comment: 'Material sifati va ovoz tiniqligi ajoyib darajada. Qadoqlanishi ham juda premium. Tavsiya qilaman!',
            created_at: '2026-10-20',
          },
        ]
      : []
  );

  const isWishlisted = isInWishlist(product.id);

  const currentPrice = selectedVariant
    ? (selectedVariant.sale_price ?? selectedVariant.price)
    : (product.sale_price ?? product.price);

  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const hasDiscount = currentPrice < basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - currentPrice) / basePrice) * 100)
    : 0;

  const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.name,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          user_name: reviewName.trim() || 'Mijoz',
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      setReviewsList((prev) => [
        {
          id: `rev-${Date.now()}`,
          user_name: reviewName.trim() || 'Mijoz',
          rating: reviewRating,
          comment: reviewComment.trim(),
          created_at: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
      setReviewSuccess(true);
      setReviewComment('');
      setReviewName('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full transition-colors duration-200">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-8 overflow-x-auto pb-1">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight size={13} />
        <Link href="/products" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Katalog
        </Link>
        {product.category && (
          <>
            <ChevronRight size={13} />
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={13} />
        <span className="text-neutral-900 dark:text-white font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 shrink-0 overflow-x-auto sm:overflow-y-auto max-h-[500px]">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-neutral-100 dark:bg-[#161622] border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-rose-500 ring-2 ring-rose-500/30'
                      : 'border-neutral-200 dark:border-[#262636] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Hero Image */}
          <div className="flex-1 relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#12121a] border border-neutral-200 dark:border-[#262638] group shadow-sm">
            <img
              src={product.images[selectedImageIndex]?.image_url || product.images[0]?.image_url || '/placeholder.png'}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 wings-badge-red text-xs font-black px-2.5 py-1 rounded-md">
                -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Buying Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                <span className="uppercase font-mono tracking-wider">
                  SKU: {selectedVariant?.sku || product.sku}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="font-bold text-neutral-900 dark:text-white">{product.rating}</span>
                  <span className="text-neutral-500 dark:text-neutral-400">({product.reviews_count} ta sharh)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              {product.short_description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Price section */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#14141e] border border-neutral-200 dark:border-[#222232] flex items-baseline gap-3 shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(basePrice)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  currentStock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className={currentStock > 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                {currentStock > 0
                  ? `Mavjud (${currentStock} dona omborda qoldi)`
                  : 'Vaqtincha tugagan'}
              </span>
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-300">
                  Variantni tanlang:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                          : 'border-neutral-200 dark:border-[#28283a] bg-white dark:bg-[#14141e] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add To Cart */}
            <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-[#1e1e2c]">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-200 dark:border-[#2b2b3d] rounded-lg bg-white dark:bg-[#14141e] p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-bold text-neutral-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="flex-1 wings-btn-primary py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 rounded-lg disabled:opacity-40"
                >
                  {added ? (
                    <>
                      <Check size={18} className="text-emerald-400" />
                      <span>{t.products.added_to_cart}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>{t.products.add_to_cart}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-lg border transition-all ${
                    isWishlisted
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg'
                      : 'bg-white dark:bg-[#14141e] border-neutral-200 dark:border-[#2b2b3d] text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-white hover:border-rose-500 shadow-sm'
                  }`}
                  title={isWishlisted ? t.products.removed_from_wishlist : t.products.added_to_wishlist}
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>

                <button
                  onClick={handleShare}
                  className={`p-3 rounded-lg border transition-colors shadow-sm relative ${
                    copiedLink
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'bg-white dark:bg-[#14141e] border-neutral-200 dark:border-[#2b2b3d] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title={copiedLink ? 'Nusxalandi!' : 'Ulashish'}
                >
                  {copiedLink ? <Check size={18} /> : <Share2 size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Delivery & Warranty Guarantees Box */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#111118] border border-neutral-200 dark:border-[#20202e] space-y-3 text-xs text-neutral-600 dark:text-neutral-300 shadow-sm">
            <div className="flex items-center gap-3">
              <Truck size={17} className="text-rose-500 shrink-0" />
              <span>Toshkentda 3-5 soatda, viloyatlarga 1-2 kunda yetkaziladi</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={17} className="text-rose-500 shrink-0" />
              <span>100% asl sifat kafolati va rasmiy sertifikat</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={17} className="text-rose-500 shrink-0" />
              <span>14 kun ichida almashtirish yoki qaytarish imkoniyati</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-[#222232]">
        <div className="flex border-b border-neutral-200 dark:border-[#222232] gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === 'desc'
                ? 'border-rose-500 text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Tavsif va dizayn
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === 'specs'
                ? 'border-rose-500 text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Texnik xususiyatlar
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-rose-500 text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <span>Sharhlar</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-[#1c1c28] text-rose-600 dark:text-rose-400 font-bold">
              {reviewsList.length}
            </span>
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'desc' && (
            <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed space-y-4">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <table className="w-full text-xs text-left">
                <tbody>
                  <tr className="border-b border-neutral-200 dark:border-[#20202e]">
                    <td className="py-3 font-semibold text-neutral-500 dark:text-neutral-400 w-1/3">Kategoriya</td>
                    <td className="py-3 text-neutral-900 dark:text-white">{product.category?.name || 'Wings'}</td>
                  </tr>
                  <tr className="border-b border-neutral-200 dark:border-[#20202e]">
                    <td className="py-3 font-semibold text-neutral-500 dark:text-neutral-400">Artikul (SKU)</td>
                    <td className="py-3 text-neutral-900 dark:text-white font-mono">{product.sku}</td>
                  </tr>
                  {product.attributes_json &&
                    Object.entries(product.attributes_json).map(([key, val]) => (
                      <tr key={key} className="border-b border-neutral-200 dark:border-[#20202e]">
                        <td className="py-3 font-semibold text-neutral-500 dark:text-neutral-400 capitalize">
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 text-neutral-900 dark:text-white">{String(val)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Existing Reviews */}
              <div className="lg:col-span-7 space-y-4">
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Hozircha sharhlar yoʻq. Birinchi boʻlib fikringizni bildiring!
                  </p>
                ) : (
                  reviewsList.map((r, i) => (
                    <div key={r.id || i} className="p-4 rounded-xl bg-neutral-50 dark:bg-[#14141e] border border-neutral-200 dark:border-[#222232] space-y-2 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-900 dark:text-white">{r.user_name}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: r.rating }).map((_, idx) => (
                            <Star key={idx} size={12} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                        "{r.comment}"
                      </p>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{r.created_at}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] space-y-4 shadow-sm">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-rose-500" />
                  <span>Fikr bildirish</span>
                </h4>

                {reviewSuccess ? (
                  <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    Sharhingiz qabul qilindi! Rahmat.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div>
                      <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Ismingiz</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Ismingizni kiriting"
                        className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-200 dark:border-[#2a2a3c] rounded text-xs px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Baho</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-200 dark:border-[#2a2a3c] rounded text-xs px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Aʼlo)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Yaxshi)</option>
                        <option value={3}>⭐⭐⭐ (3 - Oʻrtacha)</option>
                        <option value={2}>⭐⭐ (2 - Qoniqarsiz)</option>
                        <option value={1}>⭐ (1 - Yomon)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Sharhingiz</label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Mahsulot haqida fikringiz..."
                        className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-200 dark:border-[#2a2a3c] rounded text-xs px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full wings-btn-primary py-2 text-xs font-bold"
                    >
                      {submittingReview ? 'Yuborilmoqda...' : 'Sharhni yuborish'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-neutral-200 dark:border-[#222232]">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight mb-6">
            Oʻxshash Wings Modellari
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
