'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductFormValues } from '@/lib/validations/product';
import { updateProduct, getProductById, deleteProduct } from '@/app/actions/products';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(id);
        if (!data) {
          toast.error('Product not found');
          router.push('/products');
          return;
        }
        setProduct(data);
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id, router]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProduct(id, data);
      toast.success('Product updated successfully');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setIsDeleting(true);
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      router.push('/products');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <ProductForm 
      title="Edit Product"
      initialData={product}
      onSubmit={onSubmit}
      onDelete={onDelete}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
    />
  );
}
