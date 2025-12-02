'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Youtube, ArrowUpRight, ArrowDown, Loader2 } from 'lucide-react';
import { topVideos as defaultTopVideos, channelStats as defaultChannelStats } from '@/lib/data';
import { getYouTubeChannelStats, getYouTubeChannelVideos, type YouTubeChannelStats, type YouTubeVideo } from '@/lib/youtube-api';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { signInWithGoogle, signOutWithGoogle } from '@/firebase/auth/auth';


export default function ChannelAnalyzerPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [channelStats, setChannelStats] = useState(defaultChannelStats);
  const [videos, setVideos] = useState<YouTubeVideo[]>(defaultTopVideos);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const [stats, videoList] = await Promise.all([
            getYouTubeChannelStats(user.uid),
            getYouTubeChannelVideos(user.uid, undefined, 20),
          ]);

          if (stats) {
            setChannelStats([
              { name: 'Subscribers', value: stats.subscribers, change: stats.subscriberChange, changeType: stats.subscriberChange.startsWith('+') ? 'positive' as const : 'negative' as const },
              { name: 'Views (30 days)', value: stats.views, change: stats.viewsChange, changeType: stats.viewsChange.startsWith('+') ? 'positive' as const : 'negative' as const },
              { name: 'Watch Time (hrs)', value: stats.watchTime, change: stats.watchTimeChange, changeType: stats.watchTimeChange.startsWith('+') ? 'positive' as const : 'negative' as const },
              { name: 'Est. Revenue', value: stats.estimatedRevenue, change: stats.revenueChange, changeType: stats.revenueChange.startsWith('+') ? 'positive' as const : 'negative' as const },
            ]);
          }

          if (videoList.length > 0) {
            setVideos(videoList);
          }
        } catch (error: any) {
          console.error('Error fetching YouTube data:', error);
          let errorMessage = 'Failed to fetch channel data. Please check your API key settings.';
          
          if (error?.message?.includes('API key') || error?.message?.includes('not configured')) {
            errorMessage = 'YouTube API key not configured. Please add your API key in Settings.';
          } else if (error?.message?.includes('channel') || error?.message?.includes('not found')) {
            errorMessage = 'Channel not found. Please connect your YouTube channel or set YOUTUBE_CHANNEL_ID in environment variables.';
          } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
            errorMessage = 'YouTube API quota exceeded. Please try again later or check your API key limits.';
          } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          }
          
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user, toast]);

  const handleConnect = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: 'Successfully Connected!',
        description: 'Your YouTube channel has been connected.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Connection Failed',
        description:
          'Could not connect to your YouTube account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async () => {
    await signOutWithGoogle();
    toast({
      title: 'Disconnected',
      description: 'Your YouTube channel has been disconnected.',
    });
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>YouTube Channel Analyzer</CardTitle>
          <CardDescription>
            {user
              ? 'In-depth analytics and insights for your channel.'
              : 'Connect your YouTube channel to get in-depth analytics and insights.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? (
            <Button onClick={handleConnect}>
              <Youtube className="mr-2 h-4 w-4" /> Connect Your YouTube Channel
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold">
                <p>Welcome, {user.displayName || 'Creator'}!</p>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {channelStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              {stat.changeType === 'positive' ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Videos</CardTitle>
          <CardDescription>
            {user
              ? 'A list of your most viewed videos.'
              : 'A list of your most viewed videos (sample data).'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Video</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Watch Time (hrs)</TableHead>
                <TableHead className="text-right">Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        width={100}
                        height={56}
                        className="rounded-md object-cover"
                        data-ai-hint={video.thumbnailHint}
                      />
                      <span className="font-medium truncate">{video.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{video.views}</TableCell>
                  <TableCell>{video.likes}</TableCell>
                  <TableCell>{video.comments}</TableCell>
                  <TableCell>{video.watchTime}</TableCell>
                  <TableCell className="text-right">
                    {video.publishedDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
