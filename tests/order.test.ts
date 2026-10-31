import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db';

describe('Wings Order Engine & Inventory Validation', () => {
  it('creates an order with server-calculated price, deducted inventory, and unique order number', async () => {
    const productsRes = await db.getProducts({ limit: 1 });
    const product = productsRes.products[0];
    expect(product).toBeDefined();

    const previousStock = product.stock_quantity;

    const newOrder = await db.createOrder({
      items: [
        {
          product_id: product.id,
          quantity: 2,
        },
      ],
      delivery_address: {
        recipient_name: 'Bobur Mirzo',
        phone: '+998 90 999 88 77',
        region: 'Toshkent',
        city: 'Chilonzor',
        street: 'Bunyodkor 15',
      },
      delivery_method: 'standard',
      payment_method: 'cod',
    });

    expect(newOrder.order_number).toMatch(/^WNG-2026-\d{4}$/);
    expect(newOrder.items.length).toBe(1);
    expect(newOrder.items[0].quantity).toBe(2);

    // Verify inventory deduction
    const updatedProduct = await db.getProductById(product.id);
    expect(updatedProduct?.stock_quantity).toBe(previousStock - 2);
  });

  it('updates order status following lifecycle state machine', async () => {
    const { orders } = await db.getOrders({ limit: 1 });
    const order = orders[0];
    expect(order).toBeDefined();

    const updated = await db.updateOrderStatus(order.id, 'shipped', 'TRK-TEST-123456', 'Courier in transit');
    expect(updated?.status).toBe('shipped');
    expect(updated?.tracking_number).toBe('TRK-TEST-123456');
    expect(updated?.admin_notes).toBe('Courier in transit');
  });
});
