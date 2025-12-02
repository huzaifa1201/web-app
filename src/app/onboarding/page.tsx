'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { initializeFirebase } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  channelName: z.string().optional(),
  channelDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const { firestore } = initializeFirebase();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channelName: '',
      channelDescription: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to complete onboarding.',
        variant: 'destructive',
      });
      router.push('/');
      return;
    }

    setIsLoading(true);
    try {
      // Save user profile data to Firestore
      await setDoc(
        doc(firestore, 'users', user.uid),
        {
          channelName: data.channelName || '',
          channelDescription: data.channelDescription || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been saved successfully.',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to TubeTrend AI!</CardTitle>
          <CardDescription>
            Let's set up your profile to personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={form.control}
                name="channelName"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="channel-name">YouTube Channel Name (Optional)</Label>
                    <FormControl>
                      <Input
                        id="channel-name"
                        placeholder="e.g., Max's Tech Garage"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="channelDescription"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="channel-description">What is your channel about? (Optional)</Label>
                    <FormControl>
                      <Textarea
                        id="channel-description"
                        placeholder="e.g., I create tutorials on the latest AI tools and tech trends for developers and enthusiasts."
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finish Setup
              </Button>
            </form>
          </Form>
          <Button
            variant="link"
            className="w-full text-muted-foreground"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip for now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
