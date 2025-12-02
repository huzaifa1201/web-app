'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateVideoTags, type GenerateVideoTagsOutput } from '@/ai/flows/generate-video-tags';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  topic: z.string().min(5, 'Please enter a topic with at least 5 characters.'),
  language: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Tag = GenerateVideoTagsOutput['tags'][0];

const getScoreColor = (score: number) => {
  if (score > 75) return 'bg-green-500';
  if (score > 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default function TagsGenerator() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      language: 'English',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setTags([]);
    try {
      const result = await generateVideoTags({
        ...data,
        userId: user?.uid,
      });
      setTags(result.tags);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || 'Failed to generate tags. Please check your API key in Settings.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const tagsString = tags.map(t => t.tag).join(', ');
    navigator.clipboard.writeText(tagsString);
    toast({
      title: 'Copied all tags!',
      description: 'Tags are ready to be pasted.',
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Beginner's guide to 3D printing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The language for the generated tags.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Tags
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isLoading || tags.length > 0) && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Tags:</h3>
              {tags.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </Button>
              )}
            </div>
            {isLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-1">
                      <div className="h-5 w-1/3 bg-muted-foreground/20 rounded"></div>
                      <div className="h-5 w-1/4 bg-muted-foreground/20 rounded"></div>
                    </div>
                    <div className="h-2.5 bg-muted-foreground/20 rounded-full"></div>
                  </div>
                ))}
              </div>
            )}
            {tags.length > 0 && (
              <div className="space-y-4">
                {tags.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <Badge variant="secondary" className="text-sm">
                        {item.tag}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        Score: {item.score}
                      </span>
                    </div>
                    <Progress value={item.score} className="h-2 [&>div]:bg-primary" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </>
  );
}
