'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertCircle, HelpCircle, Info, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return <HelpCircle className="w-6 h-6 text-[var(--primary)]" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/20';
      default:
        return 'bg-[var(--primary)] hover:opacity-90 text-white shadow-lg shadow-[var(--primary)]/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0c0c0c] rounded-[1.5rem] shadow-2xl">
        <div className="relative p-6 space-y-6">
          {/* Background Gradient Glow */}
          <div 
            className={cn(
              "absolute -top-24 -left-24 w-48 h-48 blur-[80px] opacity-20 pointer-events-none",
              variant === 'danger' ? "bg-red-500" : "bg-[var(--primary)]"
            )} 
          />

          <div className="flex items-start gap-4 relative z-10">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border",
              variant === 'danger' ? "bg-red-500/10 border-red-500/20" : "bg-[var(--primary)]/10 border-[var(--primary)]/20"
            )}>
              {getIcon()}
            </div>
            
            <div className="space-y-1">
              <DialogTitle className="text-xl font-extrabold tracking-tight dark:text-white uppercase italic italic">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 pt-2 relative z-10">
            <Button
              type="button"
              variant="ghost"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={cn(
                "flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95",
                getVariantStyles()
              )}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <AlertCircle className="w-4 h-4" />
                </motion.div>
              ) : (
                confirmText
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
