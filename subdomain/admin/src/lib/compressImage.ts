import imageCompression from 'browser-image-compression';

const MAX_SOURCE_SIZE_MB = 5;
const DEFAULT_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
};

function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

export async function compressImage(file: File): Promise<File> {
  if (!isImageFile(file)) {
    throw new Error('Only image files are allowed.');
  }

  if (file.size > MAX_SOURCE_SIZE_MB * 1024 * 1024) {
    throw new Error('Image must be 5MB or smaller before compression.');
  }

  const compressed = await imageCompression(file, DEFAULT_COMPRESSION_OPTIONS);

  if (compressed instanceof File) {
    return compressed;
  }

  return new File([compressed as Blob], file.name, {
    type: file.type || 'image/jpeg',
    lastModified: Date.now(),
  });
}
