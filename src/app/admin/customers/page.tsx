'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/i18n/translations';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  User,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  X,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface CustomerItem {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  role?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder?: string;
  isRegistered: boolean;
  orders: {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
  }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');
  const [registeredFilter, setRegisteredFilter] = useState<'all' | 'registered' | 'guest'>('all');
  const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'recent'>('spent');

  // Customer Detail Drawer/Modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filtered = customers
    .filter((c) => {
      if (roleFilter === 'admin') return c.role === 'admin';
      if (roleFilter === 'customer') return c.role !== 'admin';
      return true;
    })
    .filter((c) => {
      if (registeredFilter === 'registered') return c.isRegistered;
      if (registeredFilter === 'guest') return !c.isRegistered;
      return true;
    })
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        c.phone.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'orders') return b.ordersCount - a.ordersCount;
      if (sortBy === 'recent') {
        return new Date(b.lastOrder || 0).getTime() - new Date(a.lastOrder || 0).getTime();
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#20202e]">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Foydalanuvchilar va Mijozlar</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Barcha roʻyxatdan oʻtgan xaridorlar, buyurtma bergan mijozlar va administratorlar bazasi
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
          <span>Jami: <b className="text-neutral-900 dark:text-white">{customers.length} nafar</b></span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {customers.filter((c) => c.isRegistered).length} ta roʻyxatdan oʻtgan
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, email yoki telefon boʻyicha qidirish..."
            className="w-full bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs text-neutral-900 dark:text-white pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors shadow-sm dark:shadow-none"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs px-3 py-2 text-neutral-800 dark:text-neutral-300 focus:outline-none focus:border-rose-500 font-semibold shadow-sm dark:shadow-none"
          >
            <option value="all">Barcha Rollar</option>
            <option value="admin">Faqat Adminlar</option>
            <option value="customer">Faqat Mijozlar</option>
          </select>

          {/* Registration Filter */}
          <select
            value={registeredFilter}
            onChange={(e) => setRegisteredFilter(e.target.value as any)}
            className="bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs px-3 py-2 text-neutral-800 dark:text-neutral-300 focus:outline-none focus:border-rose-500 font-semibold shadow-sm dark:shadow-none"
          >
            <option value="all">Barcha Holatlar</option>
            <option value="registered">Roʻyxatdan oʻtganlar</option>
            <option value="guest">Mehmon (Roʻyxatsiz)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-[#14141e] border border-neutral-300 dark:border-[#242436] rounded-xl text-xs px-3 py-2 text-rose-600 dark:text-rose-400 font-bold focus:outline-none focus:border-rose-500 shadow-sm dark:shadow-none"
          >
            <option value="spent">Sarflangan summa (kamayish)</option>
            <option value="orders">Buyurtmalar soni</option>
            <option value="recent">Soʻnggi faollik</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#222232] overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 dark:bg-[#161622] text-neutral-600 dark:text-neutral-400 font-bold border-b border-neutral-200 dark:border-[#222232]">
              <tr>
                <th className="py-3.5 px-4">Mijoz / Foydalanuvchi</th>
                <th className="py-3.5 px-4">Email Manzili</th>
                <th className="py-3.5 px-4">Telefon</th>
                <th className="py-3.5 px-4">Rol & Holat</th>
                <th className="py-3.5 px-4">Buyurtmalar</th>
                <th className="py-3.5 px-4">Jami Sarflangan</th>
                <th className="py-3.5 px-4 text-right">Tarix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#1e1e2c]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Yuklanmoqda...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-neutral-50 dark:hover:bg-[#161622] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            c.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40'
                              : 'bg-rose-600/10 text-rose-600 dark:bg-rose-600/20 dark:text-rose-400'
                          }`}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                            {c.name}
                          </p>
                          {c.isRegistered ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                              ✓ Roʻyxatdan oʻtgan
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Mehmon xaridor</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                      {c.email || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 font-mono">
                      {c.phone !== '—' ? (
                        <a
                          href={`tel:${c.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-rose-600 dark:hover:text-rose-400 underline decoration-neutral-300 dark:decoration-neutral-700"
                        >
                          {c.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {c.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <ShieldCheck size={11} />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-transparent">
                          <User size={11} />
                          Mijoz
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      {c.ordersCount} ta
                    </td>

                    <td className="py-3.5 px-4 font-black text-rose-600 dark:text-rose-400 text-xs">
                      {formatCurrency(c.totalSpent)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-neutral-500 dark:text-neutral-400 text-[11px] group-hover:text-neutral-900 dark:group-hover:text-white transition-colors underline">
                        Batafsil →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#2a2a3e] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#202030]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600/10 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {selectedCustomer.isRegistered ? 'Roʻyxatdan oʻtgan foydalanuvchi' : 'Mehmon xaridor'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1a1a28]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Contact & Summary Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436] space-y-1">
                <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">Telefon:</span>
                <p className="font-mono font-bold text-neutral-900 dark:text-white">{selectedCustomer.phone}</p>
                {selectedCustomer.phone !== '—' && (
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline block pt-1 font-semibold"
                  >
                    Qoʻngʻiroq qilish →
                  </a>
                )}
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436] space-y-1">
                <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">Email:</span>
                <p className="font-mono font-bold text-neutral-900 dark:text-white truncate">
                  {selectedCustomer.email || '—'}
                </p>
                {selectedCustomer.email && (
                  <a
                    href={`mailto:${selectedCustomer.email}`}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline block pt-1 font-semibold"
                  >
                    Email yozish →
                  </a>
                )}
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436] space-y-1">
                <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">Jami Buyurtmalar:</span>
                <p className="text-sm font-black text-neutral-900 dark:text-white">{selectedCustomer.ordersCount} ta</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436] space-y-1">
                <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">Jami Xarid Summasi:</span>
                <p className="text-sm font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedCustomer.totalSpent)}
                </p>
              </div>
            </div>

            {/* Orders History List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Mijozning Buyurtmalari Tarixi ({selectedCustomer.orders?.length || 0})
              </h4>

              {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                <p className="text-xs text-neutral-500 italic p-3 rounded-xl bg-neutral-50 dark:bg-[#161622]">
                  Hozircha buyurtmalar mavjud emas
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-neutral-200 dark:divide-[#1e1e2c]">
                  {selectedCustomer.orders.map((o) => (
                    <div key={o.id} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-neutral-900 dark:text-white block">{o.order_number}</span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {new Date(o.created_at).toLocaleDateString('uz-UZ')} • {o.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-rose-600 dark:text-rose-400 block">
                          {formatCurrency(o.total_amount)}
                        </span>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          onClick={() => setSelectedCustomer(null)}
                          className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          Ochish →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1c1c2a] dark:hover:bg-[#252538] text-neutral-800 dark:text-white text-xs font-bold transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
