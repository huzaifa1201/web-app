'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { researchKeywords, type ResearchKeywordsOutput } from '@/ai/flows/research-keywords';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useToast } from '@/hooks/use-toast';

type TrendData = ResearchKeywordsOutput['trendData'];
type RelatedKeywords = ResearchKeywordsOutput['relatedKeywords'];

const initialTrendData: TrendData = [
  { date: '2024-01', "Search Volume": 4000 },
  { date: '2024-02', "Search Volume": 3000 },
  { date: '2024-03', "Search Volume": 5000 },
  { date: '2024-04', "Search Volume": 4500 },
  { date: '2024-05', "Search Volume": 6000 },
  { date: '2024-06', "Search Volume": 8000 },
  { date: '2024-07', "Search Volume": 7500 },
];

const initialRelatedKeywords: RelatedKeywords = [
  { term: "AI video editing", volume: "12.1K", competition: "High", trend: "up" },
  { term: "ChatGPT for content creators", volume: "8.5K", competition: "Medium", trend: "up" },
  { term: "Best AI tools 2024", volume: "22K", competition: "High", trend: "stable" },
  { term: "Midjourney tutorial", volume: "15K", competition: "Medium", trend: "down" },
  { term: "How to grow on YouTube with AI", volume: "5.4K", competition: "Low", trend: "up" },
];

const formSchema = z.object({
  keyword: z.string().min(2, 'Please enter a keyword with at least 2 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function KeywordResearchPage() {
  const [trendData, setTrendData] = useState<TrendData>(initialTrendData);
  const [relatedKeywords, setRelatedKeywords] = useState<RelatedKeywords>(initialRelatedKeywords);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: 'AI for YouTube',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const result = await researchKeywords(data);
      setTrendData(result.trendData);
      setRelatedKeywords(result.relatedKeywords);
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to research keywords. Please try again.';
      
      if (error?.message?.includes('API key')) {
        errorMessage = 'API key not configured. Please add your Gemini API key in Settings.';
      } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
        errorMessage = 'API quota exceeded. Please check your API key limits or try again later.';
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
          <CardTitle>Keyword Research</CardTitle>
          <CardDescription>
            Discover new content ideas and analyze keyword trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem className="relative flex-1">
                    <FormControl>
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Enter a keyword or topic..."
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

      <Card>
        <CardHeader>
          <CardTitle>Search Trend</CardTitle>
          <CardDescription>Volume of searches over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                  cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
              />
              <Area type="monotone" dataKey="Search Volume" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Related Keywords</CardTitle>
          <CardDescription>Discover related queries to expand your content ideas.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="h-5 w-1/3 bg-muted rounded"></div>
                  <div className="h-5 w-1/4 bg-muted rounded"></div>
                  <div className="h-5 w-1/6 bg-muted rounded"></div>
                  <div className="h-5 w-1/6 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Monthly Volume</TableHead>
                  <TableHead>Competition</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedKeywords.map((keyword, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{keyword.term}</TableCell>
                    <TableCell>{keyword.volume}</TableCell>
                    <TableCell>
                      <Badge variant={keyword.competition === 'High' ? 'destructive' : keyword.competition === 'Medium' ? 'secondary' : 'default'}
                      className={keyword.competition === 'Low' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}>
                        {keyword.competition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={keyword.trend === 'up' ? 'text-green-500 border-green-500' : keyword.trend === 'down' ? 'text-red-500 border-red-500' : ''}>
                        {keyword.trend === 'up' ? 'Trending Up' : keyword.trend === 'down' ? 'Trending Down' : 'Stable'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
