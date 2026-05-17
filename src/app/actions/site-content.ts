'use server';

import { unstable_noStore as noStore } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import SiteContent, { defaultSiteContent } from '@/lib/models/SiteContent';

export async function getSiteContent() {
  noStore();
  await dbConnect();
  const doc = await SiteContent.findOneAndUpdate(
    { key: defaultSiteContent.key },
    { $setOnInsert: defaultSiteContent },
    { upsert: true, returnDocument: 'after' }
  ).lean();

  console.log('[site-content] fetched homepage content from Mongo');
  
  // Ensure "about" and other new sections exist for older documents
  const finalContent = {
    ...defaultSiteContent.content,
    ...(doc?.content || {}),
    about: {
      ...defaultSiteContent.content.about,
      ...(doc?.content?.about || {}),
    }
  };

  if (finalContent.home?.hero?.subtitle) {
    finalContent.home.hero.subtitle = finalContent.home.hero.subtitle
      .replace(/hand-ASDAedits/g, 'hand-picked fashion edits')
      .replace(/coveteddAD/g, 'coveted looks');
  }

  const result = doc ? { ...doc, content: finalContent } : defaultSiteContent;
  return JSON.parse(JSON.stringify(result));
}

export async function getPinnedStoreProducts() {
  const content = await getSiteContent();
  const pinnedIds = content?.content?.home?.store?.pinnedProductIds || [];

  if (!Array.isArray(pinnedIds) || pinnedIds.length === 0) return [];

  await dbConnect();
  const products = await Product.find({
    _id: { $in: pinnedIds },
    status: 'published',
  }).lean();

  const byId = new Map(products.map((product: any) => [String(product._id), product]));
  const pinnedProducts = pinnedIds
    .map((id: string) => byId.get(String(id)))
    .filter(Boolean)
    .map((product) => JSON.parse(JSON.stringify(product)));

  console.log(`[site-content] fetched ${pinnedProducts.length} pinned store product(s) from Mongo`);
  return pinnedProducts;
}
