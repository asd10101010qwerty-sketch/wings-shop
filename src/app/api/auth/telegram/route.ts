import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = body;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Telegram Bot Token is not configured' }, { status: 500 });
    }

    if (!id || !hash) {
      return NextResponse.json({ success: false, error: 'Invalid Telegram payload' }, { status: 400 });
    }

    // Verify hash integrity with Telegram's specification
    const secretKey = crypto.createHash('sha256').update(token).digest();

    const dataCheckArr: string[] = [];
    const fields: Record<string, any> = { id, first_name, last_name, username, photo_url, auth_date };
    
    Object.keys(fields)
      .sort()
      .forEach((key) => {
        if (fields[key] !== undefined && fields[key] !== null && fields[key] !== '') {
          dataCheckArr.push(`${key}=${fields[key]}`);
        }
      });

    const dataCheckString = dataCheckArr.join('\n');
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const isValid = computedHash === hash;
    if (!isValid) {
      console.warn('[Telegram Auth Warning]: Hash verification failed');
      return NextResponse.json({ success: false, error: 'Telegram maʼlumotlari haqiqiy emas / Hash mismatch' }, { status: 401 });
    }

    // Check auth expiration (allow within 24 hours)
    const now = Math.floor(Date.now() / 1000);
    if (auth_date && now - parseInt(auth_date) > 86400) {
      return NextResponse.json({ success: false, error: 'Telegram sessiyasi muddati oʻtgan' }, { status: 401 });
    }

    // Build user object
    const userEmail = username ? `${username}@t.me` : `telegram_${id}@wings-store.uz`;
    const fullName = `${first_name || ''} ${last_name || ''}`.trim() || username || 'Telegram User';

    return NextResponse.json({
      success: true,
      user: {
        id,
        first_name,
        last_name,
        username,
        photo_url,
        email: userEmail,
        full_name: fullName,
      },
    });
  } catch (error: any) {
    console.error('[Telegram Auth Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
