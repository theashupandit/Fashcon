'use client';

import React from 'react';
import { ChevronRight, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Folder } from './types';

interface BreadcrumbsProps {
  folders: Folder[];
  currentFolderId: string | null;
  onNavigate: (id: string | null) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  folders,
  currentFolderId,
  onNavigate,
}) => {
  const getPath = () => {
    const path: Folder[] = [];
    let currentId = currentFolderId;
    
    while (currentId) {
      const folder = folders.find(f => f._id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    
    return path;
  };

  const path = getPath();

  return (
    <nav className="flex items-center text-[12px] text-black/60 dark:text-white/60 overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-1.5 gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 text-inherit"
        onClick={() => onNavigate(null)}
      >
        <HardDrive size={14} className="text-blue-500" />
        <span className="font-medium">Media Library</span>
      </Button>

      {path.map((folder, index) => (
        <React.Fragment key={folder._id}>
          <ChevronRight size={12} className="shrink-0 opacity-40 mx-0.5" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 hover:bg-black/5 dark:hover:bg-white/5 text-inherit truncate max-w-[120px] font-medium"
            onClick={() => onNavigate(folder._id)}
          >
            {folder.name}
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
};
