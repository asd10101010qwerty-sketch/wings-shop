import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { orders } = await db.getOrders({ limit: 100 });

    let registeredProfiles: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) registeredProfiles = data;
    } catch (e) {
      console.warn('[Admin customers profiles fetch warning]:', e);
    }

    const customerMap: Record<
      string,
      {
        id?: string;
        name: string;
        email?: string;
        phone: string;
        role?: string;
        ordersCount: number;
        totalSpent: number;
        lastOrder?: string;
        isRegistered: boolean;
        orders: any[];
      }
    > = {};

    // Seed registered users
    for (const p of registeredProfiles) {
      const key = (p.email || p.id).toLowerCase();
      customerMap[key] = {
        id: p.id,
        name: p.full_name || p.email?.split('@')[0] || 'Foydalanuvchi',
        email: p.email,
        phone: p.phone || '—',
        role: p.role || 'customer',
        ordersCount: 0,
        totalSpent: 0,
        lastOrder: p.created_at,
        isRegistered: true,
        orders: [],
      };
    }

    // Aggregate orders
    for (const o of orders) {
      const phoneKey = o.delivery_address.phone;
      const userKey = o.user_id ? o.user_id.toLowerCase() : '';

      let matchedKey = Object.keys(customerMap).find(
        (k) =>
          (userKey && customerMap[k].id?.toLowerCase() === userKey) ||
          (customerMap[k].phone !== '—' && customerMap[k].phone === phoneKey)
      );

      if (!matchedKey) {
        matchedKey = phoneKey || o.delivery_address.recipient_name;
        customerMap[matchedKey] = {
          name: o.delivery_address.recipient_name,
          phone: o.delivery_address.phone,
          ordersCount: 0,
          totalSpent: 0,
          lastOrder: o.created_at,
          isRegistered: false,
          orders: [],
        };
      }

      customerMap[matchedKey].ordersCount += 1;
      customerMap[matchedKey].totalSpent += o.total_amount;
      customerMap[matchedKey].lastOrder = o.created_at;
      customerMap[matchedKey].orders.push({
        id: o.id,
        order_number: o.order_number,
        total_amount: o.total_amount,
        status: o.status,
        created_at: o.created_at,
      });
    }

    const customers = Object.values(customerMap);
    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
