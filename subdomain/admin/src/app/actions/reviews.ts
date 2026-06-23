'use server';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Review from '@/lib/models/Review';
import { requireAdmin, logAdminAction } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';

/**
 * Recalculates and updates a product's average rating and review count.
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
 * Gets reviews for admin dashboard with search, pagination, and filtering.
 */
export async function getReviews(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  productId?: string;
} = {}) {
  const { page = 1, limit = 10, search, status, productId } = params;
  await dbConnect();
  
  // Ensure model is registered
  const ReviewModel = Review || mongoose.model('Review');
  const ProductModel = Product || mongoose.model('Product');

  const query: any = {};

  if (productId) {
    query.productId = productId;
  }

  if (status && status !== 'All Status') {
    query.status = status;
  }

  if (search) {
    // We can search by reviewer name or comment content
    query.$or = [
      { reviewerName: { $regex: search, $options: 'i' } },
      { comment: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  // Fetch reviews and populate product info
  const reviews = await ReviewModel.find(query)
    .populate({
      path: 'productId',
      select: 'title slug',
      model: ProductModel
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ReviewModel.countDocuments(query);

  return {
    reviews: JSON.parse(JSON.stringify(reviews)),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Updates a review's moderation status.
 */
export async function updateReviewStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
  await requireAdmin();
  await dbConnect();

  const review = await Review.findById(id);
  if (!review) throw new Error('Review not found');

  const oldStatus = review.status;
  review.status = status;
  await review.save();

  await syncProductRating(review.productId.toString());
  await logAdminAction('Update Review Status', `Changed review ID: ${id} status from ${oldStatus} to ${status}`);

  // Fetch product to revalidate its cache
  const product = await Product.findById(review.productId);
  if (product) {
    revalidatePath(`/products/${product.slug}`);
  }
  revalidatePath('/products');

  return { success: true };
}

/**
 * Permanently deletes a review.
 */
export async function deleteReview(id: string) {
  await requireAdmin();
  await dbConnect();

  const review = await Review.findById(id);
  if (!review) throw new Error('Review not found');

  const productId = review.productId.toString();
  await Review.findByIdAndDelete(id);

  await syncProductRating(productId);
  await logAdminAction('Delete Review', `Permanently deleted review ID: ${id}`);

  const product = await Product.findById(productId);
  if (product) {
    revalidatePath(`/products/${product.slug}`);
  }
  revalidatePath('/products');

  return { success: true };
}

/**
 * Allows an admin to manually add a review.
 */
export async function addAdminReview(
  productId: string,
  data: {
    reviewerName: string;
    reviewerEmail?: string;
    rating: number;
    comment: string;
    image?: string;
    status?: 'pending' | 'approved' | 'rejected';
  }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const { reviewerName, reviewerEmail, rating, comment, image, status = 'approved' } = data;

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

    const review = await Review.create({
      productId,
      reviewerName: reviewerName.trim(),
      reviewerEmail: reviewerEmail?.toLowerCase().trim() || undefined,
      rating,
      comment: comment.trim(),
      image,
      status
    });

    await syncProductRating(productId);
    await logAdminAction('Create Review', `Manually added review ID: ${review._id} to product ID: ${productId}`);

    revalidatePath(`/products/${product.slug}`);
    revalidatePath('/products');

    return {
      success: true,
      review: JSON.parse(JSON.stringify(review))
    };
  } catch (error: any) {
    console.error('addAdminReview error:', error);
    return { success: false, error: error.message || 'Failed to inject review.' };
  }
}

/**
 * Fetches all reviews (approved, pending, rejected) for a specific product.
 */
export async function getProductReviewsForAdmin(productId: string) {
  await dbConnect();
  try {
    const ReviewModel = Review || mongoose.model('Review');
    const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(reviews));
  } catch (error: any) {
    console.error('Failed to fetch product reviews for admin:', error);
    return [];
  }
}

/**
 * Calculates review stats for the admin dashboard.
 */
export async function getReviewStats() {
  await dbConnect();
  try {
    const ReviewModel = Review || mongoose.model('Review');
    const total = await ReviewModel.countDocuments();
    const approved = await ReviewModel.countDocuments({ status: 'approved' });
    const pending = await ReviewModel.countDocuments({ status: 'pending' });
    const rejected = await ReviewModel.countDocuments({ status: 'rejected' });
    
    const avgResult = await ReviewModel.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const average = avgResult[0]?.avgRating ? Math.round(avgResult[0].avgRating * 10) / 10 : 4.5;
    
    return { total, approved, pending, rejected, average };
  } catch (error: any) {
    console.error('Failed to get review stats:', error);
    return { total: 0, approved: 0, pending: 0, rejected: 0, average: 4.5 };
  }
}
