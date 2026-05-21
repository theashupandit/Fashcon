'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  X, 
  AlertTriangle,
  Loader2,
  PackageOpen
} from 'lucide-react';
import { 
  getTrashProducts, 
  restoreProduct, 
  hardDeleteProduct 
} from '@/app/actions/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';

interface TrashPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function TrashPanel({ isOpen, onClose, onRefresh }: TrashPanelProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const { products } = await getTrashProducts();
      setProducts(products);
    } catch (error) {
      toast.error('Failed to fetch trash');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTrash();
    }
  }, [isOpen]);

  const handleRestore = async (id: string) => {
    try {
      await restoreProduct(id);
      toast.success('Product restored successfully');
      fetchTrash();
      onRefresh();
    } catch (error) {
      toast.error('Failed to restore product');
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!window.confirm('PERMANENT DELETION: Are you absolutely sure? This cannot be undone.')) return;
    try {
      await hardDeleteProduct(id);
      toast.success('Product permanently deleted');
      fetchTrash();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-[110] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Vault Trash</h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Soft-deleted products</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Scanning graveyard...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4 text-center">
                  <PackageOpen className="w-16 h-16 stroke-[1]" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Trash is empty</p>
                    <p className="text-[10px] uppercase tracking-widest">No products in the vault graveyard</p>
                  </div>
                </div>
              ) : (
                products.map((product) => (
                  <motion.div
                    layout
                    key={product._id}
                    className="p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl space-y-4 group"
                  >
                    <div className="flex gap-4">
                      {product.media?.mainImage ? (
                        <img 
                          src={product.media.mainImage} 
                          alt={product.title} 
                          className="w-14 h-14 object-cover rounded-lg bg-zinc-200 dark:bg-zinc-800 grayscale group-hover:grayscale-0 transition-all"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate text-zinc-900 dark:text-zinc-100">{product.title}</h4>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">{product.brand || 'No Brand'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 opacity-50">{product.category}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/50 dark:border-white/5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(product._id)}
                        className="flex-1 h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-zinc-900 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50 transition-all gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!isSuperAdmin}
                        onClick={() => handleHardDelete(product._id)}
                        className={cn(
                          "flex-1 h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider gap-1.5",
                          isSuperAdmin 
                            ? "hover:bg-red-500/10 hover:text-red-500 transition-all" 
                            : "opacity-20 cursor-not-allowed"
                        )}
                        title={!isSuperAdmin ? "Only Super Admin can hard delete" : ""}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Purge
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {!isSuperAdmin && (
              <div className="p-6 bg-amber-500/5 border-t border-zinc-100 dark:border-white/5">
                <div className="flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-[10px] leading-normal text-amber-600/80 font-medium">
                    You are in <span className="font-bold">Admin Mode</span>. You can restore items, but permanent purging is reserved for <span className="font-bold">Super Admins</span>.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
