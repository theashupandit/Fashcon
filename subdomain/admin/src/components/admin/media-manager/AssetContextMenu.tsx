'use client';

import React from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import {
  Eye,
  Copy,
  Scissors,
  ClipboardPaste,
  Pencil,
  FolderInput,
  Trash2,
  ExternalLink,
  RefreshCw,
  Crop,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaAsset } from './types';

interface AssetContextMenuProps {
  children: React.ReactNode;
  asset: MediaAsset;
  hasClipboard: boolean;
  selectionCount: number;
  isAssetSelected: boolean;
  onOpen: (asset: MediaAsset) => void;
  onCopy: (asset: MediaAsset) => void;
  onCut: (asset: MediaAsset) => void;
  onPaste: () => void;
  onRename: (asset: MediaAsset) => void;
  onMove: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
  onRestore?: (asset: MediaAsset) => void;
  onEdit?: (asset: MediaAsset) => void;
  isTrashMode?: boolean;
}

export function AssetContextMenu({
  children,
  asset,
  hasClipboard,
  selectionCount,
  isAssetSelected,
  onOpen,
  onCopy,
  onCut,
  onPaste,
  onRename,
  onMove,
  onDelete,
  onRestore,
  onEdit,
  isTrashMode = false,
}: AssetContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[200px] bg-[var(--card)] border border-[var(--border)]/60 rounded-xl p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl z-[200] animate-in fade-in zoom-in-95 duration-150"
        >
          {isTrashMode ? (
            <>
              <MenuItem
                icon={<RefreshCw size={14} />}
                label={isAssetSelected && selectionCount > 1 ? `Restore ${selectionCount} Assets` : "Restore Asset"}
                onClick={() => onRestore?.(asset)}
              />
              <ContextMenu.Separator className="h-px bg-[var(--border)]/30 my-1.5" />
              <MenuItem
                icon={<Trash2 size={14} />}
                label={isAssetSelected && selectionCount > 1 ? `Delete ${selectionCount} Permanently` : "Delete Permanently"}
                destructive
                onClick={() => onDelete(asset)}
              />
            </>
          ) : (
            <>
              {/* Open / View Details */}
              <MenuItem
                icon={<Eye size={14} />}
                label="View Details"
                shortcut="Enter"
                onClick={() => onOpen(asset)}
              />

              <MenuItem
                icon={<ExternalLink size={14} />}
                label="Open Original"
                onClick={() => window.open(asset.url, '_blank')}
              />

              <ContextMenu.Separator className="h-px bg-[var(--border)]/30 my-1.5" />

              {/* Clipboard */}
              <MenuItem
                icon={<Copy size={14} />}
                label={isAssetSelected && selectionCount > 1 ? `Copy ${selectionCount} items` : "Copy"}
                shortcut="Ctrl+C"
                onClick={() => onCopy(asset)}
              />
              <MenuItem
                icon={<Scissors size={14} />}
                label={isAssetSelected && selectionCount > 1 ? `Cut ${selectionCount} items` : "Cut"}
                shortcut="Ctrl+X"
                onClick={() => onCut(asset)}
              />
              <MenuItem
                icon={<ClipboardPaste size={14} />}
                label="Paste Here"
                shortcut="Ctrl+V"
                disabled={!hasClipboard}
                onClick={onPaste}
              />

              <ContextMenu.Separator className="h-px bg-[var(--border)]/30 my-1.5" />

              {/* Actions */}
              {onEdit && !(
                asset.metadata?.format?.toLowerCase() === 'mp4' || 
                asset.metadata?.format?.toLowerCase() === 'webm' || 
                asset.url?.match(/\.(mp4|webm|mov|avi|wmv|flv|mkv)$/i)
              ) && (
                <MenuItem
                  icon={<Crop size={14} />}
                  label="Edit Image"
                  disabled={selectionCount > 1 && isAssetSelected}
                  onClick={() => onEdit(asset)}
                />
              )}

              <MenuItem
                icon={<Pencil size={14} />}
                label="Rename"
                shortcut="F2"
                disabled={selectionCount > 1 && isAssetSelected}
                onClick={() => onRename(asset)}
              />
              <MenuItem
                icon={<FolderInput size={14} />}
                label={isAssetSelected && selectionCount > 1 ? `Move ${selectionCount} items...` : "Move to..."}
                onClick={() => onMove(asset)}
              />

              <ContextMenu.Separator className="h-px bg-[var(--border)]/30 my-1.5" />

              {/* Destructive */}
              <MenuItem
                icon={<Trash2 size={14} />}
                label={isAssetSelected && selectionCount > 1 ? `Move ${selectionCount} to Trash` : "Move to Trash"}
                shortcut="Del"
                destructive
                onClick={() => onDelete(asset)}
              />
            </>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function MenuItem({
  icon,
  label,
  shortcut,
  destructive = false,
  disabled = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <ContextMenu.Item
      disabled={disabled}
      onSelect={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-[12px] font-semibold rounded-lg cursor-pointer outline-none select-none transition-all duration-150",
        destructive
          ? "text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 hover:text-red-300 focus:text-red-300"
          : "text-[var(--foreground)]/80 hover:bg-[var(--accent)] focus:bg-[var(--accent)] hover:text-[var(--foreground)] focus:text-[var(--foreground)]",
        disabled && "opacity-30 pointer-events-none"
      )}
    >
      <span className="shrink-0 opacity-60">{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-[10px] text-[var(--muted-foreground)]/50 font-mono tracking-tight ml-4">
          {shortcut}
        </span>
      )}
    </ContextMenu.Item>
  );
}
