'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface MediaStats {
  current: number;
  total: number;
  isUploading: boolean;
}

interface MediaContextType {
  uploadProgress: number;
  uploadSpeed: string;
  uploadStats: MediaStats;
  startUpload: (total: number) => void;
  updateProgress: (progress: number, speed: string) => void;
  updateStats: (current: number) => void;
  finishUpload: () => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [uploadStats, setUploadStats] = useState<MediaStats>({
    current: 0,
    total: 0,
    isUploading: false,
  });

  const startUpload = useCallback((total: number) => {
    setUploadStats({ current: 0, total, isUploading: true });
    setUploadProgress(0);
    setUploadSpeed('Starting...');
  }, []);

  const updateProgress = useCallback((progress: number, speed: string) => {
    setUploadProgress(progress);
    setUploadSpeed(speed);
  }, []);

  const updateStats = useCallback((current: number) => {
    setUploadStats(prev => ({ ...prev, current }));
  }, []);

  const finishUpload = useCallback(() => {
    setUploadStats(prev => ({ ...prev, isUploading: false }));
    setUploadProgress(0);
    setUploadSpeed('');
  }, []);

  return (
    <MediaContext.Provider value={{
      uploadProgress,
      uploadSpeed,
      uploadStats,
      startUpload,
      updateProgress,
      updateStats,
      finishUpload,
    }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMediaSync = () => {
  const context = useContext(MediaContext);
  if (!context) throw new Error('useMediaSync must be used within a MediaProvider');
  return context;
};
