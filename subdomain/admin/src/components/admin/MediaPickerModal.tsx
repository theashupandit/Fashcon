'use client';

import React, { useState, useEffect } from 'react';
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
  PlayCircle
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
import { useTheme } from '@/components/ThemeProvider';

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

  useEffect(() => {
    const fetchMedia = async () => {
      if (!isOpen) return;
      setSelectedAssetIds([]);
      setLoading(true);
      try {
        const res = await fetch('/api/media/assets');
        if (!res.ok) throw new Error('Failed to fetch media assets');
        const data = await res.json();
        setMedia(data.map((item: any) => ({
          id: item._id,
          imageId: item.imageId || item._id,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          mediumUrl: item.mediumUrl,
          name: item.displayName || item.originalFilename || item.altText || item.imageId || 'Untitled',
          type: item.metadata?.format || 'image',
          size: item.metadata?.size ? `${item.metadata.size}` : '',
          createdAt: item.createdAt
        })));
      } catch (err) {
        console.error("Error fetching media:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [isOpen]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
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
    setMedia(data.map((item: any) => ({
      id: item._id,
      imageId: item.imageId || item._id,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      mediumUrl: item.mediumUrl,
      name: item.displayName || item.originalFilename || item.altText || item.imageId || 'Untitled',
      type: item.metadata?.format || 'image',
      size: item.metadata?.size ? `${item.metadata.size}` : '',
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

  const filteredMedia = media.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.imageId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          showCloseButton={false} 
          overlayClassName="bg-black/25 dark:bg-black/60 backdrop-blur-xs"
          className="!max-w-none !w-[calc(100%-240px)] !h-[calc(100%-80px)] !left-[calc(220px+((100%-220px)/2))] !top-[calc(62px+((100%-62px)/2))] !-translate-x-1/2 !-translate-y-1/2 p-0 overflow-hidden flex flex-col gap-0 bg-white dark:bg-[#080808] border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] dark:shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {/* Main Top Header */}
          <header className="p-6 border-b border-zinc-200 dark:border-white/5 shrink-0 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-2xl shadow-[var(--primary)]/20">
                <ImageIcon className="text-white w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">Media Studio Pro</DialogTitle>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-white/30 uppercase tracking-[0.3em]">Centralized Asset Pipeline</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary)] opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <input 
                  placeholder="Scan archives for assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-transparent rounded-2xl font-bold text-[13px] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/20 focus:border-[var(--primary)]/30 focus:bg-zinc-200/50 dark:focus:bg-white/[0.05] transition-all outline-none"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="h-12 px-6 flex items-center gap-3 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest rounded-2xl cursor-pointer hover:bg-[var(--primary)]/90 transition-all shadow-2xl shadow-[var(--primary)]/20 active:scale-95">
                  <Upload size={18} strokeWidth={3} /> Assets
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

                <label className="h-12 px-6 flex items-center gap-3 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white text-[11px] font-black uppercase tracking-widest rounded-2xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10 transition-all active:scale-95">
                  <FolderPlus size={18} strokeWidth={3} className="text-[var(--primary)]" /> Folders
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

              <div className="w-px h-8 bg-zinc-200 dark:bg-white/5 mx-2" />

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="rounded-2xl h-12 w-12 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-400 dark:text-white/40 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-500 hover:border-red-600/25 dark:hover:border-red-500/30 transition-all"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar Navigation */}
            <aside className="w-72 border-r border-zinc-200 dark:border-white/5 bg-zinc-50/20 dark:bg-white/[0.01] p-6 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/30 ml-2 mb-3">Navigation</h3>
                <nav className="space-y-1">
                  {[
                    { icon: ImageIcon, label: 'All Media', active: true },
                    { icon: Filter, label: 'Recent' },
                    { icon: Search, label: 'Search Results' },
                  ].map((nav, i) => (
                    <button 
                      key={i}
                      className={cn(
                        "w-full h-11 flex items-center gap-4 px-4 rounded-xl text-[12px] font-bold transition-all",
                        nav.active ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white"
                      )}
                    >
                      <nav.icon size={16} />
                      {nav.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/30 ml-2 mb-3">Metadata Filters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['JPG', 'PNG', 'SVG', 'WEBP'].map((format) => (
                    <button key={format} className="h-9 border border-zinc-200 dark:border-white/5 rounded-xl text-[10px] font-black text-zinc-500 dark:text-white/30 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-transparent transition-all uppercase">{format}</button>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-5 rounded-[1.5rem] bg-gradient-to-br from-[var(--primary)]/5 dark:from-[var(--primary)]/10 to-transparent border border-zinc-200 dark:border-[var(--primary)]/10 text-center space-y-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center mx-auto text-[var(--primary)]">
                  <Sparkles size={14} />
                </div>
                <p className="text-[9px] font-bold text-zinc-600 dark:text-white/60 leading-relaxed uppercase tracking-widest">Studio Tip</p>
                <p className="text-[8px] text-zinc-400 dark:text-white/20 leading-relaxed">Drag and drop assets anywhere to begin the ingestion process.</p>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative p-8 scrollbar-hide">


              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
                  <div className="text-center">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-700 dark:text-white opacity-40">Scanning archives...</p>
                    <p className="text-[9px] font-bold text-zinc-400 dark:text-white/10 uppercase tracking-widest mt-1">Retrieving Visual Metadata</p>
                  </div>
                </div>
              ) : filteredMedia.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-6 pb-20">
                  {filteredMedia.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                        selectedAssetIds.includes(item.id)
                          ? "border-[var(--primary)] ring-8 ring-[var(--primary)]/5 scale-[0.96] shadow-2xl shadow-[var(--primary)]/20" 
                          : "border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] hover:border-zinc-300 dark:hover:border-white/20"
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
                          <PlayCircle className="w-12 h-12 text-white/80 group-hover:text-white transition-colors relative z-10" strokeWidth={1.5} />
                          <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-1.5 z-20">
                            <Video size={10} className="text-[var(--primary)]" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Video</span>
                          </div>
                        </div>
                      ) : (
                        <SafeImage 
                          src={item.thumbnailUrl || item.mediumUrl || item.url} 
                          alt={item.name} 
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                      )}
                      
                      {/* Interaction Layer */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                      
                      {/* Selection Indicator */}
                      {selectedAssetIds.includes(item.id) && (
                        <div className="absolute inset-0 bg-[var(--primary)]/20 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in zoom-in-75">
                          <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-2xl shadow-black/40">
                            <Check className="w-6 h-6" strokeWidth={4} />
                          </div>
                        </div>
                      )}

                      {/* Floating Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                        <Button 
                          size="icon" 
                          variant="secondary"
                          className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white hover:bg-[var(--primary)] dark:hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-white transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCropperState({ open: true, image: item.url, originalFile: null, isModification: true, modificationId: item.id });
                          }}
                        >
                          <Scissors size={16} strokeWidth={3} />
                        </Button>
                      </div>

                      {/* Label Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                        <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{item.name}</p>
                        <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-0.5">{item.type} • {item.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-6 py-20 opacity-20">
                  <div className="w-20 h-20 rounded-[2.5rem] border-2 border-dashed border-zinc-300 dark:border-white/20 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                    <ImageIcon size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-white/40">No archives found</p>
                    <p className="text-[10px] font-medium mt-1 text-zinc-400 dark:text-white/40">Try refining your scan parameters</p>
                  </div>
                </div>
              )}

              {/* Background Pipeline Status (Bottom Bar) */}
              {isUploading && (
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 dark:bg-zinc-950/80 backdrop-blur-3xl border border-zinc-200 dark:border-white/10 rounded-[2rem] p-4 flex items-center gap-6 shadow-2xl dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-12 duration-500 z-[60]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
                    <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-800 dark:text-white">Ingesting Assets</p>
                        <span className="text-[9px] font-bold text-zinc-500 dark:text-white/30 uppercase tracking-widest bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                          File {uploadStats.current} of {uploadStats.total}
                        </span>
                      </div>
                      <p className="text-[11px] font-black text-[var(--primary)] uppercase tracking-widest italic">{uploadSpeed}</p>
                    </div>
                    
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--primary)] transition-all duration-300 shadow-[0_0_10px_var(--primary)]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="h-10 w-px bg-zinc-200 dark:bg-white/10" />

                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-black text-zinc-800 dark:text-white">{uploadProgress}%</p>
                    <p className="text-[8px] font-bold text-zinc-400 dark:text-white/20 uppercase tracking-[0.2em]">Synchronizing Archive</p>
                  </div>
                </div>
              )}

              {/* Sticky Selection Status */}
              {selectedAssetIds.length > 0 && !isUploading && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-zinc-950/80 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-3xl p-4 flex items-center gap-6 shadow-2xl dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8 duration-500 z-50">
                   <div className="flex items-center gap-3 px-2">
                     <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[12px] font-black">
                       {selectedAssetIds.length}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-white/60">Assets Locked</span>
                   </div>
                   <div className="h-8 w-px bg-zinc-200 dark:bg-white/10" />
                   <div className="flex items-center gap-2">
                     <Button variant="ghost" onClick={() => setSelectedAssetIds([])} className="h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white transition-all">Clear</Button>
                     <Button 
                       onClick={() => {
                        const selected = media.filter((item) => selectedAssetIds.includes(item.id));
                        if (selected.length > 0) onSelect(selected);
                       }}
                       className="h-10 px-8 rounded-2xl bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[var(--primary)]/20 active:scale-95 transition-all"
                     >
                       Confirm Selection
                     </Button>
                   </div>
                </div>
              )}
            </main>
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
