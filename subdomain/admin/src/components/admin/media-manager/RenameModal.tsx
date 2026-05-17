'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from 'framer-motion'

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newName: string) => void
  defaultValue: string
  title?: string
  label?: string
  placeholder?: string
}

export function RenameModal({
  isOpen,
  onClose,
  onConfirm,
  defaultValue,
  title = "Rename Item",
  label = "New Name",
  placeholder = "Enter name..."
}: RenameModalProps) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue)
    }
  }, [defaultValue, isOpen])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (value.trim()) {
      onConfirm(value.trim())
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[400px] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden p-0 gap-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        
        <DialogHeader className="p-6 pb-2 relative z-10 select-none">
          <DialogTitle className="text-lg font-black uppercase tracking-tighter text-white/90">
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="rename-input" className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
              {label}
            </Label>
            <div className="relative group">
              <Input
                id="rename-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="h-11 bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder:text-white/20 transition-all rounded-xl"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit()
                }}
              />
              <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
            </div>
          </div>

          <DialogFooter className="flex items-center gap-2 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 h-10 rounded-xl hover:bg-white/5 text-white/60 text-[11px] font-bold uppercase tracking-widest transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-[1.5] h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
