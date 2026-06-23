'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Review from '@/lib/models/Review';
import { revalidatePath } from 'next/cache';

/**
 * Synchronizes the average rating and review count of a product based on its approved reviews.
 */
async function syncProductRating(productId: string) {
  const reviews = await Review.find({ productId, status: 'approved' });
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 4.5, reviewsCount: 0 });
  } else {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
    await Product.findByIdAndUpdate(productId, { rating: averageRating, reviewsCount: reviews.length });
  }
}

/**
 * Fetches all approved reviews for a given product ID.
 */
export async function getProductReviews(productId: string) {
  await dbConnect();
  try {
    const reviews = await Review.find({ productId, status: 'approved' }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(reviews));
  } catch (error: any) {
    console.error('Failed to get product reviews:', error);
    return [];
  }
}

/**
 * Submits a new review from a customer on the storefront.
 */
export async function addCustomerReview(data: {
  productId: string;
  reviewerName: string;
  reviewerEmail?: string;
  rating: number;
  comment: string;
  image?: string;
}) {
  await dbConnect();
  try {
    const { productId, reviewerName, reviewerEmail, rating, comment, image } = data;

    if (!productId || !reviewerName.trim() || !comment.trim()) {
      return { success: false, error: 'Product ID, reviewer name, and comment are required.' };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5.' };
    }

    const product = await Product.findById(productId);
    if (!product) {
      return { success: false, error: 'Product not found.' };
    }

    const newReview = await Review.create({
      productId,
      reviewerName: reviewerName.trim(),
      reviewerEmail: reviewerEmail?.toLowerCase().trim() || undefined,
      rating,
      comment: comment.trim(),
      image,
      status: 'approved' // Automatically approve for instant feedback (moderator can reject/delete later)
    });

    await syncProductRating(productId);
    
    // Revalidate the product details path
    revalidatePath(`/products/${product.slug}`);
    revalidatePath('/'); // Revalidate homepage in case the product is featured

    return { 
      success: true, 
      review: JSON.parse(JSON.stringify(newReview)) 
    };
  } catch (error: any) {
    console.error('Add customer review error:', error);
    return { success: false, error: error.message || 'Failed to submit review.' };
  }
}
