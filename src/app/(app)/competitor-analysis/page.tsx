'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link2, Search, BarChart, ThumbsUp, MessageSquare, Eye, Loader2 } from 'lucide-react';
import { analyzeVideo, type AnalyzeVideoOutput } from '@/ai/flows/analyze-video';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import Image from 'next/image';

const formSchema = z.object({
  url: z.string().url('Please enter a valid YouTube URL.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompetitorAnalysisPage() {
  const [videoData, setVideoData] = useState<AnalyzeVideoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // Authentication removed

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setVideoData(null);
    try {
      const result = await analyzeVideo({ 
        videoUrl: data.url,
        userId: null, // Authentication removed
      });
      setVideoData(result);
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to analyze video. Please try again.';
      
      if (error?.message?.includes('API key') || error?.message?.includes('not configured')) {
        errorMessage = 'YouTube API key not configured. Please add your API key in Settings.';
      } else if (error?.message?.includes('Invalid YouTube URL') || error?.message?.includes('not found')) {
        errorMessage = 'Invalid YouTube URL or video not found. Please check the URL and try again.';
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
  };


  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Competitor Analysis</CardTitle>
          <CardDescription>
            Analyze any YouTube video to uncover its strategy and performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
               <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="relative flex-1">
                    <FormControl>
                      <div className="relative flex-1">
                        <Link2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Enter a YouTube video URL..."
                          className="w-full rounded-lg bg-background pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="absolute -bottom-6" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

        {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video w-full rounded-lg bg-muted"></div>
                    </CardContent>
                </Card>
                <div className="grid lg:col-span-3 auto-rows-min gap-4 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 bg-muted rounded w-1/3"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}

      {videoData && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>{videoData.title}</CardTitle>
                <CardDescription>Performance Overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full rounded-lg bg-muted overflow-hidden">
                    <Image src={videoData.thumbnailUrl} alt={videoData.title} data-ai-hint={videoData.thumbnailHint} width={640} height={360} className="w-full h-full object-cover" />
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:col-span-3 auto-rows-min gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{videoData.views}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Likes</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{videoData.likes}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comments</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{videoData.comments}</div>
                    </CardContent>
                </Card>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Video Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{videoData.description}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Video Tags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {videoData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

    </div>
  );
}
