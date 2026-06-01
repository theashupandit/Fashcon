'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeImage } from "@/components/ui/SafeImage";
import { 
  X, 
  Search, 
  Image as ImageIcon, 
  Loader2, 
  Check,
  Filter,
  Plus,
  Scissors,
  Upload,
  Sparkles,
  FolderPlus,
  Video,
  PlayCircle,
  RotateCw,
  CheckSquare,
  Square,
  Trash2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { CropperModal } from './CropperModal';
import { ConfirmDialog } from './ConfirmDialog';
import { useTheme } from '@/components/ThemeProvider';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  imageId: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  name: string;
  type: string;
  size: string;
  createdAt: any;
  folderPath?: string;
  folderName?: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (assets: MediaItem[]) => void;
}

export default function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [uploadStats, setUploadStats] = useState({ current: 0, total: 0 });
  const [cropperState, setCropperState] = useState<{
    open: boolean;
    image: string;
    originalFile: File | null;
    isModification?: boolean;
    modificationId?: string;
  }>({
    open: false,
    image: '',
    originalFile: null,
  });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDeletingAsset, setIsDeletingAsset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; assetId: string }>({
    isOpen: false,
    assetId: ''
  });

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleDeleteAsset = async () => {
    const id = confirmDelete.assetId;
    if (!id) return;

    setIsDeletingAsset(true);
    try {
      const res = await fetch(`/api/media/assets?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete asset');
      }

      setMedia(prev => prev.filter(item => item.id !== id));
      setSelectedAssetIds(prev => prev.filter(selectedId => selectedId !== id));
      toast.success('Asset moved to recycle bin');
      setConfirmDelete({ isOpen: false, assetId: '' });
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || 'Failed to delete asset');
    } finally {
      setIsDeletingAsset(false);
    }
  };

  const handleRestoreAsset = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    try {
      const res = await fetch('/api/media/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDeleted: false })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to restore asset');
      }

      setMedia(prev => prev.filter(item => item.id !== id));
      setSelectedAssetIds(prev => prev.filter(selectedId => selectedId !== id));
      toast.success('Asset restored from recycle bin');
    } catch (err: any) {
      console.error("Restore error:", err);
      toast.error(err.message || 'Failed to restore asset');
    }
  };

  // Tools, usage filters, and grid density states
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [usageFilter, setUsageFilter] = useState<'all' | 'products' | 'categories' | 'website'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'size'>('newest');
  const [gridDensity, setGridDensity] = useState<'comfortable' | 'standard' | 'compact'>('standard');
  const [uploadQuality, setUploadQuality] = useState<'standard' | 'high' | 'original'>('standard');
  const [showTrash, setShowTrash] = useState(false);

  const fetchMedia = async (sync = false, isLoadMore = false) => {
    if (sync) {
      setIsSyncing(true);
    } else if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const nextPage = isLoadMore ? page + 1 : 1;
      const params = new URLSearchParams();
      if (sync) params.append('sync', 'true');
      if (showTrash) params.append('trash', 'true');
      params.append('page', nextPage.toString());
      params.append('limit', '50');
      
      const res = await fetch(`/api/media/assets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch media assets');
      const data = await res.json();
      const assetsList = Array.isArray(data) ? data : (data.assets || []);
      const mappedAssets = assetsList.map((item: any) => ({
        id: item._id,
        imageId: item.imageId || item._id,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        mediumUrl: item.mediumUrl,
        name: item.displayName || item.originalFilename || item.altText || item.imageId || 'Untitled',
        type: item.metadata?.format || 'image',
        size: item.metadata?.size ? Number(item.metadata.size) : 0,
        createdAt: item.createdAt,
        folderPath: item.folderPath || '',
        folderName: item.folderName || ''
      }));

      if (isLoadMore) {
        setMedia(prev => [...prev, ...mappedAssets]);
        setPage(nextPage);
      } else {
        setMedia(mappedAssets);
        setPage(1);
        setSelectedAssetIds([]);
      }
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchMedia(false, true);
    }
  }, [loading, loadingMore, hasMore, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, loadMore]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia(false, false);
    }
  }, [isOpen, showTrash]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', uploadQuality);
    const startTime = Date.now();

    try {
      const xhr = new XMLHttpRequest();
      const promise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
            const duration = (Date.now() - startTime) / 1000;
            if (duration > 0) {
              const speed = (e.loaded / 1024 / 1024) / duration; // MB/s
              setUploadSpeed(speed.toFixed(1) + ' MB/s');
            }
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error('Upload failed'));
        });
        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.open('POST', '/api/media/upload');
        xhr.send(formData);
      });
      await promise;
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleMultipleUpload = async (files: FileList | File[]) => {
    setIsUploading(true);
    const total = files.length;
    setUploadStats({ current: 0, total });
    
    for (let i = 0; i < total; i++) {
      setUploadStats({ current: i + 1, total });
      await handleUpload(files[i]);
    }
    
    const res = await fetch('/api/media/assets');
    const data = await res.json();
    const assetsList = Array.isArray(data) ? data : (data.assets || []);
    setMedia(assetsList.map((item: any) => ({
      id: item._id,
      imageId: item.imageId || item._id,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      mediumUrl: item.mediumUrl,
      name: item.displayName || item.originalFilename || item.altText || item.imageId || 'Untitled',
      type: item.metadata?.format || 'image',
      size: item.metadata?.size ? Number(item.metadata.size) : 0,
      createdAt: item.createdAt
    })));
    setIsUploading(false);
    setUploadSpeed('');
  };

  const handleFileSelect = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropperState({ open: true, image: reader.result as string, originalFile: file });
      };
      reader.readAsDataURL(file);
      return;
    }
    await handleMultipleUpload([file]);
  };

  const handleCroppedUpload = async (blob: Blob) => {
    const name = cropperState.isModification 
      ? `cropped-${cropperState.modificationId}-${Date.now()}.jpg`
      : cropperState.originalFile?.name || `asset-${Date.now()}.jpg`;
      
    const file = new File([blob], name, { type: 'image/jpeg' });
    await handleUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDraggingOver(true);
    else if (e.type === 'dragleave') setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const filteredMedia = media
    .filter(item => {
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.imageId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (typeFilter === 'image') {
        if (item.type?.match(/(mp4|mov|avi|wmv|flv|mkv|webm|video)/i)) return false;
      }
      if (typeFilter === 'video') {
        if (!item.type?.match(/(mp4|mov|avi|wmv|flv|mkv|webm|video)/i)) return false;
      }

      // Usage Purpose classification
      const path = (item.folderPath || '').toLowerCase();
      const folder = (item.folderName || '').toLowerCase();
      const filename = (item.name || '').toLowerCase();

      let itemUsage: 'products' | 'categories' | 'website' = 'website';
      if (
        path.includes('products/') || 
        path.startsWith('products') || 
        folder === 'variants' || 
        folder === 'gallery' || 
        folder === 'main' ||
        filename.includes('product')
      ) {
        itemUsage = 'products';
      } else if (
        path.startsWith('/') || 
        path.includes('category') || 
        folder === 'dress' || 
        folder === 'acccessories' || 
        folder === 'skincare' || 
        filename.includes('category')
      ) {
        itemUsage = 'categories';
      }

      if (usageFilter !== 'all' && itemUsage !== usageFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'size') {
        const sizeA = typeof a.size === 'number' ? a.size : parseFloat(String(a.size)) || 0;
        const sizeB = typeof b.size === 'number' ? b.size : parseFloat(String(b.size)) || 0;
        return sizeB - sizeA;
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          showCloseButton={false} 
          overlayClassName="bg-black/25 dark:bg-black/60 backdrop-blur-xs"
          className="!max-w-none !w-[94vw] !h-[92vh] !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 p-0 overflow-hidden flex flex-col gap-0 bg-white dark:bg-[#080808] border-zinc-200 dark:border-white/5 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.15)] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)]"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {/* Main Top Header - Compact & Sleek */}
          <header className="py-3 px-5 border-b border-zinc-200 dark:border-white/5 shrink-0 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 shrink-0">
                <ImageIcon className="text-white w-4.5 h-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold tracking-tighter uppercase italic text-zinc-900 dark:text-white leading-none">Media Studio Pro</DialogTitle>
                <p className="text-[8px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-[0.25em] mt-1">Centralized Asset Pipeline</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative group w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--primary)] opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <input 
                  placeholder="Scan archives for assets..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); }}
                  className="w-full h-9 pl-9 pr-3 bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-transparent rounded-xl font-bold text-[11px] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 focus:border-[var(--primary)]/30 focus:bg-zinc-200/50 dark:focus:bg-white/[0.05] transition-all outline-none"
                />
              </div>

              {/* Manual Cloudinary Sync/Reload Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => fetchMedia(true)} 
                disabled={isSyncing || loading}
                title="Sync and reload assets"
                className="rounded-xl h-9 w-9 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-400 dark:text-white/40 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95 shrink-0"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" /> : <RotateCw className="w-4 h-4" />}
              </Button>
              
              <div className="flex items-center gap-1.5">
                <label className="h-9 px-3.5 flex items-center gap-2 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/15 active:scale-95 shrink-0">
                  <Upload size={13} strokeWidth={3} /> Assets
                  <input 
                    type="file" 
                    multiple
                    accept="image/*,video/*" 
                    className="hidden" 
                    disabled={isUploading}
                    onChange={async (e) => {
                      if (e.target.files?.length) await handleMultipleUpload(e.target.files);
                    }} 
                  />
                </label>

                <label className="h-9 px-3.5 flex items-center gap-2 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10 transition-all active:scale-95 shrink-0">
                  <FolderPlus size={13} strokeWidth={3} className="text-[var(--primary)]" /> Folders
                  <input 
                    type="file" 
                    {...({ webkitdirectory: "", directory: "" } as any)}
                    className="hidden" 
                    disabled={isUploading}
                    onChange={async (e) => {
                      if (e.target.files?.length) await handleMultipleUpload(e.target.files);
                    }} 
                  />
                </label>
              </div>

              <div className="w-px h-6 bg-zinc-200 dark:bg-white/5 mx-1 shrink-0" />

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="rounded-xl h-9 w-9 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-400 dark:text-white/40 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-500 hover:border-red-600/25 dark:hover:border-red-500/30 transition-all active:scale-95 shrink-0"
              >
                <X className="w-4.5 h-4.5" />
              </Button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Sidebar Navigation - Narrow & Functional */}
            <aside className="w-56 border-r border-zinc-200 dark:border-white/5 bg-zinc-50/20 dark:bg-white/[0.01] p-4 flex flex-col gap-5 overflow-y-auto scrollbar-hide shrink-0">
              <div className="space-y-1">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/30 ml-1 mb-2">Navigation</h3>
                <nav className="space-y-1">
                  {[
                    { icon: ImageIcon, label: 'All Media', active: !showTrash },
                    { icon: Filter, label: 'Recent', active: false },
                    { icon: Trash2, label: 'Recycle Bin', active: showTrash },
                  ].map((nav, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        if (nav.label === 'Recycle Bin') setShowTrash(true);
                        else setShowTrash(false);
                      }}
                      className={cn(
                        "w-full h-8 flex items-center gap-3 px-3 rounded-lg text-[11px] font-bold transition-all",
                        nav.active ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white"
                      )}
                    >
                      <nav.icon size={13} className="shrink-0" />
                      {nav.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Sidebar Tools replacing old filters */}
              <div className="space-y-4 pt-2 border-t border-zinc-200/50 dark:border-white/5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/30 ml-1">Tools & Filters</h3>
                
                {/* 1. Filter by Media Type */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-white/35 uppercase tracking-wider ml-1">Media Type</span>
                  <div className="grid grid-cols-3 gap-0.5 bg-zinc-100 dark:bg-white/5 p-0.5 rounded-lg border border-zinc-200/40 dark:border-white/5">
                    {(['all', 'image', 'video'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTypeFilter(t); }}
                        className={cn(
                          "h-6 rounded-md text-[9px] font-black uppercase transition-all whitespace-nowrap shrink-0",
                          typeFilter === t 
                            ? "bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-xs" 
                            : "text-zinc-500 hover:text-zinc-900 dark:text-white/30 dark:hover:text-white"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Usage Purpose Filter */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-white/35 uppercase tracking-wider ml-1">Usage Purpose</span>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-100 dark:bg-white/5 p-1 rounded-lg border border-zinc-200/40 dark:border-white/5">
                    {[
                      { value: 'all', label: 'All Uses' },
                      { value: 'products', label: 'Products' },
                      { value: 'categories', label: 'Categories' },
                      { value: 'website', label: 'Website/UI' },
                    ].map((u) => (
                      <button
                        key={u.value}
                        onClick={() => setUsageFilter(u.value as any)}
                        className={cn(
                          "h-6 rounded-md text-[8px] font-black uppercase transition-all whitespace-nowrap shrink-0 cursor-pointer",
                          usageFilter === u.value 
                            ? "bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-xs" 
                            : "text-zinc-500 hover:text-zinc-900 dark:text-white/30 dark:hover:text-white"
                        )}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Sort Order */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-white/35 uppercase tracking-wider ml-1">Sort By</span>
                  <div className="grid grid-cols-3 gap-0.5 bg-zinc-100 dark:bg-white/5 p-0.5 rounded-lg border border-zinc-200/40 dark:border-white/5">
                    {(['newest', 'name', 'size'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSortBy(s); }}
                        className={cn(
                          "h-6 rounded-md text-[9px] font-black uppercase transition-all whitespace-nowrap shrink-0",
                          sortBy === s 
                            ? "bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-xs" 
                            : "text-zinc-500 hover:text-zinc-900 dark:text-white/30 dark:hover:text-white"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Grid Density */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-white/35 uppercase tracking-wider ml-1">Grid Size</span>
                  <div className="grid grid-cols-3 gap-0.5 bg-zinc-100 dark:bg-white/5 p-0.5 rounded-lg border border-zinc-200/40 dark:border-white/5">
                    {(['comfortable', 'standard', 'compact'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setGridDensity(d)}
                        title={d.charAt(0).toUpperCase() + d.slice(1)}
                        className={cn(
                          "h-6 rounded-md text-[9px] font-black uppercase transition-all whitespace-nowrap shrink-0",
                          gridDensity === d 
                            ? "bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-xs" 
                            : "text-zinc-500 hover:text-zinc-900 dark:text-white/30 dark:hover:text-white"
                        )}
                      >
                        {d === 'comfortable' ? 'L' : d === 'standard' ? 'M' : 'S'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Selection Actions */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-white/35 uppercase tracking-wider ml-1">Selection</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        const allIds = filteredMedia.map(item => item.id);
                        setSelectedAssetIds(allIds);
                      }}
                      className="h-7 border border-zinc-200 dark:border-white/5 rounded-lg text-[9px] font-black text-zinc-500 dark:text-white/30 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-transparent transition-all uppercase flex items-center justify-center gap-1 shrink-0"
                    >
                      <CheckSquare size={10} className="shrink-0" /> All
                    </button>
                    <button
                      onClick={() => setSelectedAssetIds([])}
                      disabled={selectedAssetIds.length === 0}
                      className="h-7 border border-zinc-200 dark:border-white/5 rounded-lg text-[9px] font-black text-zinc-500 dark:text-white/30 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-transparent transition-all uppercase flex items-center justify-center gap-1 disabled:opacity-30 disabled:pointer-events-none shrink-0"
                    >
                      <Square size={10} className="shrink-0" /> Clear
                    </button>
                  </div>
                </div>

                {/* 5. Upload Quality Profile */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-200/50 dark:border-white/5">
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-white/35 uppercase tracking-wider ml-1">Upload Quality</span>
                  <div className="grid grid-cols-3 gap-0.5 bg-zinc-100 dark:bg-white/5 p-0.5 rounded-lg border border-zinc-200/40 dark:border-white/5">
                    {(['standard', 'high', 'original'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setUploadQuality(q)}
                        title={q === 'standard' ? 'Standard 1200px' : q === 'high' ? 'High Quality 2400px' : 'Original resolution'}
                        className={cn(
                          "h-6 rounded-md text-[8px] font-black uppercase transition-all whitespace-nowrap shrink-0 cursor-pointer",
                          uploadQuality === q 
                            ? "bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-xs" 
                            : "text-zinc-500 hover:text-zinc-900 dark:text-white/30 dark:hover:text-white"
                        )}
                      >
                        {q === 'standard' ? 'Std' : q === 'high' ? 'High' : 'Orig'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area Wrapper to avoid scrolling the floating status panels */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <main 
                className="flex-1 overflow-y-auto p-5 scrollbar-hide relative"
              >
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 py-20">
                    <Loader2 className="w-9 h-9 text-[var(--primary)] animate-spin" />
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-700 dark:text-white opacity-40">Scanning archives...</p>
                      <p className="text-[8px] font-bold text-zinc-400 dark:text-white/10 uppercase tracking-widest mt-1">Retrieving Visual Metadata</p>
                    </div>
                  </div>
                ) : filteredMedia.length > 0 ? (
                  <div className={cn(
                    "grid pb-20 transition-all",
                    gridDensity === 'comfortable' 
                      ? "grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5"
                      : gridDensity === 'standard'
                      ? "grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3.5"
                      : "grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2"
                  )}>
                    {filteredMedia.map((item) => (
                      <div 
                        key={item.id}
                        className={cn(
                          "group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer select-none",
                          selectedAssetIds.includes(item.id)
                            ? "border-[var(--primary)] ring-4 ring-[var(--primary)]/10 scale-[0.97] shadow-lg shadow-[var(--primary)]/15" 
                            : "border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] hover:border-zinc-300 dark:hover:border-white/15"
                        )}
                        onClick={() => {
                          setSelectedAssetIds(prev => 
                            prev.includes(item.id) 
                              ? prev.filter(id => id !== item.id) 
                              : [...prev, item.id]
                          );
                        }}
                      >
                        {item.type?.match(/(mp4|mov|avi|wmv|flv|mkv|webm|video)/i) ? (
                          <div className="absolute inset-0 bg-black flex items-center justify-center">
                            <SafeImage 
                              src={item.thumbnailUrl || item.url} 
                              alt={item.name} 
                              fill
                              className="object-cover opacity-50 transition-all duration-700 group-hover:scale-110"
                            />
                            <PlayCircle className={cn(
                              "text-white/80 group-hover:text-white transition-colors relative z-10 shrink-0",
                              gridDensity === 'compact' ? "w-6 h-6" : "w-10 h-10"
                            )} strokeWidth={1.5} />
                            
                            {/* Video Badge - bottom left to avoid top left checkmark */}
                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 rounded-md backdrop-blur-md border border-white/10 flex items-center gap-1 z-20 pointer-events-none">
                              <Video size={8} className="text-[var(--primary)] shrink-0" />
                              {gridDensity !== 'compact' && (
                                <span className="text-[7px] font-black text-white uppercase tracking-widest">Video</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <SafeImage 
                            src={item.thumbnailUrl || item.mediumUrl || item.url} 
                            alt={item.name} 
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                            sizes="(max-width: 768px) 30vw, 15vw"
                          />
                        )}
                        
                        {/* Interaction Layer */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        
                        {/* Redesigned Selection Checkbox Indicator */}
                        <div className="absolute top-2 left-2 z-30 transition-all duration-200">
                          {selectedAssetIds.includes(item.id) ? (
                            <div className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg border border-[var(--primary)] shrink-0 animate-in zoom-in-75 duration-200">
                              <Check className="w-3.5 h-3.5" strokeWidth={4} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-1.5 border-white/55 dark:border-white/35 bg-black/15 dark:bg-black/35 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0" />
                          )}
                        </div>

                        {/* Floating Actions - Minimal crop and delete/restore buttons */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-30">
                          {!showTrash && (
                            <Button 
                              size="icon" 
                              variant="secondary"
                              className="w-7 h-7 rounded-lg bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white hover:bg-[var(--primary)] dark:hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-white transition-all shrink-0 active:scale-90"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCropperState({ open: true, image: item.url, originalFile: null, isModification: true, modificationId: item.id });
                              }}
                            >
                              <Scissors size={12} strokeWidth={2.5} className="shrink-0" />
                            </Button>
                          )}
                          
                          {showTrash ? (
                            <Button 
                              size="icon" 
                              variant="secondary"
                              className="w-7 h-7 rounded-lg bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 text-emerald-500 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all shrink-0 active:scale-90"
                              onClick={(e) => handleRestoreAsset(e, item.id)}
                              title="Restore asset"
                            >
                              <RotateCw size={12} strokeWidth={2.5} className="shrink-0" />
                            </Button>
                          ) : (
                            <Button 
                              size="icon" 
                              variant="secondary"
                              className="w-7 h-7 rounded-lg bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shrink-0 active:scale-90"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete({ isOpen: true, assetId: item.id });
                              }}
                              title="Move to recycle bin"
                            >
                              <Trash2 size={12} strokeWidth={2.5} className="shrink-0" />
                            </Button>
                          )}
                        </div>

                        {/* Label Overlay - Hidden in compact mode */}
                        {gridDensity !== 'compact' && (
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                            <p className="text-[9px] font-black text-white truncate uppercase tracking-widest">{item.name}</p>
                            <p className="text-[7px] font-bold text-white/40 uppercase tracking-[0.15em] mt-0.5">
                              {item.type} • {item.size ? `${Math.round(Number(item.size))} KB` : '0 KB'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 py-20 opacity-25">
                    <div className="w-16 h-16 rounded-2xl border border-dashed border-zinc-300 dark:border-white/20 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                      <ImageIcon size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-white/40">No archives found</p>
                      <p className="text-[9px] font-medium mt-1 text-zinc-400 dark:text-white/30">Try refining your scan parameters</p>
                    </div>
                  </div>
                )}

                {/* Intersection Observer Target for Infinite Scroll */}
                <div ref={observerTarget} className="h-10 w-full flex items-center justify-center mt-4 mb-20">
                  {loadingMore && (
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 dark:border-white/5 shadow-sm animate-in fade-in duration-200">
                      <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40">Loading more assets...</span>
                    </div>
                  )}
                </div>
              </main>

              {/* Background Pipeline Status (Fixed Floating Panel) */}
              {isUploading && (
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-zinc-950/80 backdrop-blur-3xl border border-zinc-200 dark:border-white/10 rounded-2xl p-3 flex items-center gap-4 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8 duration-500 z-[60]">
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
                  </div>
                  
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800 dark:text-white">Ingesting Assets</p>
                        <span className="text-[8px] font-bold text-zinc-500 dark:text-white/30 uppercase tracking-widest bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                          File {uploadStats.current} of {uploadStats.total}
                        </span>
                      </div>
                      <p className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest italic">{uploadSpeed}</p>
                    </div>
                    
                    <div className="h-1 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--primary)] transition-all duration-300 shadow-[0_0_8px_var(--primary)]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="h-8 w-px bg-zinc-200 dark:bg-white/10 shrink-0" />

                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-black text-zinc-800 dark:text-white">{uploadProgress}%</p>
                    <p className="text-[7px] font-bold text-zinc-400 dark:text-white/20 uppercase tracking-[0.20em]">Synchronizing Archive</p>
                  </div>
                </div>
              )}

              {/* Sticky Selection Status (Fixed Floating Panel) */}
              {selectedAssetIds.length > 0 && !isUploading && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-zinc-950/80 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-2xl p-2.5 flex items-center gap-4 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-6 duration-500 z-50">
                   <div className="flex items-center gap-2.5 px-1 shrink-0">
                     <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                       {selectedAssetIds.length}
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-white/60 whitespace-nowrap">Assets Selected</span>
                   </div>
                   <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 shrink-0" />
                   <div className="flex items-center gap-1.5 shrink-0">
                     <Button variant="ghost" onClick={() => setSelectedAssetIds([])} className="h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white transition-all">Clear</Button>
                     <Button 
                       onClick={() => {
                        const selected = media.filter((item) => selectedAssetIds.includes(item.id));
                        if (selected.length > 0) onSelect(selected);
                       }}
                       className="h-8 px-6 rounded-xl bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[9px] shadow-2xl shadow-[var(--primary)]/20 active:scale-95 transition-all"
                     >
                       Confirm Selection
                     </Button>
                   </div>
                </div>
              )}
            </div>
          </div>

          {isDraggingOver && (
            <div className="absolute inset-0 z-[100] bg-[var(--primary)]/10 backdrop-blur-md border-[12px] border-dashed border-[var(--primary)]/20 m-8 rounded-[3rem] flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-32 h-32 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-2xl shadow-[var(--primary)]/40 animate-bounce">
                <Upload size={48} strokeWidth={3} />
              </div>
              <div className="text-center">
                <p className="text-4xl font-black uppercase tracking-tighter text-white">Drop to Ingest</p>
                <p className="text-[12px] font-bold uppercase tracking-[0.5em] text-[var(--primary)] mt-2">Ready for High-Fidelity Processing</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, assetId: '' })}
        onConfirm={handleDeleteAsset}
        title="Move to Recycle Bin"
        description="Are you sure you want to move this asset to the recycle bin? You can restore it later if needed."
        confirmText="Move to Bin"
        variant="danger"
        isLoading={isDeletingAsset}
      />
      <CropperModal 
        open={cropperState.open}
        onOpenChange={(open) => setCropperState(prev => ({ ...prev, open }))}
        image={cropperState.image}
        onCropComplete={handleCroppedUpload}
      />
    </>
  );
}

const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h3 className={cn("text-lg font-semibold", className)}>{children}</h3>
);
