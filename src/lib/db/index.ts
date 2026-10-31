import { Category, Product, Order, Coupon, Review, StoreSettings, OrderStatus, PaymentStatus } from '@/types';
import { initialCategories, initialProducts, initialCoupons, initialStoreSettings, initialReviews, initialOrders } from './mock-data';
import { supabaseAdmin } from '../supabase/admin';

function mapDbProductToProduct(row: any): Product {
  const images = (row.product_images || []).map((img: any) => ({
    id: img.id,
    product_id: img.product_id,
    image_url: img.image_url,
    alt_text: img.alt_text || row.name,
    sort_order: img.sort_order ?? 0,
    is_thumbnail: img.is_thumbnail ?? false,
  }));

  if (images.length === 0) {
    images.push({
      id: `img-${row.id}`,
      product_id: row.id,
      image_url: '/images/products/phantom-anc-headphones.jpg',
      alt_text: row.name,
      sort_order: 0,
      is_thumbnail: true,
    });
  }

  const variants = (row.product_variants || []).map((v: any) => ({
    id: v.id,
    product_id: v.product_id,
    title: v.title,
    sku: v.sku,
    price: Number(v.price),
    sale_price: v.sale_price ? Number(v.sale_price) : null,
    stock_quantity: v.stock_quantity ?? 0,
    options: v.options_json || {},
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || null,
    short_description: row.short_description || null,
    price: Number(row.price),
    sale_price: row.sale_price ? Number(row.sale_price) : null,
    cost_price: row.cost_price ? Number(row.cost_price) : 0,
    sku: row.sku || null,
    barcode: row.barcode || null,
    stock_quantity: row.stock_quantity ?? 0,
    low_stock_threshold: row.low_stock_threshold ?? 5,
    category_id: row.category_id || null,
    category: row.category || null,
    is_published: row.is_published ?? true,
    is_featured: row.is_featured ?? false,
    is_new: row.is_new ?? false,
    rating: Number(row.rating ?? 5.0),
    reviews_count: row.reviews_count ?? 0,
    attributes_json: row.attributes_json || {},
    images,
    variants,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

// Supabase-backed persistent storage container with fallback
class WingsDataStore {
  private categories: Category[] = [...initialCategories];
  private products: Product[] = [...initialProducts];
  private coupons: Coupon[] = [...initialCoupons];
  private orders: Order[] = [...initialOrders];
  private reviews: Review[] = [...initialReviews];
  private settings: StoreSettings = { ...initialStoreSettings };

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        this.categories = data;
        return data;
      }
    } catch (e) {
      console.warn('[Supabase getCategories fallback]:', e);
    }
    return this.categories.filter((c) => c.is_active);
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        this.categories = data;
        return data;
      }
    } catch (e) {
      console.warn('[Supabase getAllCategories fallback]:', e);
    }
    return [...this.categories];
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) return data;
    } catch (e) {
      console.warn('[Supabase getCategoryBySlug fallback]:', e);
    }
    return this.categories.find((c) => c.slug === slug) || null;
  }

  async saveCategory(cat: Partial<Category>): Promise<Category> {
    const isNew = !cat.id || cat.id.startsWith('cat-');
    const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-') || `cat-${Date.now()}`;

    try {
      if (isNew) {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .insert([{
            name: cat.name || 'New Category',
            slug,
            description: cat.description || null,
            image_url: cat.image_url || null,
            icon: cat.icon || null,
            sort_order: cat.sort_order ?? this.categories.length + 1,
            is_active: cat.is_active ?? true,
          }])
          .select()
          .single();

        if (!error && data) {
          this.categories.push(data);
          return data;
        }
      } else {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .update({
            name: cat.name,
            slug,
            description: cat.description,
            image_url: cat.image_url,
            icon: cat.icon,
            sort_order: cat.sort_order,
            is_active: cat.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cat.id)
          .select()
          .single();

        if (!error && data) {
          const idx = this.categories.findIndex((c) => c.id === cat.id);
          if (idx !== -1) this.categories[idx] = data;
          return data;
        }
      }
    } catch (e) {
      console.warn('[Supabase saveCategory fallback]:', e);
    }

    // Local fallback
    if (cat.id) {
      const idx = this.categories.findIndex((c) => c.id === cat.id);
      if (idx !== -1) {
        this.categories[idx] = { ...this.categories[idx], ...cat } as Category;
        return this.categories[idx];
      }
    }
    const newCategory: Category = {
      id: cat.id || `cat-${Date.now()}`,
      name: cat.name || 'New Category',
      slug,
      description: cat.description || null,
      image_url: cat.image_url || null,
      icon: cat.icon || null,
      sort_order: cat.sort_order ?? this.categories.length + 1,
      is_active: cat.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await supabaseAdmin.from('categories').delete().eq('id', id);
    } catch {}
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.categories.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ==========================================
  // PRODUCTS (STORED IN SUPABASE)
  // ==========================================
  async getProducts(params?: {
    category?: string;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    inStockOnly?: boolean;
    limit?: number;
    offset?: number;
    featured?: boolean;
    isNew?: boolean;
  }): Promise<{ products: Product[]; total: number }> {
    try {
      let query = supabaseAdmin
        .from('products')
        .select('*, product_images(*), product_variants(*), category:categories(*)', { count: 'exact' });

      // Category filter
      let resolvedCatId: string | null = null;
      if (params?.category) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.category);
        const { data: cat, error: catErr } = isUuid
          ? await supabaseAdmin.from('categories').select('id').eq('id', params.category).maybeSingle()
          : await supabaseAdmin.from('categories').select('id').eq('slug', params.category).maybeSingle();

        if (cat) {
          resolvedCatId = cat.id;
          query = query.eq('category_id', cat.id);
        }
      }

      if (params?.featured) query = query.eq('is_featured', true);
      if (params?.isNew) query = query.eq('is_new', true);
      if (params?.inStockOnly) query = query.gt('stock_quantity', 0);
      if (params?.minPrice !== undefined) query = query.gte('price', params.minPrice);
      if (params?.maxPrice !== undefined) query = query.lte('price', params.maxPrice);
      if (params?.query) {
        const qClean = params.query.trim().toLowerCase();
        const orClauses: string[] = [
          `name.ilike.%${qClean}%`,
          `short_description.ilike.%${qClean}%`,
          `sku.ilike.%${qClean}%`,
        ];

        const dbSynonyms: Record<string, string[]> = {
          soat: ['watch', 'chronograph', 'timepiece'],
          chas: ['watch', 'chronograph', 'timepiece'],
          chasy: ['watch', 'chronograph', 'timepiece'],
          naushnik: ['headphone', 'earbud', 'anc', 'audio'],
          quloqchin: ['headphone', 'earbud', 'anc', 'audio'],
          krossovka: ['runner', 'sneaker', 'low-top', 'shoe'],
          poyabzal: ['runner', 'sneaker', 'low-top', 'shoe', 'slide'],
          oyoq: ['runner', 'sneaker', 'low-top', 'shoe', 'slide'],
          kiyim: ['parka', 'hoodie', 'jacket', 'pant', 'tee'],
          hudi: ['hoodie'],
          kurtka: ['parka', 'jacket', 'overshirt'],
          sumka: ['sling', 'backpack', 'cardholder', 'bag'],
          ryukzak: ['backpack', 'bag'],
          hamyon: ['cardholder', 'wallet'],
          titan: ['titanium'],
          karbon: ['carbon'],
          simsiz: ['wireless', 'spatial', 'anc'],
        };

        for (const [key, terms] of Object.entries(dbSynonyms)) {
          if (qClean.includes(key)) {
            terms.forEach((t) => {
              orClauses.push(`name.ilike.%${t}%`, `short_description.ilike.%${t}%`);
            });
          }
        }

        query = query.or(orClauses.join(','));
      }

      if (params?.sort === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (params?.sort === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else if (params?.sort === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const limit = params?.limit || 50;
      const offset = params?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (error) {
        console.warn('[Supabase query error]:', error);
      }
      if (!error && data && data.length > 0) {
        const mapped = data.map(mapDbProductToProduct);
        return { products: mapped, total: count || mapped.length };
      }
    } catch (e) {
      console.warn('[Supabase getProducts fallback]:', e);
    }

    // Fallback in-memory
    let result = [...this.products].filter((p) => p.is_published);

    if (params?.category) {
      const cat = this.categories.find((c) => c.slug === params.category || c.id === params.category);
      if (cat) result = result.filter((p) => p.category_id === cat.id);
    }
    if (params?.featured) result = result.filter((p) => p.is_featured);
    if (params?.isNew) result = result.filter((p) => p.is_new);
    if (params?.inStockOnly) result = result.filter((p) => p.stock_quantity > 0);
    if (params?.minPrice !== undefined) result = result.filter((p) => (p.sale_price ?? p.price) >= params.minPrice!);
    if (params?.maxPrice !== undefined) result = result.filter((p) => (p.sale_price ?? p.price) <= params.maxPrice!);
    if (params?.query) {
      const q = params.query.toLowerCase().trim();
      const tokens = q.split(/\s+/).filter(Boolean);

      const categorySynonyms: Record<string, string[]> = {
        'cat-audio': ['audio', 'naushnik', 'quloqchin', 'ovoz', 'akustika', 'наушники', 'звук', 'bluetooth', 'buds', 'earbuds', 'monitors'],
        'cat-footwear': ['footwear', 'krossovka', 'poyabzal', 'tufli', 'oyoq kiyim', 'krasovka', 'sneakers', 'кроссовки', 'обувь', 'runner', 'boots', 'etik', 'slides'],
        'cat-timepieces': ['timepieces', 'soat', 'xronograf', 'chas', 'chasy', 'mexanik', 'часы', 'хронограф', 'watch', 'titan', 'titanium', 'diver'],
        'cat-streetwear': ['streetwear', 'kiyim', 'hudi', 'hoodie', 'futbolka', 'kurtka', 'parka', 'shim', 'одежда', 'худи', 'куртка', 'tee', 'jogger', 'cargo'],
        'cat-carry': ['carry', 'sumka', 'ryukzak', 'hamyon', 'koshelyok', 'sling', 'рюкзак', 'сумка', 'кошелек', 'edc', 'backpack', 'cardholder', 'wallet', 'mat'],
      };

      const wordSynonyms: Record<string, string[]> = {
        'titan': ['titanium', 'титан'],
        'titanium': ['titan', 'титан'],
        'karbon': ['carbon', 'карбон'],
        'carbon': ['karbon', 'карбон'],
        'simsiz': ['wireless', 'bluetooth', 'беспроводной'],
        'wireless': ['simsiz', 'bluetooth', 'беспроводной'],
        'qora': ['black', 'obsidian', 'черный'],
        'oq': ['white', 'белый'],
        'suv': ['waterproof', 'hydrophobic', 'aqua'],
      };

      result = result.filter((p) => {
        const cat = this.categories.find((c) => c.id === p.category_id);
        const catName = cat?.name.toLowerCase() || '';
        const catSlug = cat?.slug.toLowerCase() || '';
        const name = p.name.toLowerCase();
        const shortDesc = p.short_description?.toLowerCase() || '';
        const desc = p.description?.toLowerCase() || '';
        const sku = (p.sku || '').toLowerCase();
        const variantsStr = (p.variants || []).map((v) => `${v.title} ${v.sku}`).join(' ').toLowerCase();

        const corpus = `${name} ${sku} ${shortDesc} ${desc} ${catName} ${catSlug} ${variantsStr}`;

        return tokens.every((token) => {
          if (corpus.includes(token)) return true;

          const catSyns = p.category_id ? (categorySynonyms[p.category_id] || []) : [];
          if (catSyns.some((syn: string) => syn.includes(token) || token.includes(syn))) {
            return true;
          }

          for (const [key, synList] of Object.entries(wordSynonyms)) {
            if (token === key || synList.includes(token)) {
              if (corpus.includes(key) || synList.some((s) => corpus.includes(s))) {
                return true;
              }
            }
          }

          return false;
        });
      });
    }

    const total = result.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || total;
    return { products: result.slice(offset, offset + limit), total };
  }

  async getAllProductsAdmin(): Promise<Product[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*, product_images(*), product_variants(*), category:categories(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbProductToProduct);
      }
    } catch (e) {
      console.warn('[Supabase getAllProductsAdmin fallback]:', e);
    }
    return [...this.products];
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*, product_images(*), product_variants(*), category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return mapDbProductToProduct(data);
      }
    } catch (e) {
      console.warn('[Supabase getProductBySlug fallback]:', e);
    }
    const product = this.products.find((p) => p.slug === slug);
    if (!product) return null;
    return {
      ...product,
      category: this.categories.find((c) => c.id === product.category_id),
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*, product_images(*), product_variants(*), category:categories(*)')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return mapDbProductToProduct(data);
      }
    } catch (e) {
      console.warn('[Supabase getProductById fallback]:', e);
    }
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;
    return {
      ...product,
      category: this.categories.find((c) => c.id === product.category_id),
    };
  }

  async saveProduct(pData: Partial<Product>): Promise<Product> {
    const isNew = !pData.id || pData.id.startsWith('prod-');
    const slug = pData.slug || pData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `wings-${Date.now()}`;

    try {
      let resolvedCategoryId: string | null = null;
      if (pData.category_id !== undefined) {
        if (pData.category_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pData.category_id)) {
          resolvedCategoryId = pData.category_id;
        } else if (pData.category_id) {
          const { data: cat } = await supabaseAdmin
            .from('categories')
            .select('id')
            .or(`slug.eq.${pData.category_id},id.eq.${pData.category_id}`)
            .maybeSingle();
          if (cat) resolvedCategoryId = cat.id;
        }
      }

      let savedProductRow: any = null;

      if (!isNew && pData.id) {
        // Partial update payload - only update fields that were actually provided
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (pData.name !== undefined) updatePayload.name = pData.name;
        if (pData.slug !== undefined) updatePayload.slug = pData.slug;
        if (pData.description !== undefined) updatePayload.description = pData.description;
        if (pData.short_description !== undefined) updatePayload.short_description = pData.short_description;
        if (pData.price !== undefined) updatePayload.price = pData.price;
        if (pData.sale_price !== undefined) updatePayload.sale_price = pData.sale_price;
        if (pData.cost_price !== undefined) updatePayload.cost_price = pData.cost_price;
        if (pData.sku !== undefined) updatePayload.sku = pData.sku;
        if (pData.barcode !== undefined) updatePayload.barcode = pData.barcode;
        if (pData.stock_quantity !== undefined) updatePayload.stock_quantity = pData.stock_quantity;
        if (pData.low_stock_threshold !== undefined) updatePayload.low_stock_threshold = pData.low_stock_threshold;
        if (pData.category_id !== undefined) updatePayload.category_id = resolvedCategoryId;
        if (pData.is_published !== undefined) updatePayload.is_published = pData.is_published;
        if (pData.is_featured !== undefined) updatePayload.is_featured = pData.is_featured;
        if (pData.is_new !== undefined) updatePayload.is_new = pData.is_new;
        if (pData.attributes_json !== undefined) updatePayload.attributes_json = pData.attributes_json;

        const { data, error } = await supabaseAdmin
          .from('products')
          .update(updatePayload)
          .eq('id', pData.id)
          .select('*, product_images(*), product_variants(*), category:categories(*)')
          .single();

        if (!error && data) savedProductRow = data;
      } else {
        // Insert new product
        const slug = pData.slug || pData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `wings-${Date.now()}`;
        if (!resolvedCategoryId) {
          const { data: defaultCat } = await supabaseAdmin.from('categories').select('id').limit(1).maybeSingle();
          if (defaultCat) resolvedCategoryId = defaultCat.id;
        }

        const insertPayload: Record<string, any> = {
          name: pData.name || 'New Wings Product',
          slug,
          description: pData.description || null,
          short_description: pData.short_description || null,
          price: pData.price ?? 500000,
          sale_price: pData.sale_price ?? null,
          cost_price: pData.cost_price ?? 250000,
          sku: pData.sku || `WNG-${Math.floor(1000 + Math.random() * 9000)}`,
          stock_quantity: pData.stock_quantity ?? 10,
          low_stock_threshold: pData.low_stock_threshold ?? 5,
          category_id: resolvedCategoryId,
          is_published: pData.is_published ?? true,
          is_featured: pData.is_featured ?? false,
          is_new: pData.is_new ?? false,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabaseAdmin
          .from('products')
          .insert([insertPayload])
          .select('*, product_images(*), product_variants(*), category:categories(*)')
          .single();

        if (!error && data) savedProductRow = data;
      }

      if (savedProductRow) {
        const productId = savedProductRow.id;

        // Upsert product images in Supabase if provided
        if (pData.images && pData.images.length > 0) {
          await supabaseAdmin.from('product_images').delete().eq('product_id', productId);
          const imageRows = pData.images.map((img, idx) => ({
            product_id: productId,
            image_url: img.image_url,
            alt_text: img.alt_text || pData.name || savedProductRow.name,
            sort_order: idx,
            is_thumbnail: idx === 0,
          }));
          await supabaseAdmin.from('product_images').insert(imageRows);
        }

        const fresh = await this.getProductById(productId);
        if (fresh) {
          // Update local cache
          const idx = this.products.findIndex((p) => p.id === productId);
          if (idx !== -1) this.products[idx] = fresh;
          else this.products.unshift(fresh);
          return fresh;
        }
      }
    } catch (e) {
      console.warn('[Supabase saveProduct error]:', e);
    }

    // Local fallback
    if (pData.id) {
      const idx = this.products.findIndex((p) => p.id === pData.id);
      if (idx !== -1) {
        this.products[idx] = {
          ...this.products[idx],
          ...pData,
          category: this.categories.find((c) => c.id === (pData.category_id || this.products[idx].category_id)),
          updated_at: new Date().toISOString(),
        } as Product;
        return this.products[idx];
      }
    }

    const newProd: Product = {
      id: pData.id || `prod-${Date.now()}`,
      name: pData.name || 'New Wings Product',
      slug,
      description: pData.description || null,
      short_description: pData.short_description || null,
      price: pData.price ?? 500000,
      sale_price: pData.sale_price ?? null,
      cost_price: pData.cost_price ?? 250000,
      sku: pData.sku || `WNG-${Date.now().toString().slice(-4)}`,
      stock_quantity: pData.stock_quantity ?? 10,
      low_stock_threshold: pData.low_stock_threshold ?? 5,
      category_id: pData.category_id || this.categories[0]?.id || null,
      category: this.categories.find((c) => c.id === pData.category_id),
      is_published: pData.is_published ?? true,
      is_featured: pData.is_featured ?? false,
      is_new: pData.is_new ?? true,
      rating: 5.0,
      reviews_count: 0,
      images: pData.images && pData.images.length > 0 ? pData.images : [
        {
          id: `img-${Date.now()}`,
          product_id: pData.id || `prod-${Date.now()}`,
          image_url: '/images/products/phantom-anc-headphones.jpg',
          alt_text: pData.name || 'Product',
          sort_order: 0,
          is_thumbnail: true,
        },
      ],
      variants: pData.variants || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.products.unshift(newProd);
    return newProd;
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await supabaseAdmin.from('products').delete().eq('id', id);
    } catch (e) {
      console.warn('[Supabase deleteProduct error]:', e);
    }
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.products.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ==========================================
  // ORDERS (STORED IN SUPABASE)
  // ==========================================
  async getOrders(params?: { status?: string; search?: string; limit?: number; offset?: number }): Promise<{ orders: Order[]; total: number }> {
    try {
      let query = supabaseAdmin
        .from('orders')
        .select('*, items:order_items(*)', { count: 'exact' });

      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      if (params?.search) {
        query = query.or(`order_number.ilike.%${params.search}%,customer_notes.ilike.%${params.search}%`);
      }

      query = query.order('created_at', { ascending: false });

      const limit = params?.limit || 50;
      const offset = params?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (!error && data && data.length > 0) {
        const mappedOrders: Order[] = data.map((o: any) => ({
          id: o.id,
          order_number: o.order_number,
          user_id: o.user_id,
          status: o.status,
          payment_status: o.payment_status,
          payment_method: o.payment_method,
          delivery_method: o.delivery_method,
          subtotal: Number(o.subtotal),
          discount_amount: Number(o.discount_amount),
          shipping_fee: Number(o.shipping_fee),
          total_amount: Number(o.total_amount),
          coupon_code: o.coupon_code,
          delivery_address: o.delivery_address_json || {},
          customer_notes: o.customer_notes,
          admin_notes: o.admin_notes,
          tracking_number: o.tracking_number,
          items: (o.items || []).map((it: any) => ({
            id: it.id,
            order_id: it.order_id,
            product_id: it.product_id,
            variant_id: it.variant_id,
            product_name: it.product_name,
            variant_title: it.variant_title,
            sku: it.sku,
            unit_price: Number(it.unit_price),
            quantity: it.quantity,
            total_price: Number(it.total_price),
            image_url: it.image_url,
          })),
          created_at: o.created_at,
          updated_at: o.updated_at,
        }));
        return { orders: mappedOrders, total: count || mappedOrders.length };
      }
    } catch (e) {
      console.warn('[Supabase getOrders fallback]:', e);
    }

    let result = [...this.orders];
    if (params?.status && params.status !== 'all') result = result.filter((o) => o.status === params.status);
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter((o) => o.order_number.toLowerCase().includes(q) || o.delivery_address.recipient_name.toLowerCase().includes(q));
    }
    const total = result.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || total;
    return { orders: result.slice(offset, offset + limit), total };
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          order_number: data.order_number,
          user_id: data.user_id,
          status: data.status,
          payment_status: data.payment_status,
          payment_method: data.payment_method,
          delivery_method: data.delivery_method,
          subtotal: Number(data.subtotal),
          discount_amount: Number(data.discount_amount),
          shipping_fee: Number(data.shipping_fee),
          total_amount: Number(data.total_amount),
          coupon_code: data.coupon_code,
          delivery_address: data.delivery_address_json || {},
          customer_notes: data.customer_notes,
          admin_notes: data.admin_notes,
          tracking_number: data.tracking_number,
          items: (data.items || []).map((it: any) => ({
            id: it.id,
            order_id: it.order_id,
            product_id: it.product_id,
            variant_id: it.variant_id,
            product_name: it.product_name,
            variant_title: it.variant_title,
            sku: it.sku,
            unit_price: Number(it.unit_price),
            quantity: it.quantity,
            total_price: Number(it.total_price),
            image_url: it.image_url,
          })),
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch {}
    return this.orders.find((o) => o.id === id) || null;
  }

  async createOrder(data: {
    user_id?: string | null;
    items: { product_id: string; variant_id?: string; quantity: number }[];
    coupon_code?: string;
    delivery_address: Order['delivery_address'];
    delivery_method: Order['delivery_method'];
    payment_method: Order['payment_method'];
    customer_notes?: string;
  }): Promise<Order> {
    let subtotal = 0;
    const orderItems: Order['items'] = [];

    for (const item of data.items) {
      // Find product either in Supabase or fallback
      let product = await this.getProductById(item.product_id);
      if (!product) {
        product = this.products.find((p) => p.id === item.product_id) || null;
      }
      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`);
      }

      const unitPrice = product.sale_price ?? product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      let variantTitle: string | null = null;
      if (item.variant_id && product.variants) {
        const variant = product.variants.find((v) => v.id === item.variant_id);
        if (variant) variantTitle = variant.title;
      }

      const primaryImg = product.images[0]?.image_url || null;

      orderItems.push({
        id: `ord-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order_id: '',
        product_id: product.id,
        variant_id: item.variant_id || null,
        product_name: product.name,
        variant_title: variantTitle,
        sku: product.sku,
        unit_price: unitPrice,
        quantity: item.quantity,
        total_price: totalPrice,
        image_url: primaryImg,
      });

      // Deduct stock in Supabase and cache
      const newStock = Math.max(0, product.stock_quantity - item.quantity);
      if (product.id && product.id.length === 36) {
        try {
          await supabaseAdmin.from('products').update({ stock_quantity: newStock }).eq('id', product.id);
        } catch {}
      }
      const cachedProd = this.products.find((p) => p.id === product.id);
      if (cachedProd) {
        cachedProd.stock_quantity = newStock;
      }
    }

    // Coupon calculation
    let discountAmount = 0;
    let validCouponCode: string | null = null;
    if (data.coupon_code) {
      const couponRes = await this.validateCoupon(data.coupon_code, subtotal);
      if (couponRes.valid && couponRes.coupon) {
        discountAmount = couponRes.discountAmount;
        validCouponCode = couponRes.coupon.code;
        try {
          await supabaseAdmin.from('coupons').update({ times_used: (couponRes.coupon.times_used || 0) + 1 }).eq('code', validCouponCode);
        } catch {}
      }
    }

    // Shipping calculation
    const settings = await this.getStoreSettings();
    let shippingFee = 0;
    if (data.delivery_method === 'standard') {
      shippingFee = subtotal >= settings.free_shipping_threshold ? 0 : settings.standard_shipping_fee;
    } else if (data.delivery_method === 'express') {
      shippingFee = settings.express_shipping_fee;
    } else {
      shippingFee = 0;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `WNG-2026-${randomSuffix}`;

    // Insert into Supabase
    try {
      const { data: dbOrder, error: oErr } = await supabaseAdmin
        .from('orders')
        .insert([{
          order_number: orderNumber,
          user_id: data.user_id && data.user_id.length === 36 ? data.user_id : null,
          status: 'pending',
          payment_status: data.payment_method === 'cod' ? 'unpaid' : 'paid',
          payment_method: data.payment_method,
          delivery_method: data.delivery_method,
          subtotal,
          discount_amount: discountAmount,
          shipping_fee: shippingFee,
          total_amount: totalAmount,
          coupon_code: validCouponCode,
          delivery_address_json: data.delivery_address,
          customer_notes: data.customer_notes || null,
        }])
        .select()
        .single();

      if (!oErr && dbOrder) {
        const itemRows = orderItems.map((it) => ({
          order_id: dbOrder.id,
          product_id: it.product_id && it.product_id.length === 36 ? it.product_id : null,
          variant_id: it.variant_id && it.variant_id.length === 36 ? it.variant_id : null,
          product_name: it.product_name,
          variant_title: it.variant_title,
          sku: it.sku,
          unit_price: it.unit_price,
          quantity: it.quantity,
          total_price: it.total_price,
          image_url: it.image_url,
        }));
        await supabaseAdmin.from('order_items').insert(itemRows);

        const createdOrder: Order = {
          id: dbOrder.id,
          order_number: dbOrder.order_number,
          user_id: dbOrder.user_id,
          status: dbOrder.status,
          payment_status: dbOrder.payment_status,
          payment_method: dbOrder.payment_method,
          delivery_method: dbOrder.delivery_method,
          subtotal: Number(dbOrder.subtotal),
          discount_amount: Number(dbOrder.discount_amount),
          shipping_fee: Number(dbOrder.shipping_fee),
          total_amount: Number(dbOrder.total_amount),
          coupon_code: dbOrder.coupon_code,
          delivery_address: data.delivery_address,
          customer_notes: dbOrder.customer_notes,
          admin_notes: null,
          tracking_number: null,
          items: orderItems.map((it) => ({ ...it, order_id: dbOrder.id })),
          created_at: dbOrder.created_at,
          updated_at: dbOrder.updated_at,
        };
        this.orders.unshift(createdOrder);
        return createdOrder;
      }
    } catch (e) {
      console.warn('[Supabase createOrder fallback]:', e);
    }

    // Local fallback order
    const orderId = `ord-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: data.user_id || null,
      status: 'pending',
      payment_status: data.payment_method === 'cod' ? 'unpaid' : 'paid',
      payment_method: data.payment_method,
      delivery_method: data.delivery_method,
      subtotal,
      discount_amount: discountAmount,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      coupon_code: validCouponCode,
      delivery_address: data.delivery_address,
      customer_notes: data.customer_notes || null,
      admin_notes: null,
      tracking_number: null,
      items: orderItems.map((it) => ({ ...it, order_id: orderId })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, adminNotes?: string): Promise<Order | null> {
    try {
      const updateData: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
      if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

      await supabaseAdmin.from('orders').update(updateData).eq('id', id);
    } catch {}

    const order = this.orders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      if (trackingNumber !== undefined) order.tracking_number = trackingNumber;
      if (adminNotes !== undefined) order.admin_notes = adminNotes;
      order.updated_at = new Date().toISOString();
      return order;
    }
    return this.getOrderById(id);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order | null> {
    try {
      await supabaseAdmin.from('orders').update({ payment_status: paymentStatus, updated_at: new Date().toISOString() }).eq('id', id);
    } catch {}

    const order = this.orders.find((o) => o.id === id);
    if (order) {
      order.payment_status = paymentStatus;
      order.updated_at = new Date().toISOString();
      return order;
    }
    return this.getOrderById(id);
  }

  // ==========================================
  // COUPONS (STORED IN SUPABASE)
  // ==========================================
  async getCoupons(): Promise<Coupon[]> {
    try {
      const { data, error } = await supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          code: c.code,
          description: c.description,
          discount_type: c.discount_type,
          discount_value: Number(c.discount_value),
          min_order_value: Number(c.min_order_value || 0),
          max_discount: c.max_discount ? Number(c.max_discount) : null,
          usage_limit: c.usage_limit,
          times_used: c.times_used || 0,
          is_active: c.is_active,
        }));
      }
    } catch {}
    return [...this.coupons];
  }

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discountAmount: number; message?: string; coupon?: Coupon }> {
    const cleanCode = code.trim().toUpperCase();

    try {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (!error && data) {
        const coupon: Coupon = {
          id: data.id,
          code: data.code,
          description: data.description,
          discount_type: data.discount_type,
          discount_value: Number(data.discount_value),
          min_order_value: Number(data.min_order_value || 0),
          max_discount: data.max_discount ? Number(data.max_discount) : null,
          usage_limit: data.usage_limit,
          times_used: data.times_used || 0,
          is_active: data.is_active,
        };

        if (!coupon.is_active) {
          return { valid: false, discountAmount: 0, message: 'Ushbu kupon faol emas / Coupon is inactive' };
        }
        if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
          return { valid: false, discountAmount: 0, message: 'Kupon limiti tugagan / Coupon limit reached' };
        }
        if (subtotal < coupon.min_order_value) {
          return {
            valid: false,
            discountAmount: 0,
            message: `Minimal buyurtma miqdori: ${new Intl.NumberFormat('ru-RU').format(coupon.min_order_value)} soʻm`,
          };
        }

        let discount = 0;
        if (coupon.discount_type === 'percentage') {
          discount = Math.round((subtotal * coupon.discount_value) / 100);
          if (coupon.max_discount && discount > coupon.max_discount) discount = coupon.max_discount;
        } else {
          discount = coupon.discount_value;
        }

        return { valid: true, discountAmount: discount, coupon };
      }
    } catch {}

    const localCoupon = this.coupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!localCoupon) {
      return { valid: false, discountAmount: 0, message: 'Kupon topilmadi / Promo code not found' };
    }
    if (!localCoupon.is_active) {
      return { valid: false, discountAmount: 0, message: 'Ushbu kupon faol emas' };
    }
    if (subtotal < localCoupon.min_order_value) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimal buyurtma miqdori: ${new Intl.NumberFormat('ru-RU').format(localCoupon.min_order_value)} soʻm`,
      };
    }
    let discount = 0;
    if (localCoupon.discount_type === 'percentage') {
      discount = Math.round((subtotal * localCoupon.discount_value) / 100);
      if (localCoupon.max_discount && discount > localCoupon.max_discount) discount = localCoupon.max_discount;
    } else {
      discount = localCoupon.discount_value;
    }
    return { valid: true, discountAmount: discount, coupon: localCoupon };
  }

  async saveCoupon(cData: Partial<Coupon>): Promise<Coupon> {
    const code = (cData.code || `WNG${Math.floor(10 + Math.random() * 90)}`).toUpperCase();

    try {
      const row = {
        code,
        description: cData.description || 'Special Promotion',
        discount_type: cData.discount_type || 'percentage',
        discount_value: cData.discount_value ?? 10,
        min_order_value: cData.min_order_value ?? 200000,
        max_discount: cData.max_discount ?? null,
        usage_limit: cData.usage_limit ?? 100,
        is_active: cData.is_active ?? true,
      };

      if (cData.id && cData.id.length === 36) {
        const { data, error } = await supabaseAdmin
          .from('coupons')
          .update(row)
          .eq('id', cData.id)
          .select()
          .single();
        if (!error && data) return data;
      } else {
        const { data, error } = await supabaseAdmin
          .from('coupons')
          .insert([row])
          .select()
          .single();
        if (!error && data) return data;
      }
    } catch {}

    const newCoupon: Coupon = {
      id: cData.id || `cpn-${Date.now()}`,
      code,
      description: cData.description || 'Special Discount',
      discount_type: cData.discount_type || 'percentage',
      discount_value: cData.discount_value ?? 10,
      min_order_value: cData.min_order_value ?? 200000,
      max_discount: cData.max_discount ?? null,
      usage_limit: cData.usage_limit ?? 100,
      times_used: 0,
      is_active: cData.is_active ?? true,
    };
    this.coupons.unshift(newCoupon);
    return newCoupon;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    try {
      await supabaseAdmin.from('coupons').delete().eq('id', id);
    } catch {}
    const idx = this.coupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.coupons.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ==========================================
  // REVIEWS (STORED IN SUPABASE)
  // ==========================================
  async getReviews(productId?: string): Promise<Review[]> {
    try {
      let query = supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false });
      if (productId) {
        query = query.eq('product_id', productId).eq('is_approved', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          product_id: r.product_id,
          user_id: r.user_id,
          user_name: r.user_name,
          rating: Number(r.rating),
          title: r.title,
          comment: r.comment,
          is_verified_purchase: r.is_verified_purchase ?? true,
          is_approved: r.is_approved ?? true,
          created_at: r.created_at,
        }));
      }
    } catch {}
    if (productId) return this.reviews.filter((r) => r.product_id === productId && r.is_approved);
    return [...this.reviews];
  }

  async addReview(data: { product_id: string; user_id?: string; user_name: string; rating: number; title?: string; comment: string }): Promise<Review> {
    try {
      const row = {
        product_id: data.product_id,
        user_id: data.user_id && data.user_id.length === 36 ? data.user_id : null,
        user_name: data.user_name || 'Customer',
        rating: Math.max(1, Math.min(5, data.rating)),
        title: data.title || null,
        comment: data.comment,
        is_verified_purchase: true,
        is_approved: true,
      };
      const { data: inserted, error } = await supabaseAdmin.from('reviews').insert([row]).select().single();
      if (!error && inserted) {
        return {
          id: inserted.id,
          product_id: inserted.product_id,
          user_id: inserted.user_id || 'guest',
          user_name: inserted.user_name,
          rating: Number(inserted.rating),
          title: inserted.title,
          comment: inserted.comment,
          is_verified_purchase: true,
          is_approved: true,
          created_at: inserted.created_at,
        };
      }
    } catch {}

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      product_id: data.product_id,
      user_id: data.user_id || 'guest',
      user_name: data.user_name || 'Customer',
      rating: Math.max(1, Math.min(5, data.rating)),
      title: data.title || null,
      comment: data.comment,
      is_verified_purchase: true,
      is_approved: true,
      created_at: new Date().toISOString(),
    };
    this.reviews.unshift(newReview);
    return newReview;
  }

  async toggleReviewApproval(id: string, isApproved: boolean): Promise<boolean> {
    try {
      await supabaseAdmin.from('reviews').update({ is_approved: isApproved }).eq('id', id);
    } catch {}
    const rev = this.reviews.find((r) => r.id === id);
    if (rev) {
      rev.is_approved = isApproved;
      return true;
    }
    return false;
  }

  async deleteReview(id: string): Promise<boolean> {
    try {
      await supabaseAdmin.from('reviews').delete().eq('id', id);
    } catch {}
    const idx = this.reviews.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.reviews.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ==========================================
  // SETTINGS
  // ==========================================
  async getStoreSettings(): Promise<StoreSettings> {
    try {
      const { data, error } = await supabaseAdmin
        .from('store_settings')
        .select('*')
        .eq('key', 'general')
        .maybeSingle();

      if (!error && data?.value_json) {
        this.settings = { ...this.settings, ...data.value_json };
        return this.settings;
      }
    } catch {}
    return { ...this.settings };
  }

  async updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
    this.settings = { ...this.settings, ...newSettings };
    try {
      await supabaseAdmin
        .from('store_settings')
        .upsert({
          key: 'general',
          value_json: this.settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
    } catch {}
    return { ...this.settings };
  }

  // ==========================================
  // ADMIN ANALYTICS
  // ==========================================
  async getAdminStats() {
    const ordersResult = await this.getOrders({ limit: 100 });
    const orders = ordersResult.orders;
    const products = await this.getAllProductsAdmin();

    const totalRevenue = orders
      .filter((o) => o.payment_status === 'paid' || o.status === 'delivered')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter((p) => p.stock_quantity <= p.low_stock_threshold);

    const salesCount: Record<string, { product: Product; quantitySold: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (!item.product_id) continue;
        if (!salesCount[item.product_id]) {
          const prod = products.find((p) => p.id === item.product_id);
          if (prod) {
            salesCount[item.product_id] = { product: prod, quantitySold: 0, revenue: 0 };
          }
        }
        if (salesCount[item.product_id]) {
          salesCount[item.product_id].quantitySold += item.quantity;
          salesCount[item.product_id].revenue += item.total_price;
        }
      }
    }

    const topSelling = Object.values(salesCount)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      topSelling,
      recentOrders: orders.slice(0, 5),
    };
  }
}

// Singleton instance
export const db = new WingsDataStore();
