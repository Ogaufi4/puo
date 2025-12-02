import { google } from '@ai-sdk/google';

export const customModel = (apiIdentifier: string) => {
  // Note: Custom middleware is not compatible with Google's v2 models
  // If you need middleware, you'll need to implement it differently
  return google(apiIdentifier);
};

// Note: Gemini doesn't have image generation, you may need to keep OpenAI for this
// or use a different service for image generation
export const imageGenerationModel = google('gemini-1.5-flash'); // Placeholder
