'use server';

import { GoogleGenAI } from '@google/genai';
import { requireAdmin } from '@/lib/server-auth';
import dbConnect from '@/lib/mongodb';
import { PinterestIntegration } from '@/models/PinterestIntegration';

export async function generateProductTagsAndKeywords(title: string, description: string) {
  await requireAdmin();
  await dbConnect();

  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    const integration = await PinterestIntegration.findOne({});
    apiKey = integration?.geminiApiKey;
  }

  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in Pinterest integration settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert SEO specialist and fashion categorizer.
Based on the following product title and description, generate highly relevant SEO keywords and categorization tags.
Tags should be short, 1-2 words (e.g. "Summer", "Maxi Dress", "Boho", "Cotton").
Keywords should be a mix of short-tail and long-tail SEO phrases (e.g. "summer floral maxi dress", "boho chic outfits").

Title: ${title}
Description: ${description}

Return ONLY a valid JSON object matching this structure:
{
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword phrase 1", "keyword phrase 2", "keyword phrase 3"]
}
  `;

  let response;
  let retries = 3;
  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      break; // Success
    } catch (err: any) {
      if (err.message?.includes('503') || err.message?.includes('demand')) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s before retry
      } else {
        throw err;
      }
    }
  }

  try {
    const text = response?.text;
    if (!text) throw new Error("No response from Gemini API");

    const data = JSON.parse(text);
    return data;
  } catch (error: any) {
    console.error("Gemini AI Generation Error:", error);
    let msg = error.message;
    try {
      const parsed = JSON.parse(msg.replace(/^\[.*?\]\s*/, ''));
      if (parsed.error && parsed.error.message) msg = parsed.error.message;
    } catch(e) {}
    throw new Error(msg || "Failed to generate tags and keywords using Gemini.");
  }
}

export async function generateSeoMeta(data: { title: string, description: string, category: string, brand: string, tags: string[] }) {
  await requireAdmin();
  await dbConnect();

  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    const integration = await PinterestIntegration.findOne({});
    apiKey = integration?.geminiApiKey;
  }

  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in Pinterest integration settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an elite SEO copywriting expert specialized in premium e-commerce search engine optimization.
Based on the following product details, generate a click-through rate (CTR) optimized Meta Title and Meta Description for Google Search.

Product Context:
- Title: ${data.title}
- Description: ${data.description}
- Category: ${data.category || 'Apparel'}
- Brand: ${data.brand || 'Fashcon'}
- Tags: ${data.tags.join(', ')}

SEO Strategy Guidelines:
1. Search Intent: Craft titles and descriptions that match transactional intent (shopping, finding styles).
2. Active Voice & Action Verbs: Begin the meta description with a compelling verb (e.g., Shop, Discover, Explore, Elevate, Find).
3. Primary Keywords: Place the primary product keyword naturally near the beginning of both the Title and Description.
4. Value Proposition: Highlight a key unique benefit or quality marker (e.g., premium fabric, flattering fit, aesthetic design).
5. Length Constraints (CRITICAL):
   - Meta Title: MUST be strictly between 50 and 60 characters (spaces included). Do not exceed 60 characters.
   - Meta Description: MUST be strictly between 120 and 155 characters (spaces included). Do not exceed 160 characters under any circumstance.

Return ONLY a valid JSON object matching this structure:
{
  "metaTitle": "Catchy primary keyword title under 60 chars",
  "metaDesc": "Action-oriented compelling value description under 155 chars"
}
  `;

  let response;
  let retries = 3;
  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      break; // Success
    } catch (err: any) {
      if (err.message?.includes('503') || err.message?.includes('demand')) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s before retry
      } else {
        throw err;
      }
    }
  }

  try {
    const text = response?.text;
    if (!text) throw new Error("No response from Gemini API");

    const parsedData = JSON.parse(text);
    return parsedData;
  } catch (error: any) {
    console.error("Gemini SEO Generation Error:", error);
    let msg = error.message;
    try {
      const parsed = JSON.parse(msg.replace(/^\[.*?\]\s*/, ''));
      if (parsed.error && parsed.error.message) msg = parsed.error.message;
    } catch(e) {}
    throw new Error(msg || "Failed to generate SEO meta using Gemini.");
  }
}

export async function generateBlogSeoMeta(data: { title: string, excerpt: string, content: string }) {
  await requireAdmin();
  await dbConnect();

  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    const integration = await PinterestIntegration.findOne({});
    apiKey = integration?.geminiApiKey;
  }

  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in Pinterest integration settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an elite SEO expert specialized in lifestyle, fashion, and e-commerce content optimization.
Based on the following blog article details (title, excerpt, and content), generate high-performing SEO metadata including a primary Focus Keyword, a Meta Description, and a list of related Tags/Keywords.

Blog Context:
- Title: ${data.title}
- Excerpt: ${data.excerpt}
- Content Snippet/Full: ${data.content.slice(0, 4000)}

SEO Strategy Guidelines:
1. Focus Keyword: Determine the single most important search query / keyword phrase (1-3 words) that this article should rank for.
2. Meta Description: Craft a compelling, click-through rate (CTR) optimized description.
   - Start with an action-oriented verb (e.g., Discover, Explore, Learn, Elevate, Master).
   - Incorporate the focus keyword naturally near the beginning.
   - Length: MUST be strictly between 120 and 155 characters (spaces included). Do not exceed 160 characters.
3. Related Tags / Keywords: Provide a list of 5 to 8 highly relevant, search-traffic keywords or tags (e.g., "fashion trends", "skincare guide", "summer styles").

Return ONLY a valid JSON object matching this structure:
{
  "focusKeyword": "Primary focus keyword here",
  "metaDescription": "Action-oriented compelling description under 155 chars",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"]
}
  `;

  let response;
  let retries = 3;
  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      break; // Success
    } catch (err: any) {
      if (err.message?.includes('503') || err.message?.includes('demand')) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw err;
      }
    }
  }

  try {
    const text = response?.text;
    if (!text) throw new Error("No response from Gemini API");

    const parsedData = JSON.parse(text);
    return parsedData;
  } catch (error: any) {
    console.error("Gemini Blog SEO Generation Error:", error);
    let msg = error.message;
    try {
      const parsed = JSON.parse(msg.replace(/^\[.*?\]\s*/, ''));
      if (parsed.error && parsed.error.message) msg = parsed.error.message;
    } catch(e) {}
    throw new Error(msg || "Failed to generate blog SEO meta using Gemini.");
  }
}

export async function generateBlogTags(title: string, content: string) {
  await requireAdmin();
  await dbConnect();

  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    const integration = await PinterestIntegration.findOne({});
    apiKey = integration?.geminiApiKey;
  }

  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in Pinterest integration settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert fashion editor and content organizer.
Based on the following blog article details (title and content), generate a list of 5 to 10 highly relevant, single-word or short phrase tags/categories (e.g., "Skincare", "Beauty Tips", "Summer", "Old Money") that fit this content.

Article:
- Title: ${title}
- Content: ${content.slice(0, 3000)}

Return ONLY a valid JSON array of strings:
["tag1", "tag2", "tag3"]
  `;

  let response;
  let retries = 3;
  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      break; // Success
    } catch (err: any) {
      if (err.message?.includes('503') || err.message?.includes('demand')) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw err;
      }
    }
  }

  try {
    const text = response?.text;
    if (!text) throw new Error("No response from Gemini API");

    const parsedData = JSON.parse(text);
    return parsedData;
  } catch (error: any) {
    console.error("Gemini Blog Tags Generation Error:", error);
    let msg = error.message;
    try {
      const parsed = JSON.parse(msg.replace(/^\[.*?\]\s*/, ''));
      if (parsed.error && parsed.error.message) msg = parsed.error.message;
    } catch(e) {}
    throw new Error(msg || "Failed to generate blog tags using Gemini.");
  }
}

export async function generateBlogExcerpt(title: string, content: string) {
  await requireAdmin();
  await dbConnect();

  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const integration = await PinterestIntegration.findOne({});
    apiKey = integration?.geminiApiKey;
  }
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in Pinterest integration settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are an expert fashion and lifestyle editor.
Based on the following blog article title and content, generate a highly engaging, professional 1-2 sentence summary (hook/excerpt) of the blog post. It should be concise and optimized to capture reader interest in article lists.
Maximum length: 150 characters.

Article Title: ${title}
Content: ${content.slice(0, 3000)}

Return ONLY a valid JSON object matching this structure:
{
  "excerpt": "Engaging 1-2 sentence hook here"
}
  `;

  let response;
  let retries = 3;
  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      break;
    } catch (err: any) {
      if (err.message?.includes('503') || err.message?.includes('demand')) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw err;
      }
    }
  }

  try {
    const text = response?.text;
    if (!text) throw new Error("No response from Gemini API");
    const data = JSON.parse(text);
    return data.excerpt || '';
  } catch (error: any) {
    console.error("Gemini Blog Excerpt Generation Error:", error);
    throw new Error("Failed to generate blog excerpt using Gemini.");
  }
}

export async function generateBlogCardInfo(title: string, content: string) {
  await requireAdmin();
  await dbConnect();

  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const integration = await PinterestIntegration.findOne({});
    apiKey = integration?.geminiApiKey;
  }
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please add it in Pinterest integration settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are an expert fashion editor.
Based on the following blog article title and content, generate a short bulleted list or a very concise breakdown summarizing the key points of the post to show in the sliding pull-out blog card drawer.
Maximum length: 250 characters. Keep it extremely punchy.

Article Title: ${title}
Content: ${content.slice(0, 3000)}

Return ONLY a valid JSON object matching this structure:
{
  "cardInfo": "Concise key breakdown/points here"
}
  `;

  let response;
  let retries = 3;
  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      break;
    } catch (err: any) {
      if (err.message?.includes('503') || err.message?.includes('demand')) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw err;
      }
    }
  }

  try {
    const text = response?.text;
    if (!text) throw new Error("No response from Gemini API");
    const data = JSON.parse(text);
    return data.cardInfo || '';
  } catch (error: any) {
    console.error("Gemini Blog Card Info Generation Error:", error);
    throw new Error("Failed to generate blog card info using Gemini.");
  }
}



