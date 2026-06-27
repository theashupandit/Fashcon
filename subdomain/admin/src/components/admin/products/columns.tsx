'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  Copy,
  Edit2,
  ExternalLink,
  MoreVertical,
  ShoppingBag,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SafeImage } from '@/components/ui/SafeImage';
import { getCloudinaryThumbnailUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

export interface Product {
  _id: string;
  title: string;
  brand: string;
  category: string;
  status: 'draft' | 'published';
  badge: string;
  prices: {
    original: number;
    offer: number;
    discountPercentage: number;
  };
  affiliate: {
    platform: string;
    mainLink: string;
    clicks?: number;
  };
  media: {
    mainImage: string;
  };
  isFeatured: boolean;
  createdAt: string;
}

type ColumnActions = {
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleStatus: (product: Product) => void;
};

export function getColumns(actions: ColumnActions): ColumnDef<Product>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-[var(--border)] rounded-md data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-[var(--border)] rounded-md data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Product details
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        </button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--background)] overflow-hidden border border-[var(--border)] shrink-0 shadow-sm relative group-hover:scale-105 transition-all duration-500">
              {product.media?.mainImage ? (
                <SafeImage
                  src={getCloudinaryThumbnailUrl(product.media.mainImage)}
                  alt={product.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  fill
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--card)]">
                  <ShoppingBag className="w-4 h-4 opacity-20" />
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-1 right-1 bg-amber-400 p-0.5 rounded-full shadow-lg ring-2 ring-[var(--card)]">
                  <Star className="w-2 h-2 text-white fill-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 max-w-[110px] md:max-w-[320px]">
              <p className="text-[13px] font-bold text-[var(--foreground)] tracking-tight leading-tight truncate">
                {product.title}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-[var(--primary)] tracking-widest uppercase opacity-60 truncate max-w-[80px]">
                  {product.brand || 'NO BRAND'}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--border)] hidden sm:inline-block" />
                <span className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest px-2 py-0.5 bg-[var(--foreground)]/5 rounded-full border border-[var(--border)]/50 truncate max-w-[90px] hidden sm:inline-block">
                  {product.category || 'UNCATEGORIZED'}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'prices.offer',
      id: 'pricing',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Pricing
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        </button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col gap-0">
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-bold text-[var(--foreground)] tracking-tight">
                ₹{product.prices?.offer?.toLocaleString()}
              </span>
              {product.prices?.discountPercentage > 0 && (
                <span className="text-[10px] font-bold text-emerald-500 ml-1">
                  -{product.prices.discountPercentage}%
                </span>
              )}
            </div>
            {product.prices?.original > product.prices?.offer && (
              <span className="text-[9px] font-bold text-[var(--muted-foreground)] line-through opacity-20">
                ₹{product.prices.original.toLocaleString()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'affiliate.platform',
      id: 'affiliate',
      header: () => (
        <span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">
          Platform
        </span>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col gap-1">
            <Badge
              variant="outline"
              className="w-fit text-[8px] font-bold px-2 py-0 border-[var(--border)] bg-[var(--foreground)]/5 text-[var(--muted-foreground)] uppercase"
            >
              {product.affiliate?.platform || 'DIRECT'}
            </Badge>
            <a
              href={product.affiliate?.mainLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-bold text-[var(--primary)] hover:opacity-100 opacity-40 transition-all flex items-center gap-1 group/link"
            >
              LINK <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        );
      },
    },
    {
      accessorKey: 'affiliate.clicks',
      id: 'clicks',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all mx-auto"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Clicks
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        </button>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col items-center">
            <span className="text-[14px] font-bold text-[var(--foreground)]">
              {product.affiliate?.clicks || 0}
            </span>
            <span className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase opacity-30 leading-none">Hits</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: () => (
        <span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">
          Status
        </span>
      ),
      cell: ({ row }) => {
        const product = row.original;
        const isPublished = product.status === 'published';
        return (
          <button
            onClick={() => actions.onToggleStatus(product)}
            className={cn(
              'inline-flex items-center gap-2 text-[9px] font-bold px-3 py-1 rounded-xl transition-all border uppercase',
              isPublished
                ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10 hover:bg-emerald-500/10'
                : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--card)]'
            )}
          >
            <span
              className={cn(
                'w-1 h-1 rounded-full',
                isPublished ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-neutral-300'
              )}
            />
            {product.status}
          </button>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        </button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-tight">
              {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
            <span className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest opacity-20">
              {date.getFullYear()}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-2xl hover:bg-[var(--primary)]/5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[var(--card)] border border-[var(--border)] shadow-md rounded-xl p-1"
            >
              <DropdownMenuLabel className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 py-1.5">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href={`/products/${product._id}/edit`}
                  className="flex items-center gap-2 cursor-pointer rounded-md py-2 px-2 focus:bg-[var(--primary)]/5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-semibold text-xs tracking-wide">Edit</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onDuplicate(product._id)}
                className="flex items-center gap-2 cursor-pointer rounded-md py-2 px-2 focus:bg-[var(--primary)]/5"
              >
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-semibold text-xs tracking-wide">Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--border)] my-1 mx-2" />
              <DropdownMenuItem
                onClick={() => actions.onDelete(product._id)}
                className="flex items-center gap-2 text-rose-500 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer rounded-md py-2 px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="font-semibold text-xs tracking-wide">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
