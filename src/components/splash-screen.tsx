import { AppLogo } from './app-logo';

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-75 animate-pulse"></div>
        <div className="relative">
            <AppLogo />
        </div>
      </div>
      <h1 className="text-2xl font-bold mt-6 text-foreground animate-pulse">TubeTrend AI</h1>
      <p className="text-muted-foreground mt-2">Loading your AI toolkit...</p>
    </div>
  );
}
