import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyNewOrder, getEffectiveSiteUrl } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, delivery_address, delivery_method, payment_method, coupon_code, customer_notes, user_id } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Savatda mahsulotlar mavjud emas / Cart is empty' }, { status: 400 });
    }

    if (!delivery_address || !delivery_address.recipient_name || !delivery_address.phone || !delivery_address.region || !delivery_address.street) {
      return NextResponse.json({ success: false, error: 'Yetkazib berish manzili toʻliq emas / Address incomplete' }, { status: 400 });
    }

    // Atomic server-side order creation & inventory deduction
    const order = await db.createOrder({
      user_id: user_id || null,
      items,
      coupon_code,
      delivery_address,
      delivery_method: delivery_method || 'standard',
      payment_method: payment_method || 'cod',
      customer_notes,
    });

    // Asynchronously dispatch Telegram notification
    const siteUrl = getEffectiveSiteUrl(req.nextUrl.origin);
    let telegramResult = null;
    try {
      telegramResult = await notifyNewOrder(order, siteUrl);
    } catch (tErr) {
      console.warn('[Telegram Dispatch Warning]:', tErr);
    }

    return NextResponse.json({
      success: true,
      order,
      telegram: telegramResult,
    });
  } catch (error: any) {
    console.error('[Order Creation Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Buyurtma yaratishda xatolik yuz berdi' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    const result = await db.getOrders({ status, search, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
