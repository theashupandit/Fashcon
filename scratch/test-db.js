import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashcon';

async function test() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const blogs = await Blog.find({ slug: '5-dinner-outfit-ideas-that-look-effortlessly-classy-without-overdressing' });
  console.log('Blogs found:', blogs.length);
  for (const blog of blogs) {
    console.log('Blog title:', blog.title);
    if (blog.sections) {
      for (const sec of blog.sections) {
        console.log('Section title:', sec.title);
        console.log('Section image:', sec.image);
        if (sec.productId) {
          const prod = await Product.findById(sec.productId);
          if (prod) {
            console.log('  Linked Product:', prod.title);
            console.log('  Product mainImage:', prod.media?.mainImage);
            console.log('  Product gallery:', prod.media?.gallery);
            if (prod.variants) {
              console.log('  Product variants:', prod.variants.map(v => ({ colorName: v.colorName, variantImage: v.variantImage })));
            }
          }
        }
      }
    }
  }
  
  await mongoose.disconnect();
}

test().catch(console.error);
