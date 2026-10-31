import { Order, StoreSettings } from '@/types';

export function getEffectiveSiteUrl(siteUrl?: string): string {
  if (siteUrl && !siteUrl.includes('localhost')) {
    return siteUrl.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || siteUrl || '';
}

function escapeHtml(text: string = ''): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface TelegramResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

export async function sendTelegramMessage(
  text: string,
  customChatId?: string | number,
  replyMarkup?: any
): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      success: false,
      error: 'Telegram Bot Token or Chat ID is not configured.',
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload: Record<string, any> = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    };

    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      const errorMsg = data.description || 'Unknown Telegram API error';
      console.warn('[Telegram Notification Error]:', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (err: any) {
    console.warn('[Telegram Network Error]:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function sendTelegramPhoto(
  photoUrl: string,
  caption: string,
  customChatId?: string | number,
  replyMarkup?: any
): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      success: false,
      error: 'Telegram Bot Token or Chat ID is not configured.',
    };
  }

  try {
    // If caption fits within Telegram 1024-character caption limit
    if (caption.length <= 1020) {
      const url = `https://api.telegram.org/bot${token}/sendPhoto`;
      const payload: Record<string, any> = {
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
      };
      if (replyMarkup) payload.reply_markup = replyMarkup;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.ok) {
        return { success: true, messageId: data.result?.message_id };
      }
    }

    // If caption > 1020 characters or combined photo failed:
    // Send photo first, then full message
    const photoUrlEndpoint = `https://api.telegram.org/bot${token}/sendPhoto`;
    await fetch(photoUrlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: '🦅 <b>WINGS — BUYURTMA RASMI</b>',
        parse_mode: 'HTML',
      }),
    });

    return await sendTelegramMessage(caption, customChatId, replyMarkup);
  } catch (err: any) {
    console.warn('[Telegram Photo Fallback]:', err.message);
    return sendTelegramMessage(caption, customChatId, replyMarkup);
  }
}

export async function notifyNewOrder(order: Order, siteUrlInput?: string): Promise<TelegramResult> {
  const siteUrl = getEffectiveSiteUrl(siteUrlInput);

  const itemsText = order.items
    .map((item, idx) => {
      const variantInfo = item.variant_title ? ` (${escapeHtml(item.variant_title)})` : '';
      const formattedTotal = new Intl.NumberFormat('ru-RU').format(item.total_price);
      return `${idx + 1}. <b>${escapeHtml(item.product_name)}</b>${variantInfo}\n   📦 ${item.quantity} dona × ${new Intl.NumberFormat('ru-RU').format(item.unit_price)} = <b>${formattedTotal} soʻm</b>`;
    })
    .join('\n');

  const addr = order.delivery_address;
  const addressText = `${escapeHtml(addr.region)}, ${escapeHtml(addr.city)}, ${escapeHtml(addr.street)}${addr.apartment ? ', xonadon ' + escapeHtml(addr.apartment) : ''}`;
  const totalFormatted = new Intl.NumberFormat('ru-RU').format(order.total_amount);
  const subtotalFormatted = new Intl.NumberFormat('ru-RU').format(order.subtotal);
  const shippingFormatted = order.shipping_fee > 0 ? `${new Intl.NumberFormat('ru-RU').format(order.shipping_fee)} soʻm` : 'BEPUL';
  const discountFormatted = order.discount_amount > 0 ? `-${new Intl.NumberFormat('ru-RU').format(order.discount_amount)} soʻm` : 'Yoʻq';

  const paymentLabels: Record<string, string> = {
    cod: '💵 Qabul qilganda naqd / karta',
    bank_transfer: '💳 Click / Payme / Karta oʻtkazmasi',
    card: '💳 Onlayn bank kartasi',
  };

  const deliveryLabels: Record<string, string> = {
    standard: '🚚 Standart kuryer (1-2 kun)',
    express: '⚡ Ekspress tezkor (3-5 soat)',
    pickup: '🏬 Doʻkondan olib ketish',
  };

  const adminOrderUrl = `${siteUrl}/admin/orders/${order.id}`;

  const message = [
    `🦅 <b>WINGS — YANGI BUYURTMA QABUL QILINDI!</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 <b>Buyurtma raqami:</b> <code>${escapeHtml(order.order_number)}</code>`,
    `⏱ <b>Sana:</b> ${new Date(order.created_at || Date.now()).toLocaleString('uz-UZ')}`,
    `🟡 <b>Holat:</b> ${order.status.toUpperCase()}`,
    `💳 <b>Toʻlov:</b> ${paymentLabels[order.payment_method] || order.payment_method} (${order.payment_status.toUpperCase()})`,
    `🚚 <b>Yetkazish:</b> ${deliveryLabels[order.delivery_method] || order.delivery_method}`,
    ``,
    `👤 <b>MIJOZ MAʼLUMOTLARI:</b>`,
    `• Ismi: <b>${escapeHtml(addr.recipient_name)}</b>`,
    `• Telefon: <b>${escapeHtml(addr.phone)}</b>`,
    `• Manzil: ${addressText}`,
    addr.notes ? `• Eslatma: <i>${escapeHtml(addr.notes)}</i>` : null,
    ``,
    `🛍 <b>BUYURTMA TARKIBI:</b>`,
    itemsText,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `📊 Oraliq jami: ${subtotalFormatted} soʻm`,
    `🎟 Chegirma: ${discountFormatted}`,
    `🚚 Yetkazib berish: ${shippingFormatted}`,
    `💰 <b>JAMI TOʻLOV: ${totalFormatted} soʻm</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `🔗 <a href="${adminOrderUrl}">Buyurtmani boshqarish (Admin Panel)</a>`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  // If public HTTPS domain, add inline keyboard button
  let replyMarkup = undefined;
  if (siteUrl.startsWith('https://')) {
    replyMarkup = {
      inline_keyboard: [
        [{ text: '📋 Buyurtmani ochish', url: adminOrderUrl }],
      ],
    };
  }

  // Find product photo from ordered items or default premium brand photo
  const rawPhoto = order.items?.find((i) => i.image_url)?.image_url || '/images/products/phantom-anc-headphones.jpg';
  const primaryPhoto = rawPhoto.startsWith('http')
    ? rawPhoto
    : (siteUrl.startsWith('https://')
        ? `${siteUrl}${rawPhoto}`
        : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop');

  return sendTelegramPhoto(primaryPhoto, message, undefined, replyMarkup);
}

export async function notifyOrderStatusChange(
  order: Order,
  previousStatus: string,
  newStatus: string,
  siteUrlInput?: string
): Promise<TelegramResult> {
  const siteUrl = getEffectiveSiteUrl(siteUrlInput);
  const adminOrderUrl = `${siteUrl}/admin/orders/${order.id}`;
  const totalFormatted = new Intl.NumberFormat('ru-RU').format(order.total_amount);

  const statusIcons: Record<string, string> = {
    confirmed: '✅ Tasdiqlandi',
    processing: '⚙️ Tayyorlanmoqda',
    shipped: '🚀 Kuryerga berildi',
    delivered: '📦 Yetkazib berildi',
    cancelled: '❌ Bekor qilindi',
  };

  const message = [
    `🦅 <b>WINGS — BUYURTMA HOLATI OʻZGARDI</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 <b>Buyurtma:</b> <code>${escapeHtml(order.order_number)}</code>`,
    `🔄 <b>Oʻzgarish:</b> ${previousStatus.toUpperCase()} ➡️ <b>${statusIcons[newStatus] || newStatus.toUpperCase()}</b>`,
    `👤 <b>Mijoz:</b> ${escapeHtml(order.delivery_address.recipient_name)} (${escapeHtml(order.delivery_address.phone)})`,
    `💰 <b>Summa:</b> ${totalFormatted} soʻm`,
    order.tracking_number ? `📍 <b>Trek-kod:</b> <code>${escapeHtml(order.tracking_number)}</code>` : null,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `🔗 <a href="${adminOrderUrl}">Admin panelda ochish</a>`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  let replyMarkup = undefined;
  if (siteUrl.startsWith('https://')) {
    replyMarkup = {
      inline_keyboard: [
        [{ text: '📋 Buyurtmani koʻrish', url: adminOrderUrl }],
      ],
    };
  }

  const primaryPhoto = order.items?.find((i) => i.image_url)?.image_url;
  if (primaryPhoto) {
    return sendTelegramPhoto(primaryPhoto, message, undefined, replyMarkup);
  }

  return sendTelegramMessage(message, undefined, replyMarkup);
}

export async function sendTestNotification(siteUrlInput?: string): Promise<TelegramResult> {
  const siteUrl = getEffectiveSiteUrl(siteUrlInput);

  const message = [
    `🦅 <b>WINGS E-COMMERCE BOT ALOQA TESTI</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `Bot: @wings_shop_bot`,
    `Holat: ✅ Tizim toʻliq faol va aloqada`,
    `Vaqt: ${new Date().toLocaleString('uz-UZ')}`,
    `Sayt: ${siteUrl}`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `Barcha yangi buyurtmalar va bildirishnomalar ushbu chatga avtomatik yetkaziladi.`,
  ].join('\n');

  let replyMarkup = undefined;
  if (siteUrl.startsWith('https://')) {
    replyMarkup = {
      inline_keyboard: [
        [{ text: '🛍 Doʻkonni ochish', url: siteUrl }],
      ],
    };
  }

  const testPhoto = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop';
  return sendTelegramPhoto(testPhoto, message, undefined, replyMarkup);
}

// Manage Webhook for Vercel Serverless
export async function setTelegramWebhook(webhookUrl: string, secretToken?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('Telegram bot token not configured');

  const secret = secretToken || process.env.TELEGRAM_WEBHOOK_SECRET;
  const apiUrl = `https://api.telegram.org/bot${token}/setWebhook`;

  const payload: Record<string, any> = {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false,
  };

  if (secret) {
    payload.secret_token = secret;
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

export async function getTelegramWebhookInfo() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('Telegram bot token not configured');

  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  return await res.json();
}
