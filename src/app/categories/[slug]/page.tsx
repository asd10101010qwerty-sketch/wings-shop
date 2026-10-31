import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
  const categories = await db.getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await db.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { products } = await db.getProducts({ category: slug });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full transition-colors duration-200">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-6">
        <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight size={13} />
        <Link href="/products" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Mahsulotlar
        </Link>
        <ChevronRight size={13} />
        <span className="text-neutral-900 dark:text-white font-semibold">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 dark:border-[#242436] p-8 sm:p-12 mb-10 flex flex-col justify-end min-h-[220px] shadow-sm">
        {category.image_url && (
          <img
            src={category.image_url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover brightness-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400 drop-shadow">
            Wings Toʻplami
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed drop-shadow">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Mavjud tovarlar ({products.length})
          </h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            <span>Barcha tovarlar</span>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0f0f16] border border-neutral-200 dark:border-[#20202e] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Ushbu kategoriyada hozircha mahsulotlar yoʻq.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
