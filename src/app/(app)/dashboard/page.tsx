'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { channelStats as defaultChannelStats, topVideos as defaultTopVideos, trendingKeywords } from '@/lib/data';
import { getYouTubeChannelStats, getYouTubeChannelVideos, type YouTubeChannelStats, type YouTubeVideo } from '@/lib/youtube-api';
import { useUser } from '@/firebase/auth/use-user';
import Image from 'next/image';
import { ChannelPerformanceChart } from '@/components/channel-performance-chart';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();
  const [channelStats, setChannelStats] = useState(defaultChannelStats);
  const [topVideos, setTopVideos] = useState<YouTubeVideo[]>(defaultTopVideos);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const [stats, videos] = await Promise.all([
            getYouTubeChannelStats(user.uid),
            getYouTubeChannelVideos(user.uid),
          ]);

          if (stats) {
            setChannelStats([
              { name: 'Subscribers', value: stats.subscribers, change: stats.subscriberChange, changeType: stats.subscriberChange.startsWith('+') ? 'positive' as const : 'negative' as const },
              { name: 'Views (30 days)', value: stats.views, change: stats.viewsChange, changeType: stats.viewsChange.startsWith('+') ? 'positive' as const : 'negative' as const },
              { name: 'Watch Time (hrs)', value: stats.watchTime, change: stats.watchTimeChange, changeType: stats.watchTimeChange.startsWith('+') ? 'positive' as const : 'negative' as const },
              { name: 'Est. Revenue', value: stats.estimatedRevenue, change: stats.revenueChange, changeType: stats.revenueChange.startsWith('+') ? 'positive' as const : 'negative' as const },
            ]);
          }

          if (videos.length > 0) {
            setTopVideos(videos);
          }
        } catch (error: any) {
          console.error('Error fetching YouTube data:', error);
          // Silent fail for dashboard - show default data instead
          // User can check Settings if they want real data
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {channelStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.changeType === 'positive'
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {stat.change} vs. last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>
              A summary of your channel views over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelPerformanceChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trending Keywords</CardTitle>
            <CardDescription>
              Hot topics and keywords in your niche right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {trendingKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{keyword.term}</span>
                    <span className="text-sm text-muted-foreground">
                      {keyword.searchVolume}
                    </span>
                  </div>
                  <Badge variant={keyword.trend === 'up' ? 'default' : 'secondary'}
                    className={keyword.trend === 'up' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}>
                    {keyword.trend === 'up' ? 'Trending Up' : 'Stable'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Top Performing Videos</CardTitle>
            <CardDescription>
              Your most successful videos from the last 30 days.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/channel-analyzer">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead className="hidden sm:table-cell">Views</TableHead>
                <TableHead className="hidden sm:table-cell">Likes</TableHead>
                <TableHead className="text-right">Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topVideos.slice(0, 5).map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        width={64}
                        height={36}
                        className="rounded-md object-cover"
                        data-ai-hint={video.thumbnailHint}
                      />
                      <div className="font-medium">{video.title}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {video.views}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {video.likes}
                  </TableCell>
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
