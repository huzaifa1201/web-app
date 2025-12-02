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
export default function ChannelAnalyzerPage() {
  const { toast } = useToast();
  const [channelStats, setChannelStats] = useState(defaultChannelStats);
  const [videos, setVideos] = useState<YouTubeVideo[]>(defaultTopVideos);
  const [isLoading, setIsLoading] = useState(false);

  // Authentication removed - using default data
  // You can configure YouTube API key in Settings to fetch real data

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>YouTube Channel Analyzer</CardTitle>
          <CardDescription>
            In-depth analytics and insights for your channel. Configure your YouTube API key in Settings to fetch real data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Using sample data. Add your YouTube API key in Settings to see real analytics.</p>
          </div>
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
            A list of your most viewed videos (sample data).
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
