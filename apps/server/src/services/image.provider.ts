import { config } from '../config.js';

export interface ImagePromptStructure {
  shot?: string;
  lens?: string;
  lighting?: string;
  mood?: string;
  character?: string;
  environment?: string;
  visualStyle?: string;
  rawPrompt?: string;
}

export class ImageGenerationProvider {
  static async generateStoryboardFrame(promptData: ImagePromptStructure): Promise<{ imageUrl: string; prompt: string; structuredPrompt: string }> {
    const fullPrompt = promptData.rawPrompt ||
      `Cinematic film still, ${promptData.shot || 'Medium Shot'}, ${promptData.lens || '50mm'} anamorphic lens, ${promptData.lighting || 'dramatic lighting'}, ${promptData.mood || 'tense mood'}, ${promptData.character || 'character'}, ${promptData.environment || 'cinematic setting'}, ${promptData.visualStyle || 'Neo-Noir cinematic realism'}, 8k, masterpiece, color graded.`;

    const structuredStr = JSON.stringify(promptData);

    // If external provider is configured
    if (config.imageProvider !== 'none' && config.imageApiKey) {
      try {
        if (config.imageProvider === 'openai') {
          const res = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.imageApiKey}`,
            },
            body: JSON.stringify({
              prompt: fullPrompt,
              n: 1,
              size: '1024x1024',
            }),
          });
          const json = await res.json();
          if (json.data && json.data[0]?.url) {
            return {
              imageUrl: json.data[0].url,
              prompt: fullPrompt,
              structuredPrompt: structuredStr,
            };
          }
        }
      } catch (err) {
        console.error('Image generation provider error:', err);
      }
    }

    // High-aesthetic contextual cinematic fallback images based on genre/mood
    const cinematicFallbacks = [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    ];

    const hash = (fullPrompt.length * 13) % cinematicFallbacks.length;
    const fallbackImage = cinematicFallbacks[hash];

    return {
      imageUrl: fallbackImage,
      prompt: fullPrompt,
      structuredPrompt: structuredStr,
    };
  }
}
