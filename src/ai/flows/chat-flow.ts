'use server';
/**
 * @fileOverview A conversational AI flow for the AI Assistant page.
 *
 * - continueConversation - A function that continues a chat conversation.
 * - ContinueConversationInput - The input type for the continueConversation function.
 * - ChatMessage - The type for a single message in the conversation history.
 */

import { ai, getGeminiApiKey, createGenkitInstanceWithKey } from '@/ai/genkit';
import { z } from 'genkit';
import { toGenkitHistory, ContinueConversationInputSchema, type ContinueConversationInput } from '@/lib/history';

export interface ContinueConversationInputWithUser extends ContinueConversationInput {
  userId?: string;
}

export async function continueConversation(input: ContinueConversationInputWithUser): Promise<string> {
  // Get user's API key if available
  const apiKey = await getGeminiApiKey(input.userId);
  
  // Use custom instance if user has API key and env doesn't have one
  const aiInstance = (apiKey && !process.env.GOOGLE_API_KEY) 
    ? createGenkitInstanceWithKey(apiKey)
    : ai;
  
  // Create flow with the appropriate instance
  const flow = aiInstance.defineFlow(
    {
      name: 'continueConversationFlow',
      inputSchema: ContinueConversationInputSchema,
      outputSchema: z.string(),
    },
    async ({ history, message }) => {
      const genkitHistory = toGenkitHistory(history);

      // Build conversation context with system prompt
      const systemPrompt = `You are a helpful and friendly AI assistant named TubeTrend AI. Keep your responses concise, easy to understand, and encouraging. Use markdown for formatting when it helps with readability.`;

      // Combine history with new message
      const allMessages = [
        ...genkitHistory,
        {
          role: 'user' as const,
          content: [{ text: message }],
        },
      ];

      // Build prompt parts array
      const promptParts = [
        { text: systemPrompt },
        ...allMessages.flatMap(msg => msg.content),
      ];

      // Use ai.generate with prompt parts
      const { text } = await aiInstance.generate(promptParts);

      return text;
    }
  );
  
  return flow({ history: input.history, message: input.message });
}

const continueConversationFlow = ai.defineFlow(
  {
    name: 'continueConversationFlow',
    inputSchema: ContinueConversationInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, message }) => {
    const genkitHistory = toGenkitHistory(history);

    // Build conversation context with system prompt
    const systemPrompt = `You are a helpful and friendly AI assistant named TubeTrend AI. Keep your responses concise, easy to understand, and encouraging. Use markdown for formatting when it helps with readability.`;

    // Combine history with new message
    const allMessages = [
      ...genkitHistory,
      {
        role: 'user' as const,
        content: [{ text: message }],
      },
    ];

    // Build prompt parts array
    const promptParts = [
      { text: systemPrompt },
      ...allMessages.flatMap(msg => msg.content),
    ];

    // Use ai.generate with prompt parts
    const { text } = await ai.generate(promptParts);

    return text;
  }
);
