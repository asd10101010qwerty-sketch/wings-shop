import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('query') || undefined;
    const minPrice = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
    const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
    const sort = searchParams.get('sort') || undefined;
    const inStockOnly = searchParams.get('in_stock') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const isNew = searchParams.get('new') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const result = await db.getProducts({
      category,
      query,
      minPrice,
      maxPrice,
      sort,
      inStockOnly,
      featured,
      isNew,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await db.saveProduct(body);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
