const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const sharp = require('sharp');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function run() {
  try {
    console.log("Creating dummy 1x1 image buffer...");
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    // sharp optimization logic
    console.log("Optimizing with sharp...");
    const sharpInstance = sharp(dummyPng);
    const metadata = await sharpInstance.metadata();
    
    let processedBuffer = await sharpInstance
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const processedMetadata = await sharp(processedBuffer).metadata();
    const dimensions = `${processedMetadata.width}x${processedMetadata.height}`;
    const format = 'webp';
    console.log("Sharp optimization success! Dimensions:", dimensions, "Format:", format);

    const folderName = 'Root';
    const folderPath = '';
    const categorySegment = 'root';
    const timestamp = Date.now();
    const storedName = `root_64f1a2b3c4d5e6f7a8b9c0d1_${timestamp}_dummy.webp`;
    const publicFolder = `Collection/media_manager/root`;

    console.log("Uploading optimized stream to Cloudinary...");
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: storedName.replace('.webp', ''),
          folder: publicFolder,
          resource_type: 'image',
          quality: 'auto',
          transformation: [
            { format: 'webp', quality: 80 }
          ],
          eager: [
            { width: 150, height: 150, crop: 'fill', gravity: 'face' }, // Thumbnail
            { width: 600, crop: 'scale' }, // Medium
          ],
        },
        (error, res) => {
          if (error) reject(error);
          else resolve(res);
        }
      );
      uploadStream.end(processedBuffer);
    });

    console.log("Cloudinary Upload Stream Successful!");
    console.log("Result:", result);
    process.exit(0);
  } catch (error) {
    console.error("Error running optimize and upload logic:", error);
    process.exit(1);
  }
}

run();
