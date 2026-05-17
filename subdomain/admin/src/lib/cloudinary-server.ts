import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const hasExplicitCredentials =
  Boolean(cloudName) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (hasExplicitCredentials) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (!process.env.CLOUDINARY_URL) {
  console.warn('Cloudinary is not fully configured. Set CLOUDINARY_URL or CLOUDINARY_* env vars.');
}

export { cloudinary };

export interface OptimizationResult {
  url: string;
  thumbnailUrl: string;
  mediumUrl: string;
  storedName: string;
  displayName: string;
  folderName: string;
  folderPath: string;
  metadata: {
    size: number;
    format: string;
    dimensions: string;
  };
}

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function optimizeAndUpload(
  buffer: Buffer,
  originalFilename: string,
  adminId: string,
  options: {
    folderName?: string;
    folderPath?: string;
  } = {}
): Promise<OptimizationResult> {
  const isVideo = /\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i.test(originalFilename);
  let processedBuffer = buffer;
  let dimensions = '0x0';
  let format = originalFilename.split('.').pop() || '';
  
  if (!isVideo) {
    // 1. Process with sharp: Convert to WebP and ensure max width 1200px for "original"
    try {
      const sharpInstance = sharp(buffer);
      const metadata = await sharpInstance.metadata();
      
      processedBuffer = await sharpInstance
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const processedMetadata = await sharp(processedBuffer).metadata();
      dimensions = `${processedMetadata.width}x${processedMetadata.height}`;
      format = 'webp';
    } catch (e) {
      console.warn('Sharp processing failed, uploading original:', e);
    }
  }

  const folderName = options.folderName?.trim() || 'Root';
  const folderPath = options.folderPath?.trim() || '';
  const categorySegment = folderPath
    ? sanitizePathSegment(folderPath.split('/').filter(Boolean).join('-'))
    : sanitizePathSegment(folderName);

  // 2. Generate unique name: category/admin/timestamp/filename
  const timestamp = Date.now();
  const cleanFileName = originalFilename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const storedName = isVideo 
    ? `${categorySegment || 'root'}_${adminId}_${timestamp}_${cleanFileName}`
    : `${categorySegment || 'root'}_${adminId}_${timestamp}_${cleanFileName}.webp`;
    
  const rootFolder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'Collection';
  const publicFolder = `${rootFolder}/media_manager/${categorySegment || 'root'}`;
  const displayName = `${folderName}/${cleanFileName.replace(/\.(webp|mp4|mov|avi|wmv|flv|mkv|webm)$/i, '')}`;

  // 3. Upload to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: isVideo 
          ? storedName.replace(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i, '') 
          : storedName.replace('.webp', ''),
        folder: publicFolder,
        resource_type: isVideo ? 'video' : 'image',
        quality: 'auto',
        transformation: isVideo ? [
          { format: 'webm', video_codec: 'vp9', quality: 'auto' }
        ] : [
          { format: 'webp', quality: 80 }
        ],
        eager: isVideo ? [
          { width: 600, crop: 'scale', format: 'webm', video_codec: 'vp9', quality: 'auto:eco' }
        ] : [
          { width: 150, height: 150, crop: 'fill', gravity: 'face' }, // Thumbnail
          { width: 600, crop: 'scale' }, // Medium
        ],
        eager_async: isVideo, 
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));

        // Get the eager transformation URLs
        const thumbnailUrl = isVideo 
          ? result.secure_url.replace(/\.[^/.]+$/, '.jpg') 
          : result.eager?.[0]?.secure_url || result.secure_url;
        const mediumUrl = isVideo 
          ? (result.eager?.[0]?.secure_url || result.secure_url) 
          : result.eager?.[1]?.secure_url || result.secure_url;

        resolve({
          url: result.secure_url,
          thumbnailUrl,
          mediumUrl,
          storedName: `${result.public_id}.${result.format}`,
          displayName,
          folderName,
          folderPath,
          metadata: {
            size: Math.round(result.bytes / 1024), // KB
            format: result.format,
            dimensions: isVideo ? `${result.width}x${result.height}` : dimensions,
          },
        });

        console.log(`[admin:cloudinary] uploaded ${storedName} to Cloudinary (${result.secure_url})`);
      }
    );

    uploadStream.end(processedBuffer);
  });
}

/**
 * Validate URL and fetch image with timeout
 */
export async function fetchImageFromUrl(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new Error('Invalid MIME type. Only images are allowed.');
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 10 seconds');
    }
    throw error;
  }
}
