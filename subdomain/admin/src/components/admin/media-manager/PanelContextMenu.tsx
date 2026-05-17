'use client'

import React from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import {
  ClipboardPaste,
  Upload,
  FolderPlus,
  RefreshCw,
  Trash2,
  Image as ImageIcon
} from 'lucide-react'

interface PanelContextMenuProps {
  children: React.ReactNode
  hasClipboard: boolean
  onPaste: () => void
  onUpload: () => void
  onCreateFolder: () => void
  onRefresh: () => void
  onToggleTrash: () => void
  isTrashActive: boolean
}

export function PanelContextMenu({
  children,
  hasClipboard,
  onPaste,
  onUpload,
  onCreateFolder,
  onRefresh,
  onToggleTrash,
  isTrashActive,
}: PanelContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild className="min-h-full w-full">
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Content 
        className="min-w-[220px] bg-[var(--card)]/95 backdrop-blur-xl border border-[var(--border)] rounded-xl overflow-hidden shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200"
        onContextMenu={(e) => e.preventDefault()}
      >
        <ContextMenu.Item 
          className="group relative flex items-center gap-3 px-3 py-2 text-xs font-medium text-[var(--foreground)] rounded-lg outline-none select-none hover:bg-[var(--primary)] hover:text-white cursor-pointer transition-colors"
          onClick={onUpload}
        >
          <Upload size={14} className="text-[var(--muted-foreground)] group-hover:text-white transition-colors" />
          Upload Asset
          <div className="ml-auto text-[10px] text-[var(--muted-foreground)] group-hover:text-white/70">Ctrl+U</div>
        </ContextMenu.Item>

        <ContextMenu.Item 
          className="group relative flex items-center gap-3 px-3 py-2 text-xs font-medium text-[var(--foreground)] rounded-lg outline-none select-none hover:bg-[var(--primary)] hover:text-white cursor-pointer transition-colors"
          onClick={onCreateFolder}
        >
          <FolderPlus size={14} className="text-[var(--muted-foreground)] group-hover:text-white transition-colors" />
          New Folder
          <div className="ml-auto text-[10px] text-[var(--muted-foreground)] group-hover:text-white/70">Ctrl+Shift+N</div>
        </ContextMenu.Item>

        <ContextMenu.Separator className="h-px bg-[var(--border)]/50 my-1" />

        <ContextMenu.Item 
          disabled={!hasClipboard}
          className="group relative flex items-center gap-3 px-3 py-2 text-xs font-medium text-[var(--foreground)] rounded-lg outline-none select-none hover:bg-[var(--primary)] hover:text-white cursor-pointer transition-colors data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent data-[disabled]:hover:text-[var(--foreground)]"
          onClick={onPaste}
        >
          <ClipboardPaste size={14} className="text-[var(--muted-foreground)] group-hover:text-white transition-colors group-data-[disabled]:text-[var(--muted-foreground)]" />
          Paste
          <div className="ml-auto text-[10px] text-[var(--muted-foreground)] group-hover:text-white/70">Ctrl+V</div>
        </ContextMenu.Item>

        <ContextMenu.Separator className="h-px bg-[var(--border)]/50 my-1" />

        <ContextMenu.Item 
          className="group relative flex items-center gap-3 px-3 py-2 text-xs font-medium text-[var(--foreground)] rounded-lg outline-none select-none hover:bg-[var(--accent)] cursor-pointer transition-colors"
          onClick={onRefresh}
        >
          <RefreshCw size={14} className="text-[var(--muted-foreground)]" />
          Refresh
          <div className="ml-auto text-[10px] text-[var(--muted-foreground)]">F5</div>
        </ContextMenu.Item>

        <ContextMenu.Separator className="h-px bg-[var(--border)]/50 my-1" />

        <ContextMenu.Item 
          className="group relative flex items-center gap-3 px-3 py-2 text-xs font-medium text-[var(--foreground)] rounded-lg outline-none select-none hover:bg-destructive hover:text-destructive-foreground cursor-pointer transition-colors"
          onClick={onToggleTrash}
        >
          {isTrashActive ? (
            <>
              <ImageIcon size={14} className="text-[var(--muted-foreground)] group-hover:text-destructive-foreground transition-colors" />
              View Assets
            </>
          ) : (
            <>
              <Trash2 size={14} className="text-destructive" />
              View Trash
            </>
          )}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
