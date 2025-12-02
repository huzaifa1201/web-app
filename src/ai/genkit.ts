import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Default Genkit instance with environment variable API key
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

// Helper function to get API key from user settings or environment
export async function getGeminiApiKey(userId?: string): Promise<string | undefined> {
  // First check environment variable
  if (process.env.GOOGLE_API_KEY) {
    return process.env.GOOGLE_API_KEY;
  }
  
  // Then check user's saved API key
  if (userId) {
    try {
      const { getApiKeys } = await import('@/lib/api-keys');
      const keys = await getApiKeys(userId);
      if (keys.geminiApiKey && keys.geminiApiKey.trim() !== '') {
        return keys.geminiApiKey;
      }
    } catch (error) {
      console.error('Error fetching Gemini API key:', error);
    }
  }
  
  return undefined;
}

// Create Genkit instance with custom API key
export function createGenkitInstanceWithKey(apiKey: string) {
  return genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-2.5-flash',
  });
}
