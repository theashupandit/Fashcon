const urls = [
  'https://res.cloudinary.com/fashconcloud/image/upload/v1779879573/Collection/media_manager/products-pink-ribbed-collared-side-tie-maxi-dress-women-vari/64f1a2b3c4d5e6f7a8b9c0d1_1779879573475_cropped_1779879569866_jpg.webp',
  'https://res.cloudinary.com/fashconcloud/image/upload/v1779879708/Collection/media_manager/products-pink-ribbed-collared-side-tie-maxi-dress-women-vari/64f1a2b3c4d5e6f7a8b9c0d1_1779879708051_cropped_1779879705745_jpg.webp'
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err.message);
    }
  }
}

check();
