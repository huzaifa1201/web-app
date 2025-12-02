'use server';

import { getApiKeys } from './api-keys';

export interface YouTubeChannelStats {
  subscribers: string;
  views: string;
  watchTime: string;
  estimatedRevenue: string;
  subscriberChange: string;
  viewsChange: string;
  watchTimeChange: string;
  revenueChange: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  views: string;
  likes: string;
  comments: string;
  watchTime: string;
  publishedDate: string;
  thumbnailUrl: string;
  thumbnailHint: string;
}

export interface YouTubeViewsData {
  date: string;
  views: number;
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

function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

async function getYouTubeChannelId(userId?: string, accessToken?: string): Promise<string | null> {
  // First try to get from environment variable
  if (process.env.YOUTUBE_CHANNEL_ID) {
    return process.env.YOUTUBE_CHANNEL_ID;
  }
  
  // Try to get from user's Firestore profile
  if (userId) {
    try {
      const { initializeFirebase } = await import('@/firebase');
      const { firestore } = initializeFirebase();
      const { doc, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists() && userDoc.data().youtubeChannelId) {
        return userDoc.data().youtubeChannelId;
      }
    } catch (error) {
      console.error('Error fetching channel ID from Firestore:', error);
    }
  }
  
  // Try to get from OAuth access token
  if (accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          return data.items[0].id;
        }
      }
    } catch (error) {
      console.error('Error fetching channel ID from OAuth:', error);
    }
  }
  
  return null;
}

export async function getYouTubeChannelStats(
  userId?: string,
  youtubeApiKey?: string,
  accessToken?: string
): Promise<YouTubeChannelStats | null> {
  try {
    let apiKey = youtubeApiKey;
    
    if (!apiKey && userId) {
      const keys = await getApiKeys(userId);
      apiKey = keys.youtubeApiKey;
    }
    
    if (!apiKey) {
      apiKey = process.env.YOUTUBE_API_KEY;
    }
    
    if (!apiKey) {
      return null;
    }

    // Get channel ID from various sources
    const channelId = await getYouTubeChannelId(userId, accessToken);
    
    if (!channelId) {
      // Return null if no channel ID found
      return null;
    }

    // Fetch channel statistics
    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
    const statsResponse = await fetch(statsUrl);
    
    if (!statsResponse.ok) {
      throw new Error('Failed to fetch channel statistics');
    }
    
    const statsData = await statsResponse.json();
    
    if (!statsData.items || statsData.items.length === 0) {
      return null;
    }

    const stats = statsData.items[0].statistics;
    const subscriberCount = parseInt(stats.subscriberCount || '0', 10);
    const viewCount = parseInt(stats.viewCount || '0', 10);
    const videoCount = parseInt(stats.videoCount || '0', 10);

    // Calculate watch time (estimated based on average watch time per view)
    // This is a simplified calculation - real watch time requires YouTube Analytics API
    const estimatedWatchTimeHours = Math.floor(viewCount * 0.5 / 3600); // Assuming 30 min average per view

    // Calculate estimated revenue (simplified - real revenue requires YouTube Analytics API)
    const estimatedRevenue = Math.floor(viewCount * 0.001); // Rough estimate: $0.001 per view

    return {
      subscribers: formatNumber(subscriberCount),
      views: formatNumber(viewCount),
      watchTime: formatNumber(estimatedWatchTimeHours),
      estimatedRevenue: `$${formatNumber(estimatedRevenue)}`,
      subscriberChange: '+12.5%', // Would need historical data to calculate
      viewsChange: '+8.2%',
      watchTimeChange: '-1.5%',
      revenueChange: '+20.1%',
    };
  } catch (error) {
    console.error('Error fetching YouTube channel stats:', error);
    return null;
  }
}

export async function getYouTubeChannelVideos(
  userId?: string,
  youtubeApiKey?: string,
  maxResults: number = 10,
  accessToken?: string
): Promise<YouTubeVideo[]> {
  try {
    let apiKey = youtubeApiKey;
    
    if (!apiKey && userId) {
      const keys = await getApiKeys(userId);
      apiKey = keys.youtubeApiKey;
    }
    
    if (!apiKey) {
      apiKey = process.env.YOUTUBE_API_KEY;
    }
    
    if (!apiKey) {
      return [];
    }

    const channelId = await getYouTubeChannelId(userId, accessToken);
    
    if (!channelId) {
      return [];
    }

    // Fetch channel's uploads playlist
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const channelResponse = await fetch(channelUrl);
    
    if (!channelResponse.ok) {
      throw new Error('Failed to fetch channel details');
    }
    
    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
    
    if (!uploadsPlaylistId) {
      return [];
    }

    // Fetch videos from uploads playlist
    const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`;
    const videosResponse = await fetch(videosUrl);
    
    if (!videosResponse.ok) {
      throw new Error('Failed to fetch videos');
    }
    
    const videosData = await videosResponse.json();
    
    if (!videosData.items || videosData.items.length === 0) {
      return [];
    }

    // Get video IDs
    const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

    // Fetch detailed video statistics
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`;
    const statsResponse = await fetch(statsUrl);
    
    if (!statsResponse.ok) {
      throw new Error('Failed to fetch video statistics');
    }
    
    const statsData = await statsResponse.json();
    
    if (!statsData.items) {
      return [];
    }

    // Map to our format
    return statsData.items.map((video: any) => {
      const stats = video.statistics;
      const snippet = video.snippet;
      const publishedAt = new Date(snippet.publishedAt);
      
      return {
        id: video.id,
        title: snippet.title,
        views: formatNumber(parseInt(stats.viewCount || '0', 10)),
        likes: formatNumber(parseInt(stats.likeCount || '0', 10)),
        comments: formatNumber(parseInt(stats.commentCount || '0', 10)),
        watchTime: formatNumber(Math.floor(parseInt(stats.viewCount || '0', 10) * 0.5 / 3600)),
        publishedDate: formatDate(publishedAt),
        thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
        thumbnailHint: snippet.description?.substring(0, 50) || snippet.title,
      };
    });
  } catch (error) {
    console.error('Error fetching YouTube channel videos:', error);
    return [];
  }
}

export async function getYouTubeViewsData(
  userId?: string,
  youtubeApiKey?: string
): Promise<YouTubeViewsData[]> {
  try {
    // For now, return sample data
    // Real implementation would require YouTube Analytics API with OAuth
    const now = new Date();
    const data: YouTubeViewsData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: `Day ${7 - i}`,
        views: Math.floor(Math.random() * 3000) + 2000,
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching YouTube views data:', error);
    return [];
  }
}

