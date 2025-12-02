'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateVideoTitles } from '@/ai/flows/generate-video-titles';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Lightbulb, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Authentication removed

const formSchema = z.object({
  topic: z.string().min(10, 'Please enter a topic with at least 10 characters.'),
  targetAudience: z.string().min(5, 'Please enter a target audience with at least 5 characters.'),
  language: z.string().optional(),
  userData: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TitleGenerator() {
  const [titles, setTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // Authentication removed

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      targetAudience: '',
      language: 'English',
      userData: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setTitles([]);
    try {
      const result = await generateVideoTitles({
        ...data,
        userId: null, // Authentication removed
      });
      setTitles(result.titles);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || 'Failed to generate titles. Please check your API key in Settings.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: text,
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The future of renewable energy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tech enthusiasts and students" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                    The language for the generated titles.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Data (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., My channel focuses on short, impactful tech summaries."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide any additional context about your channel or style to personalize the results.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Titles
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isLoading || titles.length > 0) && (
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated Titles:</h3>
            {isLoading && (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-pulse">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            )}
            {titles.length > 0 && (
              <ul className="space-y-2">
                {titles.map((title, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg group"
                  >
                    <div className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-3 text-primary" />
                      <span className="text-sm">{title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => handleCopy(title)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      )}
    </>
  );
}
