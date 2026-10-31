import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ProductForm } from '@/components/admin/ProductForm';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = (await db.getProductById(id)) || (await db.getProductBySlug(id));

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#20202e]">
        <Link
          href="/admin/products"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Mahsulotlar roʻyxatiga qaytish</span>
        </Link>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Mahsulotni Tahrirlash: {product.name}
        </h1>
      </div>

      <ProductForm initialProduct={product} isEditing={true} />
    </div>
  );
}
