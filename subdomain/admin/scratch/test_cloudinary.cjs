const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from subdomain/admin/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log("MONGODB_URI:", MONGODB_URI);
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function run() {
  try {
    console.log("Testing Cloudinary config...");
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error("Missing Cloudinary cloud name!");
    }
    
    // Create a tiny 1x1 pixel transparent PNG buffer
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    console.log("Uploading test image to Cloudinary...");
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'test_folder',
          public_id: 'test_image_' + Date.now(),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(dummyPng);
    });
    
    console.log("Cloudinary Upload Success!");
    console.log("URL:", uploadResult.secure_url);
    
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error occurred during test:", error);
    process.exit(1);
  }
}

run();
