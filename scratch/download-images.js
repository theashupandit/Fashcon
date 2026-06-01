import fs from 'fs';
import path from 'path';

const urls = [
  'https://res.cloudinary.com/fashconcloud/image/upload/v1779875619/Collection/media_manager/products-product-main/64f1a2b3c4d5e6f7a8b9c0d1_1779875619081_cropped_1779875614853_jpg.webp',
  'https://res.cloudinary.com/fashconcloud/image/upload/v1779875629/Collection/media_manager/products-product-gallery/64f1a2b3c4d5e6f7a8b9c0d1_1779875629372_young_beautiful_woman__age_23_30__202605.webp',
  'https://res.cloudinary.com/fashconcloud/image/upload/v1779875645/Collection/media_manager/products-product-gallery/64f1a2b3c4d5e6f7a8b9c0d1_1779875645158_young_beautiful_woman__age_23_30__202605.webp'
];

async function download() {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      const filename = `scratch/image-${i}.webp`;
      fs.writeFileSync(filename, buffer);
      console.log(`Downloaded ${url} to ${filename} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`Failed for ${url}:`, err.message);
    }
  }
}

download();
