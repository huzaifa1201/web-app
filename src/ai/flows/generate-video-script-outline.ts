// This file is used to generate a video script outline given a video topic.
'use server';

/**
 * @fileOverview Generates a script outline for a video based on a given topic.
 *
 * - generateVideoScriptOutline - A function that generates a video script outline.
 * - GenerateVideoScriptOutlineInput - The input type for the generateVideoScriptOutline function.
 * - GenerateVideoScriptOutlineOutput - The return type for the generateVideoScriptOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoScriptOutlineInputSchema = z.object({
  topic: z.string().describe('The topic of the video.'),
  language: z.string().optional().describe('The language for the generated outline (e.g., "English", "Spanish", "Hindi").'),
  userId: z.string().optional().describe('User ID for fetching API keys from settings.'),
});

export type GenerateVideoScriptOutlineInput = z.infer<
  typeof GenerateVideoScriptOutlineInputSchema
>;

const GenerateVideoScriptOutlineOutputSchema = z.object({
  outline: z.string().describe('The generated script outline.'),
});

export type GenerateVideoScriptOutlineOutput = z.infer<
  typeof GenerateVideoScriptOutlineOutputSchema
>;

export async function generateVideoScriptOutline(
  input: GenerateVideoScriptOutlineInput
): Promise<GenerateVideoScriptOutlineOutput> {
  // Get user's API key if available
  const { getGeminiApiKey, createGenkitInstanceWithKey, ai } = await import('@/ai/genkit');
  const apiKey = await getGeminiApiKey(input.userId);
  
  // Use custom instance if user has API key and env doesn't have one
  const aiInstance = (apiKey && !process.env.GOOGLE_API_KEY) 
    ? createGenkitInstanceWithKey(apiKey)
    : ai;
  
  // Create prompt with the appropriate instance
  const prompt = aiInstance.definePrompt({
    name: 'generateVideoScriptOutlinePrompt',
    input: {schema: GenerateVideoScriptOutlineInputSchema},
    output: {schema: GenerateVideoScriptOutlineOutputSchema},
    prompt: `You are an expert video script outline generator. Generate a detailed and engaging script outline for a video on the topic: {{{topic}}}. 
  
  {{#if language}}
  Generate the outline in the following language: {{{language}}}.
  {{/if}}
  
  The outline should include an introduction, main points, and a conclusion. Format the outline in a way that is easy to follow and implement for video creation. Be creative and engaging, to capture user attention. 
`,
  });
  
  const {output} = await prompt(input);
  return output!;
}

const prompt = ai.definePrompt({
  name: 'generateVideoScriptOutlinePrompt',
  input: {schema: GenerateVideoScriptOutlineInputSchema},
  output: {schema: GenerateVideoScriptOutlineOutputSchema},
  prompt: `You are an expert video script outline generator. Generate a detailed and engaging script outline for a video on the topic: {{{topic}}}. 
  
  {{#if language}}
  Generate the outline in the following language: {{{language}}}.
  {{/if}}
  
  The outline should include an introduction, main points, and a conclusion. Format the outline in a way that is easy to follow and implement for video creation. Be creative and engaging, to capture user attention. 
`,
});

const generateVideoScriptOutlineFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptOutlineFlow',
    inputSchema: GenerateVideoScriptOutlineInputSchema,
    outputSchema: GenerateVideoScriptOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
