

const urls = [
  'https://res.cloudinary.com/fashconcloud/image/upload/q_auto,f_auto/v1779875619/Collection/media_manager/products-product-main/64f1a2b3c4d5e6f7a8b9c0d1_1779875619081_cropped_1779875614853_jpg.webp',
  'https://res.cloudinary.com/fashconcloud/image/upload/q_auto,f_auto/v1779875629/Collection/media_manager/products-product-gallery/64f1a2b3c4d5e6f7a8b9c0d1_1779875629372_young_beautiful_woman__age_23_30__202605.webp',
  'https://res.cloudinary.com/fashconcloud/image/upload/q_auto,f_auto/v1779875645/Collection/media_manager/products-product-gallery/64f1a2b3c4d5e6f7a8b9c0d1_1779875645158_young_beautiful_woman__age_23_30__202605.webp'
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status} ${res.statusText}`);
      if (res.status !== 200) {
        console.log(`Body: ${await res.text()}`);
      }
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err.message);
    }
  }
}

check();
