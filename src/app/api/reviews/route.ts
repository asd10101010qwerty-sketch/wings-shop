import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id') || undefined;
    const reviews = await db.getReviews(productId);
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, user_name, rating, title, comment } = body;

    if (!product_id || !comment) {
      return NextResponse.json({ error: 'Sharh matni kiritilmadi' }, { status: 400 });
    }

    const review = await db.addReview({
      product_id,
      user_name: user_name || 'Wings Xaridor',
      rating: Number(rating) || 5,
      title,
      comment,
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
