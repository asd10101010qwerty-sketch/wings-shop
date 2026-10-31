import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { products } = await db.getProducts({ limit: 100 });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Mahsulot topilmadi | Wings',
    };
  }

  return {
    title: `${product.name} — Wings Premium Doʻkon`,
    description: product.short_description || product.description || 'Wings original mahsuloti.',
    openGraph: {
      title: `${product.name} | Wings`,
      description: product.short_description || product.description || undefined,
      images: product.images[0]?.image_url ? [{ url: product.images[0].image_url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const { products: related } = await db.getProducts({
    category: product.category_id || undefined,
    limit: 4,
  });

  const filteredRelated = related.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={filteredRelated} />;
}
