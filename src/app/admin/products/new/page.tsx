import React from 'react';
import Link from 'next/link';
import { ProductForm } from '@/components/admin/ProductForm';
import { ArrowLeft } from 'lucide-react';

export default function NewProductPage() {
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
          Yangi Mahsulot Qoʻshish
        </h1>
      </div>

      <ProductForm isEditing={false} />
    </div>
  );
}
