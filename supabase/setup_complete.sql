-- =====================================================================
-- WINGS E-COMMERCE PLATFORM - COMPLETE DATABASE SETUP & SEED
-- Run this file in your Supabase SQL Editor in 1 click.
-- It creates all tables, RLS policies, triggers, and seeds 26 products.
-- =====================================================================

-- =====================================================================
-- WINGS E-COMMERCE PLATFORM - CORE DATABASE SCHEMA & RLS POLICIES
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'moderator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin', 'moderator')),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, role)
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    icon TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
    cost_price NUMERIC(12, 2) DEFAULT 0,
    sku TEXT UNIQUE,
    barcode TEXT,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 5,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT true,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
    reviews_count INT NOT NULL DEFAULT 0,
    attributes_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_thumbnail BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sku TEXT UNIQUE,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    options_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. INVENTORY LOGS
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('order', 'restock', 'adjustment', 'return', 'initial')),
    quantity_change INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CARTS & CART ITEMS
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT cart_owner_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. WISHLISTS & WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(wishlist_id, product_id)
);

-- 9. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Uy / Home',
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT NOT NULL,
    street TEXT NOT NULL,
    apartment TEXT,
    postal_code TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bank_transfer', 'card', 'click', 'payme')),
    delivery_method TEXT NOT NULL DEFAULT 'standard' CHECK (delivery_method IN ('standard', 'express', 'pickup')),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    coupon_code TEXT,
    delivery_address_json JSONB NOT NULL,
    customer_notes TEXT,
    admin_notes TEXT,
    tracking_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_title TEXT,
    sku TEXT,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL DEFAULT 'system',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('initiated', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. COUPONS & REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
    min_order_value NUMERIC(12, 2) DEFAULT 0,
    max_discount NUMERIC(12, 2),
    usage_limit INT,
    times_used INT NOT NULL DEFAULT 0,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    discount_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 18. NOTIFICATION LOGS
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel TEXT NOT NULL DEFAULT 'telegram',
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
    error_message TEXT,
    payload_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public can read active categories
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- Public can read published products
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products
    FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage products" ON public.products;
CREATE POLICY "Admin manage products" ON public.products
    FOR ALL USING (public.is_admin());

-- Public read product images
DROP POLICY IF EXISTS "Public read images" ON public.product_images;
CREATE POLICY "Public read images" ON public.product_images
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage images" ON public.product_images;
CREATE POLICY "Admin manage images" ON public.product_images
    FOR ALL USING (public.is_admin());

-- Public read variants
DROP POLICY IF EXISTS "Public read variants" ON public.product_variants;
CREATE POLICY "Public read variants" ON public.product_variants
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage variants" ON public.product_variants;
CREATE POLICY "Admin manage variants" ON public.product_variants
    FOR ALL USING (public.is_admin());

-- Profiles: users read/update own; admins read all
DROP POLICY IF EXISTS "Read own profile" ON public.profiles;
CREATE POLICY "Read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
CREATE POLICY "Update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admin manage profiles" ON public.profiles;
CREATE POLICY "Admin manage profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- Addresses: own user
DROP POLICY IF EXISTS "Users manage addresses" ON public.addresses;
CREATE POLICY "Users manage addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Carts & Cart Items
DROP POLICY IF EXISTS "Users read own cart" ON public.carts;
CREATE POLICY "Users read own cart" ON public.carts
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users manage cart items" ON public.cart_items;
CREATE POLICY "Users manage cart items" ON public.cart_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND (user_id = auth.uid() OR public.is_admin()))
    );

-- Wishlists
DROP POLICY IF EXISTS "Users manage wishlists" ON public.wishlists;
CREATE POLICY "Users manage wishlists" ON public.wishlists
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users manage wishlist items" ON public.wishlist_items;
CREATE POLICY "Users manage wishlist items" ON public.wishlist_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_items.wishlist_id AND (user_id = auth.uid() OR public.is_admin()))
    );

-- Orders: Customer can read own orders, Admin can manage all
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders" ON public.orders
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
CREATE POLICY "Users read own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (user_id = auth.uid() OR public.is_admin()))
    );

DROP POLICY IF EXISTS "Admin manage order items" ON public.order_items;
CREATE POLICY "Admin manage order items" ON public.order_items
    FOR ALL USING (public.is_admin());

-- Reviews: public can read approved reviews, users can insert own
DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
CREATE POLICY "Public read approved reviews" ON public.reviews
    FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert reviews" ON public.reviews;
CREATE POLICY "Users insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin manage reviews" ON public.reviews;
CREATE POLICY "Admin manage reviews" ON public.reviews
    FOR ALL USING (public.is_admin());

-- Store Settings: public read non-sensitive, admin manage
DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
CREATE POLICY "Public read store settings" ON public.store_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage store settings" ON public.store_settings;
CREATE POLICY "Admin manage store settings" ON public.store_settings
    FOR ALL USING (public.is_admin());

-- Newsletter: public insert
DROP POLICY IF EXISTS "Public insert newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public insert newsletter" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Admin manage newsletter" ON public.newsletter_subscribers
    FOR ALL USING (public.is_admin());

-- Orders: allow checkout order creation
DROP POLICY IF EXISTS "Users create orders" ON public.orders;
CREATE POLICY "Users create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users create order items" ON public.order_items;
CREATE POLICY "Users create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Auto-create profile trigger on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    is_admin_user := (lower(trim(new.email)) = 'asd10101010qwerty@gmail.com');

    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', NULL),
        CASE WHEN is_admin_user THEN 'admin' ELSE 'customer' END
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = coalesce(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = coalesce(EXCLUDED.avatar_url, public.profiles.avatar_url),
        role = CASE WHEN is_admin_user THEN 'admin' ELSE public.profiles.role END,
        updated_at = now();

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



-- =====================================================================
-- WINGS E-COMMERCE PLATFORM - PRODUCTION SEED DATA
-- =====================================================================

-- 1. STORE SETTINGS
INSERT INTO public.store_settings (key, value_json) VALUES
('general', '{
    "store_name": "Wings",
    "tagline": "Elevate Your Style. Precision & Elegance.",
    "phone": "+998 71 200 45 45",
    "email": "support@wings-store.uz",
    "telegram_channel": "@wings_official",
    "telegram_bot": "@wings_shop_bot",
    "address": "Tashkent, Amir Temur avenue 107B",
    "free_shipping_threshold": 500000,
    "standard_shipping_fee": 25000,
    "express_shipping_fee": 45000,
    "currency": "UZS",
    "default_locale": "uz"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json;

-- 2. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, icon, sort_order, is_active) VALUES
('11111111-1111-1111-1111-111111111101', 'Audio & Acoustics', 'audio', 'Premium high-fidelity wireless sound, acoustic monitors and noise-cancelling headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop', 'Headphones', 1, true),
('11111111-1111-1111-1111-111111111102', 'Minimalist Footwear', 'footwear', 'Monochrome runners, carbon-sole athletic trainers, and engineered luxury footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop', 'Footprints', 2, true),
('11111111-1111-1111-1111-111111111103', 'Precision Watches', 'timepieces', 'Matte titanium chronographs, sapphire crystal mechanical timepieces with Swiss movements', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop', 'Watch', 3, true),
('11111111-1111-1111-1111-111111111104', 'Urban Streetwear', 'streetwear', 'Heavyweight cotton hoodies, modular technical bombers, and waterproof storm jackets', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop', 'Shirt', 4, true),
('11111111-1111-1111-1111-111111111105', 'Everyday Carry', 'carry', 'Ballistic nylon tech slings, carbon RFID cardholders, and Italian leather accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop', 'Briefcase', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. PRODUCTS
INSERT INTO public.products (id, name, slug, description, short_description, price, sale_price, cost_price, sku, stock_quantity, low_stock_threshold, category_id, is_published, is_featured, is_new, rating, reviews_count) VALUES
('22222222-2222-2222-2222-222222222201', 'Wings Phantom ANC Studio Headphones', 'wings-phantom-anc-headphones', 'Precision acoustic engineering with bespoke 45mm neodymium drivers, active hybrid noise cancellation, and aerospace-grade matte titanium headband. Battery lasts up to 48 hours on a single 30-minute rapid charge.', 'Flagship noise-cancelling wireless headphones with 48h battery and titanium finish.', 1450000, 1290000, 750000, 'WNG-AUD-01', 34, 5, '11111111-1111-1111-1111-111111111101', true, true, true, 4.9, 42),
('22222222-2222-2222-2222-222222222202', 'Wings Apex Spatial Wireless Earbuds', 'wings-apex-spatial-earbuds', 'Ultra-compact high-res wireless earbuds featuring dynamic head-tracking spatial audio, IPX7 water resistance, and wireless charging case.', 'Spatial audio earbuds with transparency mode and ceramic acoustic chamber.', 850000, 750000, 420000, 'WNG-AUD-02', 45, 8, '11111111-1111-1111-1111-111111111101', true, true, false, 4.8, 28),
('22222222-2222-2222-2222-222222222203', 'Wings Carbon Velocity Runners', 'wings-carbon-velocity-runners', 'Engineered with a responsive carbon-fiber propulsion plate and breathable hydrophobic knit mesh. Built for urban speed and cloud-like comfort.', 'Ultra-lightweight runner sneakers with full carbon plate and obsidian accents.', 1150000, 980000, 580000, 'WNG-SH-01', 18, 4, '11111111-1111-1111-1111-111111111102', true, true, true, 4.9, 64),
('22222222-2222-2222-2222-222222222204', 'Wings Stealth Monochrome Low-Tops', 'wings-stealth-monochrome-sneakers', 'Handcrafted full-grain Italian leather sneakers with vulcanized rubber sole and minimalist embossed Wings logo.', 'Premium black calfskin low-tops designed for sharp casual elegance.', 920000, NULL, 500000, 'WNG-SH-02', 26, 6, '11111111-1111-1111-1111-111111111102', true, false, false, 4.7, 19),
('22222222-2222-2222-2222-222222222205', 'Wings Horizon Chronograph Titanium Watch', 'wings-horizon-chronograph-watch', 'Crafted from solid grade-5 titanium with scratch-proof sapphire crystal glass, 100m water resistance, and bespoke crimson chronograph second hand.', 'Grade-5 titanium automatic chronograph with sapphire crystal and red accent hand.', 2450000, 2190000, 1300000, 'WNG-WT-01', 12, 3, '11111111-1111-1111-1111-111111111103', true, true, true, 5.0, 31),
('22222222-2222-2222-2222-222222222206', 'Wings Obsidian Minimalist Automatic', 'wings-obsidian-minimalist-watch', 'Sleek matte-black dial with understated indices, exhibition caseback showing the mechanical rotor, and waterproof silicone deployant strap.', 'Matte-black automatic timepiece with exhibition back and silicone sport strap.', 1680000, NULL, 900000, 'WNG-WT-02', 8, 3, '11111111-1111-1111-1111-111111111103', true, false, false, 4.8, 15),
('22222222-2222-2222-2222-222222222207', 'Wings StormShield Tactical Parka', 'wings-stormshield-tactical-parka', 'Triple-layer 20,000mm waterproof breathable technical shell with magnetic pocket closures, taped seams, and detachable insulated hood.', 'Heavy-duty 20K waterproof breathable shell with tactical magnetic pockets.', 1380000, 1190000, 680000, 'WNG-AP-01', 22, 5, '11111111-1111-1111-1111-111111111104', true, true, true, 4.9, 39),
('22222222-2222-2222-2222-222222222208', 'Wings Heavyweight 500GSM Boxy Hoodie', 'wings-heavyweight-500gsm-hoodie', 'Milled from 100% organic 500 GSM French terry cotton. Features double-lined hood, dropped shoulders, and subtle high-density tonal chest embroidery.', 'Luxury 500 GSM heavyweight French terry boxy hoodie with tonal branding.', 690000, 580000, 310000, 'WNG-AP-02', 40, 8, '11111111-1111-1111-1111-111111111104', true, false, true, 4.9, 53),
('22222222-2222-2222-2222-222222222209', 'Wings Ballistic Modular Sling Bag', 'wings-ballistic-modular-sling', '1680D Cordura ballistic nylon crossbody sling bag with Fidlock magnetic V-buckles, waterproof YKK zippers, and padded tablet sleeve.', '1680D Cordura technical crossbody sling with Fidlock magnetic closure.', 480000, 420000, 210000, 'WNG-ACC-01', 31, 6, '11111111-1111-1111-1111-111111111105', true, true, false, 4.8, 47),
('22222222-2222-2222-2222-222222222210', 'Wings Carbon MagSafe Cardholder & Money Clip', 'wings-carbon-magsafe-cardholder', 'Aerospace carbon fiber RFID blocking cardholder with built-in Apple MagSafe alignment and titanium spring money clip.', 'Carbon fiber RFID-blocking minimalist wallet with MagSafe snap alignment.', 280000, 240000, 110000, 'WNG-ACC-02', 55, 10, '11111111-1111-1111-1111-111111111105', true, false, false, 4.7, 33),
('22222222-2222-2222-2222-222222222211', 'Wings SoundStage Pro Desktop Acoustic Monitors', 'wings-soundstage-pro-monitors', 'High-resolution studio reference bookshelf monitors featuring carbon-woven cones, silk dome tweeters, Bluetooth 5.4 aptX Lossless, and acoustic isolation stands.', 'Studio-grade active desktop monitors with Kevlar cones and optical inputs.', 2650000, 2390000, 1400000, 'WNG-AUD-03', 16, 4, '11111111-1111-1111-1111-111111111101', true, true, true, 4.9, 23),
('22222222-2222-2222-2222-222222222212', 'Wings Pulse Open-Ear Bone Conduction Headset', 'wings-pulse-bone-conduction-headset', 'Ultra-lightweight titanium wrap-around bone conduction headset with IP68 waterproof rating, 32GB onboard MP3 storage for swimming without a phone.', 'IP68 waterproof open-ear bone conduction headphones with 32GB offline MP3.', 950000, 820000, 480000, 'WNG-AUD-04', 28, 5, '11111111-1111-1111-1111-111111111101', true, false, true, 4.8, 19),
('22222222-2222-2222-2222-222222222213', 'Wings SubZero Hi-Res In-Ear Monitors', 'wings-subzero-hi-res-iems', 'Audiophile hybrid dual dynamic and Knowles balanced armature IEM earphones with transparent acoustic resin housing and detachable silver MMCX cable.', 'Hybrid dual-driver Hi-Res audio wired earphones with detachable silver cable.', 590000, 490000, 260000, 'WNG-AUD-05', 36, 8, '11111111-1111-1111-1111-111111111101', true, false, false, 4.7, 31),
('22222222-2222-2222-2222-222222222214', 'Wings Aeroflex High-Top Technical Sneakers', 'wings-aeroflex-high-top-sneakers', 'Engineered sock-knit technical high-tops with internal waterproof membrane, Vibram Megagrip lugged all-weather outsole, and quick-pull speed toggle lacing.', 'Weatherproof technical high-top runners with Vibram sole and quick lacing.', 1280000, 1120000, 620000, 'WNG-SH-03', 24, 5, '11111111-1111-1111-1111-111111111102', true, true, true, 4.9, 45),
('22222222-2222-2222-2222-222222222215', 'Wings Chelsea Commuter Waterproof Leather Boots', 'wings-chelsea-commuter-boots', 'Waterproof oiled Italian calfskin Chelsea boots with Goodyear-welt construction, storm welt, and shock-absorbing commando lug outsole.', 'Handcrafted oiled leather Chelsea boots with storm welt and commando sole.', 1480000, 1320000, 780000, 'WNG-SH-04', 19, 4, '11111111-1111-1111-1111-111111111102', true, false, true, 4.8, 27),
('22222222-2222-2222-2222-222222222216', 'Wings Nimbus Cloud Ergonomic Recovery Slides', 'wings-nimbus-cloud-recovery-slides', 'Ultra-thick 4.2cm dual-density EVA foam recovery slides designed to relieve foot and arch pressure after workouts or long days on your feet.', 'Dual-density featherlight cloud recovery slides with deep arch cradle.', 380000, 320000, 140000, 'WNG-SH-05', 50, 10, '11111111-1111-1111-1111-111111111102', true, false, false, 4.7, 58),
('22222222-2222-2222-2222-222222222217', 'Wings DeepSea 300M Professional Automatic Diver', 'wings-deepsea-300m-diver-watch', 'Professional 300m dive watch with scratch-proof ceramic 120-click unidirectional bezel, Swiss Super-LumiNova BGW9 glowing blue markers, and automatic helium valve.', '300-meter automatic professional diver with ceramic bezel and sapphire crystal.', 2890000, 2550000, 1450000, 'WNG-WT-03', 14, 3, '11111111-1111-1111-1111-111111111103', true, true, true, 5.0, 22),
('22222222-2222-2222-2222-222222222218', 'Wings SolarField Military Canvas Watch', 'wings-solarfield-military-watch', 'Tactical solar-powered field watch requiring zero battery replacements. Fully charges in ambient sunlight for 6 months power reserve. Sapphire crystal.', 'Solar-powered tactical field watch with sapphire glass and olive nylon strap.', 1350000, 1180000, 650000, 'WNG-WT-04', 21, 5, '11111111-1111-1111-1111-111111111103', true, false, false, 4.8, 17),
('22222222-2222-2222-2222-222222222219', 'Wings Monolith Skeleton Mechanical Watch', 'wings-monolith-skeleton-watch', 'Architectural open-work skeleton timepiece revealing the balance spring, escapement, and gold-accented mechanical gear train beneath dual sapphire glass.', 'Gunmetal skeleton mechanical timepiece with dual sapphire display glass.', 3200000, 2890000, 1700000, 'WNG-WT-05', 9, 2, '11111111-1111-1111-1111-111111111103', true, true, true, 5.0, 29),
('22222222-2222-2222-2222-222222222220', 'Wings TechWear Modular Cargo Jogger Pants', 'wings-techwear-cargo-jogger-pants', 'Technical water-repellent ripstop joggers featuring 8 articulated utility pockets, magnetic flap closures, reinforced knee gussets, and cinch ankle cords.', 'Water-repellent ripstop cargo pants with 8 pockets and magnetic flaps.', 780000, 680000, 360000, 'WNG-AP-03', 32, 6, '11111111-1111-1111-1111-111111111104', true, false, true, 4.9, 41),
('22222222-2222-2222-2222-222222222221', 'Wings Heavyweight 280GSM Minimalist Pima Tee', 'wings-heavyweight-280gsm-pima-tee', 'Crafted from long-staple Peruvian Pima cotton with double-needle dense stitching, ribbed non-stretch collar, and clean minimalist boxy fit.', 'Premium 280 GSM heavyweight Pima cotton relaxed boxy t-shirt.', 320000, 270000, 120000, 'WNG-AP-04', 65, 12, '11111111-1111-1111-1111-111111111104', true, false, false, 4.8, 73),
('22222222-2222-2222-2222-222222222222', 'Wings StormFlock Reversible Down Jacket', 'wings-stormflock-reversible-down-jacket', 'Ultra-warm reversible winter jacket: matte windproof ripstop nylon on side A, plush dense thermal sherpa on side B. Filled with 700-fill down insulation.', '700-fill power reversible winter down puffer with stormproof nylon and sherpa.', 1650000, 1450000, 850000, 'WNG-AP-05', 17, 4, '11111111-1111-1111-1111-111111111104', true, true, true, 4.9, 34),
('22222222-2222-2222-2222-222222222223', 'Wings Heavyweight Brushed Flannel Overshirt', 'wings-brushed-flannel-overshirt', 'Dense 380 GSM brushed twill cotton overshirt with quilted satin lining, metal snap closures, and dual front chest flap pockets.', 'Heavyweight quilted lined flannel jacket with matte metal hardware.', 850000, 740000, 410000, 'WNG-AP-06', 25, 5, '11111111-1111-1111-1111-111111111104', true, false, true, 4.8, 21),
('22222222-2222-2222-2222-222222222224', 'Wings Commuter 24L Ballistic Tech Backpack', 'wings-commuter-24l-tech-backpack', 'All-weather commuter pack made of 1050D ballistic nylon with 180-degree clamshell opening, false-bottom 16-inch laptop chamber, and luggage pass-through.', 'Waterproof 1050D ballistic nylon 24L tech pack with 16-inch laptop cradle.', 1150000, 980000, 540000, 'WNG-ACC-03', 22, 5, '11111111-1111-1111-1111-111111111105', true, true, true, 4.9, 51),
('22222222-2222-2222-2222-222222222225', 'Wings Titanium Carabiner Key Organizer & Tool', 'wings-titanium-carabiner-key-tool', 'Precision CNC-machined from a single billet of Grade-5 aerospace titanium. Integrates bottle opener, pry bar, hex bit driver, and secure anti-loss key gate.', 'Grade-5 titanium multi-tool carabiner with integrated pry bar and key keeper.', 260000, 220000, 95000, 'WNG-ACC-04', 48, 10, '11111111-1111-1111-1111-111111111105', true, false, false, 4.8, 38),
('22222222-2222-2222-2222-222222222226', 'Wings Full-Grain Leather Desk Mat & Organizer', 'wings-leather-desk-mat-organizer', 'Crafted from 2.2mm thick vegetable-tanned full-grain leather with non-slip natural wool felt backing and magnetic cable organization strip.', 'Vegetable-tanned full-grain leather desk pad with magnetic cable guide.', 450000, 390000, 190000, 'WNG-ACC-05', 30, 6, '11111111-1111-1111-1111-111111111105', true, false, true, 4.9, 26)
ON CONFLICT (slug) DO NOTHING;

-- 4. PRODUCT IMAGES
DELETE FROM public.product_images;
INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order, is_thumbnail) VALUES
('22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop', 'Wings Phantom ANC Studio Headphones front angle', 0, true),
('22222222-2222-2222-2222-222222222201', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop', 'Wings Phantom ANC earcups close up', 1, false),
('22222222-2222-2222-2222-222222222202', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop', 'Wings Apex Spatial Earbuds case and buds', 0, true),
('22222222-2222-2222-2222-222222222203', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop', 'Wings Carbon Velocity Runners side profile', 0, true),
('22222222-2222-2222-2222-222222222204', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop', 'Wings Stealth Monochrome Low-Tops pair', 0, true),
('22222222-2222-2222-2222-222222222205', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop', 'Wings Horizon Chronograph dial close up', 0, true),
('22222222-2222-2222-2222-222222222206', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop', 'Wings Obsidian Minimalist on wrist', 0, true),
('22222222-2222-2222-2222-222222222207', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop', 'Wings StormShield Tactical Parka street look', 0, true),
('22222222-2222-2222-2222-222222222208', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop', 'Wings Heavyweight 500GSM Boxy Hoodie front', 0, true),
('22222222-2222-2222-2222-222222222209', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop', 'Wings Ballistic Modular Sling Bag worn', 0, true),
('22222222-2222-2222-2222-222222222210', 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop', 'Wings Carbon MagSafe Cardholder minimalist view', 0, true),
('22222222-2222-2222-2222-222222222211', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop', 'Wings SoundStage Pro Acoustic Monitors pair', 0, true),
('22222222-2222-2222-2222-222222222212', 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=1000&auto=format&fit=crop', 'Wings Pulse Bone Conduction Headset', 0, true),
('22222222-2222-2222-2222-222222222213', 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?q=80&w=1000&auto=format&fit=crop', 'Wings SubZero Hi-Res IEMs', 0, true),
('22222222-2222-2222-2222-222222222214', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop', 'Wings Aeroflex High-Top Technical Sneakers', 0, true),
('22222222-2222-2222-2222-222222222215', 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1000&auto=format&fit=crop', 'Wings Chelsea Commuter Leather Boots', 0, true),
('22222222-2222-2222-2222-222222222216', 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1000&auto=format&fit=crop', 'Wings Nimbus Cloud Recovery Slides', 0, true),
('22222222-2222-2222-2222-222222222217', 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop', 'Wings DeepSea 300M Professional Diver', 0, true),
('22222222-2222-2222-2222-222222222218', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop', 'Wings SolarField Military Watch', 0, true),
('22222222-2222-2222-2222-222222222219', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop', 'Wings Monolith Skeleton Mechanical Watch', 0, true),
('22222222-2222-2222-2222-222222222220', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop', 'Wings TechWear Cargo Jogger Pants', 0, true),
('22222222-2222-2222-2222-222222222221', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop', 'Wings Heavyweight Minimalist Tee', 0, true),
('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop', 'Wings StormFlock Reversible Jacket', 0, true),
('22222222-2222-2222-2222-222222222223', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop', 'Wings Heavyweight Flannel Overshirt', 0, true),
('22222222-2222-2222-2222-222222222224', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop', 'Wings Commuter 24L Ballistic Tech Backpack', 0, true),
('22222222-2222-2222-2222-222222222225', 'https://images.unsplash.com/photo-1614165936123-aefea0d21432?q=80&w=1000&auto=format&fit=crop', 'Wings Titanium Carabiner Key Tool', 0, true),
('22222222-2222-2222-2222-222222222226', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1000&auto=format&fit=crop', 'Wings Full-Grain Leather Desk Mat', 0, true);

-- 5. COUPONS
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, is_active) VALUES
('WINGS10', '10% discount on any order over 300,000 UZS', 'percentage', 10, 300000, 250000, 500, true),
('WELCOME50', '50,000 UZS off your first purchase', 'fixed', 50000, 400000, 50000, 1000, true),
('VIP20', 'Exclusive 20% discount for Wings VIP members', 'percentage', 20, 800000, 500000, 100, true)
ON CONFLICT (code) DO NOTHING;
