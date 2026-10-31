import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_INSTRUCTION = `
Sen "Wings" premium onlayn do'konining rasmiy sun'iy intellekt xarid maslahatchisi va stilistisan ("Wings AI Assistant").

DO'KON VA BREND HAQIDA:
- Nomi: Wings (zamonaviy akustika, shahar dinamikasi, harbiy sifatdagi texnologik kiyimlar, poyabzal va titan muhandisligi soatlari).
- Bosh sahifa: /
- Do'kon katalogi: /products
- Kategoriyalar:
  * Audio & Akustika: /categories/audio (Wings Phantom ANC Headphones, Wings Apex Spatial Earbuds)
  * Poyabzal (Footwear): /categories/footwear (Wings Carbon Velocity Runners, Wings Stealth Monochrome Sneakers)
  * Soatlar (Timepieces): /categories/timepieces (Wings Chrono Titan Watch, Wings Obsidian Minimalist Watch)
  * Shahar kiyimlari (Streetwear): /categories/streetwear (Wings 500 GSM Boxy Hoodie, Wings StormShield Tactical Parka)
  * Sumkalar va aksessuarlar (Carry): /categories/carry (Wings Modular Ballistic Sling)

ASOSIY MAHSULOTLAR VA NARXLAR:
1. Wings Phantom ANC Headphones — 1 290 000 soʻm (Faol shovqinni bekor qilish, 40 soat batareya, simsiz Bluetooth 5.4, yumshoq teri quloqliklar). Havola: [Wings Phantom ANC](/products/wings-phantom-anc-headphones)
2. Wings Apex Spatial Earbuds — 890 000 soʻm (Fazoviy audio, IPX7 suvdan himoya, simsiz quvvatlanuvchi g'ilof, 32 soat ish vaqti). Havola: [Wings Apex Earbuds](/products/wings-apex-spatial-earbuds)
3. Wings Carbon Velocity Runners — 1 190 000 soʻm (Karbon tolali plastinka, o'ta yengil nafas oluvchi mesh, zarbani yutuvchi taglik). Havola: [Wings Carbon Runners](/products/wings-carbon-velocity-runners)
4. Wings Stealth Monochrome Sneakers — 950 000 soʻm (To'liq qora, minimalist dizayn, tabiiy charm va EVA qulay taglik). Havola: [Wings Stealth Sneakers](/products/wings-stealth-monochrome-sneakers)
5. Wings Chrono Titan Watch — 2 450 000 soʻm (Titan korpus, tirnalmaydigan safir oyna, 100 metr suvga chidamli, yapon xronografi). Havola: [Wings Chrono Titan](/products/wings-chrono-titan-watch)
6. Wings Obsidian Minimalist Watch — 1 850 000 soʻm (Ultra yupqa qora mat korpus, safir oyna, Shveytsariya kvarts mexanizmi). Havola: [Wings Obsidian Watch](/products/wings-obsidian-minimalist-watch)
7. Wings 500 GSM Boxy Hoodie — 680 000 soʻm (100% zich organik paxta, premium boxy qomat, yashirin cho'ntaklar). Havola: [Wings 500 GSM Hoodie](/products/wings-500-gsm-boxy-hoodie)
8. Wings StormShield Tactical Parka — 1 420 000 soʻm (3-qatlamli suv va shamol o'tkazmaydigan membrana, germetik YKK zamoklar). Havola: [Wings StormShield Parka](/products/wings-stormshield-tactical-parka)
9. Wings Modular Ballistic Sling Bag — 520 000 soʻm (Cordura 1000D yirtilmas mato, Fidlock magnit tezkor qulfi, 7 litr sig'im). Havola: [Wings Modular Sling](/products/wings-modular-ballistic-sling)

XARID VA YETKAZIB BERISH SHARTLARI:
- Yetkazib berish: 500 000 soʻmdan yuqori har qanday buyurtmaga butun Oʻzbekiston boʻylab (Toshkent va barcha viloyatlar) BEPUL yetkazib beriladi!
- Tezkor yetkazish: Toshkent shahrida 3-5 soat (ekspress), viloyatlarga 1-2 ish kuni.
- Maxsus Promo Kod: "WINGS10" — 300 000 soʻmdan oshiq birinchi xarid uchun 10% chegirma beradi!
- Kafolat va Qaytarish: 14 kun ichida bepul qaytarish va o'lcham almashtirish kafolatlangan.
- To'lov: Buyurtmani qo'lga olganda naqd yoki karta orqali, shuningdek Click, Payme, bank kartalari orqali.
- Telegram qo'llab-quvvatlash: @wings_shop_bot

JAVOB BERISH QOIDALARI:
- Foydalanuvchi qaysi tilda yozsa (o'zbekcha, ruscha yoki inglizcha), o'sha tilda ravon, professional, samimiy va uslubli javob ber.
- Mahsulot haqida so'rashsa, aniq narxi va afzalliklarini aytib, mahsulotga bosiladigan havola ber (masalan: [Wings Phantom ANC](/products/wings-phantom-anc-headphones)).
- Javoblaring ixcham, tushunarli va chiroyli formatlangan bo'lsin (bullet pointlar va qalin matnlardan foydalan).
- O'zingni erkin, do'stona va zamonaviy stilist sifatida tut.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], locale = 'uz' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Xabar matni kiritilmadi' },
        { status: 400 }
      );
    }

    // Prepare contents array for Gemini multi-turn chat
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Append previous dialogue turns (up to last 10 messages for efficiency)
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    for (const h of recentHistory) {
      if (h && typeof h.text === 'string' && (h.role === 'user' || h.role === 'model')) {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }],
        });
      }
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Prioritize ultrafast lightweight models for sub-second response times
    const models = [
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];

    const payload = {
      system_instruction: {
        parts: [
          {
            text: `${SYSTEM_INSTRUCTION}\nFoydalanuvchi joriy interfeys tili: ${locale.toUpperCase()}. Agar foydalanuvchi tilni o'zgartirmasa, ${locale === 'ru' ? 'ruscha' : locale === 'en' ? 'inglizcha' : "o'zbekcha"} tilda javob bering.`,
          },
        ],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    };

    let replyText = '';
    let lastError = null;

    for (const model of models) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        // Abort if any model takes over 5 seconds to guarantee lightning-fast replies
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text;
          if (text) {
            replyText = text;
            break; // Fast success!
          }
        } else {
          lastError = await res.text();
          console.warn(`[Gemini Model ${model} Warning]:`, res.status);
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!replyText) {
      console.error('[Gemini API Final Fallback]:', lastError);
      return NextResponse.json({
        reply:
          locale === 'ru'
            ? 'Извините, в данный момент сервер ИИ кратковременно перегружен. Вы можете изучить товары в каталоге или написать нашему боту в Telegram: @wings_shop_bot'
            : locale === 'en'
            ? 'Sorry, our AI stylist is momentarily busy. Please explore our catalogue or contact our Telegram support: @wings_shop_bot'
            : 'Kechirasiz, ayni paytda AI serverida qisqa tanaffus. Mahsulotlarimizni /products katalogida koʻrishingiz yoki Telegram botimizga yozishingiz mumkin: @wings_shop_bot',
      });
    }

    return NextResponse.json({
      reply: replyText,
    });
  } catch (error: any) {
    console.error('[AI Chat Route Error]:', error);
    return NextResponse.json(
      {
        reply:
          'Aloqa xatoligi yuz berdi. Iltimos, bir ozdan soʻng qayta urinib koʻring yoki @wings_shop_bot ga murojaat qiling.',
      },
      { status: 500 }
    );
  }
}
