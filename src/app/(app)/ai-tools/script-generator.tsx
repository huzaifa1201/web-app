'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateVideoScriptOutline } from '@/ai/flows/generate-video-script-outline';
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
import { Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Authentication removed

const formSchema = z.object({
  topic: z.string().min(10, 'Please enter a topic with at least 10 characters.'),
  language: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ScriptGenerator() {
  const [outline, setOutline] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // Authentication removed

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      language: 'English',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setOutline('');
    try {
      const result = await generateVideoScriptOutline({
        ...data,
        userId: null, // Authentication removed
      });
      setOutline(result.outline);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || 'Failed to generate script outline. Please check your API key in Settings.';
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
      description: 'The script outline has been copied.',
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
                    <Input placeholder="e.g., A day in the life of a software engineer" {...field} />
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
                    The language for the generated script outline.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Outline
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isLoading || outline) && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Script Outline:</h3>
                {outline && (
                     <Button variant="ghost" size="sm" onClick={() => handleCopy(outline)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                    </Button>
                )}
            </div>
            {isLoading && (
              <div className="p-4 border rounded-lg space-y-3 animate-pulse">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-5 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                ))}
              </div>
            )}
            {outline && (
              <div
                className="prose dark:prose-invert prose-sm max-w-none p-4 border rounded-lg"
                dangerouslySetInnerHTML={{
                  __html: outline.replace(/\n/g, '<br />'),
                }}
              />
            )}
          </div>
        </CardContent>
      )}
    </>
  );
}
