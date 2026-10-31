import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyOrderStatusChange, getEffectiveSiteUrl } from '@/lib/telegram';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Buyurtma topilmadi / Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, payment_status, tracking_number, admin_notes } = body;

    const existingOrder = await db.getOrderById(id);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Buyurtma topilmadi / Order not found' }, { status: 404 });
    }

    const previousStatus = existingOrder.status;

    let updatedOrder = existingOrder;

    if (status) {
      updatedOrder = (await db.updateOrderStatus(id, status, tracking_number, admin_notes)) || existingOrder;

      // If status changed, send Telegram notification
      if (previousStatus !== status) {
        const siteUrl = getEffectiveSiteUrl(req.nextUrl.origin);
        try {
          await notifyOrderStatusChange(updatedOrder, previousStatus, status, siteUrl);
        } catch (tErr) {
          console.warn('[Telegram Status Change Warning]:', tErr);
        }
      }
    }

    if (payment_status) {
      updatedOrder = (await db.updatePaymentStatus(id, payment_status)) || updatedOrder;
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
