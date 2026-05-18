import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Blog from '@/lib/models/Blog';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fullXml = url.searchParams.get('fullXml');

    if (fullXml === 'true') {
      const sitemapPath = path.join(process.cwd(), '../../public/sitemap.xml');
      if (fs.existsSync(sitemapPath)) {
        const xml = fs.readFileSync(sitemapPath, 'utf8');
        return new NextResponse(xml, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': 'attachment; filename="sitemap.xml"',
          },
        });
      } else {
        return NextResponse.json({ error: 'Sitemap file not found. Please click Generate first.' }, { status: 404 });
      }
    }

    await dbConnect();

    // Fetch site data
    const [products, categories, blogs] = await Promise.all([
      Product.find({}).select('slug updatedAt').lean(),
      Category.find({}).select('slug type').lean(),
      Blog.find({ status: 'published' }).select('slug updatedAt').lean(),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fashcon.store';

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
    ];

    return NextResponse.json({
      success: true,
      baseUrl,
      counts: {
        static: staticRoutes.length,
        products: products.length,
        categories: categories.length,
        blogs: blogs.length,
        total: staticRoutes.length + products.length + categories.length + blogs.length,
      },
      preview: {
        static: staticRoutes.map(r => `${baseUrl}${r}`),
        products: products.slice(0, 5).map((p: any) => `${baseUrl}/products/${p.slug}`),
        categories: categories.slice(0, 5).map((c: any) => `${baseUrl}/category/${c.slug}`),
        blogs: blogs.slice(0, 5).map((b: any) => `${baseUrl}/blog/${b.slug}`),
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Fetch site data
    const [products, categories, blogs] = await Promise.all([
      Product.find({}).select('slug updatedAt').lean(),
      Category.find({}).select('slug type').lean(),
      Blog.find({ status: 'published' }).select('slug updatedAt').lean(),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fashcon.store';

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
    ];

    // Build sitemap XML string
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 1. Static Routes
    staticRoutes.forEach((route) => {
      const priority = route === '' ? '1.0' : '0.8';
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // 2. Category Routes
    categories.forEach((cat: any) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/category/${cat.slug}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // 3. Product Routes
    products.forEach((prod: any) => {
      const lastmod = prod.updatedAt ? new Date(prod.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/products/${prod.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // 4. Blog Routes
    blogs.forEach((post: any) => {
      const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString();
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += '</urlset>';

    // Write file to storefront public directory
    const sitemapPath = path.join(process.cwd(), '../../public/sitemap.xml');
    
    // Ensure parent directory exists (defensive programming)
    const dir = path.dirname(sitemapPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(sitemapPath, xml, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Sitemap compiled and written to public/sitemap.xml successfully.',
      path: sitemapPath,
      counts: {
        static: staticRoutes.length,
        products: products.length,
        categories: categories.length,
        blogs: blogs.length,
        total: staticRoutes.length + products.length + categories.length + blogs.length,
      },
      xmlPreview: xml.slice(0, 1000) + '\n... [truncated] ...'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
