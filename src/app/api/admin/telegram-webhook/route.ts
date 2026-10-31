import { NextRequest, NextResponse } from 'next/server';
import { getTelegramWebhookInfo, setTelegramWebhook, getEffectiveSiteUrl } from '@/lib/telegram';

export async function GET(req: NextRequest) {
  try {
    const info = await getTelegramWebhookInfo();
    const effectiveSiteUrl = getEffectiveSiteUrl(req.nextUrl.origin);
    return NextResponse.json({
      success: true,
      webhookInfo: info,
      effectiveSiteUrl,
      recommendedWebhookUrl: `${effectiveSiteUrl}/api/telegram/webhook`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const siteUrl = body.siteUrl || getEffectiveSiteUrl(req.nextUrl.origin);
    const webhookUrl = `${siteUrl.replace(/\/$/, '')}/api/telegram/webhook`;

    const res = await setTelegramWebhook(webhookUrl);
    return NextResponse.json({
      success: res.ok,
      result: res,
      webhookUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=false`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
