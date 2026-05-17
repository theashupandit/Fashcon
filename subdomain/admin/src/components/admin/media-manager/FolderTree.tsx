'use client';

import React from 'react';
import { Folder as FolderIcon, ChevronRight, ChevronDown, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

import { Folder } from './types';

interface FolderTreeProps {
  folders: Folder[];
  currentFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onDeleteFolder: (id: string) => void;
  onDropAsset?: (assetId: string, targetFolderId: string | null) => void;
  isCollapsed?: boolean;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  currentFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onDropAsset,
  isCollapsed = false,
}) => {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({ root: true });
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragOver = (e: React.DragEvent, id: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id === null ? 'root' : id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    setDragOverId(null);
    
    const assetIdsData = e.dataTransfer.getData('assetIds');
    const assetId = e.dataTransfer.getData('assetId');

    if (onDropAsset) {
      if (assetIdsData) {
        try {
          const ids = JSON.parse(assetIdsData);
          // Pass the first ID to trigger the bulk logic in the parent, or pass them all
          onDropAsset(ids[0], targetFolderId);
        } catch (e) {
          if (assetId) onDropAsset(assetId, targetFolderId);
        }
      } else if (assetId) {
        onDropAsset(assetId, targetFolderId);
      }
    }
  };

  const renderFolder = (parentId: string | null, depth = 0) => {
    const children = folders.filter((f) => f.parentId === parentId);

    return children.map((folder) => (
      <div key={folder._id} className="select-none">
        <div
          className={cn(
            "group flex items-center py-1 px-2 my-px rounded transition-all cursor-default",
            currentFolderId === folder._id
              ? "bg-black/10 dark:bg-white/10 text-blue-600 dark:text-blue-400"
              : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5",
            dragOverId === folder._id && "bg-blue-500/10 border-blue-500/20",
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => onSelectFolder(folder._id)}
          onDragOver={(e) => handleDragOver(e, folder._id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder._id)}
        >
          <div
            className="p-1 mr-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(folder._id);
            }}
          >
            {folders.some(f => f.parentId === folder._id) ? (
              expanded[folder._id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            ) : (
              <div className="w-[12px]" />
            )}
          </div>
          
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="flex-1 min-w-0 flex items-center">
                <FolderIcon
                  size={16}
                  className={cn(
                    "mr-2 shrink-0",
                    currentFolderId === folder._id ? "text-blue-500" : "text-slate-400"
                  )}
                />
                
                <span className="text-[12px] font-medium flex-1 truncate">
                  {folder.name}
                </span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 bg-popover/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-xl p-1 z-[100]">
              <ContextMenuItem
                className="rounded-lg gap-2 text-xs py-2 px-3 focus:bg-blue-500/10 focus:text-blue-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); onCreateFolder(folder._id); }}
              >
                <Plus size={14} className="text-blue-500" /> 
                <span className="font-medium">New Folder</span>
              </ContextMenuItem>
              <ContextMenuItem
                className="rounded-lg gap-2 text-xs py-2 px-3 text-red-400 focus:bg-red-500/10 focus:text-red-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder._id); }}
              >
                <Trash2 size={14} /> 
                <span className="font-medium">Delete</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>

        {expanded[folder._id] && renderFolder(folder._id, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="flex flex-col">
      {renderFolder(null)}
    </div>
  );
};
