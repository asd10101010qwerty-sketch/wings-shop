import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let envContent = '';
try {
  envContent = fs.readFileSync('.env.local', 'utf8');
} catch {}

const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const categoryMapping = {
  'audio': '11111111-1111-1111-1111-111111111101',
  'footwear': '11111111-1111-1111-1111-111111111102',
  'timepieces': '11111111-1111-1111-1111-111111111103',
  'streetwear': '11111111-1111-1111-1111-111111111104',
  'carry': '11111111-1111-1111-1111-111111111105',
};

const newProducts = [
  {
    id: '22222222-2222-2222-2222-222222222211',
    name: 'Wings SoundStage Pro Desktop Acoustic Monitors',
    slug: 'wings-soundstage-pro-monitors',
    description: 'High-resolution studio reference bookshelf monitors featuring carbon-woven cones, silk dome tweeters, Bluetooth 5.4 aptX Lossless, and acoustic isolation stands. Engineered for pristine dynamic range and zero-distortion low end.',
    short_description: 'Studio-grade active desktop monitors with Kevlar cones and optical inputs.',
    price: 2650000,
    sale_price: 2390000,
    cost_price: 1400000,
    sku: 'WNG-AUD-03',
    stock_quantity: 16,
    low_stock_threshold: 4,
    category_id: categoryMapping['audio'],
    is_published: true,
    is_featured: true,
    is_new: true,
    rating: 4.9,
    reviews_count: 23,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings SoundStage Pro Acoustic Monitors pair',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222212',
    name: 'Wings Pulse Open-Ear Bone Conduction Headset',
    slug: 'wings-pulse-bone-conduction-headset',
    description: 'Ultra-lightweight titanium wrap-around bone conduction headset with IP68 waterproof rating, 32GB onboard MP3 storage for swimming without a phone, and 10 hours continuous playback.',
    short_description: 'IP68 waterproof open-ear bone conduction headphones with 32GB offline MP3.',
    price: 950000,
    sale_price: 820000,
    cost_price: 480000,
    sku: 'WNG-AUD-04',
    stock_quantity: 28,
    low_stock_threshold: 5,
    category_id: categoryMapping['audio'],
    is_published: true,
    is_featured: false,
    is_new: true,
    rating: 4.8,
    reviews_count: 19,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Pulse Bone Conduction Headset',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222213',
    name: 'Wings SubZero Hi-Res In-Ear Monitors',
    slug: 'wings-subzero-hi-res-iems',
    description: 'Audiophile hybrid dual dynamic and Knowles balanced armature IEM earphones with transparent acoustic resin housing and detachable 8-core silver-plated MMCX braided cable.',
    short_description: 'Hybrid dual-driver Hi-Res audio wired earphones with detachable silver cable.',
    price: 590000,
    sale_price: 490000,
    cost_price: 260000,
    sku: 'WNG-AUD-05',
    stock_quantity: 36,
    low_stock_threshold: 8,
    category_id: categoryMapping['audio'],
    is_published: true,
    is_featured: false,
    is_new: false,
    rating: 4.7,
    reviews_count: 31,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings SubZero Hi-Res IEMs',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222214',
    name: 'Wings Aeroflex High-Top Technical Sneakers',
    slug: 'wings-aeroflex-high-top-sneakers',
    description: 'Engineered sock-knit technical high-tops with internal waterproof membrane, Vibram Megagrip lugged all-weather outsole, and quick-pull speed toggle lacing system.',
    short_description: 'Weatherproof technical high-top runners with Vibram sole and quick lacing.',
    price: 1280000,
    sale_price: 1120000,
    cost_price: 620000,
    sku: 'WNG-SH-03',
    stock_quantity: 24,
    low_stock_threshold: 5,
    category_id: categoryMapping['footwear'],
    is_published: true,
    is_featured: true,
    is_new: true,
    rating: 4.9,
    reviews_count: 45,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Aeroflex High-Top Technical Sneakers',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
    variants: [
      { title: 'EU 41', sku: 'WNG-SH-03-41', price: 1280000, sale_price: 1120000, stock_quantity: 6, options_json: { size: '41' } },
      { title: 'EU 42', sku: 'WNG-SH-03-42', price: 1280000, sale_price: 1120000, stock_quantity: 8, options_json: { size: '42' } },
      { title: 'EU 43', sku: 'WNG-SH-03-43', price: 1280000, sale_price: 1120000, stock_quantity: 6, options_json: { size: '43' } },
      { title: 'EU 44', sku: 'WNG-SH-03-44', price: 1280000, sale_price: 1120000, stock_quantity: 4, options_json: { size: '44' } },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222215',
    name: 'Wings Chelsea Commuter Waterproof Leather Boots',
    slug: 'wings-chelsea-commuter-boots',
    description: 'Waterproof oiled Italian calfskin Chelsea boots with Goodyear-welt construction, storm welt, and shock-absorbing commando lug outsole for winter city comfort.',
    short_description: 'Handcrafted oiled leather Chelsea boots with storm welt and commando sole.',
    price: 1480000,
    sale_price: 1320000,
    cost_price: 780000,
    sku: 'WNG-SH-04',
    stock_quantity: 19,
    low_stock_threshold: 4,
    category_id: categoryMapping['footwear'],
    is_published: true,
    is_featured: false,
    is_new: true,
    rating: 4.8,
    reviews_count: 27,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Chelsea Commuter Leather Boots',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
    variants: [
      { title: 'EU 41', sku: 'WNG-SH-04-41', price: 1480000, sale_price: 1320000, stock_quantity: 5, options_json: { size: '41' } },
      { title: 'EU 42', sku: 'WNG-SH-04-42', price: 1480000, sale_price: 1320000, stock_quantity: 6, options_json: { size: '42' } },
      { title: 'EU 43', sku: 'WNG-SH-04-43', price: 1480000, sale_price: 1320000, stock_quantity: 5, options_json: { size: '43' } },
      { title: 'EU 44', sku: 'WNG-SH-04-44', price: 1480000, sale_price: 1320000, stock_quantity: 3, options_json: { size: '44' } },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222216',
    name: 'Wings Nimbus Cloud Ergonomic Recovery Slides',
    slug: 'wings-nimbus-cloud-recovery-slides',
    description: 'Ultra-thick 4.2cm dual-density EVA foam recovery slides designed to relieve foot and arch pressure after workouts or long days on your feet.',
    short_description: 'Dual-density featherlight cloud recovery slides with deep arch cradle.',
    price: 380000,
    sale_price: 320000,
    cost_price: 140000,
    sku: 'WNG-SH-05',
    stock_quantity: 50,
    low_stock_threshold: 10,
    category_id: categoryMapping['footwear'],
    is_published: true,
    is_featured: false,
    is_new: false,
    rating: 4.7,
    reviews_count: 58,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Nimbus Cloud Recovery Slides',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
    variants: [
      { title: 'EU 40-41', sku: 'WNG-SH-05-40', price: 380000, sale_price: 320000, stock_quantity: 15, options_json: { size: '40-41' } },
      { title: 'EU 42-43', sku: 'WNG-SH-05-42', price: 380000, sale_price: 320000, stock_quantity: 22, options_json: { size: '42-43' } },
      { title: 'EU 44-45', sku: 'WNG-SH-05-44', price: 380000, sale_price: 320000, stock_quantity: 13, options_json: { size: '44-45' } },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222217',
    name: 'Wings DeepSea 300M Professional Automatic Diver',
    slug: 'wings-deepsea-300m-diver-watch',
    description: 'Professional 300m dive watch with scratch-proof ceramic 120-click unidirectional bezel, Swiss Super-LumiNova BGW9 glowing blue markers, and automatic helium release valve.',
    short_description: '300-meter automatic professional diver with ceramic bezel and sapphire crystal.',
    price: 2890000,
    sale_price: 2550000,
    cost_price: 1450000,
    sku: 'WNG-WT-03',
    stock_quantity: 14,
    low_stock_threshold: 3,
    category_id: categoryMapping['timepieces'],
    is_published: true,
    is_featured: true,
    is_new: true,
    rating: 5.0,
    reviews_count: 22,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings DeepSea 300M Professional Diver',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222218',
    name: 'Wings SolarField Military Canvas Watch',
    slug: 'wings-solarfield-military-watch',
    description: 'Tactical solar-powered field watch requiring zero battery replacements. Fully charges in ambient sunlight for 6 months power reserve. Matte 316L stainless steel case with sapphire crystal.',
    short_description: 'Solar-powered tactical field watch with sapphire glass and olive nylon strap.',
    price: 1350000,
    sale_price: 1180000,
    cost_price: 650000,
    sku: 'WNG-WT-04',
    stock_quantity: 21,
    low_stock_threshold: 5,
    category_id: categoryMapping['timepieces'],
    is_published: true,
    is_featured: false,
    is_new: false,
    rating: 4.8,
    reviews_count: 17,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings SolarField Military Watch',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222219',
    name: 'Wings Monolith Skeleton Mechanical Watch',
    slug: 'wings-monolith-skeleton-watch',
    description: 'Architectural open-work skeleton timepiece revealing the balance spring, escapement, and gold-accented mechanical gear train beneath anti-reflective sapphire front and back.',
    short_description: 'Gunmetal skeleton mechanical timepiece with dual sapphire display glass.',
    price: 3200000,
    sale_price: 2890000,
    cost_price: 1700000,
    sku: 'WNG-WT-05',
    stock_quantity: 9,
    low_stock_threshold: 2,
    category_id: categoryMapping['timepieces'],
    is_published: true,
    is_featured: true,
    is_new: true,
    rating: 5.0,
    reviews_count: 29,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Monolith Skeleton Mechanical Watch',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222220',
    name: 'Wings TechWear Modular Cargo Jogger Pants',
    slug: 'wings-techwear-cargo-jogger-pants',
    description: 'Technical water-repellent ripstop joggers featuring 8 articulated utility pockets, magnetic flap closures, reinforced knee gussets, and cinch ankle cords.',
    short_description: 'Water-repellent ripstop cargo pants with 8 pockets and magnetic flaps.',
    price: 780000,
    sale_price: 680000,
    cost_price: 360000,
    sku: 'WNG-AP-03',
    stock_quantity: 32,
    low_stock_threshold: 6,
    category_id: categoryMapping['streetwear'],
    is_published: true,
    is_featured: false,
    is_new: true,
    rating: 4.9,
    reviews_count: 41,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings TechWear Cargo Jogger Pants',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
    variants: [
      { title: 'M', sku: 'WNG-AP-03-M', price: 780000, sale_price: 680000, stock_quantity: 10, options_json: { size: 'M' } },
      { title: 'L', sku: 'WNG-AP-03-L', price: 780000, sale_price: 680000, stock_quantity: 14, options_json: { size: 'L' } },
      { title: 'XL', sku: 'WNG-AP-03-XL', price: 780000, sale_price: 680000, stock_quantity: 8, options_json: { size: 'XL' } },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222221',
    name: 'Wings Heavyweight 280GSM Minimalist Pima Tee',
    slug: 'wings-heavyweight-280gsm-pima-tee',
    description: 'Crafted from long-staple Peruvian Pima cotton with double-needle dense stitching, ribbed non-stretch collar, and clean minimalist boxy fit that retains shape wash after wash.',
    short_description: 'Premium 280 GSM heavyweight Pima cotton relaxed boxy t-shirt.',
    price: 320000,
    sale_price: 270000,
    cost_price: 120000,
    sku: 'WNG-AP-04',
    stock_quantity: 65,
    low_stock_threshold: 12,
    category_id: categoryMapping['streetwear'],
    is_published: true,
    is_featured: false,
    is_new: false,
    rating: 4.8,
    reviews_count: 73,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Heavyweight Minimalist Tee',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
    variants: [
      { title: 'S', sku: 'WNG-AP-04-S', price: 320000, sale_price: 270000, stock_quantity: 12, options_json: { size: 'S' } },
      { title: 'M', sku: 'WNG-AP-04-M', price: 320000, sale_price: 270000, stock_quantity: 24, options_json: { size: 'M' } },
      { title: 'L', sku: 'WNG-AP-04-L', price: 320000, sale_price: 270000, stock_quantity: 20, options_json: { size: 'L' } },
      { title: 'XL', sku: 'WNG-AP-04-XL', price: 320000, sale_price: 270000, stock_quantity: 9, options_json: { size: 'XL' } },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Wings StormFlock Reversible Down Jacket',
    slug: 'wings-stormflock-reversible-down-jacket',
    description: 'Ultra-warm reversible winter jacket: matte windproof ripstop nylon on side A, plush dense thermal sherpa on side B. Filled with 700-fill down insulation for temperatures down to -25°C.',
    short_description: '700-fill power reversible winter down puffer with stormproof nylon and sherpa.',
    price: 1650000,
    sale_price: 1450000,
    cost_price: 850000,
    sku: 'WNG-AP-05',
    stock_quantity: 17,
    low_stock_threshold: 4,
    category_id: categoryMapping['streetwear'],
    is_published: true,
    is_featured: true,
    is_new: true,
    rating: 4.9,
    reviews_count: 34,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings StormFlock Reversible Jacket',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
    variants: [
      { title: 'M', sku: 'WNG-AP-05-M', price: 1650000, sale_price: 1450000, stock_quantity: 5, options_json: { size: 'M' } },
      { title: 'L', sku: 'WNG-AP-05-L', price: 1650000, sale_price: 1450000, stock_quantity: 8, options_json: { size: 'L' } },
      { title: 'XL', sku: 'WNG-AP-05-XL', price: 1650000, sale_price: 1450000, stock_quantity: 4, options_json: { size: 'XL' } },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222223',
    name: 'Wings Heavyweight Brushed Flannel Overshirt',
    slug: 'wings-brushed-flannel-overshirt',
    description: 'Dense 380 GSM brushed twill cotton overshirt with quilted satin lining, metal snap closures, and dual front chest flap pockets for cold transitional seasons.',
    short_description: 'Heavyweight quilted lined flannel jacket with matte metal hardware.',
    price: 850000,
    sale_price: 740000,
    cost_price: 410000,
    sku: 'WNG-AP-06',
    stock_quantity: 25,
    low_stock_threshold: 5,
    category_id: categoryMapping['streetwear'],
    is_published: true,
    is_featured: false,
    is_new: true,
    rating: 4.8,
    reviews_count: 21,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Heavyweight Flannel Overshirt',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
    variants: [
      { title: 'M', sku: 'WNG-AP-06-M', price: 850000, sale_price: 740000, stock_quantity: 8, options_json: { size: 'M' } },
      { title: 'L', sku: 'WNG-AP-06-L', price: 850000, sale_price: 740000, stock_quantity: 11, options_json: { size: 'L' } },
      { title: 'XL', sku: 'WNG-AP-06-XL', price: 850000, sale_price: 740000, stock_quantity: 6, options_json: { size: 'XL' } },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222224',
    name: 'Wings Commuter 24L Ballistic Tech Backpack',
    slug: 'wings-commuter-24l-tech-backpack',
    description: 'All-weather commuter pack made of 1050D ballistic nylon with 180-degree clamshell opening, false-bottom 16-inch laptop chamber, magnetic sternum strap, and luggage handle pass-through.',
    short_description: 'Waterproof 1050D ballistic nylon 24L tech pack with 16-inch laptop cradle.',
    price: 1150000,
    sale_price: 980000,
    cost_price: 540000,
    sku: 'WNG-ACC-03',
    stock_quantity: 22,
    low_stock_threshold: 5,
    category_id: categoryMapping['carry'],
    is_published: true,
    is_featured: true,
    is_new: true,
    rating: 4.9,
    reviews_count: 51,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Commuter 24L Ballistic Tech Backpack',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222225',
    name: 'Wings Titanium Carabiner Key Organizer & Tool',
    slug: 'wings-titanium-carabiner-key-tool',
    description: 'Precision CNC-machined from a single billet of Grade-5 aerospace titanium. Integrates bottle opener, pry bar, hex bit driver, and secure anti-loss key gate.',
    short_description: 'Grade-5 titanium multi-tool carabiner with integrated pry bar and key keeper.',
    price: 260000,
    sale_price: 220000,
    cost_price: 95000,
    sku: 'WNG-ACC-04',
    stock_quantity: 48,
    low_stock_threshold: 10,
    category_id: categoryMapping['carry'],
    is_published: true,
    is_featured: false,
    is_new: false,
    rating: 4.8,
    reviews_count: 38,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1614165936123-aefea0d21432?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Titanium Carabiner Key Tool',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222226',
    name: 'Wings Full-Grain Leather Desk Mat & Organizer',
    slug: 'wings-leather-desk-mat-organizer',
    description: 'Crafted from 2.2mm thick vegetable-tanned full-grain leather with non-slip natural wool felt backing and magnetic cable organization strip for executive setups.',
    short_description: 'Vegetable-tanned full-grain leather desk pad with magnetic cable guide.',
    price: 450000,
    sale_price: 390000,
    cost_price: 190000,
    sku: 'WNG-ACC-05',
    stock_quantity: 30,
    low_stock_threshold: 6,
    category_id: categoryMapping['carry'],
    is_published: true,
    is_featured: false,
    is_new: true,
    rating: 4.9,
    reviews_count: 26,
    images: [
      {
        image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1000&auto=format&fit=crop',
        alt_text: 'Wings Full-Grain Leather Desk Mat',
        is_thumbnail: true,
        sort_order: 0,
      },
    ],
  },
];

async function seed() {
  console.log('Seeding 16 additional products into Supabase...');

  for (const prod of newProducts) {
    const { images, variants, ...prodData } = prod;

    // Upsert product
    const { data: savedProd, error: prodErr } = await supabase
      .from('products')
      .upsert(prodData, { onConflict: 'slug' })
      .select()
      .single();

    if (prodErr) {
      console.error(`Error inserting ${prod.name}:`, prodErr.message);
      continue;
    }

    const prodId = savedProd.id;
    console.log(`✓ Inserted product: ${prod.name} (${prodId})`);

    // Insert images
    if (images && images.length > 0) {
      await supabase.from('product_images').delete().eq('product_id', prodId);
      const imgPayload = images.map((img, idx) => ({
        product_id: prodId,
        image_url: img.image_url,
        alt_text: img.alt_text,
        is_thumbnail: img.is_thumbnail ?? idx === 0,
        sort_order: img.sort_order ?? idx,
      }));
      const { error: imgErr } = await supabase.from('product_images').insert(imgPayload);
      if (imgErr) console.error(`  Error inserting images for ${prod.name}:`, imgErr.message);
      else console.log(`  ✓ Inserted ${images.length} images`);
    }

    // Insert variants
    if (variants && variants.length > 0) {
      await supabase.from('product_variants').delete().eq('product_id', prodId);
      const varPayload = variants.map((v) => ({
        product_id: prodId,
        title: v.title,
        sku: v.sku,
        price: v.price,
        sale_price: v.sale_price,
        stock_quantity: v.stock_quantity,
        options_json: v.options_json,
      }));
      const { error: varErr } = await supabase.from('product_variants').insert(varPayload);
      if (varErr) console.error(`  Error inserting variants for ${prod.name}:`, varErr.message);
      else console.log(`  ✓ Inserted ${variants.length} variants`);
    }
  }

  console.log('Finished seeding products!');
}

seed().catch(console.error);
