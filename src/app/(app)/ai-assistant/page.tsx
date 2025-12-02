'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { continueConversation } from '@/ai/flows/chat-flow';
import type { ChatMessage } from '@/lib/history';
import { useUser } from '@/firebase/auth/use-user';


const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type FormValues = z.infer<typeof formSchema>;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        // Use `lastElementChild` to scroll to the newest message
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport && viewport.lastElementChild) {
           (viewport.lastElementChild as HTMLElement).scrollIntoView({ behavior: 'smooth' });
        }
    }
  }, [messages]);


  const onSubmit = async (data: FormValues) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: data.message,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    form.reset();

    try {
      const history: ChatMessage[] = messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        content: msg.text,
      }));

      const aiResponseText = await continueConversation({
        history,
        message: data.message,
        userId: user?.uid,
      });

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: aiResponseText,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to get a response from the AI. Please try again.';
      
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
       // Optional: remove the user's message if the API call fails
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Your personal AI helper for all things YouTube. Ask me anything!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-6 pr-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground">
                    Start a conversation by typing a message below.
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-4',
                    message.sender === 'user' ? 'justify-end' : ''
                  )}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Sparkles /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-xl p-3 text-sm',
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                   {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Sparkles /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-xl p-3">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full items-center space-x-2"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Ask for video ideas, SEO tips, or anything else..."
                        autoComplete="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
}
