import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveSiteUrl } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Bot token not set' }, { status: 500 });
    }

    // Optional secret token verification
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const headerSecret = req.headers.get('x-telegram-bot-api-secret-token');
    if (secret && headerSecret && headerSecret !== secret) {
      console.warn('[Telegram Webhook]: Secret token mismatch');
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    const update = await req.json();
    const siteUrl = getEffectiveSiteUrl(req.nextUrl.origin);
    const isHttps = siteUrl.startsWith('https://');

    // Helper to send message back
    const sendMessage = async (chatId: number | string, text: string, replyMarkup?: any) => {
      const payload: Record<string, any> = {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      };
      if (replyMarkup) payload.reply_markup = replyMarkup;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    };

    const sendPhoto = async (chatId: number | string, photoUrl: string, caption: string, replyMarkup?: any) => {
      try {
        const trimmedCaption = caption.length > 1020 ? caption.substring(0, 1016) + '...' : caption;
        const payload: Record<string, any> = {
          chat_id: chatId,
          photo: photoUrl,
          caption: trimmedCaption,
          parse_mode: 'HTML',
        };
        if (replyMarkup) payload.reply_markup = replyMarkup;

        const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          return sendMessage(chatId, caption, replyMarkup);
        }
        return data;
      } catch {
        return sendMessage(chatId, caption, replyMarkup);
      }
    };

    const answerCallback = async (callbackId: string, text: string = '') => {
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackId, text }),
      });
    };

    // Keyboard configuration
    const inlineButtons: any[] = [];
    if (isHttps) {
      inlineButtons.push([
        { text: '🛍 Doʻkonni ochish (Web App)', web_app: { url: siteUrl } },
        { text: '🌐 Saytga oʻtish', url: siteUrl },
      ]);
    }
    inlineButtons.push([
      { text: '📦 Buyurtmalar holati', callback_data: 'orders' },
      { text: 'ℹ️ Doʻkon haqida', callback_data: 'about' },
    ]);
    inlineButtons.push([
      { text: '📞 Qoʻllab-quvvatlash', callback_data: 'support' },
      { text: '🎁 Faol kuponlar', callback_data: 'coupons' },
    ]);

    const mainMenu = { inline_keyboard: inlineButtons };

    // 1. Handle incoming text message
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = (msg.text || '').trim();
      const userName = msg.from?.first_name || 'Hurmatli xaridor';

      if (chatId) {
        if (text.startsWith('/start')) {
          const welcome = 
            `🦅 <b>Assalomu alaykum, ${userName}!</b>\n\n` +
            `<b>Wings</b> premium onlayn doʻkonining rasmiy botiga xush kelibsiz!\n\n` +
            `Bu yerda siz:\n` +
            `• Buyurtmalaringiz va yetkazib berish holatini bilib olishingiz\n` +
            `• Yangi chegirmalar va aksiyalar haqida xabar olishingiz\n` +
            `• Doʻkon maʼmuriyati bilan bogʻlanishingiz mumkin.\n\n` +
            `🌐 <b>Doʻkon veb-sayti:</b> ${siteUrl}\n` +
            `📞 <b>Aloqa markazi:</b> +998 71 200 45 45\n\n` +
            `<i>Quyidagi boʻlimlardan birini tanlang:</i>`;

          const heroPhoto = isHttps
            ? `${siteUrl}/images/products/phantom-anc-headphones.jpg`
            : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop';
          await sendPhoto(chatId, heroPhoto, welcome, mainMenu);
        } else if (text.startsWith('/orders') || text.toLowerCase().includes('buyurtma')) {
          const ordersText = 
            `📦 <b>Buyurtmalar boʻlimi:</b>\n\n` +
            `Sizning oxirgi buyurtmangiz:\n` +
            `• Raqam: <code>WNG-2026-8492</code>\n` +
            `• Holati: <b>Yetkazib berilgan (Delivered)</b>\n` +
            `• Summa: <b>1 305 000 soʻm</b>\n` +
            `• Tovar: Wings Phantom ANC Studio Headphones\n\n` +
            `Barcha buyurtmalarni koʻrish: ${siteUrl}/account/orders`;

          const orderPhoto = isHttps
            ? `${siteUrl}/images/products/wings-apex-earbuds.jpg`
            : 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop';
          await sendPhoto(chatId, orderPhoto, ordersText, mainMenu);
        } else if (text.startsWith('/help') || text.toLowerCase().includes('yordam')) {
          const helpText = 
            `ℹ️ <b>Yordam va buyruqlar:</b>\n\n` +
            `/start - Botni qayta ishga tushirish\n` +
            `/orders - Buyurtmalar holatini koʻrish\n` +
            `/support - Operator bilan bogʻlanish\n\n` +
            `📞 Telefon: +998 71 200 45 45\n` +
            `✉️ Email: support@wings-store.uz`;

          await sendMessage(chatId, helpText, mainMenu);
        } else {
          const defaultText = 
            `Xabaringiz qabul qilindi. Sizga qanday yordam bera olamiz?\n\n` +
            `Quyidagi tugmalardan birini tanlang yoki saytimizga tashrif buyuring:\n` +
            `🌐 ${siteUrl}`;

          await sendMessage(chatId, defaultText, mainMenu);
        }
      }
    }

    // 2. Handle callback query button clicks
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data;
      const cbId = cb.id;

      if (chatId) {
        if (data === 'orders') {
          await answerCallback(cbId, 'Buyurtmalar yuklanmoqda...');
          const text = 
            `📦 <b>Sizning buyurtmalaringiz:</b>\n\n` +
            `• <b>WNG-2026-8492</b>: 1 305 000 soʻm — <i>Yetkazilgan</i>\n` +
            `• <b>WNG-2026-9134</b>: 2 190 000 soʻm — <i>Yetkazilmoqda</i>\n\n` +
            `Toʻliq maʼlumot: ${siteUrl}/account/orders`;
          await sendMessage(chatId, text, mainMenu);
        } else if (data === 'support') {
          await answerCallback(cbId, 'Qoʻllab-quvvatlash xizmati');
          const text = 
            `📞 <b>Wings Mijozlarga Xizmat Koʻrsatish:</b>\n\n` +
            `• Telefon: +998 71 200 45 45\n` +
            `• Telegram: @Sprint383\n` +
            `• Email: support@wings-store.uz\n` +
            `• Manzil: Toshkent shahri, Amir Temur shoh koʻchasi 107B\n` +
            `• Ish vaqti: Har kuni 09:00 dan 22:00 gacha`;
          await sendMessage(chatId, text, mainMenu);
        } else if (data === 'about') {
          await answerCallback(cbId, 'Doʻkon haqida');
          const text = 
            `🦅 <b>Wings haqida:</b>\n\n` +
            `Wings — zamonaviy shahar dinamikasi uchun yaratilgan premium elektronika, akustika, titan soatlar va shahar kiyimlari doʻkoni.\n\n` +
            `• 100% original tovarlar\n` +
            `• 14 kunlik rasmiy kafolat\n` +
            `• Toshkentda 3 soatda, viloyatlarga 1 kunda yetkazish\n` +
            `🌐 ${siteUrl}`;
          await sendMessage(chatId, text, mainMenu);
        } else if (data === 'coupons') {
          await answerCallback(cbId, 'Faol kuponlar');
          const text = 
            `🎁 <b>Bugungi faol promokodlar:</b>\n\n` +
            `• <code>WINGS10</code> — Har qanday buyurtmaga 10% chegirma (300 000 soʻmdan yuqori)\n` +
            `• <code>WELCOME50</code> — Ilk xaridga 50 000 soʻm chegirma\n\n` +
            `Xarid chogʻida savatda ushbu kodlarni kiriting!`;
          await sendMessage(chatId, text, mainMenu);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Webhook Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active', bot: '@wings_shop_bot', handler: 'Vercel Serverless Webhook' });
}
