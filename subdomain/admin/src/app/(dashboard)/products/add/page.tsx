'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductFormValues } from '@/lib/validations/product';
import { createProduct } from '@/app/actions/products';

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const newProduct = await createProduct(data);
      toast.success('Product created successfully');
      router.push(`/products/${newProduct._id}/edit`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProductForm 
      title="Add Product"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
