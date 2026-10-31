import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/i18n/translations';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  TrendingUp,
  Tag,
  Layers,
  Boxes,
  Truck,
  Sparkles,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const [stats, categories] = await Promise.all([
    db.getAdminStats(),
    db.getAllCategories(),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#1f1f2e]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Wings Boshqaruv Markazi
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Real vaqt rejimidagi savdo, ombor, buyurtmalar va mijozlar tahlili
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products/new"
            className="wings-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
          >
            <Package size={14} />
            <span>Mahsulot Qoʻshish</span>
          </Link>
          <Link
            href="/admin/categories"
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#161622] hover:bg-neutral-100 dark:hover:bg-[#202030] border border-neutral-200 dark:border-[#2a2a3e] text-neutral-700 dark:text-neutral-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Layers size={14} />
            <span>Kategoriyalar</span>
          </Link>
          <Link
            href="/admin/notifications"
            className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send size={14} />
            <span>Telegram Bot</span>
          </Link>
        </div>
      </div>

      {/* Low stock alert banner */}
      {stats.lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="font-bold text-neutral-900 dark:text-white">Omborda kam qolgan tovarlar mavjud</p>
              <p className="text-amber-700 dark:text-amber-200/80 text-[11px]">
                {stats.lowStockCount} ta mahsulot zaxirasi belgilangan minimal chegaradan kamayib ketdi.
              </p>
            </div>
          </div>
          <Link
            href="/admin/inventory"
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 hover:text-neutral-900 dark:hover:text-white font-bold text-xs transition-colors shrink-0 text-center"
          >
            Omborni toʻldirish →
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] space-y-2 hover:border-neutral-300 dark:hover:border-[#303046] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <span className="text-xs font-semibold">Jami Daromad</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Yetkazilgan va toʻlangan buyurtmalardan</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] space-y-2 hover:border-neutral-300 dark:hover:border-[#303046] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <span className="text-xs font-semibold">Jami Buyurtmalar</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{stats.totalOrders} ta</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <Clock size={12} />
            <span>{stats.pendingOrders} ta kutilayotgan xarid</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] space-y-2 hover:border-neutral-300 dark:hover:border-[#303046] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <span className="text-xs font-semibold">Jami Katalog Tovar</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{stats.totalProducts} ta</p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {categories.length} ta faol toʻplam boʻyicha
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] space-y-2 hover:border-neutral-300 dark:hover:border-[#303046] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <span className="text-xs font-semibold">Ombor Holati</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Boxes size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{stats.lowStockCount} ta</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Zaxirasi kritik kam mahsulot
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/orders"
          className="p-4 rounded-xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] hover:border-rose-500/60 transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag size={18} className="text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform" />
            <ArrowRight size={13} className="text-neutral-400 group-hover:text-rose-500 transition-colors" />
          </div>
          <p className="text-xs font-bold text-neutral-900 dark:text-white">Buyurtmalar</p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Nazorat va joʻnatish</p>
        </Link>

        <Link
          href="/admin/products"
          className="p-4 rounded-xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] hover:border-rose-500/60 transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Package size={18} className="text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <ArrowRight size={13} className="text-neutral-400 group-hover:text-rose-500 transition-colors" />
          </div>
          <p className="text-xs font-bold text-neutral-900 dark:text-white">Mahsulotlar</p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Narxlar va tahrirlash</p>
        </Link>

        <Link
          href="/admin/coupons"
          className="p-4 rounded-xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] hover:border-rose-500/60 transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Tag size={18} className="text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <ArrowRight size={13} className="text-neutral-400 group-hover:text-rose-500 transition-colors" />
          </div>
          <p className="text-xs font-bold text-neutral-900 dark:text-white">Kuponlar</p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Promo-kodlar boshqaruvi</p>
        </Link>

        <Link
          href="/admin/customers"
          className="p-4 rounded-xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] hover:border-rose-500/60 transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Users size={18} className="text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <ArrowRight size={13} className="text-neutral-400 group-hover:text-rose-500 transition-colors" />
          </div>
          <p className="text-xs font-bold text-neutral-900 dark:text-white">Mijozlar</p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Foydalanuvchilar bazasi</p>
        </Link>
      </div>

      {/* Recent Orders & Top Selling layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#1c1c28]">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Soʻnggi Buyurtmalar</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Doʻkondan kelib tushgan yangi xaridlar</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1"
            >
              <span>Barchasini koʻrish</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-neutral-200 dark:divide-[#1c1c28] overflow-x-auto">
            {stats.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-neutral-500">
                Hozircha buyurtmalar kelib tushmagan
              </p>
            ) : (
              stats.recentOrders.map((o) => (
                <div key={o.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                        {o.order_number}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          o.status === 'delivered'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : o.status === 'shipped'
                            ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                            : o.status === 'cancelled'
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300">
                      {o.delivery_address.recipient_name} ({o.delivery_address.phone})
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      {o.items.length} ta tovar • {new Date(o.created_at).toLocaleTimeString('uz-UZ')} ({o.delivery_address.region})
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400 block">
                      {formatCurrency(o.total_amount)}
                    </span>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline mt-1 block"
                    >
                      Boshqarish →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#12121a] border border-neutral-200 dark:border-[#20202e] space-y-4 shadow-sm">
          <div className="pb-3 border-b border-neutral-200 dark:border-[#1c1c28]">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Top Sotilgan Modellar</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Eng koʻp talab qilingan mahsulotlar</p>
          </div>

          <div className="space-y-3.5">
            {stats.topSelling.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 py-6 text-center">
                Sotuvlar statistikasi tez orada shakllanadi
              </p>
            ) : (
              stats.topSelling.map((ts, idx) => (
                <div key={ts.product.id} className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 dark:bg-[#161622] border border-neutral-200 dark:border-[#242436]">
                  <span className="text-xs font-black text-rose-500 w-4 text-center">{idx + 1}</span>
                  <img
                    src={ts.product.images[0]?.image_url || '/placeholder.png'}
                    alt={ts.product.name}
                    className="w-11 h-11 rounded-lg object-cover bg-neutral-100 dark:bg-black shrink-0 border border-neutral-200 dark:border-[#2a2a3e]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{ts.product.name}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {ts.quantitySold} dona • <b className="text-emerald-600 dark:text-emerald-400">{formatCurrency(ts.revenue)}</b>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
