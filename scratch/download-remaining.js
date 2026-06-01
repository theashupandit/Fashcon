import fs from 'fs';

const urls = [
  'https://res.cloudinary.com/fashconcloud/image/upload/v1779875687/Collection/media_manager/products-product-gallery/64f1a2b3c4d5e6f7a8b9c0d1_1779875687548_71tjdbm0rvl__sy500__jpg.webp',
  'https://res.cloudinary.com/fashconcloud/image/upload/v1779875693/Collection/media_manager/products-product-gallery/64f1a2b3c4d5e6f7a8b9c0d1_1779875693338_61xublvvuol__sx569__jpg.webp',
  'https://res.cloudinary.com/fashconcloud/image/upload/v1779875753/Collection/media_manager/products-product-gallery/64f1a2b3c4d5e6f7a8b9c0d1_1779875753796_81ioqrpdjbl__sy550__jpg.webp'
];

async function download() {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      const filename = `scratch/gallery-${i + 2}.webp`;
      fs.writeFileSync(filename, buffer);
      console.log(`Downloaded ${url} to ${filename} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`Failed for ${url}:`, err.message);
    }
  }
}

download();
