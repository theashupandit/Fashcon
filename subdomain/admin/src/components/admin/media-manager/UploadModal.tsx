'use client';

import React from 'react';
import { Upload, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CropperModal } from '../CropperModal';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: FormData) => Promise<void>;
  folderId: string | null;
  progress?: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  folderId,
  progress = 0,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);
  const [quality, setQuality] = React.useState<'standard' | 'high' | 'original'>('standard');
  const [cropperState, setCropperState] = React.useState<{
    open: boolean;
    image: string;
    originalFile: File | null;
  }>({
    open: false,
    image: '',
    originalFile: null,
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropperState({
          open: true,
          image: reader.result as string,
          originalFile: file
        });
      };
      reader.readAsDataURL(file);
      return;
    }
    
    // For non-images, proceed with normal upload
    await performUpload(file);
  };

  const handleMultipleUpload = async (files: FileList | File[]) => {
    setIsUploading(true);
    const total = files.length;
    
    for (const file of Array.from(files)) {
      await performUpload(file);
    }
    
    toast.success(`${total} asset(s) uploaded successfully`);
    onClose();
    setIsUploading(false);
  };

  const handleCroppedUpload = async (blob: Blob) => {
    const file = new File([blob], cropperState.originalFile?.name || `asset-${Date.now()}.jpg`, { type: 'image/jpeg' });
    await performUpload(file);
  };

  const performUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    formData.append('quality', quality);

    try {
      await onUpload(formData);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    }
  };

  const handleUrlUpload = async () => {
    if (!url) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('url', url);
    if (folderId) formData.append('folderId', folderId);
    formData.append('quality', quality);

    try {
      await onUpload(formData);
      toast.success('Image fetched and optimized');
      setUrl('');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--background)] border-[var(--border)] sm:max-w-xl p-0 overflow-hidden gap-0 rounded-2xl shadow-sm">
        <div className="p-6 pb-4 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Add Media</DialogTitle>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Upload images to your library or fetch from URL</p>
          </div>
        </div>

        <Tabs defaultValue="file" className="w-full flex flex-col">
          <div className="px-6 py-4 bg-[var(--background)] flex flex-col gap-4 border-b border-[var(--border)]/50">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Source Type</span>
              <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--accent)] p-1 border border-[var(--border)]">
                <TabsTrigger 
                  value="file" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  File Upload
                </TabsTrigger>
                <TabsTrigger 
                  value="url" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Paste URL
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Global Quality Profile Selector */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]/50">
              <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Image Quality Profile</span>
              <div className="grid grid-cols-3 gap-1.5 bg-[var(--accent)] p-1.5 rounded-xl border border-[var(--border)]">
                {[
                  { id: 'standard', label: 'Standard', desc: '1200px Max' },
                  { id: 'high', label: 'High Quality', desc: '2400px Max' },
                  { id: 'original', label: 'Original', desc: 'Highest Fidelity' }
                ].map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuality(q.id as any)}
                    className={cn(
                      "py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer outline-none",
                      quality === q.id 
                        ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/10" 
                        : "text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--accent)]"
                    )}
                  >
                    <span className="text-[11px] font-black uppercase tracking-wider">{q.label}</span>
                    <span className={cn(
                      "text-[8px] font-medium opacity-60 uppercase tracking-widest",
                      quality === q.id ? "text-white" : "text-[var(--muted-foreground)]/80"
                    )}>{q.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <TabsContent value="file" className="mt-0 focus-visible:outline-none">
              <div
                className={cn(
                  "relative h-72 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group shadow-sm",
                  isDragging 
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 scale-[0.98]" 
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50",
                  isUploading && "opacity-50 pointer-events-none"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  multiple
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={async (e) => {
                    if (e.target.files?.length) await handleMultipleUpload(e.target.files);
                  }}
                  accept="image/*,video/*"
                />

                <input 
                  type="file" 
                  {...({ webkitdirectory: "", directory: "" } as any)}
                  className="hidden" 
                  ref={folderInputRef} 
                  onChange={async (e) => {
                    if (e.target.files?.length) await handleMultipleUpload(e.target.files);
                  }}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="35" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-[var(--primary)]/10" />
                        <circle 
                          cx="40" cy="40" r="35" 
                          fill="transparent" 
                          stroke="currentColor" 
                          strokeWidth="6" 
                          strokeDasharray={219.9}
                          strokeDashoffset={219.9 - (219.9 * progress) / 100}
                          className="text-[var(--primary)] transition-all duration-300"
                        />
                      </svg>
                      <span className="absolute text-sm font-black text-[var(--primary)]">{progress}%</span>
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">Ingesting Archive</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1 uppercase tracking-widest opacity-60">Optimizing Visual Integrity...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center px-4">
                    <div className="p-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8" />
                    </div>
                    <h4 className="text-base font-black uppercase tracking-tight">Drag & Drop Media</h4>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-[240px]">
                      Images optimized to WebP. Videos converted to high-performance WebM.
                    </p>
                    <div className="flex gap-2 mt-6">
                      <Button variant="outline" size="sm" className="rounded-xl font-bold border-[var(--border)] hover:border-[var(--primary)]/50 shadow-sm bg-[var(--card)]">
                        Browse Files
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-bold border-[var(--border)] hover:border-[var(--primary)]/50 shadow-sm bg-[var(--card)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          folderInputRef.current?.click();
                        }}
                      >
                        Upload Folder
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="space-y-4 py-8">
                <div className="text-center space-y-1 mb-6">
                  <h4 className="text-base font-black uppercase tracking-tight">Fetch from URL</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">Paste a direct image link below</p>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input 
                      placeholder="https://images.unsplash.com/photo-..." 
                      className="pl-11 h-12 bg-[var(--card)] border-[var(--border)] rounded-xl focus-visible:ring-[var(--primary)]/20 shadow-sm"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>
                  <Button 
                    onClick={handleUrlUpload} 
                    disabled={!url || isUploading}
                    className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider bg-[var(--primary)] text-white shadow-sm"
                  >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : "Fetch"}
                  </Button>
                </div>
                
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-amber-600" />
                  </div>
                  <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
                    Automated optimization will convert the source image to high-performance WebP and generate thumbnails for the gallery.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        <CropperModal 
          open={cropperState.open}
          onOpenChange={(open) => setCropperState(prev => ({ ...prev, open }))}
          image={cropperState.image}
          onCropComplete={handleCroppedUpload}
        />
      </DialogContent>
    </Dialog>
  );
};
