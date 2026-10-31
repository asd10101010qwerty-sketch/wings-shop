'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Coupon } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  coupon: Coupon | null;
  couponError: string | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCouponCode: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => boolean;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const FREE_SHIPPING_THRESHOLD = 500000;
const STANDARD_SHIPPING_FEE = 25000;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedCart = localStorage.getItem('wings_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem('wings_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
      const savedCoupon = localStorage.getItem('wings_coupon');
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.warn('Failed to parse saved cart/wishlist', e);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('wings_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart', e);
    }
  }, [items, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('wings_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist', e);
    }
  }, [wishlist, mounted]);

  const addItem = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    setItems((prevItems) => {
      const itemId = variant ? `${product.id}-${variant.id}` : product.id;
      const existingIndex = prevItems.findIndex((it) => it.id === itemId);

      const unitPrice = variant ? (variant.sale_price ?? variant.price) : (product.sale_price ?? product.price);

      if (existingIndex > -1) {
        const nextItems = [...prevItems];
        const newQty = nextItems[existingIndex].quantity + quantity;
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: newQty,
          total_price: unitPrice * newQty,
        };
        return nextItems;
      }

      const newItem: CartItem = {
        id: itemId,
        product_id: product.id,
        variant_id: variant?.id,
        product,
        variant,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
      };
      return [...prevItems, newItem];
    });

    setIsCartDrawerOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            quantity,
            total_price: it.unit_price * quantity,
          };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setCouponError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wings_cart');
      localStorage.removeItem('wings_coupon');
    }
  };

  const subtotal = items.reduce((sum, it) => sum + it.total_price, 0);

  // Calculate discount
  let discountAmount = 0;
  if (coupon && subtotal >= coupon.min_order_value) {
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }
  }

  // Calculate shipping
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid && data.coupon) {
        setCoupon(data.coupon);
        localStorage.setItem('wings_coupon', JSON.stringify(data.coupon));
        return true;
      } else {
        setCouponError(data.message || 'Kupon yaroqsiz / Invalid coupon');
        return false;
      }
    } catch {
      // Local fallback validation
      const codeUpper = code.trim().toUpperCase();
      if (codeUpper === 'WINGS10' && subtotal >= 300000) {
        const c: Coupon = {
          id: 'cpn-01',
          code: 'WINGS10',
          description: '10% off',
          discount_type: 'percentage',
          discount_value: 10,
          min_order_value: 300000,
          max_discount: 250000,
          times_used: 1,
          is_active: true,
        };
        setCoupon(c);
        localStorage.setItem('wings_coupon', JSON.stringify(c));
        return true;
      } else if (codeUpper === 'WELCOME50' && subtotal >= 400000) {
        const c: Coupon = {
          id: 'cpn-02',
          code: 'WELCOME50',
          description: '50,000 UZS off',
          discount_type: 'fixed',
          discount_value: 50000,
          min_order_value: 400000,
          max_discount: 50000,
          times_used: 1,
          is_active: true,
        };
        setCoupon(c);
        localStorage.setItem('wings_coupon', JSON.stringify(c));
        return true;
      }
      setCouponError('Kupon topilmadi yoki minimal summa yetarli emas');
      return false;
    }
  };

  const removeCouponCode = () => {
    setCoupon(null);
    setCouponError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wings_coupon');
    }
  };

  // Wishlist methods
  const toggleWishlist = (product: Product): boolean => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      return false;
    } else {
      setWishlist((prev) => [...prev, product]);
      return true;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((p) => p.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        total,
        coupon,
        couponError,
        applyCouponCode,
        removeCouponCode,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
