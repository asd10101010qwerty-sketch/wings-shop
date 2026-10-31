import React from 'react';
import { db } from '@/lib/db';
import { HomeView } from '@/components/home/HomeView';

export const revalidate = 60; // Revalidate every 60s for fresh inventory

export default async function HomePage() {
  const categories = await db.getCategories();
  const { products: featuredProducts } = await db.getProducts({ featured: true, limit: 4 });
  const { products: newArrivals } = await db.getProducts({ isNew: true, limit: 4 });
  const { products: allProducts } = await db.getProducts({ limit: 8 });
  const reviews = await db.getReviews();

  return (
    <HomeView
      categories={categories}
      featuredProducts={featuredProducts}
      newArrivals={newArrivals}
      allProducts={allProducts}
      reviews={reviews}
    />
  );
}
