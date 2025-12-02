'use server';

/**
 * @fileOverview This file defines a Genkit flow for researching keywords, providing search trends and related keywords.
 *
 * - researchKeywords - A function that takes a keyword and returns trend data and related keywords.
 * - ResearchKeywordsInput - The input type for the researchKeywords function.
 * - ResearchKeywordsOutput - The return type for the researchKeywords function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TrendDataSchema = z.object({
  date: z.string().describe('The date for the data point (e.g., "YYYY-MM").'),
  "Search Volume": z.number().describe('The search volume for that date.'),
});

const RelatedKeywordSchema = z.object({
  term: z.string().describe('The related keyword term.'),
  volume: z.string().describe('The monthly search volume (e.g., "12.1K").'),
  competition: z.enum(['High', 'Medium', 'Low']).describe('The competition level for the keyword.'),
  trend: z.enum(['up', 'down', 'stable']).describe('The search trend direction.'),
});

const ResearchKeywordsInputSchema = z.object({
  keyword: z.string().describe('The keyword to research.'),
});
export type ResearchKeywordsInput = z.infer<typeof ResearchKeywordsInputSchema>;

const ResearchKeywordsOutputSchema = z.object({
  trendData: z.array(TrendDataSchema).describe('An array of search volume data points over the last 6 months.'),
  relatedKeywords: z.array(RelatedKeywordSchema).describe('An array of 5 related keywords with their metrics.'),
});
export type ResearchKeywordsOutput = z.infer<typeof ResearchKeywordsOutputSchema>;

export async function researchKeywords(
  input: ResearchKeywordsInput
): Promise<ResearchKeywordsOutput> {
  return researchKeywordsFlow(input);
}


const prompt = ai.definePrompt({
    name: 'researchKeywordsPrompt',
    input: { schema: ResearchKeywordsInputSchema },
    output: { schema: ResearchKeywordsOutputSchema },
    prompt: `You are a YouTube keyword research expert. For the given keyword, generate realistic but fictional data.
    
    Keyword: {{{keyword}}}
    
    Generate the following:
    1.  **Trend Data**: Create 7 data points for a monthly search volume trend over the last 7 months. The date format should be 'YYYY-MM'.
    2.  **Related Keywords**: Create a list of 5 related keywords. For each, provide a realistic monthly search volume (as a string like "12.1K"), competition level ('High', 'Medium', or 'Low'), and a trend ('up', 'down', or 'stable').
    
    Do not use real-time data. The data should be plausible for a real-world scenario related to the keyword.
    `,
});


const researchKeywordsFlow = ai.defineFlow(
  {
    name: 'researchKeywordsFlow',
    inputSchema: ResearchKeywordsInputSchema,
    outputSchema: ResearchKeywordsOutputSchema,
  },
  async (input) => {
    console.log(`Researching keyword with AI: ${input.keyword}`);
    const { output } = await prompt(input);
    return output!;
  }
);
