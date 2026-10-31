'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types';
import { Plus, Trash2, Edit2, Layers, Search, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('1');

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      notify('Kategoriyalarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('/images/categories/cat-audio.jpg');
    setIsActive(true);
    setSortOrder((categories.length + 1).toString());
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setIsActive(cat.is_active ?? true);
    setSortOrder((cat.sort_order ?? 1).toString());
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        sort_order: parseInt(sortOrder) || 1,
      };

      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Saqlashda xatolik yuz berdi');

      notify(editingId ? 'Kategoriya muvaffaqiyatli yangilandi' : 'Yangi kategoriya yaratildi');
      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      notify(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Haqiqatan ham "${catName}" kategoriyasini oʻchirmoqchimisiz?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        notify(`"${catName}" kategoriyasi oʻchirildi`);
      } else {
        throw new Error('Oʻchirish imkoni boʻlmadi');
      }
    } catch (e: any) {
      notify(e.message, 'error');
    }
  };

  const handleToggleActive = async (cat: Category) => {
    const updatedStatus = !cat.is_active;
    // Optimistic UI
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, is_active: updatedStatus } : c))
    );

    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cat, is_active: updatedStatus }),
      });
      if (!res.ok) throw new Error();
      notify(`Kategoriya holati ${updatedStatus ? 'faollashtirildi' : 'nofaol qilindi'}`);
    } catch {
      // Revert on error
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: cat.is_active } : c))
      );
      notify('Holatni oʻzgartirib boʻlmadi', 'error');
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
              : 'bg-rose-950 border-rose-700 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#20202e]">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Kategoriyalar Boshqaruvi</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Katalog toʻplamlari, tartib raqamlari va doʻkonda koʻrsatilishi
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="wings-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-2 rounded-xl shrink-0"
        >
          <Plus size={16} />
          <span>Yangi Kategoriya Qoʻshish</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kategoriya nomi yoki slug boʻyicha qidirish..."
            className="w-full bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs text-neutral-900 dark:text-white pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors shadow-sm dark:shadow-none"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          <span>Jami: <b className="text-neutral-900 dark:text-white">{categories.length} ta</b> toifa</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {categories.filter((c) => c.is_active).length} ta faol
          </span>
        </div>
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-neutral-500">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Kategoriyalar yuklanmoqda...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] space-y-3 shadow-sm dark:shadow-none">
          <Layers size={36} className="text-neutral-400 dark:text-neutral-600 mx-auto" />
          <p className="text-sm font-bold text-neutral-900 dark:text-white">Hech qanday kategoriya topilmadi</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Yangi toifa qoʻshish uchun yuqoridagi tugmani bosing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className={`p-5 rounded-2xl bg-white dark:bg-[#12121a] border transition-all duration-200 flex flex-col justify-between gap-4 shadow-sm dark:shadow-none ${
                cat.is_active ? 'border-neutral-200 dark:border-[#222232] hover:border-neutral-300 dark:hover:border-[#333348]' : 'border-neutral-200 dark:border-neutral-800/60 opacity-60'
              }`}
            >
              <div className="flex gap-4 items-start">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#1c1c28] border border-neutral-200 dark:border-[#28283a] shrink-0">
                  <img
                    src={cat.image_url || '/images/categories/cat-audio.jpg'}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/categories/cat-audio.jpg';
                    }}
                  />
                  {!cat.is_active && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <EyeOff size={16} className="text-neutral-400" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">{cat.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#1e1e2c] text-neutral-600 dark:text-neutral-400 shrink-0">
                      #{cat.sort_order ?? 1}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400/90 truncate mt-0.5">/{cat.slug}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {cat.description || 'Tavsif berilmagan'}
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1e1e2c] flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(cat)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    cat.is_active
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                  title="Koʻrinish holatini oʻzgartirish"
                >
                  {cat.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{cat.is_active ? 'Faol' : 'Yashirin'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/categories/${cat.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1a1a28] transition-colors"
                    title="Doʻkonda ochish"
                  >
                    <ArrowUpRight size={15} />
                  </Link>

                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-600 dark:text-neutral-400 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-[#1a1a28] transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-[#1a1a28] transition-colors"
                    title="Oʻchirish"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#2a2a3e] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#202030]">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-base">
                <Layers size={18} className="text-rose-500" />
                <span>{editingId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Yaratish'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1a1a28]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Kategoriya Nomi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Masalan: Tactical Wear"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Slug (URL manzili) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Tartib raqami (Sort order)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Qisqacha Tavsif
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Katalogdagi tovarlar haqida qisqacha maʼlumot..."
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Rasm Havolasi (URL)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/categories/cat-audio.jpg"
                  className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded-xl text-xs px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                />

                {imageUrl && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 rounded-xl bg-neutral-50 dark:bg-[#181824] border border-neutral-200 dark:border-[#262638]">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover bg-neutral-100 dark:bg-black"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/categories/cat-audio.jpg';
                      }}
                    />
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Rasm koʻrinishi namunasi</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-0 bg-white dark:bg-[#181824] border-neutral-300 dark:border-[#2a2a3c]"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold cursor-pointer">
                  Kategoriyani doʻkonda koʻrsatish (Faol)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-[#202030]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1c1c2a] dark:hover:bg-[#252538] text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="wings-btn-primary px-6 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {saving ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
