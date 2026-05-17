'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  RotateCw,
  Search,
  Plus,
  Scissors,
  Copy,
  ClipboardPaste,
  Type,
  Trash2,
  ArrowDownWideNarrow,
  LayoutGrid,
  Share2,
  MoreHorizontal,
  Home,
  Clock,
  Star,
  HardDrive,
  Network,
  Cloud,
  FolderOpen,
  X,
  Filter,
  Upload,
  Minus,
  Square,
  Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Components
import { FolderTree } from '@/components/admin/media-manager/FolderTree';
import { MediaGallery } from '@/components/admin/media-manager/MediaGallery';
import { AssetSidebar } from '@/components/admin/media-manager/AssetSidebar';
import { UploadModal } from '@/components/admin/media-manager/UploadModal';
import { Breadcrumbs } from '@/components/admin/media-manager/Breadcrumbs';
import { PanelContextMenu } from '@/components/admin/media-manager/PanelContextMenu';
import { RenameModal } from '@/components/admin/media-manager/RenameModal';
import { ConfirmModal } from '@/components/admin/media-manager/ConfirmModal';
import { useAuth } from '@/lib/auth';
import { uploadMediaAsset } from '@/lib/cloudinary';

import { MediaAsset, Folder as MediaFolder } from '@/components/admin/media-manager/types';
import { useMediaSync } from '@/lib/media-context';


export default function MediaManagerPage() {
  const { user } = useAuth();
  // State
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'details'>('grid');
  const { startUpload, updateProgress, updateStats, finishUpload } = useMediaSync();

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    label: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    label: '',
    defaultValue: '',
    onConfirm: () => {},
  });

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: '',
    onConfirm: () => {},
  });



  // Clear selection when changing folder or toggling trash
  useEffect(() => {
    setSelectedIds(new Set());
    setSelectedAsset(null);
  }, [currentFolderId, showTrash]);

  // Clipboard state for context menu copy/cut/paste
  const [clipboard, setClipboard] = useState<{
    assetIds: string[];
    action: 'copy' | 'cut';
  } | null>(null);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/media/folders');
      const data = await res.json();
      setFolders(data);
    } catch (error) {
      toast.error("Failed to load folders");
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFolderId) params.append('folderId', currentFolderId);
      if (searchQuery) params.append('search', searchQuery);
      if (showTrash) params.append('trash', 'true');

      const res = await fetch(`/api/media/assets?${params.toString()}`);
      const data = await res.json();
      setAssets(data);
    } catch (error) {
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, searchQuery, showTrash]);

  // Fetch folders and assets
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCreateFolder = async (parentId: string | null) => {
    setModalConfig({
      isOpen: true,
      title: "Create New Folder",
      label: "Folder Name",
      defaultValue: "",
      onConfirm: async (name) => {
        try {
          const res = await fetch('/api/media/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, parentId })
          });
          if (res.ok) {
            fetchFolders();
            toast.success("Folder created");
          }
        } catch (error) {
          toast.error("Failed to create folder");
        }
      }
    });
  };

  const handleDeleteFolder = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Folder",
      description: "Are you sure? This folder and all its contents will be moved to the recycle bin.",
      confirmText: "Delete Folder",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/media/folders?id=${id}`, { method: 'DELETE' });
          const data = await res.json();

          if (data.hasContents) {
            // For complex scenarios like this, we'll keep it simple for now or implement a choice modal later
            // For now, we'll just delete everything if it has contents and they confirmed the first dialog
            await fetch(`/api/media/folders?id=${id}&action=delete`, { method: 'DELETE' });
          }

          fetchFolders();
          toast.success("Folder deleted");
        } catch (error) {
          toast.error("Failed to delete folder");
        }
      }
    });
  };

  const handleUpdateAsset = async (id: string, data: any) => {
    try {
      const res = await fetch('/api/media/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      });
      if (res.ok) {
        fetchAssets();
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    // If the asset is part of a selection, delete the whole selection
    const ids = selectedIds.has(id) ? Array.from(selectedIds) : [id];
    
    setConfirmConfig({
      isOpen: true,
      title: showTrash ? "Permanent Delete" : "Move to Trash",
      description: showTrash 
        ? `Are you sure you want to permanently delete ${ids.length} item(s)? This action cannot be undone.`
        : `Move ${ids.length} item(s) to the recycle bin?`,
      confirmText: showTrash ? "Delete Permanently" : "Move to Trash",
      onConfirm: async () => {
        // Optimistic Update
        const previousAssets = [...assets];
        setAssets(prev => prev.filter(a => !ids.includes(a._id)));
        if (selectedAsset && ids.includes(selectedAsset._id)) setSelectedAsset(null);
        setSelectedIds(prev => {
          const next = new Set(prev);
          ids.forEach(i => next.delete(i));
          return next;
        });

        try {
          const res = await fetch(`/api/media/assets?ids=${ids.join(',')}${showTrash ? '&hard=true' : ''}`, { method: 'DELETE' });
          const data = await res.json();

          if (!res.ok) {
            setAssets(previousAssets); // Rollback
            toast.error(data.error || "Delete failed");
            return;
          }

          toast.success(showTrash ? `${ids.length} asset(s) permanently deleted` : `${ids.length} asset(s) moved to trash`);
        } catch (error) {
          setAssets(previousAssets); // Rollback
          toast.error("Delete failed");
        }
      }
    });
  };

  const handleRestoreAsset = async (id: string) => {
    const ids = selectedIds.has(id) ? Array.from(selectedIds) : [id];

    // Optimistic Update
    const previousAssets = [...assets];
    setAssets(prev => prev.filter(a => !ids.includes(a._id)));
    setSelectedIds(new Set());

    try {
      const res = await fetch('/api/media/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, isDeleted: false })
      });

      if (res.ok) {
        toast.success(ids.length > 1 ? `${ids.length} assets restored` : "Asset restored");
      } else {
        setAssets(previousAssets); // Rollback
        const data = await res.json();
        toast.error(data.error || "Restore failed");
      }
    } catch (error) {
      setAssets(previousAssets); // Rollback
      toast.error("Restore failed");
    }
  };

  const handleUpload = async (formData: FormData) => {
    const file = formData.get('file') as File | null;
    const currentFolder = folders.find((folder) => folder._id === currentFolderId);

    if (user?._id) formData.append('adminId', user._id);
    if (currentFolder?.name) formData.append('folderName', currentFolder.name);
    if (currentFolder?.path) formData.append('folderPath', currentFolder.path);

    const startTime = Date.now();
    
    try {
      const xhr = new XMLHttpRequest();
      const promise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded * 100) / e.total);
            const duration = (Date.now() - startTime) / 1000;
            let speed = 'Calculated...';
            if (duration > 0) {
              const mbps = (e.loaded / 1024 / 1024) / duration;
              speed = mbps.toFixed(1) + ' MB/s';
            }
            updateProgress(progress, speed);
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

      const created = await promise as any;
      setAssets((prev) => [created, ...prev.filter((asset) => asset._id !== created._id)]);
      setSelectedAsset(created);
    } catch (err) {
      if (file) {
        updateProgress(50, 'Fallback Sync');
        await uploadMediaAsset(file, {
          adminId: user?._id,
          folderId: currentFolderId,
          folderName: currentFolder?.name,
          folderPath: currentFolder?.path,
        });
        updateProgress(100, 'Done');
        await fetchAssets();
      } else {
        throw new Error('Upload failed');
      }
    }
  };

  // === Context Menu Handlers ===
  const handleCopyAsset = (asset: MediaAsset) => {
    const ids = selectedIds.has(asset._id) ? Array.from(selectedIds) : [asset._id];
    setClipboard({ assetIds: ids, action: 'copy' });
    toast.success(`${ids.length} item(s) copied to clipboard`);
  };

  const handleCutAsset = (asset: MediaAsset) => {
    const ids = selectedIds.has(asset._id) ? Array.from(selectedIds) : [asset._id];
    setClipboard({ assetIds: ids, action: 'cut' });
    toast.success(`${ids.length} item(s) cut to clipboard`);
  };

  const handlePasteAsset = async () => {
    if (!clipboard) return;

    try {
      const res = await fetch('/api/media/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: clipboard.assetIds,
          targetFolderId: currentFolderId,
          action: clipboard.action,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Paste failed');
        return;
      }

      if (clipboard.action === 'cut') {
        setClipboard(null);
      }
      fetchAssets();
      toast.success(clipboard.action === 'copy' ? 'Items duplicated here' : 'Items moved here');
    } catch (error) {
      toast.error('Paste operation failed');
    }
  };

  const handleRenameAsset = async (asset: MediaAsset) => {
    const currentName = asset.displayName || asset.originalFilename;
    
    setModalConfig({
      isOpen: true,
      title: "Rename Asset",
      label: "New Name",
      defaultValue: currentName,
      onConfirm: async (newName) => {
        if (!newName || newName.trim() === currentName) return;

        try {
          const res = await fetch('/api/media/rename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId: asset._id, newName: newName.trim() }),
          });

          if (!res.ok) {
            const data = await res.json();
            toast.error(data.error || 'Rename failed');
            return;
          }

          fetchAssets();
          toast.success('Asset renamed');
        } catch (error) {
          toast.error('Rename failed');
        }
      }
    });
  };

  const handleMoveAsset = async (asset: MediaAsset) => {
    // If the asset is part of a selection, move the whole selection
    const ids = selectedIds.has(asset._id) ? Array.from(selectedIds) : [asset._id];
    const assetName = ids.length > 1 ? `${ids.length} items` : `"${asset.displayName || asset.originalFilename}"`;

    const folderOptions = folders.map(f => `${f.name}`).join(', ');
    
    setModalConfig({
      isOpen: true,
      title: `Move ${ids.length > 1 ? 'Items' : 'Asset'}`,
      label: `Available folders: ${folderOptions || 'None'}`,
      defaultValue: "",
      onConfirm: async (input) => {
        let targetFolderId: string | null = null;
        if (input.trim()) {
          const match = folders.find(
            f => f.name.toLowerCase() === input.trim().toLowerCase() || f._id === input.trim()
          );
          if (!match) {
            toast.error('Folder not found');
            return;
          }
          targetFolderId = match._id;
        }

        // Optimistic Update
        const previousAssets = [...assets];
        setAssets(prev => prev.filter(a => !ids.includes(a._id)));
        setSelectedIds(new Set());

        try {
          const res = await fetch('/api/media/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetIds: ids, targetFolderId, action: 'move' }),
          });

          if (!res.ok) {
            setAssets(previousAssets); // Rollback
            const data = await res.json();
            toast.error(data.error || 'Move failed');
            return;
          }

          toast.success(ids.length > 1 ? `${ids.length} assets moved` : 'Asset moved');
        } catch (error) {
          setAssets(previousAssets); // Rollback
          toast.error('Move failed');
        }
      }
    });
  };

  const handleContextDelete = (asset: MediaAsset) => {
    handleDeleteAsset(asset._id);
  };

  const toggleSelectAsset = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkSelect = (ids: string[]) => {
    setSelectedIds(new Set(ids));
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(assets.map(a => a._id)));
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setConfirmConfig({
      isOpen: true,
      title: showTrash ? "Permanent Bulk Delete" : "Bulk Move to Trash",
      description: showTrash 
        ? `Are you sure you want to permanently delete ${ids.length} assets? This action is irreversible.`
        : `Move ${ids.length} assets to the recycle bin?`,
      confirmText: showTrash ? "Delete All" : "Move All",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/media/assets?ids=${ids.join(',')}${showTrash ? '&hard=true' : ''}`, { method: 'DELETE' });
          const data = await res.json();

          if (!res.ok) {
            toast.error(data.error || "Bulk delete failed");
            return;
          }

          fetchAssets();
          setSelectedIds(new Set());
          toast.success(showTrash ? `Permanently deleted ${ids.length} assets` : `Moved ${ids.length} assets to trash`);
        } catch (error) {
          toast.error("Bulk delete failed");
        }
      }
    });
  };

  const handleBulkRestore = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      const res = await fetch('/api/media/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, isDeleted: false })
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Bulk restore failed");
        return;
      }

      fetchAssets();
      setSelectedIds(new Set());
      toast.success(`Restored ${ids.length} assets`);
    } catch (error) {
      toast.error("Bulk restore failed");
    }
  };

  const handleDropAssetOnFolder = async (assetId: string, targetFolderId: string | null) => {
    // If the dropped asset is part of a selection, move all selected assets
    const ids = selectedIds.has(assetId) ? Array.from(selectedIds) : [assetId];

    // Optimistic Update
    const previousAssets = [...assets];
    setAssets(prev => prev.filter(a => !ids.includes(a._id)));
    setSelectedIds(new Set());

    try {
      const res = await fetch('/api/media/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds: ids, targetFolderId, action: 'move' }),
      });

      if (res.ok) {
        toast.success(ids.length > 1 ? `${ids.length} assets moved` : 'Asset moved');
      } else {
        setAssets(previousAssets); // Rollback
        toast.error('Move failed');
      }
    } catch (error) {
      setAssets(previousAssets); // Rollback
      toast.error('Move failed');
    }
  };

  const handleShare = () => {
    if (selectedIds.size === 0) return;
    const firstId = Array.from(selectedIds)[0];
    const asset = assets.find(a => a._id === firstId);
    if (asset) {
      navigator.clipboard.writeText(asset.url);
      toast.success('Link copied to clipboard');
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === 'name') return (a.displayName || a.originalFilename).localeCompare(b.displayName || b.originalFilename);
    if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'size') return (b.metadata?.size || 0) - (a.metadata?.size || 0);
    return 0;
  });

  const [isMobileLibraryOpen, setIsMobileLibraryOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleGlobalDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only show the ingestion overlay if we are dragging external files
    const isFileDrag = e.dataTransfer.types.includes('Files');
    if (!isFileDrag) return;

    if (e.type === 'dragenter' || e.type === 'dragover') setIsDraggingOver(true);
    else if (e.type === 'dragleave') {
      const rect = e.currentTarget.getBoundingClientRect();
      if (e.clientX <= rect.left || e.clientX >= rect.right || e.clientY <= rect.top || e.clientY >= rect.bottom) {
        setIsDraggingOver(false);
      }
    }
  };

  const handleGlobalDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    // Check if this is an internal drag (e.g. moving assets between folders)
    if (e.dataTransfer.getData('assetIds') || e.dataTransfer.getData('assetId')) {
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const total = e.dataTransfer.files.length;
      startUpload(total);
      toast.info(`Ingesting ${total} asset(s)...`);
      
      try {
        for (let i = 0; i < total; i++) {
          updateStats(i + 1);
          const formData = new FormData();
          formData.append('file', e.dataTransfer.files[i]);
          await handleUpload(formData);
        }
        toast.success(`${total} asset(s) ingested into ${currentFolderId ? 'folder' : 'root'}`);
      } finally {
        finishUpload();
      }
    }
  };

  return (
    <div 
      className="absolute inset-0 z-10 flex flex-col overflow-hidden bg-transparent font-sans"
      onDragEnter={handleGlobalDrag}
      onDragOver={handleGlobalDrag}
      onDragLeave={handleGlobalDrag}
      onDrop={handleGlobalDrop}
    >
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-blue-600/10 backdrop-blur-md border-[12px] border-dashed border-blue-500/20 m-8 rounded-[3rem] flex flex-col items-center justify-center gap-8 pointer-events-none"
          >
            <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-bounce">
              <Upload size={48} strokeWidth={3} />
            </div>
            <div className="text-center">
              <p className="text-4xl font-black uppercase tracking-tighter text-white">Drop to Ingest</p>
              <p className="text-[12px] font-bold uppercase tracking-[0.5em] text-blue-400 mt-2">Syncing Visual Archive</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Windows 11 Navigation & Command Bar Container */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-b border-black/5 dark:border-white/5 shadow-sm shrink-0 z-30">
        {/* Navigation Bar (Back, Forward, Up, Refresh, Address, Search) */}
        <div className="h-12 flex items-center px-4 gap-2">
          <div className="flex items-center gap-1 mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5" onClick={fetchAssets}><RotateCw size={14} className={cn(loading && "animate-spin")} /></Button>
          </div>

          <div className="flex-1 h-8 bg-black/5 dark:bg-white/5 rounded flex items-center px-1 border border-black/10 dark:border-white/10 group focus-within:bg-white dark:focus-within:bg-black transition-all">
            <Breadcrumbs
              folders={folders}
              currentFolderId={currentFolderId}
              onNavigate={(id) => {
                setCurrentFolderId(id);
                setShowTrash(false);
              }}
            />
          </div>

          <div className="w-64 h-8 bg-black/5 dark:bg-white/5 rounded flex items-center px-3 border border-black/10 dark:border-white/10 focus-within:bg-white dark:focus-within:bg-black transition-all">
            <Search size={14} className="opacity-40 mr-2" />
            <input
              placeholder="Search resources..."
              className="bg-transparent border-none outline-none text-[12px] w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

        </div>

        {/* Command Bar */}
        <div className="h-10 flex items-center px-4 gap-1 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center">
            <Button variant="ghost" className="h-8 px-3 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 rounded" onClick={() => setIsUploadOpen(true)}>
              <Plus size={16} className="text-blue-500" />
              <span className="text-[11px] font-medium">New</span>
            </Button>
          </div>

          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 hover:opacity-100" disabled={selectedIds.size === 0} onClick={() => {
              const firstId = Array.from(selectedIds)[0];
              const asset = assets.find(a => a._id === firstId);
              if (asset) handleCutAsset(asset);
            }}><Scissors size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 hover:opacity-100" disabled={selectedIds.size === 0} onClick={() => {
              const firstId = Array.from(selectedIds)[0];
              const asset = assets.find(a => a._id === firstId);
              if (asset) handleCopyAsset(asset);
            }}><Copy size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 hover:opacity-100" disabled={!clipboard} onClick={handlePasteAsset}><ClipboardPaste size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 hover:opacity-100" disabled={selectedIds.size !== 1} onClick={() => {
              const firstId = Array.from(selectedIds)[0];
              const asset = assets.find(a => a._id === firstId);
              if (asset) handleRenameAsset(asset);
            }}><Type size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 hover:opacity-100" disabled={selectedIds.size === 0} onClick={handleShare}><Share2 size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 disabled:opacity-20" disabled={selectedIds.size === 0} onClick={handleBulkDelete}><Trash2 size={16} /></Button>
          </div>

          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 px-3 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                  <ArrowDownWideNarrow size={16} />
                  <span className="text-[11px] font-medium">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setSortBy('name')} className={cn(sortBy === 'name' && "bg-black/5 dark:bg-white/5")}>By Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('date')} className={cn(sortBy === 'date' && "bg-black/5 dark:bg-white/5")}>By Date</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')} className={cn(sortBy === 'size' && "bg-black/5 dark:bg-white/5")}>By Size</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 px-3 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                  <LayoutGrid size={16} />
                  <span className="text-[11px] font-medium">View</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setViewMode('grid')} className={cn(viewMode === 'grid' && "bg-black/5 dark:bg-white/5")}>Grid View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('details')} className={cn(viewMode === 'details' && "bg-black/5 dark:bg-white/5")}>Details View</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setShowTrash(!showTrash)}>
              <RotateCw size={14} className={cn(showTrash && "text-red-500")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5"><MoreHorizontal size={16} /></Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Windows 11 Navigation Pane (Sidebar) */}
        <aside
          className="w-48 border-r border-black/5 dark:border-white/5 bg-transparent flex flex-col shrink-0 relative z-20"
        >
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-3 mb-4 space-y-0.5">
              <Button variant="ghost" className={cn("w-full justify-start gap-3 h-8 text-[12px] font-medium rounded px-2 hover:bg-black/5 dark:hover:bg-white/5", !currentFolderId && !showTrash && "bg-black/10 dark:bg-white/10")} onClick={() => { setCurrentFolderId(null); setShowTrash(false); }}>
                <Home size={16} className="text-blue-500" /> Home
              </Button>
            </div>
            <div className="px-4 mb-2">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Library</span>
            </div>

            <div className="px-3 space-y-0.5">
              <FolderTree
                folders={folders}
                currentFolderId={currentFolderId}
                onSelectFolder={(id) => {
                  setCurrentFolderId(id);
                  setShowTrash(false);
                  setIsMobileLibraryOpen(false);
                }}
                onCreateFolder={handleCreateFolder}
                onDeleteFolder={handleDeleteFolder}
                onDropAsset={handleDropAssetOnFolder}
                isCollapsed={false}
              />
              <Button variant="ghost" className={cn("w-full justify-start gap-3 h-8 text-[12px] font-medium rounded px-2 hover:bg-black/5 dark:hover:bg-white/5", showTrash && "bg-black/10 dark:bg-white/10")} onClick={() => { setShowTrash(true); setCurrentFolderId(null); }}>
                <Trash2 size={16} className="text-red-400" /> Recycle Bin
              </Button>
            </div>
          </div>

          <div className="p-3 border-t border-black/5 dark:border-white/5 mt-auto flex flex-col gap-3">
            <Button
              className="w-full justify-center gap-2 h-9 text-[11px] font-black uppercase tracking-widest rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              onClick={() => setIsUploadOpen(true)}
            >
              <Plus size={14} strokeWidth={3} /> Upload
            </Button>
            
            <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-tighter text-foreground/40">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{assets.length} Items</span>
              </div>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-1 h-1 rounded-full bg-blue-400" />
                  <span>{selectedIds.size} Selected</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-transparent overflow-y-auto relative flex flex-col min-w-0">
          <PanelContextMenu
            hasClipboard={!!clipboard}
            onPaste={handlePasteAsset}
            onUpload={() => setIsUploadOpen(true)}
            onCreateFolder={() => handleCreateFolder(currentFolderId)}
            onRefresh={fetchAssets}
            onToggleTrash={() => setShowTrash(!showTrash)}
            isTrashActive={showTrash}
          >
            <div className="p-4 min-h-full">
              {/* Gallery */}
              <MediaGallery
                assets={sortedAssets}
                viewMode={viewMode}
                selectedAssetId={selectedAsset?._id ?? null}
                onSelectAsset={setSelectedAsset}
                isLoading={loading}
                hasClipboard={!!clipboard}
                onCopyAsset={handleCopyAsset}
                onCutAsset={handleCutAsset}
                onPasteAsset={handlePasteAsset}
                onRenameAsset={handleRenameAsset}
                onMoveAsset={handleMoveAsset}
                onDeleteAsset={handleContextDelete}
                onRestoreAsset={(asset) => handleRestoreAsset(asset._id)}
                isTrashMode={showTrash}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelectAsset}
                onBulkSelect={handleBulkSelect}
                onClearSelection={() => setSelectedIds(new Set())}
              />
            </div>
          </PanelContextMenu>
        </main>
        {/* Details Pane (Sidebar) */}
        <AnimatePresence>
          {selectedAsset && selectedIds.size <= 1 && (
            <AssetSidebar
              asset={selectedAsset}
              selectionCount={selectedIds.size}
              onClose={() => {
                setSelectedAsset(null);
                setSelectedIds(new Set());
              }}
              onUpdate={handleUpdateAsset}
              onDelete={handleDeleteAsset}
              onRestore={(id) => handleRestoreAsset(id)}
              onBulkMove={() => selectedAsset && handleMoveAsset(selectedAsset)}
              onBulkRestore={handleBulkRestore}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUpload={async (formData) => {
            startUpload(1);
            updateStats(1);
            try {
              await handleUpload(formData);
            } finally {
              finishUpload();
            }
          }}
          folderId={currentFolderId}
        />

      <RenameModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        defaultValue={modalConfig.defaultValue}
        title={modalConfig.title}
        label={modalConfig.label}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
      />
    </div>
  );
}
