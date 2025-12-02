'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateVideoDescription } from '@/ai/flows/generate-video-descriptions';
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
import { useUser } from '@/firebase/auth/use-user';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  topic: z.string().min(10, 'Please enter a topic with at least 10 characters.'),
  targetAudience: z.string().min(5, 'Please enter a target audience with at least 5 characters.'),
  language: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DescriptionGenerator() {
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      targetAudience: '',
      language: 'English',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setDescription('');
    try {
      const result = await generateVideoDescription({
        ...data,
        userId: user?.uid,
      });
      setDescription(result.description);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || 'Failed to generate description. Please check your API key in Settings.';
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
      description: 'The description has been copied.',
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
                      <Input placeholder="e.g., The secrets of deep sea creatures" {...field} />
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
                      <Input placeholder="e.g., Marine biology enthusiasts" {...field} />
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
                    The language for the generated description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Description
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isLoading || description) && (
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated Description:</h3>
            {isLoading && (
              <div className="p-3 bg-muted rounded-lg animate-pulse space-y-2">
                 <div className="h-4 bg-muted-foreground/20 rounded w-full"></div>
                 <div className="h-4 bg-muted-foreground/20 rounded w-full"></div>
                 <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
              </div>
            )}
            {description && (
              <div className="relative p-4 bg-muted rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(description)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <p className="text-sm whitespace-pre-wrap">{description}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </>
  );
}
