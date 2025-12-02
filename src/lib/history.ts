import { type MessageData } from 'genkit';
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ContinueConversationInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string().describe("The user's latest message."),
});
export type ContinueConversationInput = z.infer<typeof ContinueConversationInputSchema>;


/**
 * Converts the chat history from the app's format to Genkit's format.
 * @param history The chat history from the application.
 * @returns The chat history in Genkit's format.
 */
export function toGenkitHistory(history: ChatMessage[]): MessageData[] {
  return history.map((message) => ({
    role: message.role,
    content: [{ text: message.content }],
  }));
}
