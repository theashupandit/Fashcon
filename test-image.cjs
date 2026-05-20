const https = require('https');

const url = "https://res.cloudinary.com/fashconcloud/image/upload/v1778774862/Collection/products/symbol-premium-womens-sheath-dress-knee-length-desk-to-dinner-available-in-plus-sizes/gallery/symbol-premium-womens-sheath-dress-knee-length-desk-to-dinner-available-in-plus-sizes-gallery-1.jpg";

console.log("Fetching URL:", url);
const req = https.get(url, (res) => {
  console.log("Status Code:", res.statusCode);
  console.log("Headers:", res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    // we don't need body, just status
  });
  res.on('end', () => {
    console.log("Response finished.");
  });
});

req.on('error', (e) => {
  console.error("HTTP error:", e);
});
