'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import { Save, ArrowLeft, Plus, Trash2, Image as ImageIcon, Sparkles, AlertCircle, Percent } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialProduct?: Product;
  isEditing?: boolean;
}

export function ProductForm({ initialProduct, isEditing = false }: ProductFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || '');
  const [shortDesc, setShortDesc] = useState(initialProduct?.short_description || '');
  const [description, setDescription] = useState(initialProduct?.description || '');

  const [price, setPrice] = useState(initialProduct?.price?.toString() || '');
  const [salePrice, setSalePrice] = useState(initialProduct?.sale_price?.toString() || '');
  const [costPrice, setCostPrice] = useState(initialProduct?.cost_price?.toString() || '');

  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [stockQuantity, setStockQuantity] = useState(initialProduct?.stock_quantity?.toString() || '10');
  const [lowStockThreshold, setLowStockThreshold] = useState(initialProduct?.low_stock_threshold?.toString() || '5');

  // Multi-image list
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialProduct?.images?.map((img) => img.image_url) || [
      '/images/products/phantom-anc-headphones.jpg',
    ]
  );
  const [newImageInput, setNewImageInput] = useState('');

  const [isPublished, setIsPublished] = useState(initialProduct?.is_published ?? true);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured ?? false);
  const [isNew, setIsNew] = useState(initialProduct?.is_new ?? true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        const cats = Array.isArray(data) ? data : [];
        setCategories(cats);
        if (!categoryId && cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleAddImage = () => {
    if (newImageInput.trim() && !imageUrls.includes(newImageInput.trim())) {
      setImageUrls([...imageUrls, newImageInput.trim()]);
      setNewImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  // Calculations
  const numericPrice = parseFloat(price) || 0;
  const numericCost = parseFloat(costPrice) || 0;
  const effectivePrice = salePrice ? parseFloat(salePrice) : numericPrice;
  const grossProfit = effectivePrice - numericCost;
  const marginPercent = effectivePrice > 0 ? Math.round((grossProfit / effectivePrice) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const finalImages = imageUrls.length > 0
        ? imageUrls.map((url, idx) => ({
            id: `img-${Date.now()}-${idx}`,
            product_id: initialProduct?.id || '',
            image_url: url,
            alt_text: name,
            sort_order: idx,
            is_thumbnail: idx === 0,
          }))
        : [
            {
              id: `img-${Date.now()}`,
              product_id: initialProduct?.id || '',
              image_url: '/images/products/phantom-anc-headphones.jpg',
              alt_text: name,
              sort_order: 0,
              is_thumbnail: true,
            },
          ];

      const payload: Partial<Product> = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        category_id: categoryId || null,
        short_description: shortDesc.trim() || null,
        description: description.trim() || null,
        price: numericPrice,
        sale_price: salePrice ? parseFloat(salePrice) : null,
        cost_price: numericCost,
        sku: sku.trim() || null,
        stock_quantity: parseInt(stockQuantity) || 0,
        low_stock_threshold: parseInt(lowStockThreshold) || 5,
        is_published: isPublished,
        is_featured: isFeatured,
        is_new: isNew,
        images: finalImages,
      };

      const url = isEditing ? `/api/products/${initialProduct?.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Mahsulotni saqlashda xatolik yuz berdi');
      }

      router.push('/admin/products');
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#20202e]">
        <Link
          href="/admin/products"
          className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Mahsulotlar roʻyxatiga qaytish</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="wings-btn-primary px-6 py-2 text-xs font-bold flex items-center gap-2 rounded-xl disabled:opacity-50"
        >
          <Save size={15} />
          <span>{loading ? 'Saqlanmoqda...' : isEditing ? 'Oʻzgarishlarni saqlash' : 'Mahsulotni nashr qilish'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Details (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Asosiy Maʼlumotlar
            </h2>

            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Mahsulot Nomi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Masalan: Wings Phantom ANC Studio Headphones"
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 font-bold shadow-sm dark:shadow-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  URL Slugi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 font-mono shadow-sm dark:shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Kategoriya <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 font-semibold shadow-sm dark:shadow-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Qisqacha Tavsif (1 qatorda afzallik)
              </label>
              <input
                type="text"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="48 soat batareya, titan korpus va gibrid shovqin pasaytiruvchi..."
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Toʻliq Batafsil Tavsif
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mahsulot muhandisligi, materiallari, xususiyatlari va yetkazib berish tarkibi..."
                className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 leading-relaxed shadow-sm dark:shadow-none"
              />
            </div>
          </div>

          {/* Pricing & Profit Margin */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] space-y-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Narxlar va Rentabellik
              </h2>
              {effectivePrice > 0 && (
                <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                  marginPercent >= 40
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : marginPercent > 0
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}>
                  Foyda marjasi: {marginPercent}% ({new Intl.NumberFormat('ru-RU').format(grossProfit)} soʻm)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Asosiy Narx (soʻm) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1450000"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Aksiya Narxi (ixtiyoriy)
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="1290000"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-rose-600 dark:text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Tannarx (Cost Price)
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="750000"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Ombor va Artikul (SKU)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Artikul (SKU)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="WNG-AUD-01"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Qoldiq Miqdori (dona) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Kam Qolish Chegarasi (Min)
                </label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media & Flags (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Gallery / Images */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon size={16} className="text-rose-500" />
              <span>Rasmlar Galereyasi ({imageUrls.length})</span>
            </h2>

            <div className="flex gap-2">
              <input
                type="url"
                value={newImageInput}
                onChange={(e) => setNewImageInput(e.target.value)}
                placeholder="Rasm URL havolasi..."
                className="flex-1 bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-rose-600 dark:bg-[#202030] dark:hover:bg-rose-600 text-neutral-800 dark:text-white hover:text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="space-y-2.5">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436]"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-neutral-100 dark:bg-black shrink-0 border border-neutral-200 dark:border-neutral-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.png';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block truncate">
                      {url}
                    </span>
                    {idx === 0 && (
                      <span className="text-[9px] font-bold uppercase text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-1.5 py-0.2 rounded">
                        Asosiy Rasm (Muqova)
                      </span>
                    )}
                  </div>
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visibility and Flags */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] space-y-4 shadow-sm dark:shadow-none">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Holat va Nishonlar
            </h2>

            <div className="space-y-3.5">
              <label className="flex items-center gap-3 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer p-2.5 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436]">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-0 bg-white dark:bg-[#12121a] border-neutral-300 dark:border-[#2b2b3d]"
                />
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">Doʻkonda Koʻrsatilsin (Published)</span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Xaridorlar ushbu tovarni koʻrib sotib olishlari mumkin</span>
                </div>
              </label>

              <label className="flex items-center gap-3 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer p-2.5 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436]">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-0 bg-white dark:bg-[#12121a] border-neutral-300 dark:border-[#2b2b3d]"
                />
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">Ommabop Mahsulot (Featured)</span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Asosiy sahifada eng yaxshi tovarlar qatorida chiqadi</span>
                </div>
              </label>

              <label className="flex items-center gap-3 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer p-2.5 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436]">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-0 bg-white dark:bg-[#12121a] border-neutral-300 dark:border-[#2b2b3d]"
                />
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">Yangi Drop Nishoni (New Drop)</span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Tovar ustida &ldquo;Yangi&rdquo; yorligʻi aks etadi</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
