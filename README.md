# Wings — Premium E-Commerce Platform

Wings is a modern, high-performance, production-style online shopping platform built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase PostgreSQL. Designed with a sophisticated obsidian aesthetic, crimson accents, real-time Telegram bot notifications, full multi-language support (Uzbek, Russian, English), and robust server-side pricing and inventory validation.

---

## 1. Key Features

- **Storefront & Catalog**:
  - Immersive homepage with category grids, trending products, new arrivals, promotional drops, and customer reviews.
  - Multi-faceted product catalog filtering (category, search query, price range slider, in-stock filter, and sorting).
  - High-resolution product detail pages with gallery zoom, variant selectors, real-time inventory checks, related items, and verified customer reviews.
- **Cart & Wishlist**:
  - Persistent shopping bag with slide-out drawer, quantity controls, real-time subtotal calculation, coupon redemption (`WINGS10`), and free delivery threshold indicator.
  - One-click wishlist synchronization with cart transfer.
- **Checkout & Order Management**:
  - Multi-step checkout: Contact Information, Delivery Address, Shipping Methods (Standard & Express), and Payment Options (Cash on Delivery, Bank Transfer, Online Card).
  - Atomic server-side order calculation, inventory reservation, and duplicate-submission protection.
- **Telegram Bot Automation**:
  - Automated HTML-formatted alerts sent directly to Telegram (`@wings_shop_bot`) for new orders, delivery status changes, order cancellations, and low-inventory warnings.
- **Customer Account Portal**:
  - Order tracking with timeline status (`pending → confirmed → processing → shipped → delivered`), shipping address book, and profile management.
- **Protected Admin Dashboard (`/admin`)**:
  - Live revenue metrics, order velocity, inventory health, and customer spending analytics.
  - Complete CRUD for products (with variant management and image uploads), categories, orders, coupons, customer spending, and customer reviews moderation.
  - Diagnostic test panel for Telegram bot integration.
- **Internationalization & Currency**:
  - First-class support for **Oʻzbekcha (Default)**, **Русский**, and **English**.
  - Localized currency formatting in **Uzbek soʻm (UZS)** throughout the platform.

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 & custom design tokens
- **Icons**: Lucide Icons
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Supabase Auth SSR
- **Validation**: Zod & React Hook Form
- **Testing**: Vitest test suite covering pricing algorithms, order creation, and Telegram formatting
- **Notifications**: Telegram Bot API

---

## 3. Directory Structure

```text
├── src/
│   ├── app/                    # Next.js App Router pages and API handlers
│   │   ├── (auth)/             # Login, register, forgot-password
│   │   ├── account/            # Customer profile, addresses, orders
│   │   ├── admin/              # Complete admin management suite
│   │   │   ├── categories/     # Category management
│   │   │   ├── coupons/        # Promotional coupon configuration
│   │   │   ├── customers/      # Customer history & spending
│   │   │   ├── inventory/      # Stock tracking & adjustments
│   │   │   ├── notifications/  # Telegram status & diagnostics
│   │   │   ├── orders/         # Order processing & lifecycle
│   │   │   ├── products/       # Product catalog CRUD
│   │   │   ├── reviews/        # Customer review moderation
│   │   │   └── settings/       # Store configurations
│   │   ├── api/                # Secure server actions & API endpoints
│   │   ├── cart/               # Full shopping bag page
│   │   ├── categories/[slug]/  # Category-filtered catalog
│   │   ├── checkout/           # Multi-step checkout & success page
│   │   ├── products/           # Product search & filtering
│   │   ├── products/[slug]/    # Product details with gallery & reviews
│   │   ├── wishlist/           # Saved wishlist items
│   │   └── layout.tsx          # Root layout with providers & navigation
│   ├── components/             # Reusable UI & domain components
│   │   ├── admin/              # ProductForm and admin controls
│   │   ├── brand/              # Wings logo and SVG emblem
│   │   ├── cart/               # Cart drawer and line item cards
│   │   ├── layout/             # Header, Footer, LanguageSwitcher
│   │   └── product/            # ProductCard, ProductDetailClient, Filters
│   ├── lib/
│   │   ├── auth/               # Supabase Auth context & session hooks
│   │   ├── cart/               # Cart & Wishlist provider with persistence
│   │   ├── db/                 # Unified resilient data access layer
│   │   ├── i18n/               # Uzbek, Russian, English dictionaries
│   │   ├── supabase/           # Client, Server, and Admin Supabase instances
│   │   └── telegram.ts         # Telegram Bot notification engine
│   └── types/                  # Strict TypeScript domain interfaces
├── supabase/
│   ├── migrations/             # SQL schema migrations with RLS policies
│   └── seed.sql                # Seed data for categories, products, coupons
└── tests/                      # Automated Vitest test suite
```

---

## 4. Environment Variables

Create `.env.local` in the project root (never commit this file to Git):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rryjvthvimknjscfdyvo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Telegram Notifications
TELEGRAM_BOT_TOKEN=8953227132:AAHBEPnfuUBpj0yIUvCG3_Ok3CvH0Nyq3vk
TELEGRAM_CHAT_ID=7234943242
TELEGRAM_WEBHOOK_SECRET=your_telegram_webhook_secret

# Store Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 5. Supabase Database Setup & Migrations

The database migration and seed files are located in `supabase/`:

1. **Schema & Security Policies**:
   - Open your Supabase Dashboard at [https://supabase.com/dashboard/project/rryjvthvimknjscfdyvo](https://supabase.com/dashboard/project/rryjvthvimknjscfdyvo)
   - Go to the **SQL Editor**.
   - Paste and execute `supabase/migrations/20261027000000_wings_init.sql`.
   - This creates 19 relational tables, performance indexes, automated timestamp triggers, and strict Row Level Security (RLS) policies.

2. **Seed Initial Catalog & Store Settings**:
   - In the **SQL Editor**, paste and run `supabase/seed.sql`.
   - This seeds categories (Audio, Footwear, Timepieces, Streetwear, Everyday Carry), initial products with images and variants, store settings, and active discount coupons (`WINGS10`, `WELCOME20`).

3. **Hybrid Resilient Data Layer**:
   - The platform includes a fallback local data engine (`src/lib/db/index.ts`). If the remote Supabase PostgreSQL instance is unreachable or paused, all catalog browsing, cart operations, checkout flows, and admin actions function seamlessly without crashing.

---

## 6. Secure First-Administrator Creation

To grant administrator privileges to an account:

1. Register an account through `/register` on the storefront (e.g. `admin@wings.uz`).
2. In Supabase Dashboard → **SQL Editor**, run:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<USER_UUID_FROM_AUTH_USERS>', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

3. In the development/evaluator environment, an instant demo switch is also available on `/login` and `/admin` to toggle Admin mode for evaluation purposes.

---

## 7. Telegram Bot Notifications

The store integrates with Telegram Bot `@wings_shop_bot`:

1. **One-Time Requirement**:
   - Open Telegram and search for `@wings_shop_bot`.
   - Click **Start** (or send `/start`) in the chat with `@wings_shop_bot`.
   - *Note*: Telegram's Bot API forbids bots from sending proactive messages to a user or chat until that user has initiated the conversation.
2. **Notification Events**:
   - **New Order Placed**: Sends order number, items, total in UZS, payment method, delivery address, customer phone, and direct admin order URL.
   - **Order Status Update**: Alerts on status changes (`confirmed`, `shipped`, `delivered`, `cancelled`).
   - **Low Stock Warning**: Triggers when any product stock drops to 3 units or fewer.
3. **Diagnostics**:
   - Navigate to `/admin/notifications` in the browser to view live bot configuration status and send a test message.

---

## 8. Development & Testing Commands

### Install Dependencies
```bash
npm install
```

### Run Automated Tests
```bash
npm test
```
Runs the Vitest test suite covering:
- Unit & server-side pricing calculations (subtotals, percentage & fixed coupons, shipping fees).
- Order creation & duplicate submission protection.
- Telegram HTML message formatting and payload structure.

### Run Production Build
```bash
npm run build
```
Compiles TypeScript, processes styles, runs Turbopack page optimization, and statically generates all 57 routes.

### Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 9. Admin Dashboard Access

- **URL**: `http://localhost:3000/admin`
- **Sections**:
  - `/admin`: Real-time KPI summary, revenue charts, and quick-action order lists.
  - `/admin/products`: Searchable product catalog with stock indicators, price edits, and new product creation.
  - `/admin/categories`: Category management with slugs and cover images.
  - `/admin/orders`: Order lifecycle processing, status transitions, tracking numbers, and internal notes.
  - `/admin/customers`: Customer profiles and cumulative spend.
  - `/admin/coupons`: Discount coupon generator with expiration and usage limits.
  - `/admin/inventory`: Live stock adjustments and out-of-stock monitoring.
  - `/admin/reviews`: Customer review moderation with approval/rejection controls.
  - `/admin/notifications`: Telegram bot connection diagnostics and test triggers.
  - `/admin/settings`: Store currency, free shipping threshold, and contact details.

---

## 10. License & Production Deployment

- **Vercel Deployment**: Connect repository to Vercel, set the environment variables from Section 4, and deploy.
- **Security Check**: Verify `SUPABASE_SERVICE_ROLE_KEY` and `TELEGRAM_BOT_TOKEN` are only ever accessed in server components and API routes.
