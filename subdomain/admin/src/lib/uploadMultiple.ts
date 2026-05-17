import { compressImage } from './compressImage';
import { createProductImageConfig, uploadImage, type UploadImageConfig } from './cloudinaryUpload';

export async function uploadMultiple(
  files: File[], 
  config: UploadImageConfig,
  onProgress?: (pct: number) => void
): Promise<string[]> {
  const baseIndex = config.index ?? 1;
  const progressMap = new Map<number, number>();
  
  const totalFiles = files.length;
  const updateGlobalProgress = () => {
    if (!onProgress) return;
    let totalPct = 0;
    progressMap.forEach(pct => totalPct += pct);
    onProgress(Math.round(totalPct / totalFiles));
  };

  const uploads = files.map(async (file, index) => {
    const compressed = await compressImage(file);
    const nextConfig =
      config.type === 'gallery'
        ? createProductImageConfig(config.slug, config.type, { index: baseIndex + index })
        : createProductImageConfig(config.slug, config.type, {
            index: config.index,
            variant: config.variant,
          });

    return uploadImage(compressed, nextConfig, (pct) => {
      progressMap.set(index, pct);
      updateGlobalProgress();
    });
  });

  return Promise.all(uploads);
}
