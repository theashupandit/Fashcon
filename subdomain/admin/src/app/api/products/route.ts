import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { productSchema } from '@/lib/validations/product';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = Number(searchParams.get('limit') || '0');

    const query: Record<string, unknown> = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    let products = Product.find(query).sort({ createdAt: -1 });
    if (limit > 0) {
      products = products.limit(limit);
    }

    return NextResponse.json(await products.lean());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate with Zod
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const productData = validation.data;
    let slug = productData.slug;

    // Slug Uniqueness Logic
    let isUnique = false;
    let counter = 0;
    let finalSlug = slug;

    while (!isUnique) {
      const existing = await Product.findOne({ slug: finalSlug });
      if (!existing) {
        isUnique = true;
      } else {
        counter++;
        finalSlug = `${slug}-${counter}`;
      }
    }

    // Create product
    const product = new Product({
      ...productData,
      slug: finalSlug
    });

    await product.save();

    return NextResponse.json({ 
      message: 'Product created successfully', 
      product 
    }, { status: 201 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
}
