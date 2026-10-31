'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      title: 'Asosiy manzil (Uy)',
      name: 'Sardor Rahimiy',
      phone: '+998 90 123 45 67',
      address: 'Toshkent shahri, Mirobod tumani, Nukus koʻchasi 24, xonadon 14',
      isDefault: true,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('Ishxona');
  const [newName, setNewName] = useState('Sardor Rahimiy');
  const [newPhone, setNewPhone] = useState('+998 90 123 45 67');
  const [newAddress, setNewAddress] = useState('');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setAddresses((prev) => [
      ...prev,
      {
        id: `addr-${Date.now()}`,
        title: newTitle,
        name: newName,
        phone: newPhone,
        address: newAddress,
        isDefault: false,
      },
    ]);
    setShowAddForm(false);
    setNewAddress('');
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full transition-colors duration-200">
      <Link
        href="/account"
        className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 mb-4"
      >
        <ArrowLeft size={13} />
        <span>Kabinetingizga qaytish</span>
      </Link>

      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-200 dark:border-[#222232]">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Saqlangan manzillar
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Yetkazib berish manzillaringizni boshqaring
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="wings-btn-primary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 rounded-lg"
        >
          <Plus size={14} />
          <span>Yangi manzil</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddAddress} className="mb-6 p-5 rounded-xl bg-white dark:bg-[#14141e] border border-neutral-200 dark:border-[#262638] space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase">Yangi yetkazish manzili</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nomi (Uy, Ishxona)"
              className="bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded text-xs px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
            />
            <input
              type="text"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Telefon raqam"
              className="bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded text-xs px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
          <textarea
            required
            rows={2}
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Shahar, tuman, koʻcha, uy, xonadon..."
            className="w-full bg-neutral-50 dark:bg-[#181824] border border-neutral-300 dark:border-[#2a2a3c] rounded text-xs px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-[#20202e] text-xs font-semibold rounded text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#28283a]"
            >
              Bekor qilish
            </button>
            <button type="submit" className="wings-btn-primary px-4 py-1.5 text-xs font-bold rounded">
              Qoʻshish
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#242436] flex items-start justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-rose-600 dark:text-rose-500" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white">{addr.title}</span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Asosiy
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{addr.name} ({addr.phone})</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">{addr.address}</p>
            </div>

            <button
              onClick={() => handleDelete(addr.id)}
              className="text-neutral-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 p-1 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
