'use client';

import React from 'react';
import { SafeImage } from "@/components/ui/SafeImage";
import { X, Copy, Trash2, Save, ExternalLink, Calendar, Hash, Maximize2, File as FileIcon, RefreshCw, FolderInput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { MediaAsset } from './types';

interface AssetSidebarProps {
  asset: MediaAsset | null;
  selectionCount: number;
  onClose: () => void;
  onUpdate: (id: string, data: { altText?: string; imageId?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  onBulkMove: () => void;
  onBulkRestore: () => void;
}

export const AssetSidebar: React.FC<AssetSidebarProps> = ({
  asset,
  selectionCount,
  onClose,
  onUpdate,
  onDelete,
  onRestore,
  onBulkMove,
  onBulkRestore,
}) => {
  const [altText, setAltText] = React.useState('');
  const [imageId, setImageId] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const formatDisplayName = (name: string) => {
    return name
      .replace(/[_-]/g, ' ')
      .replace(/\.[^/.]+$/, "")
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatImageId = (id: string) => {
    return id.split('/').pop() || id;
  };

  React.useEffect(() => {
    if (asset) setAltText(asset.altText || '');
    if (asset) setImageId(asset.imageId || '');
  }, [asset]);


  if (!asset && selectionCount === 0) return null;

  const handleCopyUrl = () => {
    if (asset) {
      navigator.clipboard.writeText(asset.url);
      toast.success('URL copied to clipboard');
    }
  };

  const handleSave = async () => {
    if (!asset) return;
    setIsSaving(true);
    try {
      await onUpdate(asset._id, { altText, imageId });
      toast.success('Asset updated successfully');
    } catch (error) {
      toast.error('Failed to update asset');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-80 h-full border-l border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 backdrop-blur-3xl flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 shrink-0">
        <div>
          <h3 className="font-semibold text-sm text-black/80 dark:text-white/80 leading-none">
            {selectionCount > 1 ? `${selectionCount} items selected` : asset ? formatDisplayName(asset.displayName || asset.originalFilename) : 'Details'}
          </h3>
          {asset && selectionCount <= 1 && (
            <p className="text-[10px] text-black/40 dark:text-white/40 font-medium mt-1 truncate">
              {asset.metadata.format.toUpperCase()} file • {asset.metadata.size} KB
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all"
        >
          <X size={16} />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-5 overflow-hidden min-h-0">
        <div className="py-4 space-y-5">
          {selectionCount > 1 ? (
            <div className="space-y-6 py-4">
              <div className="p-6 rounded-lg bg-blue-500/5 border border-blue-500/20 flex flex-col items-center justify-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Maximize2 size={24} />
                </div>
                <div>
                  <h4 className="text-[12px] font-semibold text-black/80 dark:text-white/80">Multiple items selected</h4>
                  <p className="text-[10px] text-black/40 dark:text-white/40 mt-1">
                    Manage {selectionCount} assets at once
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] text-black/40 dark:text-white/40 uppercase font-bold tracking-wider ml-1">Actions</Label>
                <div className="grid grid-cols-1 gap-1">
                  <Button 
                    variant="ghost" 
                    className="h-9 justify-start gap-3 rounded px-3 hover:bg-black/5 dark:hover:bg-white/5 text-[11px] font-medium transition-all"
                    onClick={onBulkMove}
                  >
                    <FolderInput size={14} className="text-blue-500" />
                    Move {selectionCount} items
                  </Button>
                  
                  {asset?.isDeleted ? (
                    <Button 
                      variant="ghost" 
                      className="h-9 justify-start gap-3 rounded px-3 hover:bg-black/5 dark:hover:bg-white/5 text-[11px] font-medium transition-all"
                      onClick={onBulkRestore}
                    >
                      <RefreshCw size={14} className="text-green-500" />
                      Restore {selectionCount} assets
                    </Button>
                  ) : null}

                  <Button 
                    variant="ghost" 
                    className="h-9 justify-start gap-3 rounded px-3 hover:bg-red-500/5 text-red-500 text-[11px] font-medium transition-all"
                    onClick={() => {
                      if (asset) onDelete(asset._id);
                      else if (selectionCount > 0) onDelete(""); 
                    }}
                  >
                    <Trash2 size={14} />
                    {asset?.isDeleted ? `Delete ${selectionCount} permanently` : `Move ${selectionCount} to Recycle Bin`}
                  </Button>
                </div>
              </div>
            </div>
          ) : asset ? (
            <>
              {/* Preview Panel */}
              <div className="space-y-2">
                <Label className="text-[10px] text-black/40 dark:text-white/40 uppercase font-bold tracking-wider ml-1">Preview</Label>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-black flex items-center justify-center group shadow-sm">
                  {asset.url.match(/\.(mp4|webm|mov|avi|wmv|flv|mkv)$/i) ? (
                    <video 
                      src={asset.url} 
                      className="w-full h-full object-contain"
                      controls
                      poster={asset.url.replace('/video/upload/', '/video/upload/so_auto,w_500,c_limit/').replace(/\.(mp4|webm|mov|avi|wmv|flv|mkv)$/i, '.jpg')}
                    />
                  ) : (
                    <SafeImage
                      src={asset.url}
                      alt={formatDisplayName(asset.displayName || asset.originalFilename)}
                      fill
                      className="object-contain p-2"
                      sizes="280px"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button size="sm" variant="secondary" className="h-7 rounded px-3 text-[10px] font-medium" asChild>
                      <a href={asset.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={12} className="mr-1.5" /> Open
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] text-black/40 dark:text-white/40 uppercase font-bold tracking-wider ml-1">Image ID</Label>
                  <Input
                    value={imageId}
                    onChange={(e) => setImageId(e.target.value)}
                    className="h-8 rounded bg-white dark:bg-black border-black/10 dark:border-white/10 text-[11px] font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] text-black/40 dark:text-white/40 uppercase font-bold tracking-wider ml-1">Alt Text</Label>
                  <Input
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="h-8 rounded bg-white dark:bg-black border-black/10 dark:border-white/10 text-[11px]"
                  />
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-8 rounded bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium transition-all"
                  >
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] text-black/40 dark:text-white/40 uppercase font-bold tracking-wider ml-1">Information</Label>
                  <div className="space-y-1.5 p-3 rounded-lg bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5">
                    <InfoRow label="Dimensions" value={asset.metadata.dimensions} />
                    <InfoRow label="Created" value={format(new Date(asset.createdAt), 'MMM dd, yyyy')} />
                    <InfoRow label="Format" value={asset.metadata.format.toUpperCase()} />
                    <InfoRow label="Usage" value={`${asset.usageCount} documents`} />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-card/20 backdrop-blur-md mt-auto shrink-0 flex flex-col gap-2">
        {selectionCount <= 1 && asset && (
          asset.isDeleted ? (
            <>
              <Button
                variant="default"
                className="w-full gap-2 h-11 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                onClick={() => onRestore(asset._id)}
              >
                <RefreshCw size={16} /> Restore Asset
              </Button>
              <Button
                variant="destructive"
                className="w-full gap-2 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/10 hover:shadow-destructive/20 transition-all"
                onClick={() => onDelete(asset._id)}
              >
                <Trash2 size={16} /> Delete Permanently
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              className="w-full gap-2 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/10 hover:shadow-destructive/20 transition-all"
              onClick={() => onDelete(asset._id)}
            >
              <Trash2 size={16} /> Move to Trash
            </Button>
          )
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex items-center justify-between py-0.5">
    <span className="text-[10px] text-black/40 dark:text-white/40 font-medium">{label}</span>
    <span className="text-[10px] text-black/80 dark:text-white/80 font-semibold truncate ml-4">{value}</span>
  </div>
);

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);
