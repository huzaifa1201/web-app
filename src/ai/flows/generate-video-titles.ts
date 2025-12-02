'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating YouTube video titles based on a topic and target audience.
 *
 * - generateVideoTitles - A function that generates video title suggestions.
 * - GenerateVideoTitlesInput - The input type for the generateVideoTitles function.
 * - GenerateVideoTitlesOutput - The output type for the generateVideoTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoTitlesInputSchema = z.object({
  topic: z.string().describe('The topic of the YouTube video.'),
  targetAudience: z.string().describe('The target audience for the video.'),
  language: z.string().optional().describe('The language for the generated titles (e.g., "English", "Spanish", "Hindi").'),
  userData: z.string().optional().describe('Any relevant user data for personalization.'),
  userId: z.string().optional().describe('User ID for fetching API keys from settings.'),
});
export type GenerateVideoTitlesInput = z.infer<typeof GenerateVideoTitlesInputSchema>;

const GenerateVideoTitlesOutputSchema = z.object({
  titles: z.array(z.string()).describe('An array of suggested video titles.'),
});
export type GenerateVideoTitlesOutput = z.infer<typeof GenerateVideoTitlesOutputSchema>;

export async function generateVideoTitles(input: GenerateVideoTitlesInput): Promise<GenerateVideoTitlesOutput> {
  // Get user's API key if available
  const { getGeminiApiKey, createGenkitInstanceWithKey, ai } = await import('@/ai/genkit');
  const apiKey = await getGeminiApiKey(input.userId);
  
  // Use custom instance if user has API key and env doesn't have one
  const aiInstance = (apiKey && !process.env.GOOGLE_API_KEY) 
    ? createGenkitInstanceWithKey(apiKey)
    : ai;
  
  // Create prompt with the appropriate instance
  const prompt = aiInstance.definePrompt({
    name: 'generateVideoTitlesPrompt',
    input: {schema: GenerateVideoTitlesInputSchema},
    output: {schema: GenerateVideoTitlesOutputSchema},
    prompt: `You are an expert YouTube video title generator. Based on the topic and target audience provided, generate multiple compelling title options that will maximize click-through-rate and views.

Topic: {{{topic}}}
Target Audience: {{{targetAudience}}}

{{#if language}}
Generate the titles in the following language: {{{language}}}.
{{/if}}

{{#if userData}}
User Data: {{{userData}}}
Consider this information when generating titles to make them more personalized and relevant.
{{/if}}

Output an array of at least 5 title suggestions.
Titles:
`, config: {
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
      ],
    },
  });
  
  const {output} = await prompt(input);
  return output!;
}

// Legacy flow for backward compatibility (uses default instance)
const generateVideoTitlesFlow = ai.defineFlow(
  {
    name: 'generateVideoTitlesFlow',
    inputSchema: GenerateVideoTitlesInputSchema,
    outputSchema: GenerateVideoTitlesOutputSchema,
  },
  async input => {
    const prompt = ai.definePrompt({
      name: 'generateVideoTitlesPrompt',
      input: {schema: GenerateVideoTitlesInputSchema},
      output: {schema: GenerateVideoTitlesOutputSchema},
      prompt: `You are an expert YouTube video title generator. Based on the topic and target audience provided, generate multiple compelling title options that will maximize click-through-rate and views.

Topic: {{{topic}}}
Target Audience: {{{targetAudience}}}

{{#if language}}
Generate the titles in the following language: {{{language}}}.
{{/if}}

{{#if userData}}
User Data: {{{userData}}}
Consider this information when generating titles to make them more personalized and relevant.
{{/if}}

Output an array of at least 5 title suggestions.
Titles:
`, config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
      },
    });
    const {output} = await prompt(input);
    return output!;
  }
);
