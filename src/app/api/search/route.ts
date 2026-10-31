import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const category = searchParams.get('category') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 8;

    const popularSearches = [
      'Wings Phantom ANC',
      'Titan soat',
      'Carbon krossovka',
      '500 GSM Hoodie',
      'Ballistic Sling',
      'Apex Earbuds',
      'StormShield Parka',
      'MagSafe Cardholder',
    ];

    if (!query.trim()) {
      return NextResponse.json({
        products: [],
        categories: [],
        total: 0,
        popularSearches,
      });
    }

    const { products, total } = await db.getProducts({
      query: query.trim(),
      category,
      limit,
    });

    const allCategories = await db.getCategories();
    const qLower = query.toLowerCase().trim();
    const matchedCategories = allCategories.filter((c) =>
      c.name.toLowerCase().includes(qLower) ||
      c.slug.toLowerCase().includes(qLower) ||
      c.description?.toLowerCase().includes(qLower)
    );

    return NextResponse.json({
      products,
      categories: matchedCategories,
      total,
      query: query.trim(),
      popularSearches,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
