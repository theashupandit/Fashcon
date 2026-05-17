'use client';

import * as React from 'react';
import { SafeImage } from "@/components/ui/SafeImage";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, Columns2, Loader2, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  // Pagination (server-side)
  page: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  onPageChange: (page: number) => void;
  // Selection
  onSelectionChange?: (selectedIds: string[]) => void;
  onClearFilters?: () => void;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData extends { _id: string }, TValue>({
  columns,
  data,
  loading,
  page,
  totalPages,
  totalProducts,
  limit,
  onPageChange,
  onSelectionChange,
  onClearFilters,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row._id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Notify parent of selection changes
  React.useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    onSelectionChange?.(selectedIds);
  }, [rowSelection, onSelectionChange]);

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div>
      {/* Table Metadata & Toolbar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--border)]/50 bg-[var(--background)]/30">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {data.slice(0, 3).map((item: any, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[var(--card)] bg-[var(--border)] overflow-hidden">
                {item.images?.[0] ? (
                  <div className="relative w-full h-full">
                    <SafeImage
                      src={item.images[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] font-black">{item.name?.[0]}</div>
                )}
              </div>
            ))}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest opacity-40">
            {totalProducts} Items in Archive
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-[10px] font-semibold uppercase tracking-wider gap-2 border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] bg-transparent rounded-xl transition-all"
            >
              <Columns2 className="w-3 h-3" />
              Configure View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm p-1.5">
            <DropdownMenuLabel className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-2 py-2">
              Toggle visibility
            </DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize text-[11px] font-semibold rounded-xl cursor-pointer py-2 focus:bg-[var(--primary)]/5"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id === 'pricing'
                    ? 'Pricing'
                    : col.id === 'affiliate'
                      ? 'Affiliate'
                      : col.id === 'clicks'
                        ? 'Clicks'
                        : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto relative min-h-[400px]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-[var(--border)]/50 hover:bg-transparent bg-[var(--background)]/20">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-11 text-[9px] font-bold uppercase text-[var(--muted-foreground)] opacity-60',
                      header.id === 'select' && 'w-[60px] pl-8',
                      header.id === 'actions' && 'w-[80px] pr-8 text-right'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={columns.length} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-[var(--primary)]/10 border-t-[var(--primary)] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-ping" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold tracking-tight uppercase">Synchronizing Repository</p>
                      <p className="text-[10px] font-medium uppercase opacity-30">Accessing secure fashion database...</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={columns.length} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-[2rem] bg-[var(--background)] flex items-center justify-center border border-[var(--border)] group hover:scale-110 transition-transform duration-500 shadow-inner">
                      <ShoppingBag className="w-7 h-7 text-[var(--primary)] opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold tracking-tight uppercase">No Data Found</p>
                      <p className="text-[10px] font-medium uppercase tracking-wider opacity-30">No matches found in the product vault</p>
                    </div>
                    {onClearFilters && (
                      <Button
                        variant="link"
                        className="text-[10px] font-bold uppercase tracking-wider h-8 rounded-xl px-4 text-[var(--primary)] hover:opacity-80 transition-all mt-2"
                        onClick={onClearFilters}
                      >
                        Reset All Parameters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "border-b border-[var(--border)]/60 transition-colors group",
                    "data-[state=selected]:bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        // Prevent row click when clicking on select or actions
                        if (cell.column.id === 'select' || cell.column.id === 'actions' || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
                          e.stopPropagation();
                        }
                      }}
                      className={cn(
                        'py-3 text-[12px] font-medium transition-all group-hover:translate-x-0.5 duration-300',
                        cell.column.id === 'select' && 'pl-8',
                        cell.column.id === 'actions' && 'pr-8 text-right',
                        cell.column.id === 'clicks' && 'text-center',
                        row.getIsSelected() && 'bg-[var(--primary)]/[0.01]'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modernized Pagination */}
      <div className="px-8 py-6 border-t border-[var(--border)]/50 bg-[var(--background)]/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest opacity-40">System Status: Nominal</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
          <div className="text-[11px] font-medium uppercase tracking-wider opacity-60">
            {selectedCount > 0 ? (
              <span className="text-[var(--primary)]">{selectedCount} Manifests Selected</span>
            ) : (
              <>
                <span className="text-[var(--foreground)]">{(page - 1) * limit + 1} – {Math.min(page * limit, totalProducts)}</span>
                <span className="mx-2 opacity-30">/</span>
                <span>{totalProducts} Total Entries</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-5 rounded-xl border-[var(--border)] text-[10px] font-black uppercase tracking-[0.15em] opacity-60 hover:opacity-100 disabled:opacity-20 transition-all active:scale-95 bg-transparent"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-inner">
            <span className="text-[11px] font-black text-[var(--primary)]">{page}</span>
            <span className="text-[9px] font-black uppercase opacity-20 tracking-tighter">of</span>
            <span className="text-[11px] font-black opacity-40">{totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-10 px-5 rounded-xl border-[var(--border)] text-[10px] font-black uppercase tracking-[0.15em] opacity-60 hover:opacity-100 disabled:opacity-20 transition-all active:scale-95 bg-transparent"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
          >
            Forward
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
