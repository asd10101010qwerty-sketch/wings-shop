import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Kupon kodi kiritilmadi' }, { status: 400 });
    }

    const result = await db.validateCoupon(code, Number(subtotal) || 0);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ valid: false, message: error.message || 'Server xatosi' }, { status: 500 });
  }
}
