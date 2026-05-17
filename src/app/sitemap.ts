import { MetadataRoute } from 'next';
import { getAllProducts, getLatestBlogs, getPublicCategories } from '@/app/actions/storefront';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://fashcon.store';

  const [categoriesResult, productsResult, blogsResult] = await Promise.allSettled([
    getPublicCategories('product'),
    getAllProducts(),
    getLatestBlogs(),
  ]);

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
  const blogs = blogsResult.status === 'fulfilled' ? blogsResult.value : [];

  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/blog',
    '/categories',
    '/privacy-policy',
    '/disclaimer',
    '/affiliate',
    '/terms-of-use',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const categoryRoutes = categories.map((cat: any) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const productRoutes = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const postRoutes = blogs.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug || post._id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...postRoutes];
}
