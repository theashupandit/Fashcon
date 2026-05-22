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
You are an elite SEO expert for a premium fashion e-commerce brand.
Based on the following product details, generate an optimized Meta Title and Meta Description for search engines (Google).

Context:
- Title: ${data.title}
- Description: ${data.description}
- Category: ${data.category || 'Apparel'}
- Brand: ${data.brand || 'Fashcon'}
- Tags: ${data.tags.join(', ')}

Rules:
1. Meta Title MUST be under 60 characters. It should be catchy, include the primary keyword, and optionally the brand name.
2. Meta Description MUST be under 160 characters. It should be compelling, describe the product perfectly, and include a call to action.
3. Keep the tone premium, elegant, and persuasive.

Return ONLY a valid JSON object matching this structure:
{
  "metaTitle": "Your < 60 chars title here",
  "metaDesc": "Your < 160 chars description here"
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
