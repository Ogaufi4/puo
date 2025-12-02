import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  streamText,
} from 'ai';
import fs from 'fs';
import path from 'path';

import { auth } from '@/app/(auth)/auth';
import {
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';

// Load translation data
const translationFilePath = path.join(process.cwd(), 'public', 'documents', 'translation.json');
let translationData: any[] = [];

try {
  if (fs.existsSync(translationFilePath)) {
    const fileContent = fs.readFileSync(translationFilePath, 'utf-8');
    translationData = JSON.parse(fileContent);
  } else {
    console.warn('Translation file not found at:', translationFilePath);
  }
} catch (error) {
  console.error('Error loading translation data:', error);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function getSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - levenshteinDistance(longer, shorter)) / longerLength;
}

function findTranslation(input: string): any | null {
  if (!translationData || translationData.length === 0) return null;
  
  const normalizedInput = input.trim().toLowerCase();
  
  // 1. Exact/Lowercased match
  const exactMatch = translationData.find(item => 
    item.en.toLowerCase() === normalizedInput || 
    item.tn.toLowerCase() === normalizedInput
  );

  if (exactMatch) {
    const isEn = exactMatch.en.toLowerCase() === normalizedInput;
    return {
      input: input,
      translation: isEn ? exactMatch.tn : exactMatch.en,
      detected_language: isEn ? 'en' : 'tn',
      source: 'dictionary',
      category: exactMatch.category
    };
  }

  // 2. Fuzzy match (similarity >= 70%)
  let bestMatch = null;
  let highestSimilarity = 0;

  for (const item of translationData) {
    const simEn = getSimilarity(normalizedInput, item.en.toLowerCase());
    const simTn = getSimilarity(normalizedInput, item.tn.toLowerCase());
    
    if (simEn > highestSimilarity) {
      highestSimilarity = simEn;
      bestMatch = { item, lang: 'en' };
    }
    if (simTn > highestSimilarity) {
      highestSimilarity = simTn;
      bestMatch = { item, lang: 'tn' };
    }
  }

  if (highestSimilarity >= 0.7 && bestMatch) {
    return {
      input: input,
      translation: bestMatch.lang === 'en' ? bestMatch.item.tn : bestMatch.item.en,
      detected_language: bestMatch.lang,
      source: 'fuzzy',
      category: bestMatch.item.category
    };
  }

  return null;
}

function getMostRecentUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export async function POST(request: Request) {
  console.log('🔵 [API /chat] POST request received');
  const { id, messages, modelId: selectedChatModel } = await request.json();
  console.log('🔵 [API /chat] Request data:', { id, messageCount: messages?.length, selectedChatModel });

  const session = await auth();

  if (!session || !session.user) {
    console.log('🔴 [API /chat] Unauthorized - no session');
    return new Response('Unauthorized', { status: 401 });
  }

  if (!id || !messages || !Array.isArray(messages) || messages.length === 0) {
    console.log('🔴 [API /chat] Invalid request body');
    return new Response('Invalid request body', { status: 400 });
  }

  const userMessage = getMostRecentUserMessage(messages);
  console.log('🔵 [API /chat] User message:', userMessage?.content);

  if (!userMessage) {
    console.log('🔴 [API /chat] No user message found');
    return new Response('No user message found', { status: 400 });
  }

  // Check if chat exists, if not, create a placeholder chat
  const chat = await getChatById({ id });
  if (!chat) {
    console.log('🔵 [API /chat] Creating new chat');
    const content = typeof userMessage.content === 'string' ? userMessage.content : JSON.stringify(userMessage.content);
    const title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    await saveChat({ id, userId: session.user!.id!, title });
  }

  // Save the user message
  await saveMessages({
    messages: [{ ...userMessage, id: userMessage.id ?? generateUUID(), createdAt: new Date(), chatId: id }],
  });
  console.log('🔵 [API /chat] User message saved');

  const model = models.find((m) => m.id === selectedChatModel) || models[0];
  console.log('🔵 [API /chat] Using model:', model.id, model.apiIdentifier);
  const coreMessages = convertToCoreMessages(messages);
  console.log('🔵 [API /chat] Core messages count:', coreMessages.length);
  const userMessageId = generateUUID();

  // Try dictionary/fuzzy lookup
  let translationResult = null;
  if (typeof userMessage.content === 'string') {
    translationResult = findTranslation(userMessage.content);
  }

  console.log('🔵 [API /chat] Creating data stream response');
  return createDataStreamResponse({
    execute: (dataStream) => {
      console.log('🔵 [API /chat] Execute function called');
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });
      console.log('🔵 [API /chat] User message ID written to stream');

      console.log('🔵 [API /chat] Starting streamText');
      
      let finalSystemPrompt = systemPrompt;
      let finalMessages = coreMessages;

      if (translationResult) {
        console.log('🟢 [API /chat] Dictionary/Fuzzy match found:', translationResult);
        // If match found, force the model to output this result
        finalSystemPrompt = `You are a JSON outputting system. Output EXACTLY the following JSON object and nothing else: ${JSON.stringify(translationResult)}`;
        // We clear messages to avoid confusion, or just append a system instruction
        finalMessages = [
           { role: 'user', content: 'Output the JSON.' }
        ];
      }

      const result = streamText({
        model: customModel(model.apiIdentifier) as any,
        system: finalSystemPrompt,
        messages: finalMessages,
        maxSteps: 5,
        onFinish: async ({ text }) => {
          console.log('🟢 [API /chat] Stream finished. Response text:', text);
          // Save the assistant message to the database
          await saveMessages({
            messages: [{
              id: generateUUID(),
              role: 'assistant',
              content: text,
              createdAt: new Date(),
              chatId: id,
            }],
          });
          console.log('🟢 [API /chat] Assistant message saved');
        },
      });

      console.log('🔵 [API /chat] Merging result into data stream');
      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      console.error('🔴 [API /chat] Stream error:', error);
      return 'Oops, an error occurred during the stream!';
    },
  });
}