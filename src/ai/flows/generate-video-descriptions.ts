'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating YouTube video descriptions based on a topic and target audience.
 *
 * - generateVideoDescription - A function that takes a topic and target audience as input and returns a generated video description.
 * - GenerateVideoDescriptionInput - The input type for the generateVideoDescription function.
 * - GenerateVideoDescriptionOutput - The return type for the generateVideoDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoDescriptionInputSchema = z.object({
  topic: z.string().describe('The topic of the YouTube video.'),
  targetAudience: z.string().describe('The target audience for the YouTube video.'),
  language: z.string().optional().describe('The language for the generated description (e.g., "English", "Spanish", "Hindi").'),
  userId: z.string().optional().describe('User ID for fetching API keys from settings.'),
});
export type GenerateVideoDescriptionInput = z.infer<typeof GenerateVideoDescriptionInputSchema>;

const GenerateVideoDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated YouTube video description.'),
});
export type GenerateVideoDescriptionOutput = z.infer<typeof GenerateVideoDescriptionOutputSchema>;

export async function generateVideoDescription(
  input: GenerateVideoDescriptionInput
): Promise<GenerateVideoDescriptionOutput> {
  // Get user's API key if available
  const { getGeminiApiKey, createGenkitInstanceWithKey, ai } = await import('@/ai/genkit');
  const apiKey = await getGeminiApiKey(input.userId);
  
  // Use custom instance if user has API key and env doesn't have one
  const aiInstance = (apiKey && !process.env.GOOGLE_API_KEY) 
    ? createGenkitInstanceWithKey(apiKey)
    : ai;
  
  // Create prompt with the appropriate instance
  const prompt = aiInstance.definePrompt({
    name: 'generateVideoDescriptionPrompt',
    input: {schema: GenerateVideoDescriptionInputSchema},
    output: {schema: GenerateVideoDescriptionOutputSchema},
    prompt: `You are an expert YouTube video description writer.

  Based on the topic and target audience, generate a compelling and SEO-friendly YouTube video description.
  
  {{#if language}}
  Generate the description in the following language: {{{language}}}.
  {{/if}}

  Topic: {{{topic}}}
  Target Audience: {{{targetAudience}}}
  `,
  });
  
  const {output} = await prompt(input);
  return output!;
}

const prompt = ai.definePrompt({
  name: 'generateVideoDescriptionPrompt',
  input: {schema: GenerateVideoDescriptionInputSchema},
  output: {schema: GenerateVideoDescriptionOutputSchema},
  prompt: `You are an expert YouTube video description writer.

  Based on the topic and target audience, generate a compelling and SEO-friendly YouTube video description.
  
  {{#if language}}
  Generate the description in the following language: {{{language}}}.
  {{/if}}

  Topic: {{{topic}}}
  Target Audience: {{{targetAudience}}}
  `,
});

const generateVideoDescriptionFlow = ai.defineFlow(
  {
    name: 'generateVideoDescriptionFlow',
    inputSchema: GenerateVideoDescriptionInputSchema,
    outputSchema: GenerateVideoDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
