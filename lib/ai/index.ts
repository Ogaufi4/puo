import { google } from '@ai-sdk/google';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: google(apiIdentifier),
    middleware: customMiddleware,
  });
};

// Note: Gemini doesn't have image generation, you may need to keep OpenAI for this
// or use a different service for image generation
export const imageGenerationModel = google('gemini-1.5-flash'); // Placeholder
