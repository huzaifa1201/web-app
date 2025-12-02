'use server';

/**
 * @fileOverview This flow generates video tags with SEO scores based on a given topic.
 *
 * - generateVideoTags - A function that generates video tags and their scores.
 * - GenerateVideoTagsInput - The input type for the generateVideoTags function.
 * - GenerateVideoTagsOutput - The output type for the generateVideoTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const getKeywordScore = ai.defineTool(
  {
    name: 'getKeywordScore',
    description: 'Returns a score for a given keyword based on its trend and search volume.',
    inputSchema: z.object({
      keyword: z.string().describe('The keyword to score.'),
    }),
    outputSchema: z.number(),
  },
  async (input) => {
    // In a real application, you would use the YouTube and Google Trends APIs here.
    // This is a placeholder for that logic.
    console.log(`Scoring keyword (real API placeholder): ${input.keyword}`);
    
    // Placeholder logic: We'll still generate a score, but it's understood
    // that this would be replaced by actual API calls.
    // For example:
    // const youtubeData = await youtubeApi.search.list({ part: 'snippet', q: input.keyword });
    // const trendsData = await googleTrendsApi.interestOverTime({ keyword: input.keyword });
    // const score = calculateScore(youtubeData, trendsData);
    // Using a deterministic approach to avoid hydration errors caused by Math.random()
    const score = Math.min(100, (input.keyword.length * 7) % 101);
    return score;
  }
)

const GenerateVideoTagsInputSchema = z.object({
  topic: z.string().describe('The topic of the video.'),
  language: z.string().optional().describe('The language for the generated tags (e.g., "English", "Spanish", "Hindi").'),
  userId: z.string().optional().describe('User ID for fetching API keys from settings.'),
});
export type GenerateVideoTagsInput = z.infer<typeof GenerateVideoTagsInputSchema>;

const TagWithScoreSchema = z.object({
  tag: z.string().describe('A relevant tag for the video.'),
  score: z
    .number()
    .describe(
      'An SEO score from 1 to 100, representing the tag\'s effectiveness and relevance.'
    ),
});

const GenerateVideoTagsOutputSchema = z.object({
  tags: z
    .array(TagWithScoreSchema)
    .describe('A list of relevant tags for the video, each with an SEO score.'),
});
export type GenerateVideoTagsOutput = z.infer<typeof GenerateVideoTagsOutputSchema>;

export async function generateVideoTags(input: GenerateVideoTagsInput): Promise<GenerateVideoTagsOutput> {
  // Get user's API key if available
  const { getGeminiApiKey, createGenkitInstanceWithKey, ai } = await import('@/ai/genkit');
  const apiKey = await getGeminiApiKey(input.userId);
  
  // Use custom instance if user has API key and env doesn't have one
  const aiInstance = (apiKey && !process.env.GOOGLE_API_KEY) 
    ? createGenkitInstanceWithKey(apiKey)
    : ai;
  
  // Create prompt and tool with the appropriate instance
  const prompt = aiInstance.definePrompt({
    name: 'generateVideoTagsPrompt',
    input: {schema: z.object({ topic: z.string(), language: z.string().optional() }) },
    output: {schema: z.object({ tags: z.array(z.string()).describe('An array of tag strings.') }) },
    prompt: `You are a YouTube SEO expert. For a video about "{{topic}}", generate a list of 10 relevant tags. These tags should be comma separated. Do not use quotation marks around the tags.
  {{#if language}}
  Generate the tags in the following language: {{{language}}}.
  {{/if}}

Tags:`,
  });
  
  const getKeywordScore = aiInstance.defineTool(
    {
      name: 'getKeywordScore',
      description: 'Returns a score for a given keyword based on its trend and search volume.',
      inputSchema: z.object({
        keyword: z.string().describe('The keyword to score.'),
      }),
      outputSchema: z.number(),
    },
    async (input) => {
      console.log(`Scoring keyword (real API placeholder): ${input.keyword}`);
      const score = Math.min(100, (input.keyword.length * 7) % 101);
      return score;
    }
  );
  
  const llmResponse = await prompt(input);
  const generatedTags = llmResponse.output?.tags || [];

  const scoredTags: { tag: string; score: number }[] = await Promise.all(
    generatedTags.map(async (tag) => {
      const score = await getKeywordScore({ keyword: tag });
      return { tag, score };
    })
  );

  return { tags: scoredTags.sort((a, b) => b.score - a.score) };
}

const prompt = ai.definePrompt({
  name: 'generateVideoTagsPrompt',
  input: {schema: z.object({ topic: z.string(), language: z.string().optional() }) },
  output: {schema: z.object({ tags: z.array(z.string()).describe('An array of tag strings.') }) },
  prompt: `You are a YouTube SEO expert. For a video about "{{topic}}", generate a list of 10 relevant tags. These tags should be comma separated. Do not use quotation marks around the tags.
  {{#if language}}
  Generate the tags in the following language: {{{language}}}.
  {{/if}}

Tags:`,
});

const generateVideoTagsFlow = ai.defineFlow(
  {
    name: 'generateVideoTagsFlow',
    inputSchema: GenerateVideoTagsInputSchema,
    outputSchema: GenerateVideoTagsOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    const generatedTags = llmResponse.output?.tags || [];

    const scoredTags: { tag: string; score: number }[] = await Promise.all(
      generatedTags.map(async (tag) => {
        const score = await getKeywordScore({ keyword: tag });
        return { tag, score };
      })
    );

    return { tags: scoredTags.sort((a, b) => b.score - a.score) };
  }
);
