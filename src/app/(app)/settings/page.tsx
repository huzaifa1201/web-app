'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
export default function SettingsPage() {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showYoutubeKey, setShowYoutubeKey] = useState(false);
  const [showGoogleTrendsKey, setShowGoogleTrendsKey] = useState(false);
  
  const [geminiKey, setGeminiKey] = useState('');
  const [youtubeKey, setYoutubeKey] = useState('');
  const [googleTrendsKey, setGoogleTrendsKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    // Load API keys from localStorage (authentication removed)
    setGeminiKey(localStorage.getItem('GEMINI_API_KEY') || '');
    setYoutubeKey(localStorage.getItem('YOUTUBE_API_KEY') || '');
    setGoogleTrendsKey(localStorage.getItem('GOOGLE_TRENDS_API_KEY') || '');
    setIsLoadingKeys(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      // Save to localStorage (authentication removed)
      localStorage.setItem('GEMINI_API_KEY', geminiKey);
      localStorage.setItem('YOUTUBE_API_KEY', youtubeKey);
      localStorage.setItem('GOOGLE_TRENDS_API_KEY', googleTrendsKey);
      
      toast({
        title: "Settings Saved!",
        description: "Your API keys have been saved.",
      });
    } catch (error: any) {
      console.error('Error saving API keys:', error);
      toast({
        title: "Error",
        description: 'Failed to save API keys. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
          <CardDescription>
            Manage your API keys to power TubeTrend AI features. Keys are stored in your browser's localStorage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="gemini-key">Gemini API Key</Label>
                <Button variant="link" asChild className="text-xs -mr-4">
                    <Link href="https://aistudio.google.com/app/apikey" target="_blank">
                        Get API Key <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showGeminiKey ? 'text' : 'password'}
                  className="w-full pr-10"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder='Enter your Gemini API Key...'
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  aria-label="Toggle Gemini key visibility"
                >
                  {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Required for all AI content generation features.
              </p>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="youtube-key">YouTube Data API v3 Key</Label>
                <Button variant="link" asChild className="text-xs -mr-4">
                    <Link href="https://console.cloud.google.com/apis/credentials" target="_blank">
                        Get API Key <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                </Button>
              </div>
               <div className="relative">
                <Input
                  id="youtube-key"
                  type={showYoutubeKey ? 'text' : 'password'}
                  className="w-full pr-10"
                  value={youtubeKey}
                  onChange={(e) => setYoutubeKey(e.target.value)}
                  placeholder='Enter your YouTube API Key...'
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowYoutubeKey(!showYoutubeKey)}
                  aria-label="Toggle YouTube key visibility"
                >
                  {showYoutubeKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Required for competitor and channel analysis.
              </p>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="google-trends-key">Google Trends API Key</Label>
                 <Button variant="link" asChild className="text-xs -mr-4">
                    <Link href="https://console.cloud.google.com/apis/credentials" target="_blank">
                        Get API Key <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                </Button>
              </div>
               <div className="relative">
                <Input
                  id="google-trends-key"
                  type={showGoogleTrendsKey ? 'text' : 'password'}
                  className="w-full pr-10"
                  value={googleTrendsKey}
                  onChange={(e) => setGoogleTrendsKey(e.target.value)}
                  placeholder='Enter your Google API Key for Trends...'
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowGoogleTrendsKey(!showGoogleTrendsKey)}
                  aria-label="Toggle Google Trends key visibility"
                >
                  {showGoogleTrendsKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Required for keyword research trend data. Note: Requires a custom setup.
              </p>
            </div>
             <Button type="submit" disabled={isLoading || isLoadingKeys}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Save Changes
             </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
