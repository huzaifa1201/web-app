import { config } from 'dotenv';
config();

import '@/ai/flows/generate-video-descriptions.ts';
import '@/ai/flows/generate-video-tags.ts';
import '@/ai/flows/generate-video-titles.ts';
import '@/ai/flows/generate-video-script-outline.ts';
import '@/ai/flows/research-keywords.ts';
import '@/ai/flows/analyze-video.ts';
import '@/ai/flows/chat-flow.ts';
