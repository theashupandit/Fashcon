"use client"

import React from "react"
import { UseFormRegister, FieldErrors, Control, useController } from "react-hook-form"
import { Upload, X, Eye } from "lucide-react"
import { SiteSettingsFormValues } from "@/lib/siteSettingsSchema"
import Image from "next/image"

// ── Section Card ─────────────────────────────────────────────────────────────
export function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
      <div className="flex items-start gap-3 pb-4 border-b border-white/8">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-base">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-foreground/90">{title}</h3>
          {description && <p className="text-xs text-foreground/40 mt-0.5 font-medium">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Field Group ───────────────────────────────────────────────────────────────
export function FieldGroup({
  label,
  hint,
  error,
  children,
  required,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/50 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-foreground/30 font-medium">{hint}</p>}
      {error && <p className="text-[11px] text-rose-400 font-semibold">{error}</p>}
    </div>
  )
}

// ── Base Input ────────────────────────────────────────────────────────────────
export function Input({
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      className={`w-full h-10 px-4 rounded-xl bg-white/5 border ${
        error ? "border-rose-500/50" : "border-white/10"
      } text-sm font-medium text-foreground placeholder:text-foreground/25
      focus:outline-none focus:border-white/25 focus:bg-white/8
      transition-all duration-200 ${className}`}
      {...props}
    />
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({
  error,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <textarea
      className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
        error ? "border-rose-500/50" : "border-white/10"
      } text-sm font-medium text-foreground placeholder:text-foreground/25
      focus:outline-none focus:border-white/25 focus:bg-white/8
      transition-all duration-200 resize-none ${className}`}
      {...props}
    />
  )
}

// ── Code Editor Textarea ──────────────────────────────────────────────────────
export function CodeEditor({
  label,
  hint,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
  error?: string
}) {
  return (
    <FieldGroup label={label} hint={hint} error={error}>
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 gap-2 border-b border-white/8 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
          <span className="ml-auto text-[10px] font-mono text-foreground/20 tracking-widest">HTML/JS</span>
        </div>
        <textarea
          className={`w-full pt-10 px-4 pb-4 rounded-xl bg-black/40 border ${
            error ? "border-rose-500/50" : "border-white/8"
          } text-[12px] font-mono text-emerald-300/80 placeholder:text-foreground/15
          focus:outline-none focus:border-white/20
          transition-all duration-200 resize-none min-h-[160px]`}
          spellCheck={false}
          {...props}
        />
      </div>
    </FieldGroup>
  )
}

// ── Image Uploader ────────────────────────────────────────────────────────────
export function ImageUploader({
  label,
  hint,
  value,
  onChange,
  aspectRatio = "1:1",
}: {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  aspectRatio?: "1:1" | "16:9" | "auto"
}) {
  // In production: trigger Cloudinary upload widget here
  const handleClick = () => {
    // @ts-ignore
    if (typeof window !== "undefined" && (window as any).cloudinary) {
      // @ts-ignore
      const widget = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'Collection',
          sources: ["local", "url", "camera"],
          multiple: false,
          maxFiles: 1,
        },
        (error: any, result: any) => {
          if (!error && result?.event === "success") {
            onChange(result.info.secure_url)
          }
        }
      )
      widget.open()
    } else {
      // Dev fallback — prompt URL
      const url = prompt("Enter image URL (dev mode):")
      if (url) onChange(url)
    }
  }

  const heightClass = aspectRatio === "16:9" ? "h-28" : "h-20"

  return (
    <FieldGroup label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <div
          onClick={handleClick}
          className={`relative flex-shrink-0 ${
            aspectRatio === "16:9" ? "w-48" : "w-20"
          } ${heightClass} rounded-xl border border-dashed border-white/15 bg-white/3
          flex flex-col items-center justify-center cursor-pointer
          hover:border-white/30 hover:bg-white/6 transition-all duration-200 group overflow-hidden`}
        >
          {value ? (
            <>
              <Image src={value} alt={label} fill className="object-contain" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-foreground/25 group-hover:text-foreground/50 transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 mt-1.5">Upload</span>
            </>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClick}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Choose File
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </FieldGroup>
  )
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
export function Toggle({
  checked,
  onChange,
  label,
  description,
  destructive = false,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  destructive?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className={`text-sm font-bold ${destructive ? "text-rose-400" : "text-foreground/80"}`}>{label}</p>
        {description && <p className="text-[11px] text-foreground/35 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full border transition-all duration-300 ${
          checked
            ? destructive
              ? "bg-rose-500 border-rose-400"
              : "bg-emerald-500 border-emerald-400"
            : "bg-white/10 border-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${
            checked ? "left-[calc(100%-1.375rem)]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  )
}

// ── Character Count Textarea ──────────────────────────────────────────────────
export function CharCountTextarea({
  value,
  maxLength,
  onChange,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string
  maxLength: number
  onChange: (v: string) => void
  error?: string
}) {
  const len = value?.length ?? 0
  const pct = len / maxLength
  return (
    <div className="space-y-1">
      <div className="relative">
        <span className="hidden"></span>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          {...props}
        />
        <div className={`absolute bottom-3 right-3 text-[10px] font-black tabular-nums ${
          pct > 0.9 ? "text-rose-400" : pct > 0.75 ? "text-amber-400" : "text-foreground/25"
        }`}>
          {len}/{maxLength}
        </div>
      </div>
      <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            pct > 0.9 ? "bg-rose-400" : pct > 0.75 ? "bg-amber-400" : "bg-emerald-400/50"
          }`}
          style={{ width: `${Math.min(pct * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

// ── Page Selector Dropdown ────────────────────────────────────────────────────
const DEFAULT_PAGES = [
  "/privacy-policy",
  "/terms",
  "/cookie-policy",
  "/about",
  "/contact",
  "/faq",
]

export function PageSelect({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-10 px-4 rounded-xl bg-white/5 border ${
        error ? "border-rose-500/50" : "border-white/10"
      } text-sm font-medium text-foreground
      focus:outline-none focus:border-white/25
      transition-all duration-200 appearance-none cursor-pointer`}
    >
      {DEFAULT_PAGES.map((p) => (
        <option key={p} value={p} className="bg-neutral-900">
          {p}
        </option>
      ))}
    </select>
  )
}
