'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductFormValues } from '@/lib/validations/product';
import { updateProduct, getProductById, deleteProduct } from '@/app/actions/products';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
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
    <>
      <ProductForm 
        title="Edit Product"
        initialData={product}
        onSubmit={onSubmit}
        onDelete={onDelete}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
      />

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-6 overflow-hidden z-[201] text-zinc-900 dark:text-zinc-100">
          <DialogHeader className="flex flex-col gap-2">
            <DialogTitle className="text-lg font-black tracking-tight text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Product
            </DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Are you sure you want to delete this product?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                executeDelete();
                setShowDeleteConfirm(false);
              }}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
