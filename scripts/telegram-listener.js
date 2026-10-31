// Wings Telegram Bot Interactive Listener
const fs = require('fs');
const path = require('path');

// Load environment from .env.local if present
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.warn('Could not parse .env.local:', e.message);
}

const token = process.env.TELEGRAM_BOT_TOKEN || '8953227132:AAHBEPnfuUBpj0yIUvCG3_Ok3CvH0Nyq3vk';
let lastUpdateId = 0;

console.log('[Telegram Bot]: Starting interactive listener for @wings_shop_bot...');

async function sendMessage(chatId, text, replyMarkup = null) {
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error('[Send Error]:', err.message);
  }
}

async function sendPhoto(chatId, photoUrl, caption, replyMarkup = null) {
  try {
    const trimmedCaption = caption.length > 1020 ? caption.substring(0, 1016) + '...' : caption;
    const body = {
      chat_id: chatId,
      photo: photoUrl,
      caption: trimmedCaption,
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return sendMessage(chatId, caption, replyMarkup);
    }
    return data;
  } catch (err) {
    return sendMessage(chatId, caption, replyMarkup);
  }
}

async function answerCallbackQuery(callbackQueryId, text = '') {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });
  } catch (e) {}
}

const mainMenu = {
  inline_keyboard: [
    [
      { text: '📦 Buyurtmalar holati', callback_data: 'orders' },
      { text: 'ℹ️ Doʻkon haqida', callback_data: 'about' }
    ],
    [
      { text: '📞 Qoʻllab-quvvatlash', callback_data: 'support' },
      { text: '🎁 Faol kuponlar', callback_data: 'coupons' }
    ]
  ]
};

async function handleMessage(msg) {
  const chatId = msg.chat?.id;
  const text = (msg.text || '').trim();
  const userName = msg.from?.first_name || 'Hurmatli xaridor';

  if (!chatId) return;

  if (text.startsWith('/start')) {
    const welcomeText = 
      `🦅 <b>Assalomu alaykum, ${userName}!</b>\n\n` +
      `<b>Wings</b> premium onlayn doʻkonining rasmiy botiga xush kelibsiz!\n\n` +
      `Bu yerda siz:\n` +
      `• Buyurtmalaringiz va yetkazib berish holatini bilib olishingiz\n` +
      `• Yangi chegirmalar va aksiyalar haqida xabar olishingiz\n` +
      `• Doʻkon maʼmuriyati bilan bogʻlanishingiz mumkin.\n\n` +
      `🌐 <b>Doʻkon veb-sayti:</b> http://localhost:3000\n` +
      `📞 <b>Aloqa markazi:</b> +998 71 200 45 45\n\n` +
      `<i>Quyidagi boʻlimlardan birini tanlang:</i>`;

    const heroPhoto = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop';
    await sendPhoto(chatId, heroPhoto, welcomeText, mainMenu);
  } else if (text.startsWith('/orders') || text.toLowerCase().includes('buyurtma')) {
    const ordersText = 
      `📦 <b>Buyurtmalar boʻlimi:</b>\n\n` +
      `Sizning oxirgi buyurtmangiz:\n` +
      `• Raqam: <code>WNG-2026-8492</code>\n` +
      `• Holati: <b>Yetkazib berilgan (Delivered)</b>\n` +
      `• Summa: <b>1 305 000 soʻm</b>\n` +
      `• Tovar: Wings Phantom ANC Studio Headphones\n\n` +
      `Barcha buyurtmalarni koʻrish uchun saytdagi <a href="http://localhost:3000/account/orders">shaxsiy kabinetingizga</a> kiring.`;

    const orderPhoto = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop';
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
    // Default reply
    const defaultText = 
      `Xabaringiz qabul qilindi. Sizga qanday yordam bera olamiz?\n\n` +
      `Quyidagi tugmalardan birini tanlang yoki saytimizga tashrif buyuring:\n` +
      `🌐 http://localhost:3000`;

    await sendMessage(chatId, defaultText, mainMenu);
  }
}

async function handleCallback(cb) {
  const chatId = cb.message?.chat?.id;
  const data = cb.data;
  const cbId = cb.id;

  if (!chatId) return;

  if (data === 'orders') {
    await answerCallbackQuery(cbId, 'Buyurtmalar yuklanmoqda...');
    const text = 
      `📦 <b>Sizning buyurtmalaringiz:</b>\n\n` +
      `• <b>WNG-2026-8492</b>: 1 305 000 soʻm — <i>Yetkazilgan</i>\n` +
      `• <b>WNG-2026-9134</b>: 2 190 000 soʻm — <i>Yetkazilmoqda</i>\n\n` +
      `Toʻliq maʼlumot: http://localhost:3000/account/orders`;
    await sendMessage(chatId, text, mainMenu);
  } else if (data === 'support') {
    await answerCallbackQuery(cbId, 'Qoʻllab-quvvatlash xizmati');
    const text = 
      `📞 <b>Wings Mijozlarga Xizmat Koʻrsatish:</b>\n\n` +
      `• Telefon: +998 71 200 45 45\n` +
      `• Telegram aloqa: @Sprint383\n` +
      `• Email: support@wings-store.uz\n` +
      `• Manzil: Toshkent shahri, Amir Temur shoh koʻchasi 107B\n` +
      `• Ish vaqti: Har kuni 09:00 dan 22:00 gacha`;
    await sendMessage(chatId, text, mainMenu);
  } else if (data === 'about') {
    await answerCallbackQuery(cbId, 'Doʻkon haqida');
    const text = 
      `🦅 <b>Wings haqida:</b>\n\n` +
      `Wings — zamonaviy shahar dinamikasi uchun yaratilgan premium elektronika, akustika, titan soatlar va shahar kiyimlari doʻkoni.\n\n` +
      `• 100% original tovarlar\n` +
      `• 14 kunlik rasmiy kafolat\n` +
      `• Toshkentda 3 soatda, viloyatlarga 1 kunda yetkazish\n` +
      `🌐 http://localhost:3000`;
    await sendMessage(chatId, text, mainMenu);
  } else if (data === 'coupons') {
    await answerCallbackQuery(cbId, 'Faol kuponlar');
    const text = 
      `🎁 <b>Bugungi faol promokodlar:</b>\n\n` +
      `• <code>WINGS10</code> — Har qanday buyurtmaga 10% chegirma (300 000 soʻmdan yuqori)\n` +
      `• <code>WELCOME50</code> — Ilk xaridga 50 000 soʻm chegirma\n\n` +
      `Xarid chogʻida savatda ushbu kodlarni kiriting!`;
    await sendMessage(chatId, text, mainMenu);
  }
}

async function poll() {
  try {
    const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);

        if (update.message) {
          await handleMessage(update.message);
        } else if (update.callback_query) {
          await handleCallback(update.callback_query);
        }
      }
    }
  } catch (err) {
    // Silent network retry
  }

  // Continue polling
  setTimeout(poll, 1000);
}

// Start polling
poll();
