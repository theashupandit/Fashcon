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
  const pinnedIdsRow1 = content?.content?.home?.store?.pinnedProductIds || [];
  const pinnedIdsRow2 = content?.content?.home?.store?.pinnedProductIdsRow2 || [];

  const allPinnedIds = [...pinnedIdsRow1, ...pinnedIdsRow2];

  if (!Array.isArray(allPinnedIds) || allPinnedIds.length === 0) return { row1: [], row2: [] };

  await dbConnect();
  const products = await Product.find({
    _id: { $in: allPinnedIds },
    status: 'published',
  }).lean();

  const byId = new Map(products.map((product: any) => [String(product._id), product]));
  
  const row1 = pinnedIdsRow1
    .map((id: string) => byId.get(String(id)))
    .filter(Boolean)
    .map((product) => JSON.parse(JSON.stringify(product)));

  const row2 = pinnedIdsRow2
    .map((id: string) => byId.get(String(id)))
    .filter(Boolean)
    .map((product) => JSON.parse(JSON.stringify(product)));

  console.log(`[site-content] fetched ${row1.length} (Row 1) and ${row2.length} (Row 2) pinned store product(s) from Mongo`);
  return { row1, row2 };
}

import SiteSettings from "@/lib/models/SiteSettings";

export async function getStorefrontSiteSettings() {
  await dbConnect();
  // @ts-ignore
  let doc = await SiteSettings.findOne().lean();
  if (!doc) {
    // @ts-ignore
    doc = await SiteSettings.create({});
  }
  return JSON.parse(JSON.stringify(doc));
}
