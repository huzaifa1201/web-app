'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing a YouTube video.
 *
 * - analyzeVideo - A function that takes a YouTube video URL and returns its analysis.
 * - AnalyzeVideoInput - The input type for the analyzeVideo function.
 * - AnalyzeVideoOutput - The return type for the analyzeVideo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getApiKeys } from '@/lib/api-keys';

const AnalyzeVideoInputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the YouTube video to analyze.'),
  userId: z.string().optional().describe('The user ID to fetch API keys from Firestore.'),
  youtubeApiKey: z.string().optional().describe('Optional YouTube API key. If not provided, will try to fetch from user settings or use env variable.'),
});
export type AnalyzeVideoInput = z.infer<typeof AnalyzeVideoInputSchema>;

const AnalyzeVideoOutputSchema = z.object({
  title: z.string().describe("The title of the video."),
  views: z.string().describe("The number of views the video has."),
  likes: z.string().describe("The number of likes the video has."),
  comments: z.string().describe("The number of comments the video has."),
  description: z.string().describe("The description of the video."),
  tags: z.array(z.string()).describe("A list of tags used for the video."),
  thumbnailUrl: z.string().url().describe("The URL of the video's thumbnail."),
  thumbnailHint: z.string().describe("A hint for the AI to understand the thumbnail image content.")
});
export type AnalyzeVideoOutput = z.infer<typeof AnalyzeVideoOutputSchema>;

function getVideoId(url: string): string | null {
  let videoId: string | null = null;
  try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      if (hostname.includes('youtube.com') || hostname.includes('m.youtube.com')) {
          if (pathname.startsWith('/watch')) {
              videoId = searchParams.get('v');
          } else if (pathname.startsWith('/shorts/')) {
              videoId = pathname.split('/shorts/')[1].split('?')[0];
          } else if (pathname.startsWith('/embed/')) {
              videoId = pathname.split('/embed/')[1].split('?')[0];
          }
      } else if (hostname.includes('youtu.be')) {
          videoId = pathname.slice(1).split('?')[0];
      }
  } catch (error) {
      console.error("Error parsing URL:", error);
      // Fallback for non-standard URLs, try regex
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      if (match) {
        videoId = match[1];
      } else {
        return null;
      }
  }

  // Final cleanup for any remaining query params
  if (videoId && videoId.includes('&')) {
      videoId = videoId.split('&')[0];
  }

  return videoId;
}


function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export async function analyzeVideo(
  input: AnalyzeVideoInput
): Promise<AnalyzeVideoOutput> {
  return analyzeVideoFlow(input);
}

const analyzeVideoFlow = ai.defineFlow(
  {
    name: 'analyzeVideoFlow',
    inputSchema: AnalyzeVideoInputSchema,
    outputSchema: AnalyzeVideoOutputSchema,
  },
  async (input) => {
    const videoId = getVideoId(input.videoUrl);

    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }

    // Try to get API key from parameter, user settings, or environment variable
    let apiKey = input.youtubeApiKey;
    
    if (!apiKey && input.userId) {
      try {
        const keys = await getApiKeys(input.userId);
        apiKey = keys.youtubeApiKey;
      } catch (error) {
        console.error('Error fetching API keys from Firestore:', error);
      }
    }
    
    if (!apiKey) {
      apiKey = process.env.YOUTUBE_API_KEY;
    }
    
    if (!apiKey) {
        throw new Error("YouTube API key is not configured. Please add it in the settings page.");
    }
    
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('YouTube API Error:', errorData);
            throw new Error(`YouTube API request failed: ${errorData.error.message}`);
        }
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found on YouTube.');
        }

        const video = data.items[0];
        const snippet = video.snippet;
        const statistics = video.statistics;

        return {
            title: snippet.title,
            views: formatNumber(parseInt(statistics.viewCount || '0', 10)),
            likes: formatNumber(parseInt(statistics.likeCount || '0', 10)),
            comments: formatNumber(parseInt(statistics.commentCount || '0', 10)),
            description: snippet.description,
            tags: snippet.tags || [],
            thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
            thumbnailHint: "youtube video thumbnail"
        };
    } catch (error: any) {
        console.error("Failed to fetch video data:", error);
        // Re-throw the error to be caught by the client-side component
        throw new Error(error.message || 'Failed to fetch video data from YouTube API.');
    }
  }
);
