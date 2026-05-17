'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  variant = "destructive"
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent pointer-events-none" />
        
        <DialogHeader className="gap-2 relative z-10 select-none">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
            <AlertTriangle size={24} strokeWidth={2.5} />
          </div>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white/90">
            {title}
          </DialogTitle>
          <DialogDescription className="text-white/40 text-xs font-medium leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex items-center gap-2 pt-8 relative z-10">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-11 rounded-xl hover:bg-white/5 text-white/60 text-[11px] font-bold uppercase tracking-widest transition-all"
          >
            Cancel
          </Button>
          <Button 
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-[1.5] h-11 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-red-500/10 transition-all active:scale-95"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
