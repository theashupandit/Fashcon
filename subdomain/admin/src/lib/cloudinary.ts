/**
 * Cloudinary helper functions for Fashcon
 */

import { createImageId } from './media-id';

/**
 * Optimizes a Cloudinary URL by adding f_auto and q_auto transformations
 */
export const getOptimizedUrl = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Check if it already has transformations
  if (url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return url;
};

const applyCloudinaryTransform = (url: string, transform: string): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  if (!url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
};

export const getCloudinaryThumbnailUrl = (url: string): string => {
  return applyCloudinaryTransform(url, 'c_fill,w_150,h_150,f_auto,q_auto');
};

export const getCloudinaryMediumUrl = (url: string): string => {
  return applyCloudinaryTransform(url, 'c_scale,w_600,f_auto,q_auto');
};

/**
 * Frontend helper to upload a file to Cloudinary
 * Note: Requires NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 */
export const uploadToCloudinary = async (file: File | Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
  formData.append('folder', process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'Collection');

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error('Cloudinary Cloud Name not configured');

  const isVideo = file instanceof File && file.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

type MediaUploadOptions = {
  adminId?: string;
  folderId?: string | null;
  folderName?: string;
  folderPath?: string;
};

const getFallbackName = (file: File | Blob) => {
  if (file instanceof File && file.name) return file.name;
  return `uploaded-image-${Date.now()}.jpg`;
};

const registerFallbackAsset = async (
  file: File | Blob,
  url: string,
  options: MediaUploadOptions = {}
): Promise<void> => {
  const fileName = getFallbackName(file);
  const safeBaseName = fileName.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'uploaded_image';
  const payload = {
    imageId: createImageId(fileName),
    originalFilename: fileName,
    displayName: `${options.folderName || 'Root'}/${safeBaseName}`,
    storedName: `${(options.folderPath || options.folderName || 'root').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}_${Date.now()}_${safeBaseName}.webp`,
    url,
    thumbnailUrl: url,
    mediumUrl: url,
    folderId: options.folderId || null,
    folderName: options.folderName || 'Root',
    folderPath: options.folderPath || '',
    uploadedBy: options.adminId || '64f1a2b3c4d5e6f7a8b9c0d1',
    metadata: {
      size: file.size ? Math.round(file.size / 1024) : 0,
      format: file instanceof File && file.type ? file.type.split('/')[1] || 'image' : 'image',
      dimensions: 'unknown',
    },
    altText: `${options.folderName || 'Root'} ${safeBaseName}`.trim(),
  };

  const response = await fetch('/api/media/assets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to register fallback media asset');
  }
};

/**
 * Preferred upload path for the admin app.
 * Uses the signed server endpoint first, then falls back to direct Cloudinary upload.
 */
export const uploadMediaAsset = async (
  file: File | Blob,
  options: MediaUploadOptions = {}
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    if (options.adminId) {
      formData.append('adminId', options.adminId);
    }

    if (options.folderId) {
      formData.append('folderId', options.folderId);
    }

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.url) {
        return data.url;
      }
      if (data?.secure_url) {
        return data.secure_url;
      }
    }
  } catch (error) {
    console.warn('Signed media upload failed, falling back to direct Cloudinary upload.', error);
  }

  const fallbackUrl = await uploadToCloudinary(file);

  try {
    await registerFallbackAsset(file, fallbackUrl, options);
  } catch (registerError) {
    console.warn('Fallback asset registration failed.', registerError);
  }

  return fallbackUrl;
};

/**
 * Upload multiple files to Cloudinary
 */
export const uploadMultipleToCloudinary = async (files: (File | Blob)[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};
