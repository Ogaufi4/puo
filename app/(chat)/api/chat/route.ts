import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  streamText,
} from 'ai';

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
      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt,
        messages: coreMessages,
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