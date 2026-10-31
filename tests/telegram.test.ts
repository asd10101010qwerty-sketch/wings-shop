import { describe, it, expect } from 'vitest';
import { notifyNewOrder, notifyOrderStatusChange } from '../src/lib/telegram';
import { Order } from '../src/types';

describe('Wings Telegram Notification Service', () => {
  const dummyOrder: Order = {
    id: 'ord-test-999',
    order_number: 'WNG-2026-9999',
    status: 'pending',
    payment_status: 'unpaid',
    payment_method: 'cod',
    delivery_method: 'standard',
    subtotal: 1290000,
    discount_amount: 129000,
    shipping_fee: 0,
    total_amount: 1161000,
    coupon_code: 'WINGS10',
    delivery_address: {
      recipient_name: 'Test Customer <script>alert(1)</script>',
      phone: '+998 90 123 45 67',
      region: 'Toshkent',
      city: 'Yunusobod',
      street: 'Bogishamol & Amir Temur',
    },
    items: [
      {
        id: 'item-test-1',
        order_id: 'ord-test-999',
        product_id: 'prod-01',
        product_name: 'Wings Phantom ANC Headphones & Earbuds',
        unit_price: 1290000,
        quantity: 1,
        total_price: 1290000,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('safely attempts notification without crashing even if chat is not found', async () => {
    const res = await notifyNewOrder(dummyOrder, 'http://localhost:3000');
    // It should handle the Telegram response safely and return a TelegramResult
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
  });

  it('safely attempts status change notification', async () => {
    const res = await notifyOrderStatusChange(dummyOrder, 'pending', 'confirmed', 'http://localhost:3000');
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
  });
});
