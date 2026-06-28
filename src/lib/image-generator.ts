import { openai } from './openai-client';

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageData = response.data?.[0];
    return imageData?.url || null;
  } catch (error: any) {
    console.error("Image generation error:", error);
    return null;
  }
}

export async function generateAdImage(productDescription: string, brand: string, style: string = 'modern luxury'): Promise<string | null> {
  const prompt = `Professional product advertisement image for ${brand}. Product: ${productDescription}. Style: ${style}, premium, luxury, clean background, professional lighting, e-commerce ready. No text, no watermarks.`;
  
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const adImageData = response.data?.[0];
    return adImageData?.url || null;
  } catch (error: any) {
    console.error("Ad image generation error:", error);
    return null;
  }
}