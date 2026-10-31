import { NextRequest, NextResponse } from 'next/server';
import { sendTestNotification, getEffectiveSiteUrl } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const siteUrl = getEffectiveSiteUrl(req.nextUrl.origin);
    const result = await sendTestNotification(siteUrl);

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      botTokenSet: !!process.env.TELEGRAM_BOT_TOKEN,
      chatIdSet: !!process.env.TELEGRAM_CHAT_ID,
      chatId: process.env.TELEGRAM_CHAT_ID,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Telegram test failed',
      },
      { status: 500 }
    );
  }
}
