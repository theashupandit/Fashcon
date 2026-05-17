type UploadType = 'main' | 'gallery' | 'variants';

export type UploadImageConfig = {
  slug: string;
  type: UploadType;
  index?: number;
  variant?: string;
};

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function transformDriveUrl(url: string) {
  // Support both /file/d/ID/view and /open?id=ID patterns
  const fileIdMatch = url.match(/\/d\/(.*?)\/|id=(.*?)(&|$)/);
  const id = fileIdMatch ? (fileIdMatch[1] || fileIdMatch[2]) : null;

  if (id) {
    return `https://drive.google.com/uc?export=download&id=${id}`;
  }
  return url;
}

export async function uploadImageFromUrl(
  url: string,
  config: UploadImageConfig
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing (Cloud Name or Upload Preset).');
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    throw new Error('Please provide a valid image URL.');
  }

  const finalUrl = transformDriveUrl(url);

  const { folder, publicId } = buildCloudinaryPath(config);

  const formData = new FormData();
  formData.append('file', finalUrl);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('public_id', publicId);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data?.error?.message || 'Failed to upload image from URL.';
      if (errorMessage.includes('Invalid image file') || errorMessage.includes('not found')) {
        throw new Error('The provided URL is not a valid or accessible image.');
      }
      throw new Error(errorMessage);
    }

    return data.secure_url;
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error or Cloudinary API unreachable.');
    }
    throw error;
  }
}

function buildSuffix(config: UploadImageConfig) {
  if (config.type === 'main') {
    return 'main';
  }

  if (config.type === 'gallery') {
    return `gallery-${config.index ?? 1}`;
  }

  const variantSlug = slugifySegment(config.variant || 'variant');
  return `variant-${variantSlug}`;
}

function buildCloudinaryPath(config: UploadImageConfig) {
  const slug = slugifySegment(config.slug);
  const type = slugifySegment(config.type);
  const suffix = buildSuffix(config);
  const rootFolder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'Collection';
  const folder = `${rootFolder}/products/${slug}/${type}`;
  const publicId = `${slug}-${suffix}`;

  return { folder, publicId, slug, type };
}

export async function uploadImage(
  file: File, 
  config: UploadImageConfig,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.');
  }

  const { folder, publicId } = buildCloudinaryPath(config);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folderName', config.type);
  formData.append('folderPath', `products/${config.slug}/${config.type}`);
  // Pass additional context if needed
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/media/upload', true);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.url) resolve(data.url);
          else reject(new Error('Upload succeeded but no URL returned.'));
        } catch (err) {
          reject(new Error('Failed to parse upload response.'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload.'));
    xhr.send(formData);
  });
}

export function createProductImageConfig(
  slug: string,
  type: UploadType,
  options: Pick<UploadImageConfig, 'index' | 'variant'> = {}
): UploadImageConfig {
  return {
    slug,
    type,
    ...options,
  };
}
