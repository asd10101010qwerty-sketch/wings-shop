import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db';
import { formatCurrency } from '../src/lib/i18n/translations';

describe('Wings Pricing & Coupon Engine', () => {
  it('formats currency correctly in Uzbek, Russian, and English', () => {
    expect(formatCurrency(1200000, 'uz')).toContain('1 200 000 soʻm');
    expect(formatCurrency(1200000, 'ru')).toContain('1 200 000 сум');
    expect(formatCurrency(1200000, 'en')).toContain('1,200,000 UZS');
  });

  it('validates 10% percentage coupon WINGS10 correctly when above threshold', async () => {
    const res = await db.validateCoupon('WINGS10', 1000000);
    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(100000); // 10% of 1,000,000
  });

  it('rejects coupon when subtotal is below minimum order value', async () => {
    const res = await db.validateCoupon('WINGS10', 150000); // min is 300,000
    expect(res.valid).toBe(false);
    expect(res.discountAmount).toBe(0);
  });

  it('validates fixed discount coupon WELCOME50', async () => {
    const res = await db.validateCoupon('WELCOME50', 500000); // min is 400,000
    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(50000);
  });

  it('rejects invalid or non-existent coupon code', async () => {
    const res = await db.validateCoupon('INVALIDCODE999', 500000);
    expect(res.valid).toBe(false);
  });
});
